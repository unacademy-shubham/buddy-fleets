import React, { useState } from 'react';
import { Camera } from 'lucide-react';
import { clientPortalApi } from '../services/clientPortalApi';

async function fileToSmallJpeg(file) {
  const bitmap = await createImageBitmap(file);
  const max = 480;
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.78));
  return await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = reject; reader.readAsDataURL(blob); });
}

export default function PhotoField({ ownerType, ownerId, photoUrl, demo = false, onUploaded }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const upload = async (event) => {
    const file = event.target.files?.[0]; if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Please select an image.'); return; }
    if (demo) { const photoUrl = URL.createObjectURL(file); onUploaded?.(photoUrl, { photoUrl, path: null }); return; }
    setBusy(true); setError('');
    try {
      const dataUrl = await fileToSmallJpeg(file);
      const result = await clientPortalApi.uploadPhoto({ ownerType, ownerId, dataUrl, mimeType: 'image/jpeg' });
      onUploaded?.(result.photoUrl || result.path, result);
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  };
  return <div className="bf-photo-field"><div className="bf-photo-avatar">{photoUrl ? <img src={photoUrl} alt="Profile"/> : <Camera size={28}/>}</div><label className="bf-btn bf-btn-secondary">{busy ? 'Uploading…' : 'Upload Photo'}<input hidden type="file" accept="image/*" onChange={upload}/></label>{error ? <small className="bf-error">{error}</small> : null}</div>;
}
