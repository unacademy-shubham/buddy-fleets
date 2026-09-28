export const ACTION_KEYS = ['view', 'create', 'edit', 'delete', 'approve', 'verify', 'print', 'export', 'manage'];

export const MODULE_CATALOG = [
  // Core / shared
  { key: 'dashboard', label: 'Dashboard', category: 'Overview', route: 'dashboard', icon: 'LayoutDashboard', core: true },
  { key: 'live_operations', label: 'Live Operations', category: 'Overview', route: 'live-operations', icon: 'Activity', core: true },
  { key: 'sites', label: 'Sites / Branches', category: 'Management', route: 'sites', icon: 'Building2', core: true },
  { key: 'vehicles', label: 'Vehicle Masters', category: 'Management', route: 'vehicles', icon: 'Truck', core: true },
  { key: 'vehicle_inspection', label: 'Vehicle Inspection', category: 'Management', route: 'vehicle-inspection', icon: 'ClipboardCheck', core: true },
  { key: 'drivers', label: 'Drivers', category: 'Management', route: 'drivers', icon: 'UsersRound', core: true },
  { key: 'parties', label: 'Parties / Customers', category: 'Management', route: 'parties', icon: 'Landmark', core: true },
  { key: 'trips', label: 'Trips / Route Planning', category: 'Operations', route: 'trips', icon: 'Route', websiteFeature: true },
  { key: 'route_planning', label: 'Route Planning', category: 'Operations', route: 'route-planning', icon: 'MapPinned' },
  { key: 'dispatch', label: 'Duty & Dispatch', category: 'Operations', route: 'dispatch', icon: 'ClipboardCheck', websiteFeature: true },
  { key: 'lr_bilty', label: 'LR / Bilty / Consignment', category: 'Operations', route: 'lr-bilty', icon: 'FileText', websiteFeature: true },
  { key: 'epod', label: 'ePOD / Delivery Records', category: 'Operations', route: 'epod', icon: 'PackageCheck', websiteFeature: true },
  { key: 'delivery_records', label: 'Delivery Records', category: 'Operations', route: 'delivery-records', icon: 'PackageOpen' },
  { key: 'expenses', label: 'Expenses & Earnings', category: 'Finance', route: 'finance', icon: 'IndianRupee', websiteFeature: true },
  { key: 'fuel', label: 'Diesel & Fuel', category: 'Finance', route: 'fuel', icon: 'Fuel', websiteFeature: true },
  { key: 'driver_payments', label: 'Driver Advances & Payments', category: 'Finance', route: 'driver-payments', icon: 'WalletCards', websiteFeature: true },
  { key: 'invoices', label: 'Invoices & Settlements', category: 'Finance', route: 'invoices', icon: 'ReceiptText', websiteFeature: true },
  { key: 'party_ledgers', label: 'Party Records & Ledgers', category: 'Finance', route: 'party-ledgers', icon: 'BookOpenCheck', websiteFeature: true },
  { key: 'profit_loss', label: 'Profit & Loss', category: 'Finance', route: 'profit-loss', icon: 'ChartNoAxesCombined' },
  { key: 'compliance', label: 'Documents & Compliance', category: 'Management', route: 'compliance', icon: 'BellRing', websiteFeature: true },
  { key: 'maintenance', label: 'Workshop & Maintenance', category: 'Finance', route: 'maintenance', icon: 'Wrench', websiteFeature: true },
  { key: 'tyres', label: 'Tyre Management', category: 'Finance', route: 'tyres', icon: 'CircleGauge', websiteFeature: true },
  { key: 'spare_parts', label: 'Spare Parts', category: 'Finance', route: 'spare-parts', icon: 'PackageSearch', websiteFeature: true },
  { key: 'challans', label: 'Challan Records', category: 'Finance', route: 'challans', icon: 'FileWarning', websiteFeature: true },
  { key: 'reports', label: 'Reports', category: 'Management', route: 'reports', icon: 'BarChart3', core: true, websiteFeature: true },
  { key: 'users_roles', label: 'Users & Roles', category: 'Administration', route: 'users', icon: 'ShieldCheck', core: true, websiteFeature: true },
  { key: 'notifications', label: 'Notifications', category: 'Administration', route: 'notifications', icon: 'Bell', core: true },
  { key: 'settings', label: 'Company Settings', category: 'Administration', route: 'settings', icon: 'Settings', core: true },
  { key: 'subscription', label: 'Subscription & Billing', category: 'Administration', route: 'subscription', icon: 'BadgeIndianRupee', core: true },
  { key: 'audit_activity', label: 'Audit & Activity', category: 'Administration', route: 'audit-activity', icon: 'History', core: true },
  { key: 'approval_center', label: 'Approval Center', category: 'Administration', route: 'approval-center', icon: 'BadgeCheck', core: true },

  // Small Travels
  { key: 'travel_bookings', label: 'Bookings', category: 'Operations', route: 'travels/bookings', icon: 'CalendarCheck2', pack: 'travels', active: true },
  { key: 'travel_enquiries', label: 'Enquiries / Quotations', category: 'Operations', route: 'travels/enquiries', icon: 'MessageSquareText', pack: 'travels', active: true },
  { key: 'travel_availability', label: 'Vehicle Availability', category: 'Operations', route: 'travels/availability', icon: 'CalendarDays', pack: 'travels', active: true },
  { key: 'travel_tours', label: 'Tours / Trip Sheets', category: 'Operations', route: 'travels/tours', icon: 'MapPinned', pack: 'travels', active: true },
  { key: 'travel_driver_duty', label: 'Driver Duty / Allocation', category: 'Operations', route: 'travels/driver-duty', icon: 'UserRoundCheck', pack: 'travels', active: true },

  // Bagged Cement
  { key: 'cement_placement', label: 'Vehicle Placement', category: 'Operations', route: 'cement/placement', icon: 'ListChecks', pack: 'bagged_cement', active: true },
  { key: 'cement_queue', label: 'Plant Queue / Yard', category: 'Operations', route: 'cement/queue', icon: 'Rows3', pack: 'bagged_cement', active: true },
  { key: 'cement_loading', label: 'Loading / Weighbridge', category: 'Operations', route: 'cement/loading', icon: 'Scale', pack: 'bagged_cement', active: true },
  { key: 'cement_dispatch', label: 'Cement Dispatch', category: 'Operations', route: 'cement/dispatch', icon: 'Send', pack: 'bagged_cement', active: true },
  { key: 'cement_delivery', label: 'Dealer Delivery / POD', category: 'Operations', route: 'cement/delivery', icon: 'PackageOpen', pack: 'bagged_cement', active: true },
  { key: 'cement_tat', label: 'Turnaround / Detention', category: 'Management', route: 'cement/tat', icon: 'TimerReset', pack: 'bagged_cement', active: true },

  // General Goods Transport
  { key: 'goods_consignment', label: 'Consignments / LR', category: 'Operations', route: 'goods/consignments', icon: 'FileStack', pack: 'general_transport', active: true },
  { key: 'goods_load_planning', label: 'Load Planning', category: 'Operations', route: 'goods/load-planning', icon: 'Boxes', pack: 'general_transport', active: true },
  { key: 'goods_delivery', label: 'Delivery & POD', category: 'Operations', route: 'goods/delivery', icon: 'PackageCheck', pack: 'general_transport', active: true },
  { key: 'goods_freight', label: 'Freight Settlement', category: 'Operations', route: 'goods/freight', icon: 'IndianRupee', pack: 'general_transport', active: true },

  // Container Transport
  { key: 'container_movement', label: 'Container Movement', category: 'Operations', route: 'container/movement', icon: 'Container', pack: 'container', active: true },
  { key: 'container_port_ops', label: 'Port / ICD / CFS', category: 'Operations', route: 'container/port-ops', icon: 'ShipWheel', pack: 'container', active: true },
  { key: 'container_gate', label: 'Gate Movements', category: 'Operations', route: 'container/gate', icon: 'LogIn', pack: 'container', active: true },
  { key: 'container_empty_return', label: 'Empty Return', category: 'Operations', route: 'container/empty-return', icon: 'Undo2', pack: 'container', active: true },
  { key: 'container_detention', label: 'Container Detention', category: 'Management', route: 'container/detention', icon: 'TimerReset', pack: 'container', active: true },

  // Cement Bulker
  { key: 'bulker_placement', label: 'Vehicle Placement', category: 'Operations', route: 'bulker/placement', icon: 'ListChecks', pack: 'cement_bulker', active: true },
  { key: 'bulker_queue', label: 'Plant Queue', category: 'Operations', route: 'bulker/queue', icon: 'Rows3', pack: 'cement_bulker', active: true },
  { key: 'bulker_loading', label: 'Bulker Loading', category: 'Operations', route: 'bulker/loading', icon: 'Gauge', pack: 'cement_bulker', active: true },
  { key: 'bulker_weighbridge', label: 'Weighbridge / Tonnage', category: 'Operations', route: 'bulker/weighbridge', icon: 'Scale', pack: 'cement_bulker', active: true },
  { key: 'bulker_unloading', label: 'Silo / Unloading', category: 'Operations', route: 'bulker/unloading', icon: 'Factory', pack: 'cement_bulker', active: true },
  { key: 'bulker_tat', label: 'Turnaround / Detention', category: 'Management', route: 'bulker/tat', icon: 'TimerReset', pack: 'cement_bulker', active: true },

  // Staff Transport
  { key: 'staff_routes', label: 'Employee Routes', category: 'Operations', route: 'staff/routes', icon: 'Route', pack: 'staff_transport', active: true },
  { key: 'staff_shifts', label: 'Shift Planning', category: 'Operations', route: 'staff/shifts', icon: 'Clock3', pack: 'staff_transport', active: true },
  { key: 'staff_roster', label: 'Duty Rosters', category: 'Operations', route: 'staff/roster', icon: 'ClipboardList', pack: 'staff_transport', active: true },
  { key: 'staff_allocation', label: 'Vehicle / Driver Allocation', category: 'Operations', route: 'staff/allocation', icon: 'BusFront', pack: 'staff_transport', active: true },
  { key: 'staff_attendance', label: 'Boarding / Attendance', category: 'Operations', route: 'staff/attendance', icon: 'UserCheck', pack: 'staff_transport', active: true },
  { key: 'staff_contracts', label: 'Corporate Contracts', category: 'Management', route: 'staff/contracts', icon: 'Handshake', pack: 'staff_transport', active: true },

  // School Transport
  { key: 'school_routes', label: 'Routes & Stops', category: 'Operations', route: 'school/routes', icon: 'MapPinned', pack: 'school_transport', active: true },
  { key: 'school_students', label: 'Students / Riders', category: 'Management', route: 'school/students', icon: 'GraduationCap', pack: 'school_transport', active: true },
  { key: 'school_assignments', label: 'Student Route Assignment', category: 'Operations', route: 'school/assignments', icon: 'ListChecks', pack: 'school_transport', active: true },
  { key: 'school_pickup_drop', label: 'Pickup / Drop', category: 'Operations', route: 'school/pickup-drop', icon: 'BusFront', pack: 'school_transport', active: true },
  { key: 'school_attendance', label: 'Transport Attendance', category: 'Operations', route: 'school/attendance', icon: 'UserCheck', pack: 'school_transport', active: true },
  { key: 'school_attendants', label: 'Drivers / Attendants', category: 'Management', route: 'school/attendants', icon: 'UsersRound', pack: 'school_transport', active: true },
];

export function getModule(key) {
  return MODULE_CATALOG.find((item) => item.key === key) || null;
}

export function getModuleByRoute(route) {
  const clean = String(route || '').replace(/^\/+|\/+$/g, '');
  const exact = MODULE_CATALOG.find((item) => item.route === clean);
  if (exact) return exact;
  return [...MODULE_CATALOG]
    .sort((a, b) => b.route.length - a.route.length)
    .find((item) => clean.startsWith(`${item.route}/`)) || null;
}

export function defaultPermissionSet(enabled = true) {
  return Object.fromEntries(ACTION_KEYS.map((key) => [key, enabled]));
}
