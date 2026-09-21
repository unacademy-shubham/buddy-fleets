import React from 'react';
import { Building2 } from 'lucide-react';
import { useClientPortal } from '../ClientPortalContext';

export default function SiteSelector() {
  const { sites = [], selectedSiteId, setSelectedSiteId, userAccess } = useClientPortal();
  const allowed = userAccess?.allSites ? sites : sites.filter((site) => userAccess?.siteIds?.includes(site.id));
  return (
    <label className="bf-site-select"><Building2 size={16}/><select value={selectedSiteId} onChange={(e) => setSelectedSiteId(e.target.value)}>
      {allowed.length > 1 || userAccess?.allSites ? <option value="all">All Authorized Sites</option> : null}
      {allowed.map((site) => <option key={site.id} value={site.id}>{site.name}</option>)}
    </select></label>
  );
}
