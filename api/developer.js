import accountHandler from '../server/developerApi/account.js';
import company360Handler from '../server/developerApi/company-360.js';
import controlPlaneHandler from '../server/developerApi/control-plane.js';
import finalizationHandler from '../server/developerApi/finalization.js';
import healthHandler from '../server/developerApi/health.js';
import overviewHandler from '../server/developerApi/overview.js';
import platformRegistryHandler from '../server/developerApi/platform-registry.js';
import saasManagementHandler from '../server/developerApi/saas-management.js';

const ROUTES = Object.freeze({
  account: accountHandler,
  'company-360': company360Handler,
  'control-plane': controlPlaneHandler,
  finalization: finalizationHandler,
  health: healthHandler,
  overview: overviewHandler,
  'platform-registry': platformRegistryHandler,
  'saas-management': saasManagementHandler,
});

export default async function handler(req, res) {
  const route = String(req.query?.route || '').trim().toLowerCase();
  const routeHandler = ROUTES[route];

  if (!routeHandler) {
    return res.status(404).json({
      ok: false,
      code: 'DEVELOPER_API_ROUTE_NOT_FOUND',
    });
  }

  return routeHandler(req, res);
}
