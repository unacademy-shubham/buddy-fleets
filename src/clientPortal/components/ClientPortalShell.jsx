import React, { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  Settings,
  ShieldCheck,
  User,
} from 'lucide-react';
import SiteSelector from './SiteSelector';
import PortalFooter from './PortalFooter';
import UniversalDashboardShell from './UniversalDashboardShell';
import TrialExpiredPricing from './TrialExpiredPricing';
import { useClientPortal } from '../ClientPortalContext';
import { getVisibleNavigation, iconFor } from '../config/portalNavigation';

function normalizeRuntimeNode(node, index = 0) {
  if (!node || typeof node !== 'object') return null;
  const children = (Array.isArray(node.children) ? node.children : [])
    .map((child, childIndex) => normalizeRuntimeNode(child, childIndex))
    .filter(Boolean);

  return {
    id: node.node_key || node.id || `runtime-${index}`,
    nodeType: node.node_type || node.nodeType || '',
    label: node.label || node.node_key || 'Navigation',
    icon: node.icon_key || node.icon || 'Circle',
    route: node.route || null,
    moduleKey: node.module_key || node.moduleKey || null,
    children,
  };
}

function normalizeRuntimeNavigation(nodes) {
  return (Array.isArray(nodes) ? nodes : [])
    .map(normalizeRuntimeNode)
    .filter(Boolean);
}

function hasDeepRuntimeNavigation(nodes, depth = 0) {
  return (nodes || []).some((node) =>
    ['submenu', 'level3'].includes(node.nodeType) ||
    (depth >= 1 && (node.children || []).length > 0) ||
    hasDeepRuntimeNavigation(node.children || [], depth + 1)
  );
}

function toAbsoluteRoute(basePath, route) {
  if (!route) return null;
  const clean = String(route).replace(/^\/+/, '');
  return `${basePath}/${clean}`.replace(/\/+/g, '/');
}

function toDeveloperMenuTree(nodes, basePath, indexPrefix = '') {
  return (nodes || []).map((node, index) => {
    const children = toDeveloperMenuTree(
      node.children || [],
      basePath,
      `${indexPrefix}${index}-`,
    );

    return {
      id: node.id || `portal-${indexPrefix}${index}`,
      label: node.label || 'Navigation',
      icon: iconFor(node.icon || 'Circle'),
      to: toAbsoluteRoute(basePath, node.route),
      end: Boolean(node.route && !children.length),
      children,
    };
  });
}

function PortalHeaderButton({ children, onClick, title, ariaLabel }) {
  return (
    <button
      type="button"
      title={title}
      aria-label={ariaLabel || title}
      onClick={onClick}
      className="relative flex h-9 w-9 items-center justify-center rounded-md text-[var(--bf-header-muted)] transition duration-150 hover:bg-black/10 hover:text-[var(--bf-header-text)]"
    >
      {children}
    </button>
  );
}

export default function ClientPortalShell({ children }) {
  const {
    company,
    currentUser,
    userAccess,
    runtimeNavigation,
    runtime,
    data,
    demo,
    basePath,
    onLogout,
  } = useClientPortal();

  const navigate = useNavigate();
  const location = useLocation();

  const subscriptionStatus =
    String(
      data?.billing?.subscription?.status ||
      currentUser?.companyStatus ||
      company?.status ||
      ''
    ).toLowerCase();

  const isExpiredTrial =
    runtime?.lifecycleState === 'expired' &&
    (subscriptionStatus === 'trial_expired' || subscriptionStatus === 'trial_active');

  const normalizedPath = location.pathname.replace(/\/+$/, '') || '/';
  const normalizedBasePath = basePath.replace(/\/+$/, '') || '/';
  const isDashboardRoute =
    normalizedPath === normalizedBasePath ||
    normalizedPath === `${normalizedBasePath}/dashboard`;

  const packKey = company?.fleetPack || company?.fleet_pack || null;
  const allowedKeys = userAccess?.moduleKeys || [];

  const navigation = useMemo(() => {
    if (!packKey) return [];

    const local = getVisibleNavigation(packKey, allowedKeys);
    const runtimeNodes = normalizeRuntimeNavigation(runtimeNavigation);

    return runtimeNodes.length && hasDeepRuntimeNavigation(runtimeNodes)
      ? runtimeNodes
      : local;
  }, [packKey, allowedKeys, runtimeNavigation]);

  const menuTree = useMemo(
    () => toDeveloperMenuTree(navigation, basePath),
    [navigation, basePath],
  );

  const canBilling =
    allowedKeys.includes('subscription') || userAccess?.isAdmin === true;

  const displayName =
    currentUser?.name ||
    currentUser?.full_name ||
    currentUser?.fullName ||
    currentUser?.email ||
    'Portal User';

  const companyName =
    company?.company_name ||
    company?.companyName ||
    'Buddy Fleets';

  const companyCode =
    company?.company_code ||
    company?.companyCode ||
    '';

  const role =
    userAccess?.roleName ||
    currentUser?.roleName ||
    currentUser?.role ||
    'Company Owner';

  const profileActions = useMemo(() => {
    const items = [
      {
        id: 'profile',
        label: 'My Profile',
        icon: User,
        to: `${basePath}/profile-security`,
      },
    ];

    if (canBilling) {
      items.push({
        id: 'subscription',
        label: 'Subscription & Billing',
        icon: ShieldCheck,
        to: `${basePath}/subscription`,
      });
    }

    items.push({
      id: 'settings',
      label: 'Company Settings',
      icon: Settings,
      to: `${basePath}/settings`,
    });

    if (demo) {
      items.push({
        id: 'demo-home',
        label: 'All Demo Fleets',
        icon: Home,
        onClick: () => navigate('/demo'),
      });
    }

    return items;
  }, [basePath, canBilling, demo, navigate]);

  const headerExtra = (
    <>
      {demo ? (
        <PortalHeaderButton
          title="All Demo Fleets"
          onClick={() => navigate('/demo')}
        >
          <Home size={19} />
        </PortalHeaderButton>
      ) : null}
      <SiteSelector />
    </>
  );

  const headerLabel = demo ? 'Demo Workspace' : 'Company Portal';
  const headerSubLabel = companyCode
    ? `${companyName} • ${companyCode}`
    : companyName;

  const brandSubtitle = demo ? 'Demo Portal' : 'Company Portal';
  const profileMeta = demo
    ? `${companyName} • Demo` 
    : companyName;

  const content = (
    <>
      {isExpiredTrial && isDashboardRoute ? (
        <TrialExpiredPricing />
      ) : runtime?.lifecycleAccess === 'read_only' ? (
        <div className="bf-note mb-4 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <ShieldCheck size={14} className="shrink-0" />
            <div>
              <strong>{isExpiredTrial ? 'Trial expired · Read-only access' : 'Read-only access'}</strong>
              <span className="ml-2">
                {isExpiredTrial
                  ? 'Your data remains available, but operational changes are disabled until a subscription is activated.'
                  : 'This company lifecycle currently allows viewing, printing and exporting only.'}
              </span>
            </div>
          </div>
          {isExpiredTrial ? (
            <button
              type="button"
              className="bf-btn bf-btn-secondary shrink-0"
              onClick={() => navigate(`${basePath}/dashboard`)}
            >
              View Plans
            </button>
          ) : null}
        </div>
      ) : null}
      {children}
    </>
  );

  return (
    <UniversalDashboardShell
      currentUser={currentUser}
      onLogout={onLogout}
      menuTree={menuTree}
      brandName="Buddy Fleets"
      brandSubtitle={brandSubtitle}
      portalLabel={headerLabel}
      headerSubLabel={headerSubLabel}
      headerExtra={headerExtra}
      profileActions={profileActions}
      profileRole={role}
      profileMeta={profileMeta}
      footer={<PortalFooter />}
    >
      <div className="w-full min-w-0 px-4 py-5 sm:px-5 lg:px-6">
        {content}
      </div>
    </UniversalDashboardShell>
  );
}
