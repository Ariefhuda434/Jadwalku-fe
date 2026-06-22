import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function Login() {
  const { login } = useAuth();
  const { addToast } = useToast();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError('Semua field harus diisi');
      return;
    }
    setLoading(true);
    try {
      await login(form.email, form.password);
      addToast('Login berhasil!', 'success');
    } catch (err) {
      const msg = err.response?.data?.message || 'Email atau password salah';
      setError(msg);
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-indigo-700 to-blue-600 flex items-center justify-center p-4">
      <div className="w-full max-w-[420px] bg-white rounded-2xl shadow-2xl p-8 animate-slide-up">
        <div className="text-center mb-8">
          <img src="/src/assets/logo.svg" className="w-12 h-12 mx-auto mb-3" />
          <h1 className="font-heading text-2xl font-bold text-text-primary">
            Masuk
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Silakan masuk ke akun Anda
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            name="email"
            placeholder="contoh@email.com"
            value={form.email}
            onChange={handleChange}
          />
          <Input
            label="Password"
            type="password"
            name="password"
            placeholder="Masukkan password"
            value={form.password}
            onChange={handleChange}
          />

          {error && (
            <p className="text-sm text-danger bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <LoadingSpinner size="sm" /> : 'Masuk'}
          </Button>
        </form>

        <p className="text-center text-sm text-text-secondary mt-6">
          Belum punya akun?{' '}
          <Link to="/register" className="text-primary font-medium hover:underline">
            Daftar
          </Link>
        </p>
      </div>
    </div>
  );
}
