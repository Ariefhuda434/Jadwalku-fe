export default function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      {icon && <div className="text-5xl mb-4 text-text-muted">{icon}</div>}
      <h3 className="text-base font-semibold text-text-primary mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-text-secondary text-center max-w-xs mb-4">
          {description}
        </p>
      )}
      {action}
    </div>
  );
}
