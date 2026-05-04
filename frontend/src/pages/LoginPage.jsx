import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthShell from '../components/AuthShell'
import Button from '../components/Button'
import Form from '../components/Form'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    try {
      setSubmitting(true)
      await login(email, password)
      navigate('/dashboard')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthShell>
      <Form
        title="Masuk"
        onSubmit={handleSubmit}
        footer={(
          <p className="text-center text-sm text-neutral-600">
            Belum punya akun?{' '}
            <Button to="/register" variant="text" className="text-sm font-semibold">
              Daftar
            </Button>
          </p>
        )}
      >
        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-700">Email</label>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-100"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-700">Kata Sandi</label>
          <input
            type="password"
            placeholder="Kata sandi"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-100"
          />
        </div>

        <div className="flex items-center justify-between gap-4 text-sm text-neutral-600">
          <label className="flex items-center gap-2">
            <input type="checkbox" className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500" />
            Ingat saya
          </label>
          <a href="#" className="font-medium text-primary-600 hover:text-primary-700">
            Lupa sandi?
          </a>
        </div>

        <button type="submit" disabled={submitting} className="w-full rounded-xl bg-primary-600 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700 hover:shadow-md active:bg-primary-800 disabled:cursor-not-allowed disabled:opacity-70">
          {submitting ? 'Masuk...' : 'Masuk'}
        </button>
      </Form>
    </AuthShell>
  )
}
