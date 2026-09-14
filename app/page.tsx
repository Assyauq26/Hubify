export default function Home() {
  return (
    <main className="min-h-screen bg-white px-5 py-10 text-neutral-950 sm:px-8">
      <div className="mx-auto flex min-h-[80vh] max-w-5xl flex-col justify-center">
        <span className="mb-5 text-sm font-medium tracking-wide text-neutral-500">HUBIFY</span>
        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-6xl">
          Your project knowledge hub.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-neutral-600 sm:text-lg">
          Organize projects, notes, and useful links in one focused workspace.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href="/login" className="rounded-lg bg-neutral-950 px-5 py-3 text-sm font-medium text-white hover:bg-neutral-800">
            Get started
          </a>
          <a href="/dashboard" className="rounded-lg border border-neutral-200 px-5 py-3 text-sm font-medium hover:bg-neutral-50">
            Open dashboard
          </a>
        </div>
      </div>
    </main>
  )
}
