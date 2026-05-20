import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { authService } from '../../services/authService'
import { useStore } from '../../store/useStore'
import './auth.css'

export default function SignupPage() {
  const navigate = useNavigate(); const { setAuth } = useStore()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [showPw, setShowPw] = useState(false); const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'Required'
    if (!form.email) e.email = 'Required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email'
    if (!form.password) e.password = 'Required'
    else if (form.password.length < 6) e.password = 'Min 6 characters'
    if (form.password !== form.confirm) e.confirm = "Passwords don't match"
    setErrors(e); return !Object.keys(e).length
  }

  const submit = async () => {
    if (!validate()) return; setLoading(true)
    try {
      const { user, token } = await authService.register(form.name, form.email, form.password)
      setAuth(user, token); toast.success('Account created!'); navigate('/app')
    } catch (err: any) { toast.error(err?.response?.data?.message || 'Something went wrong') }
    finally { setLoading(false) }
  }

  const fields = [
    { key: 'name',  label: 'DISPLAY_NAME', type: 'text',  ph: 'Your name',       ac: 'name'  },
    { key: 'email', label: 'EMAIL',         type: 'email', ph: 'you@example.com', ac: 'email' },
  ]

  return (
    <div className="auth-page">
      <div className="auth-bg-blob-signup" />

      <div className="auth-container">
        <Link to="/" className="auth-logo-link">
          <div className="auth-logo-icon">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/>
              <path d="M21 15V2a5 5 0 0 0-5 5v6c0 .55.45 1 1 1h3a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-3a2 2 0 0 1-2-2v-1"/>
            </svg>
          </div>
          <span className="auth-logo-text">Pantry<span className="auth-logo-accent">Pal</span></span>
        </Link>

        <div className="card auth-card">
          <p className="label label--mb-8">Register_Module</p>
          <h1 className="auth-title auth-title--with-sub">Create account</h1>
          <p className="auth-subtitle">Free forever. No credit card.</p>

          <div className="auth-fields">
            {fields.map(({ key, label, type, ph, ac }) => (
              <div key={key}>
                <label className="auth-field-label">{label}</label>
                <input type={type} value={form[key as keyof typeof form]} autoComplete={ac}
                  onChange={e => setForm({ ...form, [key]: e.target.value })}
                  placeholder={ph}
                  className={`input-field${errors[key] ? ' input-error' : ''}`} />
                {errors[key] && <p className="auth-field-error">{errors[key]}</p>}
              </div>
            ))}
            <div>
              <label className="auth-field-label">PASSWORD</label>
              <div className="auth-password-wrapper">
                <input type={showPw ? 'text' : 'password'} value={form.password} autoComplete="new-password"
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="Min 6 characters"
                  className={`input-field auth-password-input${errors.password ? ' input-error' : ''}`} />
                <button onClick={() => setShowPw(!showPw)} className="auth-password-toggle">
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {errors.password && <p className="auth-field-error">{errors.password}</p>}
            </div>
            <div>
              <label className="auth-field-label">CONFIRM_PASSWORD</label>
              <input type="password" value={form.confirm} autoComplete="new-password"
                onChange={e => setForm({ ...form, confirm: e.target.value })}
                onKeyDown={e => e.key === 'Enter' && submit()}
                placeholder="Repeat password"
                className={`input-field${errors.confirm ? ' input-error' : ''}`} />
              {errors.confirm && <p className="auth-field-error">{errors.confirm}</p>}
            </div>
          </div>

          <button onClick={submit} disabled={loading} className="btn-primary auth-submit-btn">
            {loading
              ? <><div className="auth-spinner" />Creating account…</>
              : <>Create account <ArrowRight size={15} /></>
            }
          </button>
        </div>

        <p className="auth-footer">
          Already have an account?{' '}
          <Link to="/login" className="auth-footer-link">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
