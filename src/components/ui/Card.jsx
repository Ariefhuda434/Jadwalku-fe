export default function Card({ children, className = '', hover = true, variant, onClick }) {
  const variantClass = variant === 'accent' ? 'card-accent' : variant === 'elevated' ? 'card-elevated' : '';
  return (
    <div
      onClick={onClick}
      className={`bg-bg-card rounded-xl border border-border shadow-sm ${
        variantClass
      } ${hover ? 'card-hover cursor-pointer' : ''} ${className}`}
    >
      {children}
    </div>
  );
}
