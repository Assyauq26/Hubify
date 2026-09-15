import Link from 'next/link'
import VerifyEmailForm from './VerifyEmailForm'

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>
}) {
  const params = await searchParams
  const email = params.email ?? ''

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-50 px-5 py-10">
      <section className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-8">
          <Link href="/" className="text-sm font-medium text-neutral-500 hover:text-neutral-950">HUBIFY</Link>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">Verify your email</h1>
          <p className="mt-2 text-sm leading-6 text-neutral-500">
            We sent a 6-digit verification code to your email address. Enter the latest code below to finish creating your account.
          </p>
        </div>
        <VerifyEmailForm email={email} />
      </section>
    </main>
  )
}
