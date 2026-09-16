import Link from 'next/link'
import RegisterForm from './RegisterForm'

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6 sm:py-12">
      <section className="w-full max-w-[28rem]">
        <div className="border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-sm)] sm:p-8">
          <Link href="/" className="inline-flex min-h-11 items-center rounded-sm text-xs font-semibold uppercase tracking-[0.14em] text-[var(--foreground)] hover:text-[var(--muted-foreground)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--focus-ring)]">HUBIFY</Link>
          <div className="mt-8">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--muted-foreground)]">Get started</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-[-0.03em] sm:text-[28px]">Create your Hubify account</h1>
            <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">Create a focused space for the resources that keep your work moving.</p>
          </div>
          <div className="mt-7 border-t border-[var(--border)] pt-7">
            <RegisterForm />
          </div>
        </div>
      </section>
    </main>
  )
}
