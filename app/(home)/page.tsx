import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col justify-center text-center">
      <h1 className="mb-4 text-2xl font-bold">Hello World</h1>
      <p className="text-fd-muted-foreground">
        You can open{' '}
        <Link
          href="/docs/documentation"
          className="text-fd-foreground font-semibold underline"
        >
          /docs/documentation
        </Link>{' '}
        and see the introduction.
      </p>
    </main>
  );
}
