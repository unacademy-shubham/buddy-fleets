const COMMON = [
  'dashboard','live_operations','sites','vehicles','vehicle_inspection','drivers','parties','trips','route_planning','dispatch','epod','delivery_records',
  'expenses','fuel','driver_payments','invoices','party_ledgers','profit_loss','compliance','maintenance','tyres','spare_parts','challans','reports',
  'users_roles','notifications','settings','subscription','audit_activity','approval_center'
];

export const FLEET_PACKS = {
  travels: {
    key: 'travels',
    slug: 'travels',
    name: 'Small Travels / Transport',
    shortName: 'Small Travels',
    status: 'active',
    icon: 'BusFront',
    description: 'Cars, SUVs, Tempo Travellers, Mini Buses, Buses and tourist coaches.',
    recommendedModules: [...COMMON, 'travel_bookings','travel_enquiries','travel_availability','travel_tours','travel_driver_duty'],
    roles: ['Company Owner','Company Admin','Branch Manager','Booking Manager','Booking Executive','Operations Manager','Tour Coordinator','Vehicle Allocation Executive','Driver Coordinator','Fleet Manager','Accountant','Billing Executive','Maintenance Manager','Compliance Executive','Viewer'],
    reports: ['Booking Register','Trip Register','Vehicle Utilization','Vehicle Availability','Driver Duty','Customer-wise Business','Vehicle-wise Revenue','Trip Expense','Fuel Consumption','Driver Advance','Driver Settlement','Outstanding','Invoice Register','Maintenance','Document Expiry','Branch-wise Performance']
  },
  bagged_cement: {
    key: 'bagged_cement',
    slug: 'cement',
    name: 'Bagged Cement Transport',
    shortName: 'Bagged Cement',
    status: 'active',
    icon: 'Factory',
    description: 'Plant-to-dealer bagged cement transport with placement, loading, tonnage, dispatch, delivery and POD workflow.',
    recommendedModules: [...COMMON, 'cement_placement','cement_queue','cement_loading','cement_dispatch','cement_delivery','cement_tat'],
    roles: ['Company Owner','Company Admin','Cement Transport Head','Regional Manager','Plant Manager','Vehicle Placement Manager','Vehicle Placement Executive','Dispatch Manager','Dispatch Executive','Yard / Queue Coordinator','Loading Coordinator','Weighbridge Executive','Delivery Coordinator','POD Executive','Detention Coordinator','Fleet Manager','Driver Coordinator','Freight Executive','Billing Executive','Accountant','Maintenance Manager','Compliance Executive','Viewer'],
    reports: ['Daily Dispatch','Plant-wise Dispatch','Plant-wise Tonnage','Vehicle-wise Tonnage','Driver-wise Trips','Dealer-wise Delivery','Route-wise Dispatch','Vehicle Placement','Vehicle Reporting','Plant Queue','Turnaround Time','Detention','Pending POD','Delivered vs POD','Freight','Driver Advance','Driver Settlement','Fuel','Expenses','Vehicle Utilization','Maintenance','Document Expiry','Plant Comparison','All Plants Consolidated']
  },
  general_transport: {
    key: 'general_transport',
    slug: 'general-goods',
    name: 'General Goods Transport',
    shortName: 'General Goods',
    status: 'active',
    icon: 'Truck',
    description: 'LR/Bilty, consignments, dispatch, multi-party freight, delivery, POD and settlements.',
    recommendedModules: [...COMMON, 'lr_bilty','goods_consignment','goods_load_planning','goods_delivery','goods_freight'],
    roles: ['Company Owner','Company Admin','Operations Manager','Dispatch Manager','LR Executive','Fleet Manager','Driver Coordinator','Accounts Manager','Billing Executive','POD Executive','Compliance Manager','Maintenance Manager','Viewer'],
    reports: ['LR Register','Trip Register','Dispatch Register','Consignor/Consignee Business','Vehicle Revenue','Freight Outstanding','Pending POD','Route Performance','Vehicle Utilization']
  },
  container: {
    key: 'container',
    slug: 'container',
    name: 'Container Transport',
    shortName: 'Container',
    status: 'active',
    icon: 'Container',
    description: 'Port, ICD and CFS container movements, gate activity, empty returns, detention and settlements.',
    recommendedModules: [...COMMON, 'lr_bilty','container_movement','container_port_ops','container_gate','container_empty_return','container_detention'],
    roles: ['Company Owner','Company Admin','Container Operations Manager','Port Coordinator','ICD/CFS Coordinator','Gate Executive','Fleet Manager','Driver Coordinator','Detention Executive','Billing Executive','Accountant','Compliance Manager','Viewer'],
    reports: ['Container Movement Register','Port/ICD Movement','Gate In/Out','Empty Return','Container Detention','Vehicle Utilization','Freight Settlement','Pending POD']
  },
  cement_bulker: {
    key: 'cement_bulker',
    slug: 'bulker',
    name: 'Cement Bulker',
    shortName: 'Cement Bulker',
    status: 'active',
    icon: 'Gauge',
    description: 'Bulk cement placement, plant queue, loading, weighbridge, silo unloading, tonnage and turnaround.',
    recommendedModules: [...COMMON, 'bulker_placement','bulker_queue','bulker_loading','bulker_weighbridge','bulker_unloading','bulker_tat'],
    roles: ['Company Owner','Company Admin','Bulker Transport Head','Plant Manager','Placement Executive','Queue Coordinator','Loading Executive','Weighbridge Executive','Unloading Coordinator','Fleet Manager','Driver Coordinator','Billing Executive','Accountant','Compliance Manager','Viewer'],
    reports: ['Plant Placement','Bulker Loading','Tonnage','Weighbridge','Unloading','Turnaround','Detention','Vehicle Utilization','Driver Trips','Plant Comparison']
  },
  staff_transport: {
    key: 'staff_transport',
    slug: 'staff',
    name: 'Staff Transport',
    shortName: 'Staff Transport',
    status: 'active',
    icon: 'UsersRound',
    description: 'Employee routes, shifts, duty rosters, vehicle allocation, boarding and corporate contracts.',
    recommendedModules: [...COMMON, 'staff_routes','staff_shifts','staff_roster','staff_allocation','staff_attendance','staff_contracts'],
    roles: ['Company Owner','Company Admin','Transport Manager','Route Manager','Shift Coordinator','Duty Executive','Driver Coordinator','Fleet Manager','Billing Executive','Accountant','Compliance Manager','Viewer'],
    reports: ['Route Register','Shift-wise Trips','Vehicle Allocation','Driver Duty','Boarding/Attendance','Corporate Billing','Vehicle Utilization','Route Cost']
  },
  school_transport: {
    key: 'school_transport',
    slug: 'school',
    name: 'School Transport',
    shortName: 'School Transport',
    status: 'active',
    icon: 'GraduationCap',
    description: 'School routes and stops, student assignments, pickup/drop, transport attendance and attendants.',
    recommendedModules: [...COMMON, 'school_routes','school_students','school_assignments','school_pickup_drop','school_attendance','school_attendants'],
    roles: ['Company Owner','Company Admin','School Transport Manager','Route Coordinator','Transport Executive','Driver Coordinator','Attendant Coordinator','Fleet Manager','Accounts Manager','Compliance Manager','Viewer'],
    reports: ['Route & Stop Register','Student Route Assignment','Pickup/Drop Register','Transport Attendance','Vehicle Allocation','Driver/Attendant Duty','Vehicle Utilization','Route Performance']
  },
};

export const DEMO_FLEET_ORDER = ['travels','bagged_cement','general_transport','container','cement_bulker','staff_transport','school_transport'];

export function getFleetPack(key) {
  return FLEET_PACKS[key] || null;
}

export function getFleetPackBySlug(slug) {
  return Object.values(FLEET_PACKS).find((pack) => pack.slug === slug) || null;
}
