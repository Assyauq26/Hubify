import Link from 'next/link'
import RegisterForm from './RegisterForm'

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--background)] px-5 py-10 text-[var(--foreground)] sm:px-8">
      <section className="w-full max-w-md">
        <div className="border-b border-[var(--border)] pb-7">
          <Link href="/" className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--foreground)] hover:text-[var(--muted-foreground)]">HUBIFY</Link>
          <h1 className="mt-8 text-[26px] font-semibold tracking-[-0.02em]">Create your account</h1>
          <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">Start organizing your projects in one focused workspace.</p>
        </div>
        <div className="py-7">
          <RegisterForm />
        </div>
      </section>
    </main>
  )
}
