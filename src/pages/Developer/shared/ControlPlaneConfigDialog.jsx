import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';

export default function ControlPlaneConfigDialog({ item, saving, error, onClose, onSave }) {
  const dialogRef = useRef(null);
  const [status, setStatus] = useState(item?.status || 'active');
  const [notes, setNotes] = useState(item?.config?.notes || '');
  const [enabled, setEnabled] = useState(item?.config?.enabled !== false);

  useEffect(() => {
    dialogRef.current?.showModal();
    return () => dialogRef.current?.close();
  }, []);

  return (
    <dialog
      ref={dialogRef}
      onCancel={onClose}
      className="m-auto w-[calc(100%-28px)] max-w-lg rounded-[5px] border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface)] p-0 text-[var(--bf-dev-text)] shadow-xl backdrop:bg-black/40"
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSave({
            ...item,
            status,
            config: {
              ...(item.config || {}),
              enabled,
              notes,
            },
          });
        }}
        className="p-5"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--bf-dev-primary)]">
              Backend configuration
            </div>
            <h2 className="mt-1 text-[18px] font-semibold">{item.title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--bf-dev-border)] text-[var(--bf-dev-text-2)]"
          >
            <X size={15} />
          </button>
        </div>

        <div className="mt-4 space-y-3">
          <label className="block text-[10px] font-semibold text-[var(--bf-dev-text-2)]">
            Status
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="mt-1.5 h-10 w-full rounded-lg border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface)] px-3 text-[11px] outline-none focus:border-[var(--bf-dev-primary)]"
            >
              <option value="active">active</option>
              <option value="warning">warning</option>
              <option value="planned">planned</option>
            </select>
          </label>

          <label className="flex items-center gap-2 text-[10px] font-semibold text-[var(--bf-dev-text-2)]">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(event) => setEnabled(event.target.checked)}
            />
            Enabled
          </label>

          <label className="block text-[10px] font-semibold text-[var(--bf-dev-text-2)]">
            Internal notes
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={5}
              maxLength={5000}
              className="mt-1.5 w-full rounded-lg border border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface)] px-3 py-2 text-[11px] outline-none focus:border-[var(--bf-dev-primary)]"
            />
          </label>
        </div>

        {error && (
          <p role="alert" className="mt-3 text-[10px] text-rose-500">
            {error}
          </p>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 items-center rounded-md border border-[var(--bf-dev-border)] px-3 text-[12px] font-semibold text-[var(--bf-dev-text-2)]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex h-9 items-center rounded-md border border-[var(--bf-dev-primary)] bg-[var(--bf-dev-primary)] px-3 text-[12px] font-semibold text-white disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </dialog>
  );
}
