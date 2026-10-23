// Public *liveness* only. Never inspect or expose private database state here.
// Use /api/developer?route=health for authenticated database dependency checks.
export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (!['GET', 'HEAD'].includes(req.method)) {
    res.setHeader('Allow', 'GET, HEAD');
    return res.status(405).json({ ok: false, code: 'METHOD_NOT_ALLOWED' });
  }
  if (req.method === 'HEAD') return res.status(200).end();
  return res.status(200).json({
    ok: true,
    status: 'up',
    service: 'buddy-fleets',
    checkedAt: new Date().toISOString(),
  });
}
