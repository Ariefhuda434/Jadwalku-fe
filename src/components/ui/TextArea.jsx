export default function TextArea({ label, error, className = '', ...props }) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-text-primary mb-1.5">
          {label}
        </label>
      )}
      <textarea
        className={`w-full px-3.5 py-2.5 rounded-lg border ${
          error ? 'border-danger focus:ring-danger/30' : 'border-border focus:ring-primary/30'
        } bg-white text-text-primary placeholder-text-muted text-sm outline-none focus:ring-2 focus:border-primary transition-all resize-none ${className}`}
        rows={3}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}
