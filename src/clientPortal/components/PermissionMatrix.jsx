import React from 'react';
import { MODULE_CATALOG, ACTION_KEYS } from '../config/moduleCatalog';

export default function PermissionMatrix({ modules = {}, onChange, allowedModuleKeys = null }) {
  const visible = allowedModuleKeys ? MODULE_CATALOG.filter((m) => allowedModuleKeys.includes(m.key)) : MODULE_CATALOG;
  return (
    <div className="bf-permission-grid">
      {visible.map((module) => {
        const value = modules[module.key] || {};
        return <div key={module.key} className="bf-permission-row">
          <label className="bf-module-toggle"><input type="checkbox" checked={value.view === true} onChange={(e) => onChange(module.key, { ...value, view: e.target.checked })}/><span><strong>{module.label}</strong><small>{module.category}</small></span></label>
          <div className="bf-action-checks">{ACTION_KEYS.filter((a)=>a!=='view').map((action) => <label key={action}><input type="checkbox" disabled={!value.view} checked={value[action] === true} onChange={(e) => onChange(module.key, { ...value, [action]: e.target.checked })}/>{action}</label>)}</div>
        </div>;
      })}
    </div>
  );
}
