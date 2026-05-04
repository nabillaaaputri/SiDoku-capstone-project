import { useNavigate } from 'react-router-dom'
import AuthShell from '../components/AuthShell'
import Button from '../components/Button'
import Form from '../components/Form'

export default function RegisterPage() {
  const navigate = useNavigate()

  const handleSubmit = (event) => {
    event.preventDefault()
    navigate('/login')
  }

  return (
    <AuthShell>
      <Form
        title="Daftar"
        onSubmit={handleSubmit}
        footer={(
          <p className="text-center text-sm text-neutral-600">
            Sudah punya akun?{' '}
            <Button to="/login" variant="text" className="text-sm font-semibold">
              Login
            </Button>
          </p>
        )}
      >
        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-700">Nama Usaha</label>
          <input
            type="text"
            placeholder="Nama usaha"
            className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-100"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-700">Email</label>
          <input
            type="email"
            placeholder="Email"
            className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-100"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-700">Kata Sandi</label>
          <input
            type="password"
            placeholder="Kata sandi"
            className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-100"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-700">Konfirmasi Kata Sandi</label>
          <input
            type="password"
            placeholder="Ulangi kata sandi"
            className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-100"
          />
        </div>

        <label className="flex items-start gap-3 text-sm leading-6 text-neutral-600">
          <input type="checkbox" className="mt-1 h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500" />
          Saya setuju dengan syarat dan ketentuan SiDoku.
        </label>

        <button type="submit" className="w-full rounded-xl bg-primary-600 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700 hover:shadow-md active:bg-primary-800">
          Daftar
        </button>
      </Form>
    </AuthShell>
  )
}
