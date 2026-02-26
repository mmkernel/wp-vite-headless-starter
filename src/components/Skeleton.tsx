const Skeleton = ({ className = "h-4 w-full" }: { className?: string }) => (
  <div className={`skeleton ${className}`} />
);

export default Skeleton;
