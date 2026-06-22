import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function Layout() {
  return (
    <div className="min-h-screen bg-bg-page">
      <Sidebar />
      <Navbar />
      <main className="ml-[260px] mt-16 p-6">
        <Outlet />
      </main>
    </div>
  );
}
