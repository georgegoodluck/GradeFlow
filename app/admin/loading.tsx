export default function Loading() {
  return (
    <div className="flex h-[60vh] w-full flex-col items-center justify-center space-y-4">
      <div className="border-t-ink h-12 w-12 animate-spin rounded-full border-4 border-gray-200"></div>
      <p className="text-muted-foreground animate-pulse text-sm font-medium">Fetching data...</p>
    </div>
  );
}
