import React from 'react';

export default function KpiCard({ title, value, note, icon: Icon, tone = 'purple' }) {
  return (
    <div className={`bf-card bf-kpi bf-tone-${tone}`}>
      <div className="bf-kpi-icon">{Icon ? <Icon size={20} /> : null}</div>
      <div>
        <div className="bf-muted bf-kpi-title">{title}</div>
        <div className="bf-kpi-value">{value}</div>
        {note ? <div className="bf-kpi-note">{note}</div> : null}
      </div>
    </div>
  );
}
