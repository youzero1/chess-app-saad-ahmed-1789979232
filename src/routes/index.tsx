import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: HomePage,
});

function HomePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f3ead9] text-stone-700">
      <p className="text-lg">Chess board loading…</p>
    </div>
  );
}
