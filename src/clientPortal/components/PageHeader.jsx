import React from 'react';
export default function PageHeader({ title, subtitle, actions }) {
  return <div className="bf-page-head"><div><h1>{title}</h1>{subtitle ? <p>{subtitle}</p> : null}</div><div className="bf-page-actions">{actions}</div></div>;
}
