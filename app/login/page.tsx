import Link from 'next/link'
import LoginForm from './LoginForm'

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ registered?: string }> }) {
  const params = await searchParams

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6 sm:py-12">
      <section className="w-full max-w-[28rem]">
        <div className="border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8">
          <Link href="/" className="inline-flex min-h-11 items-center text-xs font-semibold uppercase tracking-[0.14em] text-[var(--foreground)] hover:text-[var(--muted-foreground)]">HUBIFY</Link>
          <div className="mt-8">
            <h1 className="text-2xl font-semibold tracking-[-0.025em] sm:text-[28px]">Welcome back</h1>
            <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">Sign in to continue to your workspace.</p>
          </div>
          <div className="mt-7 border-t border-[var(--border)] pt-7">
            {params.registered === '1' ? <div role="status" className="ui-success mb-5">Account created. Check your email to confirm your account, then sign in.</div> : null}
            <LoginForm />
          </div>
        </div>
      </section>
    </main>
  )
}
