export default function GlobalLoading() {
  return (
    <div className="flex min-h-[60vh] w-full items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-gold border-t-transparent" />
        <p className="font-playfair text-lg text-gray-500 animate-pulse">
          Loading...
        </p>
      </div>
    </div>
  );
}
