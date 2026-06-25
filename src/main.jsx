import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch(() => {});
}

if ('indexedDB' in window) {
  import('./utils/offline').then(({ cacheData }) => {
    const dbReady = 'indexedDB' in window;
    if (dbReady && navigator.onLine) {
      import('./api/axios').then(({ default: api }) => {
        api.get('/jadwal').then((r) => cacheData('jadwal', r.data)).catch(() => {});
        api.get('/tugas').then((r) => cacheData('tugas', r.data)).catch(() => {});
        api.get('/groups').then((r) => cacheData('groups', r.data)).catch(() => {});
        api.get('/notifications').then((r) => cacheData('notifications', r.data)).catch(() => {});
        api.get('/semesters').then((r) => cacheData('semesters', r.data)).catch(() => {});
      });
    }
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
