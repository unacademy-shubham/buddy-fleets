const STATUS_DEFAULT = ['planned','pending','assigned','ready','in_progress','in_transit','completed','delivered','closed','cancelled'];

const COMMON_FIELDS = [
  { key:'site_id', label:'Site / Branch', type:'site' },
  { key:'reference_no', label:'Reference No.' },
  { key:'title', label:'Title / Description' },
  { key:'party_name', label:'Party / Customer' },
  { key:'vehicle_number', label:'Vehicle Number' },
  { key:'driver_name', label:'Driver' },
  { key:'origin', label:'Origin / From' },
  { key:'destination', label:'Destination / To' },
  { key:'scheduled_at', label:'Scheduled At', type:'datetime-local' },
  { key:'status', label:'Status', type:'select', options:STATUS_DEFAULT },
  { key:'quantity', label:'Quantity', type:'number' },
  { key:'quantity_unit', label:'Unit' },
  { key:'amount', label:'Amount', type:'number' },
  { key:'notes', label:'Notes', type:'textarea', full:true },
];

function schema(title, overrides={}) {
  return {
    title,
    recordType: overrides.recordType || 'record',
    referenceLabel: overrides.referenceLabel || 'Reference No.',
    quantityLabel: overrides.quantityLabel || 'Quantity',
    quantityUnit: overrides.quantityUnit || '',
    statusOptions: overrides.statusOptions || STATUS_DEFAULT,
    fields: overrides.fields || COMMON_FIELDS,
  };
}

export const OPERATIONAL_SCHEMAS = {
  live_operations: schema('Live Operation', {recordType:'operation'}),
  vehicle_inspection: schema('Vehicle Inspection', {recordType:'inspection',referenceLabel:'Inspection No.',statusOptions:['scheduled','in_progress','passed','attention','failed','closed']}),
  trips: schema('Trip', {recordType:'trip',referenceLabel:'Trip No.',statusOptions:['planned','assigned','started','in_transit','completed','cancelled']}),
  route_planning: schema('Route Plan', {recordType:'route_plan',referenceLabel:'Route / Plan No.'}),
  dispatch: schema('Duty / Dispatch', {recordType:'dispatch',referenceLabel:'Dispatch / Duty No.',statusOptions:['planned','assigned','reported','dispatched','completed','cancelled']}),
  lr_bilty: schema('LR / Bilty', {recordType:'lr_bilty',referenceLabel:'LR / Bilty No.',quantityLabel:'Weight / Qty'}),
  epod: schema('ePOD / Delivery', {recordType:'pod',referenceLabel:'POD / Delivery No.',statusOptions:['pending','received','verified','exception','closed']}),
  delivery_records: schema('Delivery Record', {recordType:'delivery',referenceLabel:'Delivery No.',statusOptions:['scheduled','in_transit','delivered','exception','closed']}),
  fuel: schema('Fuel Entry', {recordType:'fuel',referenceLabel:'Fuel Slip / Ref.',quantityLabel:'Litres',quantityUnit:'L',statusOptions:['recorded','verified','rejected']}),
  driver_payments: schema('Driver Payment', {recordType:'driver_payment',referenceLabel:'Payment / Advance Ref.',statusOptions:['pending','approved','paid','rejected']}),
  invoices: schema('Invoice / Settlement', {recordType:'invoice',referenceLabel:'Invoice / Settlement No.',statusOptions:['draft','issued','part_paid','paid','overdue','cancelled']}),
  party_ledgers: schema('Party Ledger Entry', {recordType:'ledger',referenceLabel:'Voucher / Ref.',statusOptions:['open','posted','settled','reversed']}),
  profit_loss: schema('Profit / Loss Entry', {recordType:'profit_loss',referenceLabel:'Period / Ref.',statusOptions:['draft','reviewed','final']}),
  compliance: schema('Compliance Record', {recordType:'compliance',referenceLabel:'Document / Compliance Ref.',statusOptions:['valid','due_soon','expired','pending_verification','verified']}),
  maintenance: schema('Maintenance Job', {recordType:'maintenance',referenceLabel:'Job Card No.',statusOptions:['scheduled','open','in_progress','completed','cancelled']}),
  tyres: schema('Tyre Record', {recordType:'tyre',referenceLabel:'Tyre / Position Ref.',statusOptions:['in_use','spare','repair','scrapped']}),
  spare_parts: schema('Spare Part Record', {recordType:'spare_part',referenceLabel:'Part / Issue Ref.',quantityLabel:'Quantity',statusOptions:['stock','issued','ordered','received','closed']}),
  challans: schema('Challan Record', {recordType:'challan',referenceLabel:'Challan No.',statusOptions:['open','paid','disputed','closed']}),
  notifications: schema('Notification', {recordType:'notification',referenceLabel:'Notification Ref.',statusOptions:['draft','scheduled','sent','read','archived']}),
  audit_activity: schema('Activity', {recordType:'activity'}),
  approval_center: schema('Approval Request', {recordType:'approval',referenceLabel:'Approval Ref.',statusOptions:['pending','approved','rejected','cancelled']}),

  travel_enquiries: schema('Travel Enquiry / Quotation', {recordType:'travel_enquiry',referenceLabel:'Enquiry / Quote No.',statusOptions:['new','quoted','follow_up','won','lost','closed']}),
  travel_availability: schema('Vehicle Availability', {recordType:'availability',referenceLabel:'Availability Ref.',statusOptions:['available','reserved','assigned','unavailable']}),
  travel_tours: schema('Tour / Trip Sheet', {recordType:'tour',referenceLabel:'Tour / Trip No.',statusOptions:['planned','confirmed','started','completed','cancelled']}),
  travel_driver_duty: schema('Driver Duty', {recordType:'driver_duty',referenceLabel:'Duty No.',statusOptions:['planned','assigned','reported','completed','cancelled']}),

  cement_queue: schema('Plant Queue / Yard', {recordType:'plant_queue',referenceLabel:'Queue / Gate Ref.',statusOptions:['reported','queued','gate_in','loading','gate_out','cancelled']}),
  cement_loading: schema('Loading / Weighbridge', {recordType:'cement_loading',referenceLabel:'Loading / WB Slip',quantityLabel:'Net Weight',quantityUnit:'MT',statusOptions:['waiting','loading','weighed','completed']}),
  cement_delivery: schema('Cement Delivery', {recordType:'cement_delivery',referenceLabel:'Delivery / POD No.',quantityLabel:'Bags / MT',statusOptions:['in_transit','delivered','pod_pending','pod_received','exception']}),
  cement_tat: schema('Turnaround / Detention', {recordType:'cement_tat',referenceLabel:'TAT Ref.',quantityLabel:'Hours',quantityUnit:'hr',statusOptions:['running','within_limit','detention','closed']}),

  goods_consignment: schema('Goods Consignment', {recordType:'goods_consignment',referenceLabel:'LR / Consignment No.',quantityLabel:'Weight',quantityUnit:'MT',statusOptions:['booked','load_planned','dispatched','in_transit','delivered','closed']}),
  goods_load_planning: schema('Load Plan', {recordType:'load_plan',referenceLabel:'Load Plan No.',quantityLabel:'Planned Load',quantityUnit:'MT',statusOptions:['draft','ready','assigned','loaded','dispatched','closed']}),
  goods_delivery: schema('Goods Delivery', {recordType:'goods_delivery',referenceLabel:'Delivery / POD No.',statusOptions:['in_transit','arrived','delivered','pod_pending','closed']}),
  goods_freight: schema('Freight Settlement', {recordType:'goods_freight',referenceLabel:'Freight / Settlement Ref.',statusOptions:['pending','approved','part_paid','paid','closed']}),

  container_movement: schema('Container Movement', {recordType:'container_movement',referenceLabel:'Container / Movement No.',statusOptions:['planned','gate_in','loaded','in_transit','at_icd','gate_out','delivered','closed']}),
  container_port_ops: schema('Port / ICD / CFS Operation', {recordType:'port_operation',referenceLabel:'Port Operation Ref.',statusOptions:['planned','at_port','customs','ready','released','closed']}),
  container_gate: schema('Container Gate Movement', {recordType:'gate_movement',referenceLabel:'Gate Pass / Ref.',statusOptions:['gate_in','inside','gate_out','closed']}),
  container_empty_return: schema('Empty Container Return', {recordType:'empty_return',referenceLabel:'Container No.',statusOptions:['pending','scheduled','returned','overdue','closed']}),
  container_detention: schema('Container Detention', {recordType:'detention',referenceLabel:'Container / Detention Ref.',quantityLabel:'Detention Hours',quantityUnit:'hr',statusOptions:['within_free_time','attention','detention','settled','closed']}),

  bulker_placement: schema('Bulker Placement', {recordType:'bulker_placement',referenceLabel:'Placement No.',statusOptions:['open','assigned','reported','closed']}),
  bulker_queue: schema('Bulker Plant Queue', {recordType:'bulker_queue',referenceLabel:'Queue / Gate Ref.',statusOptions:['reported','queued','gate_in','loading','gate_out']}),
  bulker_loading: schema('Bulker Loading', {recordType:'bulker_loading',referenceLabel:'Loading Ref.',quantityLabel:'Load',quantityUnit:'MT',statusOptions:['waiting','loading','completed']}),
  bulker_weighbridge: schema('Bulker Weighbridge', {recordType:'bulker_weighbridge',referenceLabel:'Weighbridge Slip',quantityLabel:'Net Weight',quantityUnit:'MT',statusOptions:['gross_done','tare_done','verified','closed']}),
  bulker_unloading: schema('Bulker Unloading', {recordType:'bulker_unloading',referenceLabel:'Unloading Ref.',quantityLabel:'Delivered Qty',quantityUnit:'MT',statusOptions:['arrived','unloading','completed','exception']}),
  bulker_tat: schema('Bulker Turnaround / Detention', {recordType:'bulker_tat',referenceLabel:'TAT Ref.',quantityLabel:'Hours',quantityUnit:'hr',statusOptions:['running','within_limit','detention','closed']}),

  staff_routes: schema('Staff Route', {recordType:'staff_route',referenceLabel:'Route Code',quantityLabel:'Stops',statusOptions:['active','inactive','draft']}),
  staff_shifts: schema('Staff Shift', {recordType:'staff_shift',referenceLabel:'Shift Code',quantityLabel:'Routes',statusOptions:['active','inactive','draft']}),
  staff_roster: schema('Duty Roster', {recordType:'staff_roster',referenceLabel:'Roster No.',statusOptions:['draft','published','in_progress','completed']}),
  staff_allocation: schema('Vehicle / Driver Allocation', {recordType:'staff_allocation',referenceLabel:'Allocation No.',statusOptions:['planned','assigned','dispatched','completed']}),
  staff_attendance: schema('Staff Boarding / Attendance', {recordType:'staff_attendance',referenceLabel:'Attendance Ref.',quantityLabel:'Boarded',statusOptions:['scheduled','boarding','completed','exception']}),
  staff_contracts: schema('Corporate Contract', {recordType:'staff_contract',referenceLabel:'Contract No.',statusOptions:['draft','active','renewal_due','expired','closed']}),

  school_routes: schema('School Route / Stop', {recordType:'school_route',referenceLabel:'Route Code',quantityLabel:'Stops',statusOptions:['active','inactive','draft']}),
  school_students: schema('Student Transport Record', {recordType:'school_student',referenceLabel:'Student / Admission Ref.',statusOptions:['active','inactive','hold']}),
  school_assignments: schema('Student Route Assignment', {recordType:'school_assignment',referenceLabel:'Assignment Ref.',statusOptions:['active','pending','changed','closed']}),
  school_pickup_drop: schema('Pickup / Drop Record', {recordType:'school_pickup_drop',referenceLabel:'Trip / Event Ref.',statusOptions:['scheduled','boarded','pickup_complete','drop_complete','missed','exception']}),
  school_attendance: schema('School Transport Attendance', {recordType:'school_attendance',referenceLabel:'Attendance Ref.',quantityLabel:'Students Boarded',statusOptions:['scheduled','in_progress','completed','exception']}),
  school_attendants: schema('Driver / Attendant Duty', {recordType:'school_attendant',referenceLabel:'Duty Ref.',statusOptions:['assigned','reported','completed','absent']}),
};

export function getOperationalSchema(moduleKey, label='Operational Record') {
  const base = OPERATIONAL_SCHEMAS[moduleKey] || schema(label, {recordType:moduleKey||'record'});
  return {
    ...base,
    fields: base.fields.map(field => {
      if (field.key === 'reference_no') return {...field,label:base.referenceLabel};
      if (field.key === 'quantity') return {...field,label:base.quantityLabel};
      if (field.key === 'quantity_unit' && base.quantityUnit) return {...field,placeholder:base.quantityUnit};
      if (field.key === 'status') return {...field,options:base.statusOptions};
      return field;
    }),
  };
}
