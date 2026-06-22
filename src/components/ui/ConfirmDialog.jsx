import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'Hapus',
  cancelText = 'Batal',
  variant = 'danger',
  onConfirm,
  onCancel,
  loading = false,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative bg-bg-card rounded-xl shadow-xl p-6 w-full max-w-sm animate-fade-in">
        <button
          onClick={onCancel}
          className="absolute top-3 right-3 text-text-secondary hover:text-text-primary"
        >
          <X size={18} />
        </button>
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
            <AlertTriangle size={24} className="text-danger" />
          </div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">{title}</h3>
          {message && (
            <p className="text-sm text-text-secondary mb-6">{message}</p>
          )}
          <div className="flex gap-3 w-full">
            <button
              onClick={onCancel}
              disabled={loading}
              className="flex-1 px-4 py-2 rounded-lg border border-border text-sm font-medium text-text-primary hover:bg-bg-page transition-colors disabled:opacity-50"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 px-4 py-2 rounded-lg bg-danger text-white text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Memproses...' : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
