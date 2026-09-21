import React, { useState } from 'react';
import { CheckCircle2, Search } from 'lucide-react';
import { clientPortalApi } from '../services/clientPortalApi';

export default function GstLookupField({ value, onChange, onResult, demo = false }) {
  const [busy, setBusy] = useState(false); const [status, setStatus] = useState('');
  const lookup = async () => {
    const gstin = String(value || '').trim().toUpperCase();
    if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(gstin)) { setStatus('Enter a valid 15-character GSTIN.'); return; }
    if (demo) { const fake={gstin,legalName:'Demo Registered Business Pvt Ltd',tradeName:'Demo Business',status:'Active',state:'Gujarat',stateCode:gstin.slice(0,2),address:'Demo registered address',pincode:'380015'}; onResult?.(fake); setStatus('Verified in demo mode.'); return; }
    setBusy(true); setStatus('');
    try { const res = await clientPortalApi.lookupGst(gstin); onResult?.(res.gst); setStatus(res.gst?.verified ? 'GST details verified.' : 'GST details loaded.'); }
    catch (e) { setStatus(e.code === 'GST_PROVIDER_NOT_CONFIGURED' ? 'GST lookup provider is not configured; enter details manually.' : e.message); }
    finally { setBusy(false); }
  };
  return <div><div className="bf-inline-field"><input className="bf-input" value={value || ''} maxLength={15} onChange={(e)=>onChange?.(e.target.value.toUpperCase())} placeholder="GSTIN"/><button type="button" className="bf-btn bf-btn-secondary" onClick={lookup} disabled={busy}>{busy ? 'Checking…' : <><Search size={15}/> Verify GST</>}</button></div>{status ? <small className="bf-help"><CheckCircle2 size={13}/>{status}</small> : null}</div>;
}
