# JadwalKu - Frontend

React + Vite frontend untuk aplikasi pengingat jadwal kuliah dan tugas.

## Tech Stack

- **Framework:** React 18
- **Bundler:** Vite
- **Styling:** Tailwind CSS
- **Routing:** React Router v6
- **HTTP:** Axios
- **Icons:** Lucide React

## Struktur

```
frontend/
├── public/
│   └── logo.svg           # Favicon
├── src/
│   ├── api/
│   │   └── axios.js       # Axios instance + interceptor
│   ├── assets/
│   │   └── logo.svg       # Logo aplikasi
│   ├── components/
│   │   ├── layout/        # Navbar, Sidebar, Layout
│   │   ├── notification/  # Panel notifikasi
│   │   ├── ui/            # Button, Card, Input, Modal, dll
│   │   └── ProtectedRoute.jsx
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   └── ToastContext.jsx
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── Jadwal.jsx
│   │   ├── Tugas.jsx
│   │   ├── Kalender.jsx
│   │   ├── FAQ.jsx
│   │   ├── Login.jsx
│   │   └── Register.jsx
│   └── utils/
│       └── helpers.js
├── Dockerfile
├── nginx.conf             # Konfigurasi Nginx untuk production
├── vite.config.js
├── tailwind.config.js
└── package.json
```

## Setup

```bash
npm install
npm run dev
```

Berjalan di `http://localhost:5173`. Pastikan backend juga jalan di `:3001`.

## Build Production

```bash
npm run build
```

Hasil build di `dist/`.

## Halaman

| Route | Halaman | Deskripsi |
|-------|---------|-----------|
| `/` | Dashboard | Ringkasan jadwal hari ini, deadline, progress |
| `/jadwal` | Jadwal | CRUD jadwal kuliah dengan filter hari |
| `/tugas` | Tugas | CRUD tugas dengan toggle status & tab filter |
| `/kalender` | Kalender | Tampilan kalender dengan dot indicator |
| `/faq` | FAQ | Pertanyaan umum |
| `/login` | Login | Masuk akun |
| `/register` | Register | Daftar akun baru |
