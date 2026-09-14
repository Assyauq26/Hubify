'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { signUp, type AuthState } from '../login/actions'

const initialState: AuthState = {}

export default function RegisterForm() {
  const [state, formAction, pending] = useActionState(signUp, initialState)

  return (
    <form action={formAction} className="space-y-4">
      {state.error ? (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
          {state.error}
        </div>
      ) : null}

      <label className="block text-sm font-medium">
        Email
        <input type="email" name="email" autoComplete="email" required className="mt-2 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 outline-none transition focus:border-neutral-950 focus:ring-2 focus:ring-neutral-950/10" />
      </label>

      <label className="block text-sm font-medium">
        Password
        <input type="password" name="password" autoComplete="new-password" minLength={6} required className="mt-2 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 outline-none transition focus:border-neutral-950 focus:ring-2 focus:ring-neutral-950/10" />
      </label>

      <label className="block text-sm font-medium">
        Confirm password
        <input type="password" name="confirmPassword" autoComplete="new-password" minLength={6} required className="mt-2 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 outline-none transition focus:border-neutral-950 focus:ring-2 focus:ring-neutral-950/10" />
      </label>

      <button type="submit" disabled={pending} className="w-full rounded-lg bg-neutral-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60">
        {pending ? 'Creating account…' : 'Create account'}
      </button>

      <p className="text-center text-sm text-neutral-500">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-neutral-950 hover:underline">Sign in</Link>
      </p>
    </form>
  )
}
