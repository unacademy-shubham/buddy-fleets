-- Company 360 Phase 4: commercial controls, atomic invoicing and idempotent payments.

alter table public.subscriptions
  add column if not exists revision integer not null default 1,
  add column if not exists updated_by uuid null;

alter table public.developer_company_invoices
  add column if not exists request_id uuid null;

alter table public.developer_company_payments
  add column if not exists request_id uuid null;

create unique index if not exists developer_company_invoices_company_request_uidx
  on public.developer_company_invoices(company_id, request_id)
  where request_id is not null;

create unique index if not exists developer_company_payments_company_request_uidx
  on public.developer_company_payments(company_id, request_id)
  where request_id is not null;

create unique index if not exists developer_company_payments_reference_uidx
  on public.developer_company_payments(company_id, lower(btrim(transaction_reference)))
  where btrim(transaction_reference) <> ''
    and status in ('pending','submitted','verified');

create unique index if not exists developer_company_receipts_payment_uidx
  on public.developer_company_receipts(payment_id);

create index if not exists developer_company_invoice_items_invoice_idx
  on public.developer_company_invoice_items(invoice_id);

create index if not exists developer_company_payments_invoice_status_idx
  on public.developer_company_payments(invoice_id, status)
  where invoice_id is not null;

create index if not exists developer_company_receipts_company_issued_idx
  on public.developer_company_receipts(company_id, issued_at desc);

alter table public.developer_company_payments
  drop constraint if exists developer_company_payments_amount_check;

alter table public.developer_company_payments
  add constraint developer_company_payments_amount_check check (amount > 0);

alter table public.developer_company_invoices
  drop constraint if exists developer_company_invoices_amounts_check;

alter table public.developer_company_invoices
  add constraint developer_company_invoices_amounts_check check (
    subtotal >= 0
    and discount >= 0
    and taxable_amount >= 0
    and cgst >= 0
    and sgst >= 0
    and igst >= 0
    and grand_total >= 0
    and paid_amount >= 0
    and paid_amount <= grand_total + 0.01
  );

alter table public.developer_company_invoice_items
  drop constraint if exists developer_company_invoice_items_amounts_check;

alter table public.developer_company_invoice_items
  add constraint developer_company_invoice_items_amounts_check check (
    quantity > 0
    and rate >= 0
    and discount >= 0
    and tax_rate >= 0
    and tax_rate <= 100
    and amount >= 0
  );

create or replace function public.developer_company360_update_subscription(
  p_company_id uuid,
  p_actor uuid,
  p_expected_revision integer,
  p_plan_key text,
  p_status text,
  p_reason text,
  p_trial_start_at timestamptz,
  p_trial_end_at timestamptz,
  p_subscription_start_at timestamptz,
  p_subscription_end_at timestamptz
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_company public.companies%rowtype;
  v_before public.subscriptions%rowtype;
  v_after public.subscriptions%rowtype;
  v_plan public.developer_plans%rowtype;
  v_plan_key text := nullif(lower(btrim(coalesce(p_plan_key,''))), '');
  v_status text := lower(btrim(coalesce(p_status,'')));
  v_vehicle_count integer := 0;
  v_employee_count integer := 0;
  v_site_count integer := 0;
  v_vehicle_limit integer;
  v_user_limit integer;
  v_site_limit integer;
begin
  select * into v_company
  from public.companies
  where id = p_company_id
  for update;

  if v_company.id is null then
    return jsonb_build_object('ok',false,'code','COMPANY_NOT_FOUND');
  end if;

  if v_company.status in ('pending_confirmation','suspended','cancelled') then
    return jsonb_build_object(
      'ok',false,
      'code','COMPANY_CONTROL_STATE_LOCKED',
      'message','Resolve the company control state before changing its commercial subscription.',
      'company_status',v_company.status
    );
  end if;

  select * into v_before
  from public.subscriptions
  where company_id = p_company_id
  for update;

  if v_before.id is null then
    return jsonb_build_object('ok',false,'code','SUBSCRIPTION_NOT_FOUND');
  end if;

  if coalesce(p_expected_revision,0) <> coalesce(v_before.revision,1) then
    return jsonb_build_object(
      'ok',false,
      'code','REVISION_CONFLICT',
      'message','Subscription changed in another session. Refresh and try again.',
      'current_revision',coalesce(v_before.revision,1)
    );
  end if;

  if v_status not in ('trial_active','trial_expired','active') then
    return jsonb_build_object('ok',false,'code','INVALID_SUBSCRIPTION_STATUS');
  end if;

  if length(btrim(coalesce(p_reason,''))) < 3 then
    return jsonb_build_object('ok',false,'code','CHANGE_REASON_REQUIRED','message','Add a short reason for this commercial change.');
  end if;

  if v_plan_key is not null then
    select * into v_plan
    from public.developer_plans
    where plan_key = v_plan_key
      and status = 'active';

    if v_plan.id is null then
      return jsonb_build_object('ok',false,'code','PLAN_NOT_AVAILABLE');
    end if;

    begin
      v_vehicle_limit := nullif(v_plan.limits->>'vehicles_max','')::integer;
      v_user_limit := nullif(v_plan.limits->>'users','')::integer;
      v_site_limit := nullif(v_plan.limits->>'sites','')::integer;
    exception when others then
      return jsonb_build_object('ok',false,'code','INVALID_PLAN_LIMIT_CONFIGURATION');
    end;

    select count(*)::integer into v_vehicle_count
    from public.company_portal_vehicles
    where company_id = p_company_id;

    select count(*)::integer into v_employee_count
    from public.developer_company_employees
    where company_id = p_company_id and status = 'active';

    select count(*)::integer into v_site_count
    from public.company_portal_sites
    where company_id = p_company_id and status = 'active';

    if (v_vehicle_limit is not null and v_vehicle_count > v_vehicle_limit)
       or (v_user_limit is not null and v_employee_count > v_user_limit)
       or (v_site_limit is not null and v_site_count > v_site_limit)
    then
      return jsonb_build_object(
        'ok',false,
        'code','PLAN_LIMIT_CONFLICT',
        'message','Current tenant usage exceeds the selected plan limits.',
        'usage',jsonb_build_object('vehicles',v_vehicle_count,'users',v_employee_count,'sites',v_site_count),
        'limits',jsonb_build_object('vehicles_max',v_vehicle_limit,'users',v_user_limit,'sites',v_site_limit)
      );
    end if;
  end if;

  if v_status = 'active' and v_plan_key is null then
    return jsonb_build_object('ok',false,'code','PLAN_REQUIRED_FOR_ACTIVE_SUBSCRIPTION');
  end if;

  if v_status in ('trial_active','trial_expired') then
    if p_trial_start_at is null or p_trial_end_at is null or p_trial_end_at <= p_trial_start_at then
      return jsonb_build_object('ok',false,'code','INVALID_TRIAL_RANGE');
    end if;
  end if;

  if v_status = 'active' then
    if p_subscription_start_at is null then
      return jsonb_build_object('ok',false,'code','SUBSCRIPTION_START_REQUIRED');
    end if;
    if p_subscription_end_at is not null and p_subscription_end_at <= p_subscription_start_at then
      return jsonb_build_object('ok',false,'code','INVALID_SUBSCRIPTION_RANGE');
    end if;
  end if;

  update public.subscriptions
     set plan_key = v_plan_key,
         status = v_status,
         trial_start_at = p_trial_start_at,
         trial_end_at = p_trial_end_at,
         subscription_start_at = p_subscription_start_at,
         subscription_end_at = p_subscription_end_at,
         revision = coalesce(v_before.revision,1) + 1,
         updated_by = p_actor,
         updated_at = now()
   where id = v_before.id
   returning * into v_after;

  update public.companies
     set status = v_status
   where id = p_company_id;

  insert into public.developer_saas_history (
    domain,entity_id,action,before_payload,after_payload,actor_user_id,created_at
  ) values (
    'company_360',p_company_id::text,'subscription_update',to_jsonb(v_before),
    jsonb_build_object('subscription',to_jsonb(v_after),'company_status',v_status,'plan_key',v_after.plan_key,'status',v_after.status,'revision',v_after.revision,'reason',btrim(p_reason)),p_actor,now()
  );

  return jsonb_build_object(
    'ok',true,
    'subscription',to_jsonb(v_after),
    'before',to_jsonb(v_before),
    'company_status',v_status
  );
end;
$$;

create or replace function public.developer_company360_create_invoice(
  p_company_id uuid,
  p_actor uuid,
  p_request_id uuid,
  p_invoice_type text,
  p_invoice_date date,
  p_due_date date,
  p_currency text,
  p_billing_period_start date,
  p_billing_period_end date,
  p_place_of_supply text,
  p_notes text,
  p_terms text,
  p_interstate boolean,
  p_round_off numeric,
  p_items jsonb,
  p_company_snapshot jsonb,
  p_plan_snapshot jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_existing public.developer_company_invoices%rowtype;
  v_invoice public.developer_company_invoices%rowtype;
  v_invoice_number text;
  v_invoice_type text := lower(btrim(coalesce(p_invoice_type,'subscription')));
  v_currency text := upper(btrim(coalesce(p_currency,'INR')));
  v_item jsonb;
  v_items_normalized jsonb := '[]'::jsonb;
  v_description text;
  v_quantity numeric;
  v_rate numeric;
  v_discount numeric;
  v_tax_rate numeric;
  v_hsn_sac text;
  v_line_gross numeric;
  v_line_taxable numeric;
  v_line_tax numeric;
  v_subtotal numeric := 0;
  v_discount_total numeric := 0;
  v_taxable_total numeric := 0;
  v_tax_total numeric := 0;
  v_cgst numeric := 0;
  v_sgst numeric := 0;
  v_igst numeric := 0;
  v_round_off numeric := round(coalesce(p_round_off,0),2);
  v_grand_total numeric := 0;
  v_sort integer := 0;
begin
  if p_request_id is null then
    return jsonb_build_object('ok',false,'code','REQUEST_ID_REQUIRED');
  end if;

  select * into v_existing
  from public.developer_company_invoices
  where company_id = p_company_id and request_id = p_request_id;

  if v_existing.id is not null then
    return jsonb_build_object('ok',true,'created',false,'invoice',to_jsonb(v_existing));
  end if;

  if not exists (select 1 from public.companies where id = p_company_id) then
    return jsonb_build_object('ok',false,'code','COMPANY_NOT_FOUND');
  end if;

  if v_invoice_type not in ('subscription','renewal','upgrade','addon','custom','proforma') then
    return jsonb_build_object('ok',false,'code','INVALID_INVOICE_TYPE');
  end if;

  if p_invoice_date is null then
    return jsonb_build_object('ok',false,'code','INVOICE_DATE_REQUIRED');
  end if;

  if p_due_date is not null and p_due_date < p_invoice_date then
    return jsonb_build_object('ok',false,'code','INVALID_INVOICE_DUE_DATE');
  end if;

  if p_billing_period_start is not null and p_billing_period_end is not null
     and p_billing_period_end < p_billing_period_start then
    return jsonb_build_object('ok',false,'code','INVALID_BILLING_PERIOD');
  end if;

  if v_currency !~ '^[A-Z]{3,5}$' then
    return jsonb_build_object('ok',false,'code','INVALID_CURRENCY');
  end if;

  if v_round_off < -100 or v_round_off > 100 then
    return jsonb_build_object('ok',false,'code','INVALID_ROUND_OFF');
  end if;

  if jsonb_typeof(coalesce(p_items,'[]'::jsonb)) <> 'array'
     or jsonb_array_length(coalesce(p_items,'[]'::jsonb)) < 1
     or jsonb_array_length(coalesce(p_items,'[]'::jsonb)) > 100 then
    return jsonb_build_object('ok',false,'code','INVOICE_ITEMS_REQUIRED');
  end if;

  for v_item in select value from jsonb_array_elements(p_items)
  loop
    begin
      v_description := btrim(coalesce(v_item->>'description',''));
      v_quantity := coalesce((v_item->>'quantity')::numeric,1);
      v_rate := coalesce((v_item->>'rate')::numeric,0);
      v_discount := coalesce((v_item->>'discount')::numeric,0);
      v_tax_rate := coalesce((v_item->>'tax_rate')::numeric,0);
      v_hsn_sac := btrim(coalesce(v_item->>'hsn_sac',''));
    exception when others then
      return jsonb_build_object('ok',false,'code','INVALID_INVOICE_ITEM');
    end;

    if v_description = '' or length(v_description) > 500
       or v_quantity <= 0 or v_rate < 0 or v_discount < 0
       or v_tax_rate < 0 or v_tax_rate > 100 then
      return jsonb_build_object('ok',false,'code','INVALID_INVOICE_ITEM');
    end if;

    v_line_gross := round(v_quantity * v_rate,2);
    if v_discount > v_line_gross then
      return jsonb_build_object('ok',false,'code','INVOICE_DISCOUNT_EXCEEDS_LINE_TOTAL');
    end if;

    v_line_taxable := round(v_line_gross - v_discount,2);
    v_line_tax := round(v_line_taxable * v_tax_rate / 100,2);

    v_subtotal := v_subtotal + v_line_gross;
    v_discount_total := v_discount_total + v_discount;
    v_taxable_total := v_taxable_total + v_line_taxable;
    v_tax_total := v_tax_total + v_line_tax;

    v_items_normalized := v_items_normalized || jsonb_build_array(jsonb_build_object(
      'description',v_description,
      'quantity',v_quantity,
      'rate',round(v_rate,2),
      'discount',round(v_discount,2),
      'tax_rate',round(v_tax_rate,2),
      'hsn_sac',v_hsn_sac,
      'amount',v_line_taxable,
      'sort_order',v_sort
    ));
    v_sort := v_sort + 1;
  end loop;

  v_subtotal := round(v_subtotal,2);
  v_discount_total := round(v_discount_total,2);
  v_taxable_total := round(v_taxable_total,2);
  v_tax_total := round(v_tax_total,2);

  if coalesce(p_interstate,false) then
    v_igst := v_tax_total;
  else
    v_cgst := round(v_tax_total / 2,2);
    v_sgst := round(v_tax_total - v_cgst,2);
  end if;

  v_grand_total := round(v_taxable_total + v_tax_total + v_round_off,2);
  if v_grand_total < 0 then
    return jsonb_build_object('ok',false,'code','INVALID_INVOICE_TOTAL');
  end if;

  select public.developer_next_invoice_number() into v_invoice_number;

  begin
    insert into public.developer_company_invoices (
      company_id,request_id,invoice_number,invoice_type,invoice_date,due_date,currency,
      subtotal,discount,taxable_amount,cgst,sgst,igst,round_off,grand_total,paid_amount,status,
      billing_period_start,billing_period_end,place_of_supply,notes,terms,company_snapshot,plan_snapshot,
      created_by,updated_by,created_at,updated_at
    ) values (
      p_company_id,p_request_id,v_invoice_number,v_invoice_type,p_invoice_date,p_due_date,v_currency,
      v_subtotal,v_discount_total,v_taxable_total,v_cgst,v_sgst,v_igst,v_round_off,v_grand_total,0,
      case when v_invoice_type = 'proforma' then 'draft' else 'issued' end,
      p_billing_period_start,p_billing_period_end,coalesce(p_place_of_supply,''),coalesce(p_notes,''),coalesce(p_terms,''),
      coalesce(p_company_snapshot,'{}'::jsonb),coalesce(p_plan_snapshot,'{}'::jsonb),
      p_actor,p_actor,now(),now()
    ) returning * into v_invoice;
  exception when unique_violation then
    select * into v_existing
    from public.developer_company_invoices
    where company_id = p_company_id and request_id = p_request_id;
    if v_existing.id is not null then
      return jsonb_build_object('ok',true,'created',false,'invoice',to_jsonb(v_existing));
    end if;
    raise;
  end;

  insert into public.developer_company_invoice_items (
    invoice_id,description,quantity,rate,discount,tax_rate,hsn_sac,amount,sort_order
  )
  select
    v_invoice.id,
    item->>'description',
    (item->>'quantity')::numeric,
    (item->>'rate')::numeric,
    (item->>'discount')::numeric,
    (item->>'tax_rate')::numeric,
    item->>'hsn_sac',
    (item->>'amount')::numeric,
    (item->>'sort_order')::integer
  from jsonb_array_elements(v_items_normalized) item;

  insert into public.developer_saas_history (
    domain,entity_id,action,before_payload,after_payload,actor_user_id,created_at
  ) values (
    'company_360',p_company_id::text,'invoice_create',null,
    jsonb_build_object('invoice_id',v_invoice.id,'invoice_number',v_invoice.invoice_number,'total',v_invoice.grand_total,'request_id',p_request_id),p_actor,now()
  );

  return jsonb_build_object('ok',true,'created',true,'invoice',to_jsonb(v_invoice),'items',v_items_normalized);
end;
$$;

create or replace function public.developer_company360_record_payment(
  p_company_id uuid,
  p_actor uuid,
  p_request_id uuid,
  p_invoice_id uuid,
  p_amount numeric,
  p_payment_date date,
  p_payment_mode text,
  p_transaction_reference text,
  p_proof_url text,
  p_remarks text
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_existing public.developer_company_payments%rowtype;
  v_payment public.developer_company_payments%rowtype;
  v_invoice public.developer_company_invoices%rowtype;
  v_reserved numeric := 0;
  v_available numeric := 0;
  v_reference text := btrim(coalesce(p_transaction_reference,''));
  v_mode text := lower(btrim(coalesce(p_payment_mode,'bank_transfer')));
begin
  if p_request_id is null then
    return jsonb_build_object('ok',false,'code','REQUEST_ID_REQUIRED');
  end if;

  select * into v_existing
  from public.developer_company_payments
  where company_id = p_company_id and request_id = p_request_id;

  if v_existing.id is not null then
    return jsonb_build_object('ok',true,'created',false,'payment',to_jsonb(v_existing));
  end if;

  if not exists (select 1 from public.companies where id = p_company_id) then
    return jsonb_build_object('ok',false,'code','COMPANY_NOT_FOUND');
  end if;

  if p_amount is null or round(p_amount,2) <= 0 then
    return jsonb_build_object('ok',false,'code','INVALID_PAYMENT_AMOUNT');
  end if;

  if p_payment_date is null then
    return jsonb_build_object('ok',false,'code','PAYMENT_DATE_REQUIRED');
  end if;

  if v_mode not in ('upi','bank_transfer','card','payment_gateway','cheque','cash','other') then
    return jsonb_build_object('ok',false,'code','INVALID_PAYMENT_MODE');
  end if;

  if v_mode <> 'cash' and v_reference = '' then
    return jsonb_build_object('ok',false,'code','TRANSACTION_REFERENCE_REQUIRED','message','Transaction / UTR reference is required for non-cash payments.');
  end if;

  if v_reference <> '' and exists (
    select 1 from public.developer_company_payments
    where company_id = p_company_id
      and lower(btrim(transaction_reference)) = lower(v_reference)
      and status in ('pending','submitted','verified')
  ) then
    return jsonb_build_object('ok',false,'code','PAYMENT_REFERENCE_EXISTS','message','This transaction reference is already recorded for the company.');
  end if;

  if p_invoice_id is not null then
    select * into v_invoice
    from public.developer_company_invoices
    where id = p_invoice_id and company_id = p_company_id
    for update;

    if v_invoice.id is null then
      return jsonb_build_object('ok',false,'code','INVOICE_NOT_FOUND');
    end if;

    if v_invoice.status in ('draft','paid','cancelled','void') then
      return jsonb_build_object('ok',false,'code','INVOICE_NOT_PAYABLE','invoice_status',v_invoice.status);
    end if;

    select coalesce(sum(amount),0) into v_reserved
    from public.developer_company_payments
    where invoice_id = p_invoice_id
      and company_id = p_company_id
      and status in ('pending','submitted','verified');

    v_available := round(v_invoice.grand_total - v_reserved,2);
    if round(p_amount,2) > v_available + 0.01 then
      return jsonb_build_object(
        'ok',false,
        'code','PAYMENT_EXCEEDS_OPEN_BALANCE',
        'message','Payment amount exceeds the invoice balance after pending and verified payments.',
        'available',greatest(v_available,0),
        'invoice_total',v_invoice.grand_total
      );
    end if;
  end if;

  begin
    insert into public.developer_company_payments (
      company_id,request_id,invoice_id,amount,payment_date,payment_mode,transaction_reference,
      proof_url,status,remarks,created_by,created_at,updated_at
    ) values (
      p_company_id,p_request_id,p_invoice_id,round(p_amount,2),p_payment_date,v_mode,v_reference,
      coalesce(p_proof_url,''),'submitted',coalesce(p_remarks,''),p_actor,now(),now()
    ) returning * into v_payment;
  exception when unique_violation then
    select * into v_existing
    from public.developer_company_payments
    where company_id = p_company_id and request_id = p_request_id;
    if v_existing.id is not null then
      return jsonb_build_object('ok',true,'created',false,'payment',to_jsonb(v_existing));
    end if;
    return jsonb_build_object('ok',false,'code','PAYMENT_REFERENCE_EXISTS','message','This transaction reference is already recorded for the company.');
  end;

  insert into public.developer_saas_history (
    domain,entity_id,action,before_payload,after_payload,actor_user_id,created_at
  ) values (
    'company_360',p_company_id::text,'payment_record',null,
    jsonb_build_object('payment_id',v_payment.id,'amount',v_payment.amount,'status',v_payment.status,'invoice_id',v_payment.invoice_id,'request_id',p_request_id),p_actor,now()
  );

  return jsonb_build_object('ok',true,'created',true,'payment',to_jsonb(v_payment));
end;
$$;

create or replace function public.developer_company360_verify_payment(
  p_company_id uuid,
  p_payment_id uuid,
  p_actor uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_payment public.developer_company_payments%rowtype;
  v_invoice public.developer_company_invoices%rowtype;
  v_receipt public.developer_company_receipts%rowtype;
  v_receipt_number text;
  v_other_verified numeric := 0;
  v_paid numeric := 0;
  v_invoice_status text;
  v_verified_now boolean := false;
begin
  select * into v_payment
  from public.developer_company_payments
  where id = p_payment_id and company_id = p_company_id
  for update;

  if v_payment.id is null then
    return jsonb_build_object('ok',false,'code','PAYMENT_NOT_FOUND');
  end if;

  if v_payment.status not in ('pending','submitted','verified') then
    return jsonb_build_object('ok',false,'code','PAYMENT_NOT_VERIFIABLE','payment_status',v_payment.status);
  end if;

  if v_payment.invoice_id is not null then
    select * into v_invoice
    from public.developer_company_invoices
    where id = v_payment.invoice_id and company_id = p_company_id
    for update;

    if v_invoice.id is null then
      return jsonb_build_object('ok',false,'code','INVOICE_NOT_FOUND');
    end if;

    if v_invoice.status in ('draft','cancelled','void') then
      return jsonb_build_object('ok',false,'code','INVOICE_NOT_PAYABLE','invoice_status',v_invoice.status);
    end if;

    select coalesce(sum(amount),0) into v_other_verified
    from public.developer_company_payments
    where invoice_id = v_invoice.id
      and company_id = p_company_id
      and status = 'verified'
      and id <> v_payment.id;

    if v_payment.status <> 'verified' and v_other_verified + v_payment.amount > v_invoice.grand_total + 0.01 then
      return jsonb_build_object(
        'ok',false,
        'code','PAYMENT_EXCEEDS_OPEN_BALANCE',
        'message','Verifying this payment would overpay the linked invoice.',
        'available',greatest(round(v_invoice.grand_total - v_other_verified,2),0)
      );
    end if;
  end if;

  if v_payment.status <> 'verified' then
    update public.developer_company_payments
       set status = 'verified',
           verified_by = p_actor,
           verified_at = now(),
           updated_at = now()
     where id = v_payment.id
     returning * into v_payment;
    v_verified_now := true;
  end if;

  if v_invoice.id is not null then
    select coalesce(sum(amount),0) into v_paid
    from public.developer_company_payments
    where invoice_id = v_invoice.id
      and company_id = p_company_id
      and status = 'verified';

    v_paid := least(round(v_paid,2),v_invoice.grand_total);
    v_invoice_status := case
      when v_paid >= v_invoice.grand_total - 0.01 then 'paid'
      when v_invoice.due_date is not null and v_invoice.due_date < current_date then 'overdue'
      when v_paid > 0 then 'partially_paid'
      else 'issued'
    end;

    update public.developer_company_invoices
       set paid_amount = v_paid,
           status = v_invoice_status,
           updated_by = p_actor,
           updated_at = now()
     where id = v_invoice.id
     returning * into v_invoice;
  end if;

  select * into v_receipt
  from public.developer_company_receipts
  where payment_id = v_payment.id;

  if v_receipt.id is null then
    select public.developer_next_receipt_number() into v_receipt_number;
    begin
      insert into public.developer_company_receipts (
        company_id,payment_id,receipt_number,issued_at,snapshot,created_by
      ) values (
        p_company_id,
        v_payment.id,
        v_receipt_number,
        now(),
        jsonb_build_object(
          'amount',v_payment.amount,
          'payment_date',v_payment.payment_date,
          'payment_mode',v_payment.payment_mode,
          'transaction_reference',v_payment.transaction_reference,
          'invoice_id',v_payment.invoice_id,
          'invoice_number',case when v_invoice.id is null then null else v_invoice.invoice_number end
        ),
        p_actor
      ) returning * into v_receipt;
    exception when unique_violation then
      select * into v_receipt
      from public.developer_company_receipts
      where payment_id = v_payment.id;
    end;
  end if;

  if v_verified_now then
    insert into public.developer_saas_history (
      domain,entity_id,action,before_payload,after_payload,actor_user_id,created_at
    ) values (
      'company_360',p_company_id::text,'payment_verify',null,
      jsonb_build_object('payment_id',v_payment.id,'amount',v_payment.amount,'invoice_id',v_payment.invoice_id,'receipt_id',v_receipt.id,'receipt_number',v_receipt.receipt_number),p_actor,now()
    );
  end if;

  return jsonb_build_object(
    'ok',true,
    'verified_now',v_verified_now,
    'payment',to_jsonb(v_payment),
    'invoice',case when v_invoice.id is null then null else to_jsonb(v_invoice) end,
    'receipt',to_jsonb(v_receipt)
  );
end;
$$;

create or replace function public.developer_company360_reject_payment(
  p_company_id uuid,
  p_payment_id uuid,
  p_actor uuid,
  p_reason text
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_payment public.developer_company_payments%rowtype;
  v_changed boolean := false;
begin
  if length(btrim(coalesce(p_reason,''))) < 3 then
    return jsonb_build_object('ok',false,'code','REJECTION_REASON_REQUIRED','message','Add a reason before rejecting this payment.');
  end if;

  select * into v_payment
  from public.developer_company_payments
  where id = p_payment_id and company_id = p_company_id
  for update;

  if v_payment.id is null then
    return jsonb_build_object('ok',false,'code','PAYMENT_NOT_FOUND');
  end if;

  if v_payment.status = 'rejected' then
    return jsonb_build_object('ok',true,'changed',false,'payment',to_jsonb(v_payment));
  end if;

  if v_payment.status in ('verified','refunded') then
    return jsonb_build_object('ok',false,'code','PAYMENT_NOT_REJECTABLE','payment_status',v_payment.status);
  end if;

  update public.developer_company_payments
     set status = 'rejected',
         remarks = case
           when nullif(btrim(coalesce(p_reason,'')),'') is null then remarks
           when nullif(btrim(coalesce(remarks,'')),'') is null then btrim(p_reason)
           else remarks || E'\nRejected: ' || btrim(p_reason)
         end,
         updated_at = now()
   where id = v_payment.id
   returning * into v_payment;

  v_changed := true;

  insert into public.developer_saas_history (
    domain,entity_id,action,before_payload,after_payload,actor_user_id,created_at
  ) values (
    'company_360',p_company_id::text,'payment_reject',null,
    jsonb_build_object('payment_id',v_payment.id,'amount',v_payment.amount,'invoice_id',v_payment.invoice_id,'reason',btrim(coalesce(p_reason,''))),p_actor,now()
  );

  return jsonb_build_object('ok',true,'changed',v_changed,'payment',to_jsonb(v_payment));
end;
$$;

revoke all on function public.developer_company360_update_subscription(uuid,uuid,integer,text,text,text,timestamptz,timestamptz,timestamptz,timestamptz) from public, anon, authenticated;
grant execute on function public.developer_company360_update_subscription(uuid,uuid,integer,text,text,text,timestamptz,timestamptz,timestamptz,timestamptz) to service_role;

revoke all on function public.developer_company360_create_invoice(uuid,uuid,uuid,text,date,date,text,date,date,text,text,text,boolean,numeric,jsonb,jsonb,jsonb) from public, anon, authenticated;
grant execute on function public.developer_company360_create_invoice(uuid,uuid,uuid,text,date,date,text,date,date,text,text,text,boolean,numeric,jsonb,jsonb,jsonb) to service_role;

revoke all on function public.developer_company360_record_payment(uuid,uuid,uuid,uuid,numeric,date,text,text,text,text) from public, anon, authenticated;
grant execute on function public.developer_company360_record_payment(uuid,uuid,uuid,uuid,numeric,date,text,text,text,text) to service_role;

revoke all on function public.developer_company360_verify_payment(uuid,uuid,uuid) from public, anon, authenticated;
grant execute on function public.developer_company360_verify_payment(uuid,uuid,uuid) to service_role;

revoke all on function public.developer_company360_reject_payment(uuid,uuid,uuid,text) from public, anon, authenticated;
grant execute on function public.developer_company360_reject_payment(uuid,uuid,uuid,text) to service_role;
