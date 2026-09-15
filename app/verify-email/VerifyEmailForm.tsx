'use client'

import { FormEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const OTP_LENGTH = 8
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
    const timer = window.setInterval(() => setCooldown((current) => Math.max(0, current - 1)), 1000)
    return () => window.clearInterval(timer)
  }, [cooldown])

  async function handleVerify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setMessage('')
    const normalizedToken = token.replace(/\D/g, '').slice(0, OTP_LENGTH)

    if (!email) {
      setError('Email address was not found. Please register again.')
      return
    }
    if (normalizedToken.length !== OTP_LENGTH) {
      setError(`Enter the ${OTP_LENGTH}-digit verification code.`)
      return
    }

    setPending(true)
    const supabase = createClient()
    const { error: verifyError } = await supabase.auth.verifyOtp({ email, token: normalizedToken, type: 'email' })
    setPending(false)

    if (verifyError) {
      setError('The verification code is invalid or expired. Use the latest code from your email.')
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
      options: { emailRedirectTo: `${window.location.origin}/verify-email` },
    })
    setResending(false)

    if (resendError) {
      setError('Unable to resend the verification code. Please try again.')
      return
    }

    setMessage('A new code has been sent. Use the latest code and ignore older codes.')
    setCooldown(RESEND_COOLDOWN_SECONDS)
  }

  if (!email) {
    return (
      <div className="space-y-4">
        <div role="alert" className="ui-error">Email address was not found. Please return to registration.</div>
        <a href="/register" className="ui-button-primary flex w-full justify-center">Back to registration</a>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="border border-[var(--border)] bg-[var(--surface-secondary)] px-4 py-3 text-sm text-[var(--muted-foreground)]">
        Code sent to <span className="font-medium text-[var(--foreground)]">{email}</span>
      </div>

      {error ? <div role="alert" className="ui-error">{error}</div> : null}
      {message ? <div role="status" className="ui-success">{message}</div> : null}

      <form onSubmit={handleVerify} className="space-y-5">
        <label className="block text-sm font-medium">
          Verification code
          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern={`[0-9]{${OTP_LENGTH}}`}
            maxLength={OTP_LENGTH}
            value={token}
            onChange={(event) => setToken(event.target.value.replace(/\D/g, '').slice(0, OTP_LENGTH))}
            placeholder="00000000"
            className="ui-input mt-2 w-full text-center text-lg font-semibold tracking-[0.35em]"
            aria-label={`${OTP_LENGTH}-digit verification code`}
            required
          />
        </label>

        <button type="submit" disabled={pending || token.length !== OTP_LENGTH} className="ui-button-primary w-full justify-center disabled:cursor-not-allowed disabled:opacity-60">
          {pending ? 'Verifying…' : 'Verify email'}
        </button>
      </form>

      <div className="border-t border-[var(--border)] pt-5 text-center text-sm text-[var(--muted-foreground)]">
        <p>Didn&apos;t receive the code?</p>
        <button type="button" onClick={handleResend} disabled={resending || cooldown > 0} className="mt-2 font-medium text-[var(--foreground)] hover:underline disabled:cursor-not-allowed disabled:no-underline disabled:opacity-50">
          {resending ? 'Sending…' : cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend code'}
        </button>
      </div>

      <p className="text-center text-sm text-[var(--muted-foreground)]">
        <a href="/login" className="font-medium text-[var(--foreground)] hover:underline">Back to sign in</a>
      </p>
    </div>
  )
}
