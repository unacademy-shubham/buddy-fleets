import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getDeveloperControlPlaneState,
  saveDeveloperControlPlaneState,
} from '../../../services/developerControlPlaneApi';

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export default function useDeveloperControlPlane(workspaceKey, initialPayload) {
  const initialRef = useRef(initialPayload);
  const [payload, setPayload] = useState(() => clone(initialPayload));
  const [revision, setRevision] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const reload = useCallback(async () => {
    setLoading(true);
    setError('');
    const result = await getDeveloperControlPlaneState(workspaceKey);
    if (result.ok) {
      if (result.state?.payload && typeof result.state.payload === 'object') {
        setPayload(result.state.payload);
      } else {
        setPayload(clone(initialRef.current));
      }
      setRevision(Number(result.state?.revision || 0));
    } else {
      setError('Unable to load saved configuration. Current page defaults are still available.');
    }
    setLoading(false);
    return result;
  }, [workspaceKey]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const result = await getDeveloperControlPlaneState(workspaceKey);
      if (cancelled) return;
      if (result.ok) {
        if (result.state?.payload && typeof result.state.payload === 'object') {
          setPayload(result.state.payload);
        }
        setRevision(Number(result.state?.revision || 0));
      } else {
        setError('Unable to load saved configuration. Current page defaults are still available.');
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [workspaceKey]);

  const save = useCallback(async (nextPayload) => {
    if (saving) return { ok: false, code: 'SAVE_IN_PROGRESS' };
    setSaving(true);
    setError('');
    const result = await saveDeveloperControlPlaneState({
      key: workspaceKey,
      expectedRevision: revision,
      payload: nextPayload,
    });
    if (result.ok) {
      setPayload(result.state.payload);
      setRevision(Number(result.state.revision || revision + 1));
    } else if (result.status === 409) {
      setError('This configuration changed in another session. Reload before saving again.');
    } else {
      setError('Unable to save configuration.');
    }
    setSaving(false);
    return result;
  }, [revision, saving, workspaceKey]);

  return { payload, setPayload, revision, loading, saving, error, reload, save };
}
