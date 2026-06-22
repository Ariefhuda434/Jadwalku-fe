export default function DatePicker({ label, error, className = '', ...props }) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-text-primary mb-1.5">
          {label}
        </label>
      )}
      <input
        type="date"
        className={`w-full px-3.5 py-2.5 rounded-lg border ${
          error ? 'border-danger focus:ring-danger/30' : 'border-border focus:ring-primary/30'
        } bg-white text-text-primary text-sm outline-none focus:ring-2 focus:border-primary transition-all ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}
