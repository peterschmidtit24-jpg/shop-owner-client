import { useState, type FormEvent } from 'react'
import axios from 'axios'
import { Cuboid } from 'lucide-react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

function errorMessage(error: unknown) {
  if (axios.isAxiosError(error) && typeof error.response?.data?.message === 'string') return error.response.data.message
  return 'Something went wrong. Please try again.'
}

export function AuthPage() {
  const { owner, signIn, register } = useAuth()
  const navigate = useNavigate()
  const [registering, setRegistering] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  if (owner) return <Navigate to="/" replace />

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setError('')
    const form = new FormData(event.currentTarget)
    const name = String(form.get('name'))
    const password = String(form.get('password'))

    try {
      if (registering) await register(name, password)
      else await signIn(name, password)
      navigate('/', { replace: true })
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#f7f7f9] px-4">
      <section className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
        <div className="mb-8 flex items-center gap-3 text-lg font-semibold">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-600 text-white"><Cuboid size={20} /></span>
          StoreAdmin
        </div>
        <h1 className="text-2xl font-bold text-zinc-900">{registering ? 'Create owner account' : 'Welcome back'}</h1>
        <p className="mt-2 text-sm text-zinc-500">{registering ? 'Choose a name and password.' : 'Sign in to manage your store.'}</p>
        <form className="mt-7 space-y-4" onSubmit={submit}>
          <label className="block text-sm font-medium text-zinc-700">Name<input name="name" required autoComplete="username" className="mt-1.5 w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-indigo-500" /></label>
          <label className="block text-sm font-medium text-zinc-700">Password<input name="password" required minLength={10} type="password" autoComplete={registering ? 'new-password' : 'current-password'} className="mt-1.5 w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-indigo-500" /></label>
          {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          <button disabled={busy} className="w-full rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60">{busy ? 'Please wait…' : registering ? 'Register' : 'Sign in'}</button>
        </form>
        <button className="mt-5 w-full text-sm font-medium text-indigo-600" onClick={() => { setRegistering(!registering); setError('') }}>
          {registering ? 'Already registered? Sign in' : 'Need an owner account? Register'}
        </button>
      </section>
    </main>
  )
}
