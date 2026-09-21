import { createRootRoute, Link, Outlet } from '@tanstack/react-router';
import { ThemePicker, ThemeProvider } from '@/components/ThemePicker';

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFound,
});

function RootLayout() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-[var(--theme-page)] text-[var(--theme-text)] transition-colors duration-300">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 px-4 py-6 sm:py-8">
          <header className="text-center">
            <h1 className="text-3xl font-bold tracking-tight">Saad Chess</h1>
            <p className="text-sm text-[var(--theme-muted)]">Play locally or invite a friend online</p>
          </header>
          <ThemePicker />
          <Outlet />
        </div>
      </div>
    </ThemeProvider>
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
