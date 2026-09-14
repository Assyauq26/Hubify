import Link from 'next/link'
import RegisterForm from './RegisterForm'

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-50 px-5 py-10">
      <section className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-8">
          <Link href="/" className="text-sm font-medium text-neutral-500 hover:text-neutral-950">HUBIFY</Link>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">Create your account</h1>
          <p className="mt-2 text-sm text-neutral-500">Start organizing your projects in one focused workspace.</p>
        </div>
        <RegisterForm />
      </section>
    </main>
  )
}
