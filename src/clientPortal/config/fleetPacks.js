export const FLEET_PACKS = {
  travels: {
    key: 'travels',
    name: 'Small Travels',
    status: 'active',
    description: 'Cars, SUVs, Tempo Travellers, Mini Buses, Buses and tourist coaches.',
    recommendedModules: [
      'dashboard','sites','vehicles','drivers','parties','travel_bookings','travel_enquiries','travel_availability','travel_tours',
      'trips','expenses','fuel','driver_payments','invoices','party_ledgers','compliance','maintenance','tyres','spare_parts','challans','reports','users_roles','settings','notifications'
    ],
    roles: [
      'Company Owner','Company Admin','Branch Manager','Booking Manager','Booking Executive','Operations Manager','Tour Coordinator',
      'Vehicle Allocation Executive','Driver Coordinator','Fleet Manager','Accountant','Billing Executive','Maintenance Manager','Compliance Executive','Viewer'
    ],
    reports: [
      'Booking Register','Trip Register','Vehicle Utilization','Vehicle Availability','Driver Duty','Customer-wise Business','Vehicle-wise Revenue',
      'Trip Expense','Fuel Consumption','Driver Advance','Driver Settlement','Outstanding','Invoice Register','Maintenance','Document Expiry','Branch-wise Performance'
    ]
  },
  bagged_cement: {
    key: 'bagged_cement',
    name: 'Bagged Cement Transport',
    status: 'active',
    description: 'Plant-to-dealer bagged cement transport with placement, loading, tonnage, dispatch, delivery and POD workflow.',
    recommendedModules: [
      'dashboard','sites','vehicles','drivers','parties','cement_placement','cement_queue','cement_loading','cement_dispatch','cement_delivery','cement_tat',
      'trips','dispatch','epod','expenses','fuel','driver_payments','invoices','party_ledgers','compliance','maintenance','tyres','spare_parts','challans','reports','users_roles','settings','notifications'
    ],
    roles: [
      'Company Owner','Company Admin','Cement Transport Head','Regional Manager','Plant Manager','Vehicle Placement Manager','Vehicle Placement Executive',
      'Dispatch Manager','Dispatch Executive','Yard / Queue Coordinator','Loading Coordinator','Weighbridge Executive','Delivery Coordinator','POD Executive',
      'Detention Coordinator','Fleet Manager','Driver Coordinator','Freight Executive','Billing Executive','Accountant','Maintenance Manager','Compliance Executive','Viewer'
    ],
    reports: [
      'Daily Dispatch','Plant-wise Dispatch','Plant-wise Tonnage','Vehicle-wise Tonnage','Driver-wise Trips','Dealer-wise Delivery','Route-wise Dispatch',
      'Vehicle Placement','Vehicle Reporting','Plant Queue','Turnaround Time','Detention','Pending POD','Delivered vs POD','Freight','Driver Advance',
      'Driver Settlement','Fuel','Expenses','Vehicle Utilization','Maintenance','Document Expiry','Plant Comparison','All Plants Consolidated'
    ]
  },
  general_transport: { key: 'general_transport', name: 'General Goods Transport', status: 'planned' },
  cement_bulker: { key: 'cement_bulker', name: 'Cement Bulker', status: 'planned' },
  container: { key: 'container', name: 'Container Transport', status: 'planned' },
  mining: { key: 'mining', name: 'Mining / Tipper', status: 'planned' },
  construction: { key: 'construction', name: 'Construction Material', status: 'planned' },
  petroleum: { key: 'petroleum', name: 'Petroleum Tanker', status: 'planned' },
  chemical: { key: 'chemical', name: 'Chemical Tanker', status: 'planned' },
  reefer: { key: 'reefer', name: 'Reefer / Cold Chain', status: 'planned' },
  staff_transport: { key: 'staff_transport', name: 'Staff Transport', status: 'planned' },
  school_transport: { key: 'school_transport', name: 'School Transport', status: 'planned' },
  last_mile: { key: 'last_mile', name: 'Last Mile / Distribution', status: 'planned' },
  fmcg: { key: 'fmcg', name: 'FMCG Distribution', status: 'planned' },
  car_carrier: { key: 'car_carrier', name: 'Car Carrier', status: 'planned' },
  odc: { key: 'odc', name: 'Heavy Haul / ODC', status: 'planned' },
};

export function getFleetPack(key) {
  return FLEET_PACKS[key] || null;
}
