import { useEffect, useState, type FormEvent } from 'react'
import axios from 'axios'
import { Cuboid } from 'lucide-react'
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { register } from '../api/auth'
import { useAuth } from '../auth/AuthContext'

function errorMessage(error: unknown) {
  if (axios.isAxiosError(error) && typeof error.response?.data?.message === 'string') return error.response.data.message
  return 'Something went wrong. Please try again.'
}

export function AuthPage() {
  const { owner, signIn } = useAuth()
  const navigate = useNavigate()
  const [registering, setRegistering] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  if (owner) return <Navigate to="/" replace />

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setError('')
    setNotice('')
    const form = new FormData(event.currentTarget)
    try {
      if (registering) {
        const result = await register(String(form.get('name')), String(form.get('email')), String(form.get('password')))
        setNotice(result.confirmationUrl
          ? `Account created. For local development, open this confirmation link: ${result.confirmationUrl}`
          : result.message)
      } else {
        await signIn(String(form.get('email')), String(form.get('password')))
        navigate('/', { replace: true })
      }
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
        <p className="mt-2 text-sm text-zinc-500">{registering ? 'Confirm your email before accessing the store.' : 'Sign in to manage your store.'}</p>
        <form className="mt-7 space-y-4" onSubmit={submit}>
          {registering && <label className="block text-sm font-medium text-zinc-700">Name<input name="name" required autoComplete="name" className="mt-1.5 w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-indigo-500" /></label>}
          <label className="block text-sm font-medium text-zinc-700">Email<input name="email" required type="email" autoComplete="email" className="mt-1.5 w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-indigo-500" /></label>
          <label className="block text-sm font-medium text-zinc-700">Password<input name="password" required minLength={10} type="password" autoComplete={registering ? 'new-password' : 'current-password'} className="mt-1.5 w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-indigo-500" /></label>
          {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          {notice && <p className="break-words rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{notice}</p>}
          <button disabled={busy} className="w-full rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60">{busy ? 'Please wait…' : registering ? 'Register' : 'Sign in'}</button>
        </form>
        <button className="mt-5 w-full text-sm font-medium text-indigo-600" onClick={() => { setRegistering(!registering); setError(''); setNotice('') }}>
          {registering ? 'Already registered? Sign in' : 'Need an owner account? Register'}
        </button>
      </section>
    </main>
  )
}

export function ConfirmEmailPage() {
  const { owner, completeConfirmation } = useAuth()
  const [params] = useSearchParams()
  const [error, setError] = useState('')
  const token = params.get('token')

  useEffect(() => {
    if (token && !owner) completeConfirmation(token).catch((err) => setError(errorMessage(err)))
  }, [token, owner, completeConfirmation])

  if (owner) return <Navigate to="/" replace />
  return <main className="grid min-h-screen place-items-center bg-[#f7f7f9] px-4"><section className="max-w-md rounded-3xl bg-white p-8 text-center shadow-sm"><h1 className="text-xl font-bold">Confirming your email</h1><p className="mt-3 text-sm text-zinc-500">{error || (token ? 'Please wait…' : 'This confirmation link is missing its token.')}</p>{error && <a href="/login" className="mt-5 inline-block text-sm font-medium text-indigo-600">Return to sign in</a>}</section></main>
}
