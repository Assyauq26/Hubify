'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { signIn, type AuthState } from './actions'

const initialState: AuthState = {}

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(signIn, initialState)

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {state.error ? <div role="alert" className="ui-error">{state.error}</div> : null}
      <label className="block text-sm font-medium">
        Email
        <input type="email" name="email" autoComplete="email" required className="ui-input mt-2 w-full" />
      </label>
      <label className="block text-sm font-medium">
        Password
        <input type="password" name="password" autoComplete="current-password" required className="ui-input mt-2 w-full" />
      </label>
      <button type="submit" disabled={pending} aria-busy={pending} className="ui-button-primary w-full justify-center disabled:cursor-not-allowed disabled:opacity-60">
        {pending ? 'Signing in…' : 'Sign in'}
      </button>
      <p className="pt-1 text-center text-sm text-[var(--muted-foreground)]">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="inline-flex min-h-11 items-center font-medium text-[var(--foreground)] underline-offset-4 hover:underline">Create account</Link>
      </p>
    </form>
  )
}
