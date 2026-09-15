'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { signIn, type AuthState } from './actions'

const initialState: AuthState = {}

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(signIn, initialState)

  return (
    <form action={formAction} className="space-y-5">
      {state.error ? <div role="alert" className="ui-error">{state.error}</div> : null}

      <label className="block text-sm font-medium">
        Email
        <input type="email" name="email" autoComplete="email" required className="ui-input mt-2 w-full" />
      </label>

      <label className="block text-sm font-medium">
        Password
        <input type="password" name="password" autoComplete="current-password" required className="ui-input mt-2 w-full" />
      </label>

      <button type="submit" disabled={pending} className="ui-button-primary w-full justify-center disabled:cursor-not-allowed disabled:opacity-60">
        {pending ? 'Signing in…' : 'Sign in'}
      </button>

      <p className="pt-2 text-center text-sm text-[var(--muted-foreground)]">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="font-medium text-[var(--foreground)] hover:underline">Create account</Link>
      </p>
    </form>
  )
}
