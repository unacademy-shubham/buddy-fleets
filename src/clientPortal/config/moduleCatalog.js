export const MODULE_CATALOG = [
  { key: 'dashboard', label: 'Dashboard', category: 'Overview', route: 'dashboard', icon: 'LayoutDashboard', core: true },
  { key: 'sites', label: 'Sites / Branches', category: 'Management', route: 'sites', icon: 'Building2', core: true },
  { key: 'vehicles', label: 'Vehicles', category: 'Fleet', route: 'vehicles', icon: 'Truck', core: true },
  { key: 'drivers', label: 'Drivers', category: 'Fleet', route: 'drivers', icon: 'UsersRound', core: true },
  { key: 'parties', label: 'Parties / Customers', category: 'Masters', route: 'parties', icon: 'Landmark', core: true },
  { key: 'trips', label: 'Trips / Route Planning', category: 'Operations', route: 'trips', icon: 'Route', websiteFeature: true },
  { key: 'dispatch', label: 'Duty & Dispatch', category: 'Operations', route: 'dispatch', icon: 'ClipboardCheck', websiteFeature: true },
  { key: 'lr_bilty', label: 'LR / Bilty / Consignment', category: 'Operations', route: 'lr-bilty', icon: 'FileText', websiteFeature: true },
  { key: 'epod', label: 'ePOD / Delivery Records', category: 'Operations', route: 'epod', icon: 'PackageCheck', websiteFeature: true },
  { key: 'expenses', label: 'Expenses & Earnings', category: 'Finance', route: 'finance', icon: 'IndianRupee', websiteFeature: true },
  { key: 'fuel', label: 'Diesel & Fuel', category: 'Finance', route: 'fuel', icon: 'Fuel', websiteFeature: true },
  { key: 'driver_payments', label: 'Driver Advances & Payments', category: 'Finance', route: 'driver-payments', icon: 'WalletCards', websiteFeature: true },
  { key: 'invoices', label: 'Invoices & Settlements', category: 'Finance', route: 'invoices', icon: 'ReceiptText', websiteFeature: true },
  { key: 'party_ledgers', label: 'Party Records & Ledgers', category: 'Finance', route: 'party-ledgers', icon: 'BookOpenCheck', websiteFeature: true },
  { key: 'compliance', label: 'Documents & Compliance', category: 'Fleet Control', route: 'compliance', icon: 'BellRing', websiteFeature: true },
  { key: 'maintenance', label: 'Workshop & Maintenance', category: 'Fleet Control', route: 'maintenance', icon: 'Wrench', websiteFeature: true },
  { key: 'tyres', label: 'Tyre Management', category: 'Fleet Control', route: 'tyres', icon: 'CircleGauge', websiteFeature: true },
  { key: 'spare_parts', label: 'Spare Parts', category: 'Fleet Control', route: 'spare-parts', icon: 'PackageSearch', websiteFeature: true },
  { key: 'challans', label: 'Challan Records', category: 'Fleet Control', route: 'challans', icon: 'FileWarning', websiteFeature: true },
  { key: 'reports', label: 'Reports', category: 'Management', route: 'reports', icon: 'BarChart3', core: true, websiteFeature: true },
  { key: 'users_roles', label: 'Users & Roles', category: 'Administration', route: 'users', icon: 'ShieldCheck', core: true, websiteFeature: true },
  { key: 'settings', label: 'Company Settings', category: 'Administration', route: 'settings', icon: 'Settings', core: true },
  { key: 'notifications', label: 'Notifications', category: 'Administration', route: 'notifications', icon: 'Bell', core: true },

  { key: 'travel_bookings', label: 'Bookings', category: 'Travels', route: 'travels/bookings', icon: 'CalendarCheck2', pack: 'travels', active: true },
  { key: 'travel_enquiries', label: 'Enquiries / Quotations', category: 'Travels', route: 'travels/enquiries', icon: 'MessageSquareText', pack: 'travels', active: true },
  { key: 'travel_availability', label: 'Vehicle Availability', category: 'Travels', route: 'travels/availability', icon: 'CalendarDays', pack: 'travels', active: true },
  { key: 'travel_tours', label: 'Tours / Trip Sheets', category: 'Travels', route: 'travels/tours', icon: 'MapPinned', pack: 'travels', active: true },

  { key: 'cement_placement', label: 'Vehicle Placement', category: 'Bagged Cement', route: 'cement/placement', icon: 'ListChecks', pack: 'bagged_cement', active: true },
  { key: 'cement_queue', label: 'Plant Queue / Yard', category: 'Bagged Cement', route: 'cement/queue', icon: 'Rows3', pack: 'bagged_cement', active: true },
  { key: 'cement_loading', label: 'Loading / Weighbridge', category: 'Bagged Cement', route: 'cement/loading', icon: 'Scale', pack: 'bagged_cement', active: true },
  { key: 'cement_dispatch', label: 'Cement Dispatch', category: 'Bagged Cement', route: 'cement/dispatch', icon: 'Send', pack: 'bagged_cement', active: true },
  { key: 'cement_delivery', label: 'Dealer Delivery / POD', category: 'Bagged Cement', route: 'cement/delivery', icon: 'PackageOpen', pack: 'bagged_cement', active: true },
  { key: 'cement_tat', label: 'Turnaround / Detention', category: 'Bagged Cement', route: 'cement/tat', icon: 'TimerReset', pack: 'bagged_cement', active: true },
];

export const ACTION_KEYS = ['view', 'create', 'edit', 'delete', 'approve', 'verify', 'print', 'export', 'manage'];

export function getModule(key) {
  return MODULE_CATALOG.find((item) => item.key === key) || null;
}

export function getModuleByRoute(route) {
  const clean = String(route || '').replace(/^\/+|\/+$/g, '');
  return MODULE_CATALOG.find((item) => item.route === clean) || null;
}

export function defaultPermissionSet(enabled = true) {
  return Object.fromEntries(ACTION_KEYS.map((key) => [key, enabled]));
}
