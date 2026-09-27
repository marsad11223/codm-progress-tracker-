export function ProgressBar({ value }: { value: number }) {
  const width = Math.min(100, Math.max(0, value));
  return (
    <div
      className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
      role="progressbar"
      aria-valuenow={width}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full rounded-full bg-primary"
        style={{ width: `${width}%` }}
      />
    </div>
  );
}
