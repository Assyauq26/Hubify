'use client'

import { FormEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const RESEND_COOLDOWN_SECONDS = 60

export default function VerifyEmailForm({ email }: { email: string }) {
  const router = useRouter()
  const [token, setToken] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [pending, setPending] = useState(false)
  const [resending, setResending] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = window.setInterval(() => {
      setCooldown((current) => Math.max(0, current - 1))
    }, 1000)
    return () => window.clearInterval(timer)
  }, [cooldown])

  async function handleVerify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setMessage('')

    const normalizedToken = token.replace(/\D/g, '').slice(0, 6)

    if (!email) {
      setError('Alamat email tidak ditemukan. Silakan daftar kembali.')
      return
    }

    if (normalizedToken.length !== 6) {
      setError('Masukkan kode verifikasi 6 digit.')
      return
    }

    setPending(true)
    const supabase = createClient()
    const { error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: normalizedToken,
      type: 'email',
    })
    setPending(false)

    if (verifyError) {
      setError('Kode verifikasi tidak valid atau sudah kedaluwarsa. Gunakan kode terbaru dari email.')
      return
    }

    router.replace('/dashboard')
    router.refresh()
  }

  async function handleResend() {
    if (!email || cooldown > 0 || resending) return

    setError('')
    setMessage('')
    setResending(true)

    const supabase = createClient()
    const { error: resendError } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/verify-email`,
      },
    })

    setResending(false)

    if (resendError) {
      setError(resendError.message)
      return
    }

    setMessage('Kode baru sudah dikirim. Gunakan kode terbaru dan jangan gunakan kode lama.')
    setCooldown(RESEND_COOLDOWN_SECONDS)
  }

  if (!email) {
    return (
      <div className="space-y-4">
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
          Alamat email tidak ditemukan. Silakan kembali ke halaman pendaftaran.
        </p>
        <a href="/register" className="block w-full rounded-lg bg-neutral-950 px-4 py-3 text-center text-sm font-medium text-white hover:bg-neutral-800">
          Back to registration
        </a>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="rounded-lg bg-neutral-50 px-3 py-2.5 text-sm text-neutral-600">
        Code sent to <span className="font-medium text-neutral-950">{email}</span>
      </div>

      {error ? (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {message ? (
        <div role="status" className="rounded-lg border border-green-200 bg-green-50 px-3 py-2.5 text-sm text-green-700">
          {message}
        </div>
      ) : null}

      <form onSubmit={handleVerify} className="space-y-4">
        <label className="block text-sm font-medium">
          Verification code
          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]{6}"
            maxLength={6}
            value={token}
            onChange={(event) => setToken(event.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000"
            className="mt-2 w-full rounded-lg border border-neutral-200 bg-white px-3 py-3 text-center text-lg font-semibold tracking-[0.35em] outline-none transition focus:border-neutral-950 focus:ring-2 focus:ring-neutral-950/10"
            aria-label="6-digit verification code"
            required
          />
        </label>

        <button
          type="submit"
          disabled={pending || token.length !== 6}
          className="w-full rounded-lg bg-neutral-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? 'Verifying…' : 'Verify email'}
        </button>
      </form>

      <div className="space-y-3 text-center text-sm text-neutral-500">
        <p>Didn&apos;t receive the code?</p>
        <button
          type="button"
          onClick={handleResend}
          disabled={resending || cooldown > 0}
          className="font-medium text-neutral-950 hover:underline disabled:cursor-not-allowed disabled:no-underline disabled:opacity-50"
        >
          {resending ? 'Sending…' : cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend code'}
        </button>
      </div>

      <p className="text-center text-sm text-neutral-500">
        <a href="/login" className="font-medium text-neutral-950 hover:underline">Back to sign in</a>
      </p>
    </div>
  )
}
