import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Phase 5: Vite writes fingerprinted stylesheet assets and adds the correct
// link to index.html. Browsers can cache CSS across visits instead of
// downloading the entire global stylesheet inside every HTML response.
// Keep one stylesheet to preserve the existing cross-portal cascade order.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    cssCodeSplit: false,
  },
});
