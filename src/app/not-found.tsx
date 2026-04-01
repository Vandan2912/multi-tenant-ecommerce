export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
      <h1 className="text-5xl font-bold text-gray-800">404</h1>
      <p className="mt-4 text-gray-500 text-lg">Store not found.</p>
      <p className="mt-2 text-gray-400 text-sm">
        This domain is not linked to any active store.
      </p>
    </div>
  );
}
