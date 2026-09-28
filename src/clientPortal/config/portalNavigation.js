import * as Icons from 'lucide-react';
import { getFleetPack } from './fleetPacks';

const leaf = (label, route, moduleKey, extra = {}) => ({ label, route, moduleKey, ...extra });
const group = (label, children, extra = {}) => ({ label, children, ...extra });

const FINANCE_CHILDREN = [
  group('Expenses & Earnings', [
    leaf('Expenses', 'finance', 'expenses'),
    leaf('Earnings', 'finance/earnings', 'expenses'),
    leaf('Expense Categories', 'finance/categories', 'expenses'),
  ]),
  group('Diesel & Fuel', [
    leaf('Fuel Entries', 'fuel', 'fuel'),
    leaf('Fuel Register', 'fuel/register', 'fuel'),
    leaf('Fuel Performance', 'fuel/performance', 'fuel'),
  ]),
  group('Driver Advances & Payments', [
    leaf('Advances', 'driver-payments', 'driver_payments'),
    leaf('Driver Payments', 'driver-payments/payments', 'driver_payments'),
    leaf('Driver Settlement', 'driver-payments/settlement', 'driver_payments'),
  ]),
  group('Workshop & Maintenance', [
    leaf('Maintenance Jobs', 'maintenance', 'maintenance'),
    leaf('Service Schedule', 'maintenance/schedule', 'maintenance'),
    leaf('Workshop Register', 'maintenance/workshop', 'maintenance'),
  ]),
  group('Tyre Management', [
    leaf('Tyre Master', 'tyres', 'tyres'),
    leaf('Tyre Assignment', 'tyres/assignment', 'tyres'),
    leaf('Tyre History', 'tyres/history', 'tyres'),
  ]),
  group('Spare Parts', [
    leaf('Parts Master', 'spare-parts', 'spare_parts'),
    leaf('Stock Transactions', 'spare-parts/stock', 'spare_parts'),
    leaf('Purchase History', 'spare-parts/purchases', 'spare_parts'),
  ]),
  group('Invoices & Settlements', [
    leaf('Customer Invoices', 'invoices', 'invoices'),
    leaf('Freight Settlement', 'invoices/freight-settlement', 'invoices'),
    leaf('Payments & Receipts', 'invoices/payments', 'invoices'),
  ]),
  group('Party Records & Ledgers', [
    leaf('Party Ledger', 'party-ledgers', 'party_ledgers'),
    leaf('Outstanding', 'party-ledgers/outstanding', 'party_ledgers'),
    leaf('Transactions', 'party-ledgers/transactions', 'party_ledgers'),
  ]),
  group('Profit & Loss', [
    leaf('P&L Overview', 'profit-loss', 'profit_loss'),
    leaf('Vehicle P&L', 'profit-loss/vehicles', 'profit_loss'),
    leaf('Site / Plant P&L', 'profit-loss/sites', 'profit_loss'),
    leaf('Route P&L', 'profit-loss/routes', 'profit_loss'),
  ]),
  group('Challan Records', [
    leaf('Challans', 'challans', 'challans'),
    leaf('Challan Payments', 'challans/payments', 'challans'),
  ]),
];

const MANAGEMENT_CHILDREN = [
  group('Sites / Branches', [
    leaf('Sites', 'sites', 'sites'),
    leaf('Site Access', 'sites/access', 'sites'),
  ]),
  group('Fleet Management', [
    leaf('Vehicle Masters', 'vehicles', 'vehicles'),
    leaf('Vehicle 360', 'vehicles/360', 'vehicles'),
    leaf('Vehicle Inspection', 'vehicle-inspection', 'vehicle_inspection'),
    leaf('Inspection Defects', 'vehicle-inspection/defects', 'vehicle_inspection'),
    leaf('Inspection History', 'vehicle-inspection/history', 'vehicle_inspection'),
  ]),
  group('Documents & Compliance', [
    leaf('Vehicle Documents', 'compliance', 'compliance'),
    leaf('Expiry Monitor', 'compliance/expiry', 'compliance'),
    leaf('Compliance Status', 'compliance/status', 'compliance'),
  ]),
  group('Drivers', [
    leaf('Driver Master', 'drivers', 'drivers'),
    leaf('Driver 360', 'drivers/360', 'drivers'),
    leaf('Licence & Compliance', 'drivers/compliance', 'drivers'),
  ]),
  group('Parties / Customers', [
    leaf('Party Master', 'parties', 'parties'),
    leaf('Party 360', 'parties/360', 'parties'),
    leaf('GST Details', 'parties/gst', 'parties'),
  ]),
  group('Reports', [
    leaf('Operations Reports', 'reports', 'reports'),
    leaf('Finance Reports', 'reports/finance', 'reports'),
    leaf('Fleet Reports', 'reports/fleet', 'reports'),
    leaf('Site / Plant Reports', 'reports/sites', 'reports'),
  ]),
];

const ADMIN_CHILDREN = [
  group('Users & Roles', [
    leaf('Users', 'users', 'users_roles'),
    leaf('Roles', 'users/roles', 'users_roles'),
    leaf('Permissions', 'users/permissions', 'users_roles'),
  ]),
  group('Notifications', [
    leaf('Notification Center', 'notifications', 'notifications'),
    leaf('Alert Rules', 'notifications/rules', 'notifications'),
  ]),
  group('Company Settings', [
    leaf('Company Profile', 'settings', 'settings'),
    leaf('Site Configuration', 'settings/sites', 'settings'),
    leaf('Numbering & Preferences', 'settings/numbering', 'settings'),
    leaf('Fleet Configuration', 'settings/fleet', 'settings'),
  ]),
  group('Profile & Security', [
    leaf('My Profile', 'profile-security', null),
    leaf('Security', 'profile-security/security', null),
    leaf('Sessions', 'profile-security/sessions', null),
    leaf('Login Activity', 'profile-security/activity', null),
  ]),
  group('Subscription & Billing', [
    leaf('Current Plan', 'subscription', 'subscription'),
    leaf('Plan Validity', 'subscription/validity', 'subscription'),
    leaf('Usage & Limits', 'subscription/usage', 'subscription'),
    leaf('Invoices', 'subscription/invoices', 'subscription'),
    leaf('Payments / Receipts', 'subscription/payments', 'subscription'),
  ]),
  group('Audit & Activity', [
    leaf('Activity Log', 'audit-activity', 'audit_activity'),
    leaf('Audit Trail', 'audit-activity/audit-trail', 'audit_activity'),
  ]),
  group('Approval Center', [
    leaf('Pending Approvals', 'approval-center', 'approval_center'),
    leaf('Approval History', 'approval-center/history', 'approval_center'),
  ]),
];

function baggedCementOperations() {
  return [
    group('Trips / Route Planning', [
      leaf('Trip Register', 'trips', 'trips'),
      leaf('Route Planning', 'route-planning', 'route_planning'),
      leaf('Trip Tracking', 'trips/tracking', 'trips'),
    ]),
    group('Duty & Dispatch', [
      leaf('Vehicle Placement', 'cement/placement', 'cement_placement'),
      leaf('Dispatch Planning', 'cement/dispatch', 'cement_dispatch'),
      leaf('Duty Allocation', 'dispatch', 'dispatch'),
      leaf('Dispatch Register', 'cement/dispatch/register', 'cement_dispatch'),
    ]),
    group('ePOD / Delivery Records', [
      leaf('Delivery Register', 'cement/delivery', 'cement_delivery'),
      leaf('POD Management', 'epod', 'epod'),
      leaf('Delivery Exceptions', 'cement/delivery/exceptions', 'cement_delivery'),
    ]),
    group('Plant Queue / Yard', [
      leaf('Plant Reporting', 'cement/queue', 'cement_queue'),
      leaf('Yard Queue', 'cement/queue/yard', 'cement_queue'),
      leaf('Gate Movement', 'cement/queue/gate', 'cement_queue'),
    ]),
    group('Loading / Weighbridge', [
      leaf('Loading Register', 'cement/loading', 'cement_loading'),
      leaf('Weighbridge', 'cement/loading/weighbridge', 'cement_loading'),
      leaf('Tonnage', 'cement/loading/tonnage', 'cement_loading'),
    ]),
    group('Invoices & Settlements', [
      leaf('Freight Settlement', 'invoices/freight-settlement', 'invoices'),
      leaf('Settlement Register', 'invoices/settlement-register', 'invoices'),
    ]),
  ];
}

function travelsOperations() {
  return [
    group('Bookings & Quotations', [
      leaf('Bookings', 'travels/bookings', 'travel_bookings'),
      leaf('Enquiries / Quotations', 'travels/enquiries', 'travel_enquiries'),
      leaf('Customer Booking Register', 'travels/bookings/register', 'travel_bookings'),
    ]),
    group('Trips / Tours', [
      leaf('Tours / Trip Sheets', 'travels/tours', 'travel_tours'),
      leaf('Trips / Route Planning', 'trips', 'trips'),
      leaf('Route Planning', 'route-planning', 'route_planning'),
    ]),
    group('Vehicle Allocation', [
      leaf('Vehicle Availability', 'travels/availability', 'travel_availability'),
      leaf('Vehicle Allocation', 'travels/availability/allocation', 'travel_availability'),
      leaf('Driver Duty / Allocation', 'travels/driver-duty', 'travel_driver_duty'),
    ]),
    group('Delivery / Trip Closure', [
      leaf('Trip Completion', 'travels/tours/completed', 'travel_tours'),
      leaf('ePOD / Delivery Records', 'epod', 'epod'),
    ]),
    group('Invoices & Settlements', [
      leaf('Customer Invoices', 'invoices', 'invoices'),
      leaf('Trip Settlement', 'invoices/trip-settlement', 'invoices'),
    ]),
  ];
}

function generalGoodsOperations() {
  return [
    group('LR / Bilty / Consignment', [
      leaf('Consignment Register', 'goods/consignments', 'goods_consignment'),
      leaf('LR / Bilty Register', 'lr-bilty', 'lr_bilty'),
      leaf('Load Planning', 'goods/load-planning', 'goods_load_planning'),
    ]),
    group('Trips / Route Planning', [
      leaf('Trip Register', 'trips', 'trips'),
      leaf('Route Planning', 'route-planning', 'route_planning'),
      leaf('Trip Tracking', 'trips/tracking', 'trips'),
    ]),
    group('Duty & Dispatch', [
      leaf('Duty Allocation', 'dispatch', 'dispatch'),
      leaf('Dispatch Planning', 'dispatch/planning', 'dispatch'),
      leaf('Dispatch Register', 'dispatch/register', 'dispatch'),
    ]),
    group('Delivery & POD', [
      leaf('Delivery Register', 'goods/delivery', 'goods_delivery'),
      leaf('ePOD / Delivery Records', 'epod', 'epod'),
      leaf('Delivery Exceptions', 'goods/delivery/exceptions', 'goods_delivery'),
    ]),
    group('Freight & Settlements', [
      leaf('Freight Settlement', 'goods/freight', 'goods_freight'),
      leaf('Invoices & Settlements', 'invoices', 'invoices'),
    ]),
  ];
}

function containerOperations() {
  return [
    group('Container Movement', [
      leaf('Movement Register', 'container/movement', 'container_movement'),
      leaf('Import / Export Movement', 'container/movement/import-export', 'container_movement'),
      leaf('Trip Tracking', 'trips/tracking', 'trips'),
    ]),
    group('Port / ICD / CFS', [
      leaf('Port Operations', 'container/port-ops', 'container_port_ops'),
      leaf('ICD / CFS Operations', 'container/port-ops/icd-cfs', 'container_port_ops'),
      leaf('Gate Movements', 'container/gate', 'container_gate'),
    ]),
    group('Dispatch & Delivery', [
      leaf('Duty & Dispatch', 'dispatch', 'dispatch'),
      leaf('Trips / Route Planning', 'trips', 'trips'),
      leaf('ePOD / Delivery Records', 'epod', 'epod'),
    ]),
    group('Empty Return & Detention', [
      leaf('Empty Return', 'container/empty-return', 'container_empty_return'),
      leaf('Container Detention', 'container/detention', 'container_detention'),
      leaf('Detention Register', 'container/detention/register', 'container_detention'),
    ]),
    group('Invoices & Settlements', [
      leaf('Freight Settlement', 'invoices/freight-settlement', 'invoices'),
      leaf('Customer Invoices', 'invoices', 'invoices'),
    ]),
  ];
}

function bulkerOperations() {
  return [
    group('Placement & Queue', [
      leaf('Vehicle Placement', 'bulker/placement', 'bulker_placement'),
      leaf('Plant Queue', 'bulker/queue', 'bulker_queue'),
      leaf('Plant Reporting', 'bulker/queue/reporting', 'bulker_queue'),
    ]),
    group('Loading / Weighbridge', [
      leaf('Bulker Loading', 'bulker/loading', 'bulker_loading'),
      leaf('Weighbridge / Tonnage', 'bulker/weighbridge', 'bulker_weighbridge'),
      leaf('Loading Register', 'bulker/loading/register', 'bulker_loading'),
    ]),
    group('Dispatch & Transit', [
      leaf('Duty & Dispatch', 'dispatch', 'dispatch'),
      leaf('Trips / Route Planning', 'trips', 'trips'),
      leaf('Trip Tracking', 'trips/tracking', 'trips'),
    ]),
    group('Unloading / Delivery', [
      leaf('Silo / Unloading', 'bulker/unloading', 'bulker_unloading'),
      leaf('Delivery Records', 'delivery-records', 'delivery_records'),
      leaf('ePOD', 'epod', 'epod'),
    ]),
    group('Invoices & Settlements', [
      leaf('Freight Settlement', 'invoices/freight-settlement', 'invoices'),
      leaf('Customer Invoices', 'invoices', 'invoices'),
    ]),
  ];
}

function staffOperations() {
  return [
    group('Routes & Shifts', [
      leaf('Employee Routes', 'staff/routes', 'staff_routes'),
      leaf('Shift Planning', 'staff/shifts', 'staff_shifts'),
      leaf('Route Planning', 'route-planning', 'route_planning'),
    ]),
    group('Duty & Allocation', [
      leaf('Duty Rosters', 'staff/roster', 'staff_roster'),
      leaf('Vehicle / Driver Allocation', 'staff/allocation', 'staff_allocation'),
      leaf('Duty & Dispatch', 'dispatch', 'dispatch'),
    ]),
    group('Boarding & Trips', [
      leaf('Boarding / Attendance', 'staff/attendance', 'staff_attendance'),
      leaf('Trip Register', 'trips', 'trips'),
      leaf('Trip Exceptions', 'staff/attendance/exceptions', 'staff_attendance'),
    ]),
    group('Contracts & Billing', [
      leaf('Corporate Contracts', 'staff/contracts', 'staff_contracts'),
      leaf('Invoices & Settlements', 'invoices', 'invoices'),
    ]),
  ];
}

function schoolOperations() {
  return [
    group('Routes & Stops', [
      leaf('Routes & Stops', 'school/routes', 'school_routes'),
      leaf('Student Route Assignment', 'school/assignments', 'school_assignments'),
      leaf('Route Planning', 'route-planning', 'route_planning'),
    ]),
    group('Pickup / Drop', [
      leaf('Pickup / Drop Register', 'school/pickup-drop', 'school_pickup_drop'),
      leaf('Transport Attendance', 'school/attendance', 'school_attendance'),
      leaf('Exceptions', 'school/pickup-drop/exceptions', 'school_pickup_drop'),
    ]),
    group('Duty & Allocation', [
      leaf('Vehicle Allocation', 'dispatch', 'dispatch'),
      leaf('Drivers / Attendants', 'school/attendants', 'school_attendants'),
      leaf('Trip Register', 'trips', 'trips'),
    ]),
    group('School Billing', [
      leaf('Invoices & Settlements', 'invoices', 'invoices'),
      leaf('Party / School Ledger', 'party-ledgers', 'party_ledgers'),
    ]),
  ];
}

function packManagementExtras(packKey) {
  if (packKey === 'bagged_cement') {
    return [group('Turnaround / Detention', [
      leaf('Turnaround', 'cement/tat', 'cement_tat'),
      leaf('Detention', 'cement/tat/detention', 'cement_tat'),
      leaf('Rules', 'cement/tat/rules', 'cement_tat'),
    ])];
  }
  if (packKey === 'container') {
    return [group('Container Detention', [
      leaf('Active Detention', 'container/detention', 'container_detention'),
      leaf('Detention History', 'container/detention/history', 'container_detention'),
      leaf('Rules', 'container/detention/rules', 'container_detention'),
    ])];
  }
  if (packKey === 'cement_bulker') {
    return [group('Turnaround / Detention', [
      leaf('Turnaround', 'bulker/tat', 'bulker_tat'),
      leaf('Detention', 'bulker/tat/detention', 'bulker_tat'),
      leaf('Rules', 'bulker/tat/rules', 'bulker_tat'),
    ])];
  }
  if (packKey === 'staff_transport') {
    return [group('Corporate Management', [
      leaf('Corporate Contracts', 'staff/contracts', 'staff_contracts'),
      leaf('Route SLAs', 'staff/contracts/sla', 'staff_contracts'),
    ])];
  }
  if (packKey === 'school_transport') {
    return [
      group('Students / Riders', [
        leaf('Student Master', 'school/students', 'school_students'),
        leaf('Route Assignment', 'school/assignments', 'school_assignments'),
      ]),
      group('Drivers / Attendants', [
        leaf('Driver / Attendant Register', 'school/attendants', 'school_attendants'),
        leaf('Duty Assignment', 'school/attendants/duty', 'school_attendants'),
      ]),
    ];
  }
  return [];
}

function operationsFor(packKey) {
  switch (packKey) {
    case 'bagged_cement': return baggedCementOperations();
    case 'general_transport': return generalGoodsOperations();
    case 'container': return containerOperations();
    case 'cement_bulker': return bulkerOperations();
    case 'staff_transport': return staffOperations();
    case 'school_transport': return schoolOperations();
    case 'travels':
    default: return travelsOperations();
  }
}

export function getPortalNavigation(packKey = 'travels') {
  const pack = getFleetPack(packKey) || getFleetPack('travels');
  return [
    {
      id: 'overview',
      label: 'Overview',
      icon: 'LayoutDashboard',
      children: [
        leaf('Dashboard', 'dashboard', 'dashboard'),
        leaf('Live Operations', 'live-operations', 'live_operations'),
      ],
    },
    {
      id: 'operations',
      label: 'Operations',
      icon: pack?.icon || 'Route',
      children: operationsFor(packKey),
    },
    {
      id: 'finance',
      label: 'Finance',
      icon: 'IndianRupee',
      children: FINANCE_CHILDREN,
    },
    {
      id: 'management',
      label: 'Management',
      icon: 'PanelsTopLeft',
      children: [...MANAGEMENT_CHILDREN.slice(0, 5), ...packManagementExtras(packKey), ...MANAGEMENT_CHILDREN.slice(5)],
    },
    {
      id: 'administration',
      label: 'Administration',
      icon: 'ShieldCheck',
      children: ADMIN_CHILDREN,
    },
  ];
}

function filterNode(node, allowed) {
  if (Array.isArray(node.children)) {
    const children = node.children.map((child) => filterNode(child, allowed)).filter(Boolean);
    return children.length ? { ...node, children } : null;
  }
  if (!node.moduleKey) return node;
  return allowed.has(node.moduleKey) ? node : null;
}

export function getVisibleNavigation(packKey, allowedKeys = []) {
  const allowed = new Set(allowedKeys);
  return getPortalNavigation(packKey).map((node) => filterNode(node, allowed)).filter(Boolean);
}

export function findNavigationNodeByRoute(packKey, route) {
  const clean = String(route || '').replace(/^\/+|\/+$/g, '');
  let best = null;
  const walk = (nodes) => {
    for (const node of nodes) {
      if (node.route) {
        const exact = node.route === clean;
        const prefix = clean.startsWith(`${node.route}/`);
        if (exact || prefix) {
          if (!best || node.route.length > best.route.length) best = node;
        }
      }
      if (node.children) walk(node.children);
    }
  };
  walk(getPortalNavigation(packKey));
  return best;
}

export function iconFor(name, fallback = 'Circle') {
  return Icons[name] || Icons[fallback] || Icons.Circle;
}

export function flattenNavigation(packKey) {
  const rows = [];
  const walk = (nodes, parents = []) => {
    for (const node of nodes) {
      const trail = [...parents, node.label];
      if (node.route) rows.push({ ...node, trail });
      if (node.children) walk(node.children, trail);
    }
  };
  walk(getPortalNavigation(packKey));
  return rows;
}
