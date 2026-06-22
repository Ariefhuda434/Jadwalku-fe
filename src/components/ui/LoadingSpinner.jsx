export default function LoadingSpinner({ size = 'md', className = '' }) {
  const sizeClass = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' }[size] || 'w-8 h-8';
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`${sizeClass} border-4 border-border border-t-primary rounded-full animate-spin`}
      />
    </div>
  );
}
