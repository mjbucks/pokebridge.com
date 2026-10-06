import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // Listen on the LAN, not just localhost, so `npm run dev` is reachable
    // from other devices (e.g. a phone) on the same network out of the box.
    host: true,
  },
});
