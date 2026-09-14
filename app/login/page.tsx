export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-50 px-5 py-10">
      <section className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-8">
          <p className="text-sm font-medium text-neutral-500">HUBIFY</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="mt-2 text-sm text-neutral-500">Sign in to continue to your workspace.</p>
        </div>
        <form className="space-y-4">
          <label className="block text-sm font-medium">
            Email
            <input type="email" name="email" autoComplete="email" required className="mt-2 w-full rounded-lg border border-neutral-200 px-3 py-2.5 outline-none focus:border-neutral-950" />
          </label>
          <label className="block text-sm font-medium">
            Password
            <input type="password" name="password" autoComplete="current-password" required className="mt-2 w-full rounded-lg border border-neutral-200 px-3 py-2.5 outline-none focus:border-neutral-950" />
          </label>
          <button type="submit" className="w-full rounded-lg bg-neutral-950 px-4 py-3 text-sm font-medium text-white hover:bg-neutral-800">
            Sign in
          </button>
        </form>
      </section>
    </main>
  )
}
