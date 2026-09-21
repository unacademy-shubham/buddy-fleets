import React from 'react';
import { X } from 'lucide-react';

export default function Modal({ open, title, children, onClose, footer, width = '760px' }) {
  if (!open) return null;
  return (
    <div className="bf-modal-backdrop" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose?.(); }}>
      <div className="bf-modal" style={{ maxWidth: width }} role="dialog" aria-modal="true" aria-label={title}>
        <div className="bf-modal-head"><h3>{title}</h3><button type="button" className="bf-icon-btn" onClick={onClose}><X size={18} /></button></div>
        <div className="bf-modal-body">{children}</div>
        {footer ? <div className="bf-modal-footer">{footer}</div> : null}
      </div>
    </div>
  );
}
