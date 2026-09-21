import { createRootRoute, Link, Outlet } from '@tanstack/react-router';

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFound,
});

function RootLayout() {
  return (
    <div className="min-h-screen bg-[#f0e3cd] text-[#3d2415]">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-4 py-8">
        <header className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Chess</h1>
          <p className="text-sm text-[#7a5a3c]">Pass and play on one board</p>
        </header>
        <Outlet />
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
      <p className="text-lg">This page does not exist.</p>
      <Link to="/" className="text-sm underline underline-offset-4">
        Go to the board
      </Link>
    </div>
  );
}
