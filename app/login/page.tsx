import Link from 'next/link'
import LoginForm from './LoginForm'

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ registered?: string }> }) {
  const params = await searchParams

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6 sm:py-12">
      <section className="w-full max-w-[28rem]">
        <div className="border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-sm)] sm:p-8">
          <Link href="/" className="inline-flex min-h-11 items-center rounded-sm text-xs font-semibold uppercase tracking-[0.14em] text-[var(--foreground)] hover:text-[var(--muted-foreground)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--focus-ring)]">HUBIFY</Link>
          <div className="mt-8">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--muted-foreground)]">Welcome back</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-[-0.03em] sm:text-[28px]">Sign in to Hubify</h1>
            <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">Continue to your workspaces and resources.</p>
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
