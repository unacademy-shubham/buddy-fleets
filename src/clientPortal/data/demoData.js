const daysFromNow = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
};
const isoHoursFromNow = (hours) => new Date(Date.now() + hours * 3600000).toISOString();

function billingSample(planName = 'Scale', prefix = 'DEMO') {
  return {
    plan: { plan_key: String(planName).toLowerCase().replace(/\s+/g,'_'), name: planName },
    subscription: {
      status: 'active',
      start_date: daysFromNow(-28),
      current_period_end: daysFromNow(337),
      billing_cycle: 'annual',
    },
    limits: { vehicles_max: 200, users: 10, sites: 5 },
    invoices: [
      { id:`${prefix}-inv-1`, invoice_number:`BF/26-27/${prefix}001`, invoice_date:daysFromNow(-28), billing_period_start:daysFromNow(-28), billing_period_end:daysFromNow(337), subtotal:216000, taxable_amount:216000, cgst:19440, sgst:19440, igst:0, grand_total:254880, paid_amount:254880, status:'paid' },
      { id:`${prefix}-inv-2`, invoice_number:`BF/25-26/${prefix}014`, invoice_date:daysFromNow(-393), billing_period_start:daysFromNow(-393), billing_period_end:daysFromNow(-29), subtotal:132000, taxable_amount:132000, cgst:11880, sgst:11880, igst:0, grand_total:155760, paid_amount:155760, status:'paid' },
    ],
    payments: [
      { id:`${prefix}-pay-1`, payment_date:daysFromNow(-27), amount:254880, payment_mode:'bank_transfer', transaction_reference:`UTR-${prefix}-2026`, status:'verified' },
    ],
    receipts: [
      { id:`${prefix}-rec-1`, receipt_number:`BFR/26-27/${prefix}001`, issued_at:daysFromNow(-27) },
    ],
  };
}

function commonUsers(prefix, siteNames) {
  return [
    { id:`${prefix}-u1`, full_name:'Demo Owner', name:'Demo Owner', email:'demo@buddyfleets.in', designation:'Owner', role_name:'Company Owner', role:'Company Owner', site_names:['All Sites'], status:'active', mfa_enabled:true },
    { id:`${prefix}-u2`, full_name:'Neha Shah', name:'Neha Shah', email:`accounts.${prefix}@demo.buddyfleets.in`, designation:'Accountant', role_name:'Accountant', role:'Accountant', site_names:siteNames.slice(0,2), status:'active', mfa_enabled:true },
    { id:`${prefix}-u3`, full_name:'Amit Rathod', name:'Amit Rathod', email:`operations.${prefix}@demo.buddyfleets.in`, designation:'Operations Executive', role_name:'Operations Manager', role:'Operations Manager', site_names:siteNames.slice(0,1), status:'active', mfa_enabled:false },
  ];
}

function commonVehicles(prefix, sites, vehicleTypes = ['32 FT MXL','Open Body Truck','Trailer']) {
  return Array.from({length:12}).map((_,i)=>({
    id:`${prefix}-v${i+1}`,
    vehicle_number:`GJ${String(1+(i%4)).padStart(2,'0')}BF${String(5100+i).padStart(4,'0')}`,
    vehicle_type:vehicleTypes[i%vehicleTypes.length],
    body_type:vehicleTypes[i%vehicleTypes.length],
    ownership:i%4===0?'Attached':'Own',
    home_site_id:sites[i%sites.length].id,
    current_site_id:sites[i%sites.length].id,
    status:['available','on_trip','in_transit','maintenance'][i%4],
    payload_mt:[24,28,31][i%3],
    seating_capacity:vehicleTypes.some(x=>/Bus|Traveller/i.test(x)) ? [17,27,45][i%3] : null,
    insurance_expiry:daysFromNow(30+i*7),
    fitness_expiry:daysFromNow(55+i*8),
  }));
}

function commonDrivers(prefix, sites, vehicles) {
  return Array.from({length:8}).map((_,i)=>({
    id:`${prefix}-d${i+1}`,
    driver_code:`DRV-${prefix.toUpperCase()}-${String(i+1).padStart(3,'0')}`,
    full_name:['Ramesh Patel','Imran Sheikh','Mahesh Solanki','Arjun Singh','Irfan Khan','Jignesh Parmar','Suresh Yadav','Harish Meena'][i],
    mobile:`98${String(76000000+i*761).padStart(8,'0')}`,
    primary_site_id:sites[i%sites.length].id,
    status:'active',
    dl_number:`DL-${prefix.toUpperCase()}-${i+101}`,
    dl_expiry:daysFromNow(70+i*13),
    current_vehicle:vehicles[i%vehicles.length]?.vehicle_number,
  }));
}

function commonExpenses(prefix, sites, vehicles) {
  return [
    { id:`${prefix}-e1`, date:daysFromNow(0), expense_date:daysFromNow(0), category:'Fuel', amount:18200, vehicle_number:vehicles[0]?.vehicle_number, vendor:'IOCL Fleet Pump', payment_mode:'Fleet Card', site_id:sites[0].id },
    { id:`${prefix}-e2`, date:daysFromNow(-1), expense_date:daysFromNow(-1), category:'Driver Advance', amount:5000, vehicle_number:vehicles[1]?.vehicle_number, vendor:'Driver Advance', payment_mode:'UPI', site_id:sites[Math.min(1,sites.length-1)].id },
  ];
}

function buildGenericPack({ key, prefix, companyName, companyCode, sites, vehicleTypes, metrics, tables, moduleRows }) {
  const vehicles = commonVehicles(prefix, sites, vehicleTypes);
  const drivers = commonDrivers(prefix, sites, vehicles);
  const siteNames = sites.map(s=>s.name);
  return {
    company:{ id:`demo-${key}`, company_name:companyName, company_code:companyCode, subdomain_slug:'demo', fleetPack:key, status:'active' },
    currentUser:{ id:`${prefix}-owner`, name:'Demo Owner', email:'demo@buddyfleets.in', role:'Company Owner', roleName:'Company Owner', isAccountOwner:true, mfaEnabled:true },
    sites,
    vehicles,
    drivers,
    users:commonUsers(prefix,siteNames),
    parties:[
      { id:`${prefix}-p1`, party_name:'Aarav Industries Pvt Ltd', party_type:'Customer', gstin:'24AACCA1234F1Z5', city:'Ahmedabad', state:'Gujarat', mobile:'9876500011', status:'active' },
      { id:`${prefix}-p2`, party_name:'Shakti Enterprise', party_type:'Vendor', gstin:'24AABCS1234K1Z2', city:'Vadodara', state:'Gujarat', mobile:'9876500022', status:'active' },
    ],
    expenses:commonExpenses(prefix,sites,vehicles),
    dashboardMetrics:metrics,
    dashboardTables:tables,
    moduleRows:moduleRows || {},
    billing:billingSample('Scale',prefix.toUpperCase()),
  };
}

const travelSites = [
  { id:'t-site-1', code:'AMD-HO', name:'Ahmedabad Head Office', site_type:'Head Office', city:'Ahmedabad', state:'Gujarat', status:'active', is_primary:true },
  { id:'t-site-2', code:'AMD-YARD', name:'Ahmedabad Parking Yard', site_type:'Parking Yard', city:'Ahmedabad', state:'Gujarat', status:'active' },
  { id:'t-site-3', code:'UDA-BR', name:'Udaipur Branch', site_type:'Branch Office', city:'Udaipur', state:'Rajasthan', status:'active' },
];
const travelVehicles = commonVehicles('trv', travelSites, ['Innova Crysta','Tempo Traveller','Luxury Coach','Ertiga','Mini Bus']);
travelVehicles.forEach((v,i)=>{v.status=['available','on_trip','on_trip','reserved','maintenance'][i%5];v.seating_capacity=[7,17,45,7,27][i%5];});
const travelDrivers = commonDrivers('trv',travelSites,travelVehicles);

const cementSites = [
  { id:'c-site-1', code:'KUT-PLANT', name:'Kutch Cement Plant', site_type:'Plant', city:'Kutch', state:'Gujarat', status:'active', is_primary:true },
  { id:'c-site-2', code:'AMD-PLANT', name:'Ahmedabad Cement Plant', site_type:'Plant', city:'Ahmedabad', state:'Gujarat', status:'active' },
  { id:'c-site-3', code:'SRT-PLANT', name:'Surat Cement Plant', site_type:'Plant', city:'Surat', state:'Gujarat', status:'active' },
  { id:'c-site-4', code:'JPR-PLANT', name:'Jaipur Cement Plant', site_type:'Plant', city:'Jaipur', state:'Rajasthan', status:'active' },
];
const cementVehicles = commonVehicles('cem',cementSites,['32 FT MXL','Open Body Truck']);
cementVehicles.forEach((v,i)=>{v.status=['available','at_plant','in_transit','delivered'][i%4];v.payload_mt=[28,30,31][i%3];});
const cementDrivers=commonDrivers('cem',cementSites,cementVehicles);

export const DEMO_COMPANIES = {
  travels: {
    company:{ id:'demo-travels-company', company_name:'Shree Balaji Travels', company_code:'DEMO-TRAVEL', subdomain_slug:'demo', fleetPack:'travels', status:'active' },
    currentUser:{ id:'demo-owner-travels', name:'Demo Owner', email:'demo@buddyfleets.in', role:'Company Owner', roleName:'Company Owner', isAccountOwner:true, mfaEnabled:true },
    sites:travelSites,
    vehicles:travelVehicles,
    drivers:travelDrivers,
    users:commonUsers('trv',travelSites.map(s=>s.name)),
    parties:[
      { id:'tp1', party_name:'Aarav Technologies Pvt Ltd', party_type:'Corporate Customer', gstin:'24AACCA1234F1Z5', city:'Ahmedabad', state:'Gujarat', mobile:'9876500011', status:'active' },
      { id:'tp2', party_name:'Royal Event Planners', party_type:'Customer', gstin:'', city:'Udaipur', state:'Rajasthan', mobile:'9876500022', status:'active' },
    ],
    bookings:[
      { id:'tb1', site_id:'t-site-1', booking_no:'BKG/26-27/00128', customer:'Aarav Technologies Pvt Ltd', pickup:'Ahmedabad', drop:'Udaipur', pickup_at:isoHoursFromNow(24), return_at:isoHoursFromNow(72), trip_type:'Outstation', vehicle_category:'Tempo Traveller', vehicle_number:travelVehicles[1].vehicle_number, driver_name:travelDrivers[1].full_name, amount:32000, advance:10000, status:'confirmed', payment_status:'partial' },
      { id:'tb2', site_id:'t-site-3', booking_no:'BKG/26-27/00129', customer:'Royal Event Planners', pickup:'Udaipur', drop:'Kumbhalgarh', pickup_at:isoHoursFromNow(48), return_at:isoHoursFromNow(60), trip_type:'Event', vehicle_category:'Ertiga', vehicle_number:travelVehicles[3].vehicle_number, driver_name:travelDrivers[3].full_name, amount:9500, advance:3000, status:'vehicle_assigned', payment_status:'partial' },
      { id:'tb3', site_id:'t-site-1', booking_no:'BKG/26-27/00130', customer:'Walk-in Customer', pickup:'Ahmedabad Airport', drop:'Gandhinagar', pickup_at:isoHoursFromNow(5), return_at:null, trip_type:'Airport Transfer', vehicle_category:'Innova Crysta', vehicle_number:travelVehicles[0].vehicle_number, driver_name:travelDrivers[0].full_name, amount:2400, advance:2400, status:'confirmed', payment_status:'paid' },
    ],
    expenses:commonExpenses('trv',travelSites,travelVehicles),
    moduleRows:{
      travel_driver_duty:[{id:'tduty1',duty_no:'DUTY-001',driver:'Ramesh Patel',vehicle:travelVehicles[0].vehicle_number,shift:'Day',status:'assigned'}],
    },
    billing:billingSample('Accelerate','TRV'),
  },

  bagged_cement: {
    company:{ id:'demo-cement-company', company_name:'Shree Cement Logistics', company_code:'DEMO-CEMENT', subdomain_slug:'demo', fleetPack:'bagged_cement', status:'active' },
    currentUser:{ id:'demo-owner-cement', name:'Demo Owner', email:'demo@buddyfleets.in', role:'Company Owner', roleName:'Company Owner', isAccountOwner:true, mfaEnabled:true },
    sites:cementSites,
    vehicles:cementVehicles,
    drivers:cementDrivers,
    users:commonUsers('cem',cementSites.map(s=>s.name)),
    parties:[
      { id:'cp1', party_name:'Shakti Cement Dealers', party_type:'Dealer', gstin:'24AABCS1234K1Z2', city:'Ahmedabad', state:'Gujarat', mobile:'9876500011', status:'active' },
      { id:'cp2', party_name:'Marwar Buildmart', party_type:'Dealer', gstin:'08AACCM1122P1Z8', city:'Udaipur', state:'Rajasthan', mobile:'9876500022', status:'active' },
    ],
    placements:[
      { id:'pl1', placement_no:'PLC/26-27/00521', site_id:'c-site-1', requirement_date:daysFromNow(0), required_vehicles:25, assigned_vehicles:23, reported_vehicles:18, loaded_vehicles:14, status:'open' },
      { id:'pl2', placement_no:'PLC/26-27/00522', site_id:'c-site-2', requirement_date:daysFromNow(0), required_vehicles:20, assigned_vehicles:20, reported_vehicles:16, loaded_vehicles:11, status:'open' },
      { id:'pl3', placement_no:'PLC/26-27/00523', site_id:'c-site-3', requirement_date:daysFromNow(0), required_vehicles:18, assigned_vehicles:17, reported_vehicles:15, loaded_vehicles:13, status:'open' },
      { id:'pl4', placement_no:'PLC/26-27/00524', site_id:'c-site-4', requirement_date:daysFromNow(0), required_vehicles:15, assigned_vehicles:14, reported_vehicles:12, loaded_vehicles:9, status:'open' },
    ],
    dispatches:[
      { id:'dp1', dispatch_no:'DSP/26-27/01882', site_id:'c-site-1', vehicle_number:cementVehicles[1].vehicle_number, driver_name:cementDrivers[1].full_name, dealer:'Shakti Cement Dealers', destination:'Ahmedabad', bags:560, net_weight_mt:28, loading_slip_no:'LS-9912', status:'in_transit', dispatched_at:isoHoursFromNow(-4), delivered_at:null, pod_status:'pending', turnaround_hours:6.4 },
      { id:'dp2', dispatch_no:'DSP/26-27/01883', site_id:'c-site-2', vehicle_number:cementVehicles[2].vehicle_number, driver_name:cementDrivers[2].full_name, dealer:'Marwar Buildmart', destination:'Udaipur', bags:600, net_weight_mt:30, loading_slip_no:'LS-9913', status:'delivered', dispatched_at:isoHoursFromNow(-12), delivered_at:isoHoursFromNow(-2), pod_status:'received', turnaround_hours:7.2 },
      { id:'dp3', dispatch_no:'DSP/26-27/01884', site_id:'c-site-3', vehicle_number:cementVehicles[3].vehicle_number, driver_name:cementDrivers[3].full_name, dealer:'Shakti Cement Dealers', destination:'Vadodara', bags:620, net_weight_mt:31, loading_slip_no:'LS-9914', status:'at_plant', dispatched_at:null, delivered_at:null, pod_status:'not_applicable', turnaround_hours:8.1 },
      { id:'dp4', dispatch_no:'DSP/26-27/01885', site_id:'c-site-4', vehicle_number:cementVehicles[4].vehicle_number, driver_name:cementDrivers[4].full_name, dealer:'Marwar Buildmart', destination:'Ajmer', bags:560, net_weight_mt:28, loading_slip_no:'LS-9915', status:'in_transit', dispatched_at:isoHoursFromNow(-6), delivered_at:null, pod_status:'pending', turnaround_hours:6.9 },
    ],
    expenses:commonExpenses('cem',cementSites,cementVehicles),
    billing:billingSample('Scale','CEM'),
  },
};

DEMO_COMPANIES.general_transport = buildGenericPack({
  key:'general_transport', prefix:'gds', companyName:'Western Freight Carriers', companyCode:'DEMO-GOODS',
  sites:[
    {id:'g-site-1',code:'AMD-HO',name:'Ahmedabad Hub',site_type:'Hub',city:'Ahmedabad',state:'Gujarat',status:'active',is_primary:true},
    {id:'g-site-2',code:'MUM-BR',name:'Mumbai Branch',site_type:'Branch Office',city:'Mumbai',state:'Maharashtra',status:'active'},
    {id:'g-site-3',code:'DEL-WH',name:'Delhi Warehouse',site_type:'Warehouse',city:'Delhi',state:'Delhi',status:'active'},
  ],
  vehicleTypes:['32 FT MXL','24 FT SXL','Open Body Truck'],
  metrics:[
    {title:'Active Consignments',value:46,icon:'FileText'}, {title:'Vehicles on Trip',value:18,icon:'Truck',tone:'blue'},
    {title:'Pending POD',value:7,icon:'PackageCheck',tone:'orange'}, {title:'Dispatch Today',value:22,icon:'Route',tone:'green'},
    {title:'LR Generated',value:31,icon:'FileText'}, {title:'Freight Value',value:'₹8.42L',icon:'IndianRupee',tone:'green'},
    {title:'Pending Delivery',value:12,icon:'Boxes',tone:'orange'}, {title:'Active Routes',value:16,icon:'Route'},
  ],
  tables:[
    {title:'Recent Consignments',columns:[{key:'lr_no',label:'LR / Bilty'},{key:'consignor',label:'Consignor'},{key:'destination',label:'Destination'},{key:'status',label:'Status'}],rows:[{id:1,lr_no:'LR-260184',consignor:'Aarav Industries',destination:'Mumbai',status:'in_transit'},{id:2,lr_no:'LR-260185',consignor:'Shakti Enterprise',destination:'Delhi',status:'dispatched'}]},
    {title:'Dispatch Queue',columns:[{key:'vehicle',label:'Vehicle'},{key:'route',label:'Route'},{key:'load',label:'Load'},{key:'status',label:'Status'}],rows:[{id:1,vehicle:'GJ01BF5101',route:'AMD → MUM',load:'18.4 MT',status:'ready'},{id:2,vehicle:'GJ02BF5102',route:'MUM → DEL',load:'21.0 MT',status:'assigned'}]},
  ],
  moduleRows:{ goods_consignment:[{id:1,lr_no:'LR-260184',consignor:'Aarav Industries',consignee:'Metro Traders',destination:'Mumbai',status:'in_transit'}], goods_load_planning:[{id:1,plan_no:'LOAD-221',vehicle:'GJ01BF5101',capacity:'28 MT',planned_load:'24 MT',status:'ready'}] },
});

DEMO_COMPANIES.container = buildGenericPack({
  key:'container', prefix:'ctr', companyName:'BluePort Container Logistics', companyCode:'DEMO-CONT',
  sites:[
    {id:'ct-site-1',code:'MUN-PORT',name:'Mundra Port Office',site_type:'Port / ICD / CFS Office',city:'Mundra',state:'Gujarat',status:'active',is_primary:true},
    {id:'ct-site-2',code:'AMD-ICD',name:'Ahmedabad ICD',site_type:'Hub',city:'Ahmedabad',state:'Gujarat',status:'active'},
    {id:'ct-site-3',code:'SAN-YARD',name:'Sanand Container Yard',site_type:'Yard',city:'Sanand',state:'Gujarat',status:'active'},
  ],
  vehicleTypes:['40 FT Trailer','20 FT Trailer','Multi Axle Trailer'],
  metrics:[
    {title:'Containers in Movement',value:29,icon:'Container'}, {title:'Gate In Today',value:14,icon:'Route',tone:'green'},
    {title:'Gate Out Today',value:11,icon:'Truck',tone:'blue'}, {title:'Empty Returns Pending',value:6,icon:'Boxes',tone:'orange'},
    {title:'At Port / ICD',value:9,icon:'Building2'}, {title:'Detention Cases',value:3,icon:'Clock3',tone:'orange'},
    {title:'Import Moves',value:17,icon:'Container'}, {title:'Export Moves',value:12,icon:'Route'},
  ],
  tables:[
    {title:'Container Movements',columns:[{key:'container_no',label:'Container'},{key:'size',label:'Size'},{key:'location',label:'Location'},{key:'status',label:'Status'}],rows:[{id:1,container_no:'TGHU7862314',size:'40 HC',location:'Mundra Port',status:'gate_out'},{id:2,container_no:'MSCU4419021',size:'20 GP',location:'Ahmedabad ICD',status:'at_icd'}]},
    {title:'Detention Watch',columns:[{key:'container_no',label:'Container'},{key:'free_until',label:'Free Until'},{key:'hours',label:'Detention Hrs'},{key:'status',label:'Status'}],rows:[{id:1,container_no:'CMAU8127301',free_until:daysFromNow(-1),hours:19,status:'attention'},{id:2,container_no:'OOLU3958210',free_until:daysFromNow(1),hours:0,status:'within_free_time'}]},
  ],
  moduleRows:{ container_movement:[{id:1,container_no:'TGHU7862314',movement_type:'Import',size:'40 HC',from:'Mundra Port',to:'Sanand',status:'in_transit'}], container_empty_return:[{id:1,container_no:'MSCU4419021',return_depot:'Mundra Empty Yard',due_date:daysFromNow(1),status:'pending'}] },
});

DEMO_COMPANIES.cement_bulker = buildGenericPack({
  key:'cement_bulker', prefix:'blk', companyName:'Prime Bulker Logistics', companyCode:'DEMO-BULKER',
  sites:[
    {id:'b-site-1',code:'KUT-PLANT',name:'Kutch Bulk Cement Plant',site_type:'Plant',city:'Kutch',state:'Gujarat',status:'active',is_primary:true},
    {id:'b-site-2',code:'AMD-SILO',name:'Ahmedabad Silo',site_type:'Customer Site',city:'Ahmedabad',state:'Gujarat',status:'active'},
    {id:'b-site-3',code:'SRT-SILO',name:'Surat Silo',site_type:'Customer Site',city:'Surat',state:'Gujarat',status:'active'},
  ],
  vehicleTypes:['Bulk Cement Tanker','Bulker 35 MT','Bulker 40 MT'],
  metrics:[
    {title:'Placement Required',value:34,icon:'Truck'}, {title:'Reported at Plant',value:28,icon:'Building2',tone:'blue'},
    {title:'Loading',value:7,icon:'Gauge',tone:'orange'}, {title:'Loaded Today',value:21,icon:'Scale',tone:'green'},
    {title:'Tonnage Today',value:'731 MT',icon:'Scale'}, {title:'In Transit',value:18,icon:'Route',tone:'blue'},
    {title:'Unloading',value:6,icon:'Truck'}, {title:'Avg Turnaround',value:'5.8 hr',icon:'Clock3',tone:'green'},
  ],
  tables:[
    {title:'Bulker Loading',columns:[{key:'vehicle',label:'Vehicle'},{key:'plant',label:'Plant'},{key:'net_mt',label:'Net MT'},{key:'status',label:'Status'}],rows:[{id:1,vehicle:'GJ01BF5101',plant:'Kutch Plant',net_mt:34.8,status:'loaded'},{id:2,vehicle:'GJ02BF5102',plant:'Kutch Plant',net_mt:36.1,status:'loading'}]},
    {title:'Silo / Unloading',columns:[{key:'vehicle',label:'Vehicle'},{key:'silo',label:'Destination Silo'},{key:'eta',label:'ETA'},{key:'status',label:'Status'}],rows:[{id:1,vehicle:'GJ03BF5103',silo:'Ahmedabad Silo',eta:'14:20',status:'reached'},{id:2,vehicle:'GJ04BF5104',silo:'Surat Silo',eta:'17:45',status:'in_transit'}]},
  ],
  moduleRows:{ bulker_loading:[{id:1,vehicle:'GJ01BF5101',loading_point:'LP-02',gross_mt:52.4,tare_mt:17.6,net_mt:34.8,status:'loaded'}], bulker_unloading:[{id:1,vehicle:'GJ03BF5103',silo:'Ahmedabad Silo',quantity_mt:35.2,status:'unloading'}] },
});

DEMO_COMPANIES.staff_transport = buildGenericPack({
  key:'staff_transport', prefix:'stf', companyName:'CityStaff Mobility Services', companyCode:'DEMO-STAFF',
  sites:[
    {id:'s-site-1',code:'AMD-HO',name:'Ahmedabad Operations',site_type:'Head Office',city:'Ahmedabad',state:'Gujarat',status:'active',is_primary:true},
    {id:'s-site-2',code:'SAN-CORP',name:'Sanand Corporate Site',site_type:'Customer Site',city:'Sanand',state:'Gujarat',status:'active'},
    {id:'s-site-3',code:'GNR-CORP',name:'Gandhinagar Corporate Site',site_type:'Customer Site',city:'Gandhinagar',state:'Gujarat',status:'active'},
  ],
  vehicleTypes:['Tempo Traveller','Mini Bus','Staff Bus'],
  metrics:[
    {title:'Routes Today',value:24,icon:'Route'}, {title:'Active Shifts',value:9,icon:'Clock3',tone:'blue'},
    {title:'Vehicles Allocated',value:21,icon:'BusFront',tone:'green'}, {title:'Drivers on Duty',value:20,icon:'UsersRound'},
    {title:'Employees Scheduled',value:684,icon:'UsersRound'}, {title:'Boarded',value:621,icon:'UserCheck',tone:'green'},
    {title:'Missed / No Show',value:18,icon:'AlertTriangle',tone:'orange'}, {title:'Corporate Sites',value:2,icon:'Building2'},
  ],
  tables:[
    {title:'Shift Dispatch',columns:[{key:'route',label:'Route'},{key:'shift',label:'Shift'},{key:'vehicle',label:'Vehicle'},{key:'status',label:'Status'}],rows:[{id:1,route:'AMD West → Sanand',shift:'08:00',vehicle:'GJ01BF5101',status:'in_service'},{id:2,route:'Gandhinagar → AMD',shift:'09:30',vehicle:'GJ02BF5102',status:'ready'}]},
    {title:'Boarding Snapshot',columns:[{key:'route',label:'Route'},{key:'scheduled',label:'Scheduled'},{key:'boarded',label:'Boarded'},{key:'status',label:'Status'}],rows:[{id:1,route:'Route ST-12',scheduled:38,boarded:36,status:'completed'},{id:2,route:'Route ST-14',scheduled:42,boarded:39,status:'completed'}]},
  ],
  moduleRows:{ staff_routes:[{id:1,route_code:'ST-12',route_name:'AMD West → Sanand',stops:8,distance_km:34,status:'active'}], staff_shifts:[{id:1,shift_name:'Morning A',start_time:'08:00',routes:8,status:'active'}], staff_attendance:[{id:1,route:'ST-12',scheduled:38,boarded:36,no_show:2,status:'completed'}] },
});

DEMO_COMPANIES.school_transport = buildGenericPack({
  key:'school_transport', prefix:'sch', companyName:'Sunrise School Transport', companyCode:'DEMO-SCHOOL',
  sites:[
    {id:'sc-site-1',code:'MAIN',name:'Sunrise Main Campus',site_type:'School Campus',city:'Ahmedabad',state:'Gujarat',status:'active',is_primary:true},
    {id:'sc-site-2',code:'NORTH',name:'Sunrise North Campus',site_type:'School Campus',city:'Ahmedabad',state:'Gujarat',status:'active'},
    {id:'sc-site-3',code:'YARD',name:'School Bus Yard',site_type:'Parking Yard',city:'Ahmedabad',state:'Gujarat',status:'active'},
  ],
  vehicleTypes:['School Bus 32 Seater','School Bus 45 Seater','Mini School Bus'],
  metrics:[
    {title:'Routes',value:18,icon:'Route'}, {title:'Students Assigned',value:712,icon:'GraduationCap'},
    {title:'Buses Running',value:17,icon:'BusFront',tone:'green'}, {title:'Pickup Complete',value:14,icon:'UserCheck',tone:'green'},
    {title:'Students Boarded',value:648,icon:'UsersRound'}, {title:'Stops Covered',value:'126 / 148',icon:'Route',tone:'blue'},
    {title:'Late Routes',value:2,icon:'Clock3',tone:'orange'}, {title:'Inspection Due',value:3,icon:'AlertTriangle',tone:'orange'},
  ],
  tables:[
    {title:'Live Route Status',columns:[{key:'route',label:'Route'},{key:'vehicle',label:'Bus'},{key:'students',label:'Students'},{key:'status',label:'Status'}],rows:[{id:1,route:'SCH-R01',vehicle:'GJ01BF5101',students:41,status:'pickup_complete'},{id:2,route:'SCH-R05',vehicle:'GJ02BF5102',students:38,status:'in_route'}]},
    {title:'Pickup / Drop Watch',columns:[{key:'student',label:'Student'},{key:'route',label:'Route'},{key:'stop',label:'Stop'},{key:'status',label:'Status'}],rows:[{id:1,student:'Aarav Shah',route:'SCH-R01',stop:'Bopal Cross Road',status:'boarded'},{id:2,student:'Kavya Patel',route:'SCH-R05',stop:'Science City',status:'scheduled'}]},
  ],
  moduleRows:{ school_routes:[{id:1,route_code:'SCH-R01',route_name:'Bopal → Main Campus',stops:9,students:44,status:'active'}], school_students:[{id:1,student_name:'Aarav Shah',class:'8-A',route:'SCH-R01',stop:'Bopal Cross Road',status:'active'}], school_attendance:[{id:1,route:'SCH-R01',scheduled:44,boarded:41,absent:3,status:'completed'}] },
});

export function getDemoCompany(mode = 'bagged_cement') {
  const source = DEMO_COMPANIES[mode] || DEMO_COMPANIES.bagged_cement;
  return typeof structuredClone === 'function' ? structuredClone(source) : JSON.parse(JSON.stringify(source));
}
