/* eslint-disable import/no-extraneous-dependencies */
import { defineConfig, loadEnv } from 'vite';
import path from 'node:path';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  console.log(mode);
  if (mode === 'production') {
    process.env.BASE_URL = 'https://intense-savannah-78282.herokuapp.com/';
    process.env.PORT = '';
  }
  if (mode === 'development') {
    process.env = { ...process.env, ...loadEnv(mode, path.resolve(process.cwd(), '../'), 'VITE_') };
    process.env.BASE_URL = 'http://localhost:';
    process.env.PORT = process.env.PORT || process.env.VITE_PORT_REACT;
  }
  return {
    plugins: [react()],
    server: {
      port: process.env.PORT,
      strictPort: true,
    },
  };
});
