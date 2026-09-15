import Link from 'next/link'
import LoginForm from './LoginForm'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ registered?: string }>
}) {
  const params = await searchParams

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--background)] px-5 py-10 text-[var(--foreground)] sm:px-8">
      <section className="w-full max-w-md">
        <div className="border-b border-[var(--border)] pb-7">
          <Link href="/" className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--foreground)] hover:text-[var(--muted-foreground)]">
            HUBIFY
          </Link>
          <h1 className="mt-8 text-[26px] font-semibold tracking-[-0.02em]">Welcome back</h1>
          <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">Sign in to continue to your workspace.</p>
        </div>

        <div className="py-7">
          {params.registered === '1' ? (
            <div role="status" className="ui-success mb-5">
              Account created. Check your email to confirm your account, then sign in.
            </div>
          ) : null}
          <LoginForm />
        </div>
      </section>
    </main>
  )
}
