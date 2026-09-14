import Link from 'next/link'
import LoginForm from './LoginForm'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ registered?: string }>
}) {
  const params = await searchParams

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-50 px-5 py-10">
      <section className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-8">
          <Link href="/" className="text-sm font-medium text-neutral-500 hover:text-neutral-950">
            HUBIFY
          </Link>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="mt-2 text-sm text-neutral-500">Sign in to continue to your workspace.</p>
        </div>

        {params.registered === '1' ? (
          <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-700">
            Account created. Check your email to confirm your account, then sign in.
          </div>
        ) : null}

        <LoginForm />
      </section>
    </main>
  )
}
