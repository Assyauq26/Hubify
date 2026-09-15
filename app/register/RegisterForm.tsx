'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { signUp, type AuthState } from '../login/actions'

const initialState: AuthState = {}

export default function RegisterForm() {
  const [state, formAction, pending] = useActionState(signUp, initialState)

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {state.error ? <div role="alert" className="ui-error">{state.error}</div> : null}
      <label className="block text-sm font-medium">
        Email
        <input type="email" name="email" autoComplete="email" required className="ui-input mt-2 w-full" />
      </label>
      <label className="block text-sm font-medium">
        Password
        <input type="password" name="password" autoComplete="new-password" minLength={6} required className="ui-input mt-2 w-full" />
        <span className="mt-1.5 block text-xs font-normal text-[var(--muted-foreground)]">Use at least 6 characters.</span>
      </label>
      <label className="block text-sm font-medium">
        Confirm password
        <input type="password" name="confirmPassword" autoComplete="new-password" minLength={6} required className="ui-input mt-2 w-full" />
      </label>
      <button type="submit" disabled={pending} aria-busy={pending} className="ui-button-primary w-full justify-center disabled:cursor-not-allowed disabled:opacity-60">
        {pending ? 'Creating account…' : 'Create account'}
      </button>
      <p className="pt-1 text-center text-sm text-[var(--muted-foreground)]">
        Already have an account?{' '}
        <Link href="/login" className="inline-flex min-h-11 items-center font-medium text-[var(--foreground)] underline-offset-4 hover:underline">Sign in</Link>
      </p>
    </form>
  )
}
