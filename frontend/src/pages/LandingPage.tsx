import { Link } from 'react-router-dom'
import { ArrowRight, Search, Heart, Calendar, ShoppingCart, Sun, Moon, Sparkles } from 'lucide-react'
import { useStore } from '../store/useStore'
import './LandingPage.css'

const FEATURES = [
  { icon: Search,       color: '#FFF3EC', ic: '#D4622A', title: 'Smart matching',     desc: 'Add your pantry items and get recipes ranked by how well they match what you already have.' },
  { icon: Heart,        color: '#FFF0F6', ic: '#C4789A', title: 'Save favourites',    desc: 'Build a personal recipe collection for the dishes you love and make on repeat.' },
  { icon: Calendar,     color: '#F0F7F1', ic: '#6A9A72', title: 'Weekly planner',     desc: 'Plan every meal for the week and never ask "what\'s for dinner?" again.' },
  { icon: ShoppingCart, color: '#FFFBF0', ic: '#C49A30', title: 'Auto shopping list', desc: 'One tap generates a complete shopping list for everything you\'re missing.' },
]

export default function LandingPage() {
  const { darkMode, toggleDarkMode, user } = useStore()

  return (
    <div className="landing-root">

      {/* ── Floating pill navbar ──────────── */}
      <div className="landing-nav-wrapper">
        <nav className="nav-pill landing-nav">
          <div className="landing-nav-logo">
            <div className="landing-nav-logo-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/>
                <path d="M21 15V2a5 5 0 0 0-5 5v6c0 .55.45 1 1 1h3a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-3a2 2 0 0 1-2-2v-1"/>
              </svg>
            </div>
            <span className="landing-nav-logo-text">
              Pantry<span className="landing-nav-logo-accent">Pal</span>
            </span>
          </div>
          <div className="landing-nav-spacer" />
          <button onClick={toggleDarkMode} className="landing-nav-dark-toggle">
            {darkMode ? <Sun size={14} /> : <Moon size={14} />}
          </button>
          {user ? (
            <Link to="/profile" className="nav-user-link">
              <div className="nav-user-avatar">{user.name[0].toUpperCase()}</div>
              <span className="nav-user-name hidden sm:block">{user.name}</span>
            </Link>
          ) : (
            <>
              <Link to="/login" className="landing-nav-login">Log in</Link>
              <Link to="/signup" className="btn-primary btn-nav-cta">Get started</Link>
            </>
          )}
        </nav>
      </div>

      {/* ── Hero ─────────────────────────── */}
      <section className="hero-section">
        <div className="hero-blob-1" />
        <div className="hero-blob-2" />

        <div className="hero-content">
          <div className="hero-eyebrow">
            <span className="dot-live" />
            <span className="hero-eyebrow-text">365,000+ recipes · Always free</span>
          </div>

          <h1 className="hero-headline">
            Stop wondering<br />
            <span className="text-gradient">what to cook.</span>
          </h1>

          <p className="hero-sub">
            Tell PantryPal what's in your kitchen. We'll find recipes you can make{' '}
            <span className="pill-tag"><Sparkles size={12} color="var(--terra)" strokeWidth={2} />right now</span>
            {' '}and build your{' '}
            <span className="pill-tag"><ShoppingCart size={12} color="var(--text-3)" strokeWidth={1.75} />shopping list</span>
            {' '}for the rest.
          </p>

          <div className="hero-ctas">
            <Link to="/signup" className="btn-primary btn-lg hero-cta-link">
              Start cooking free <ArrowRight size={17} strokeWidth={2.5} />
            </Link>
            <Link to="/app" className="btn-secondary btn-lg hero-cta-link">
              Browse recipes
            </Link>
          </div>

          {/* ── Product mockup ── */}
          <div className="hero-mockup-wrapper">
            <div className="hero-browser">
              <div className="browser-chrome-bar">
                <div className="browser-dots">
                  <div className="browser-dot browser-dot--red" />
                  <div className="browser-dot browser-dot--yellow" />
                  <div className="browser-dot browser-dot--green" />
                </div>
                <div className="browser-url-bar">pantrypal.app</div>
                <div className="browser-live-badge">● Live</div>
              </div>

              <div className="browser-body">
                <div className="mock-stats-grid">
                  {[
                    { label: 'Pantry items', val: '5', trend: '+2 today' },
                    { label: 'Recipes matched', val: '47', trend: '97% match' },
                    { label: 'Meals planned', val: '12', trend: 'This week' },
                  ].map(({ label, val, trend }) => (
                    <div key={label} className="mock-stat-card">
                      <p className="mock-stat-label">{label}</p>
                      <p className="mock-stat-value">{val}</p>
                      <p className="mock-stat-trend">↑ {trend}</p>
                    </div>
                  ))}
                </div>

                <div className="mock-recipes-grid">
                  {[
                    { name: 'Chicken Tikka Masala', match: 97, time: '35m' },
                    { name: 'Tomato Garlic Pasta',  match: 89, time: '20m' },
                    { name: 'Roast Chicken Thighs', match: 82, time: '50m' },
                  ].map(r => (
                    <div key={r.name} className="mock-recipe-card">
                      <div className="mock-recipe-thumb">🍽️</div>
                      <div className="mock-recipe-body">
                        <p className="mock-recipe-name">{r.name}</p>
                        <div className="mock-recipe-footer">
                          <span className="mock-recipe-time">{r.time}</span>
                          <span className="mock-recipe-match">{r.match}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="card hero-badge hero-badge--no-waste">🥦 No food waste</div>
            <div className="card hero-badge hero-badge--free">✓ Free forever</div>
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────── */}
      <section className="features-section">
        <div className="section-inner">
          <div className="section-header">
            <h2>Everything a home cook needs.</h2>
          </div>
          <div className="stagger features-grid">
            {FEATURES.map(({ icon: Icon, color, ic, title, desc }) => (
              <div key={title} className="card feature-card">
                {/* color/ic are per-feature data values, cannot be static */}
                <div className="feature-icon-box" style={{ background: color }}>
                  <Icon size={20} color={ic} strokeWidth={2} />
                </div>
                <h3 className="feature-title">{title}</h3>
                <p className="feature-desc">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ──────────────────── */}
      <section className="how-it-works-section">
        <div className="section-inner">
          <div className="section-header">
            <h2>Three steps to your next meal.</h2>
          </div>
          <div className="steps-grid">
            {[
              { n: '01', title: 'Add your ingredients',  desc: 'Type or tap what you have. Your pantry is saved automatically across sessions.' },
              { n: '02', title: 'Discover recipes',      desc: 'We scan 365,000+ recipes and rank them by how well they match your actual pantry.' },
              { n: '03', title: 'Cook and plan ahead',   desc: 'Follow steps, save favourites, plan your week, and auto-generate your shopping list.' },
            ].map(({ n, title, desc }) => (
              <div key={n} className="card step-card">
                <div className="step-number"><span>{n}</span></div>
                <div>
                  <h3 className="step-title">{title}</h3>
                  <p className="step-desc">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Social proof ──────────────────── */}
      <section className="testimonials-section">
        <div className="section-inner">
          <div className="section-header">
            <h2>Real cooks. Real results.</h2>
          </div>
          <div className="testimonials-grid">
            {[
              { q: 'I stopped wasting groceries completely. By Friday my fridge is always empty — in the best way.', name: 'Sarah K.' },
              { q: 'The meal planner changed my Sunday routine. 15 minutes and the whole week is sorted, shopping list included.', name: 'James R.' },
              { q: "It keeps suggesting recipes I'd never have tried. My family thinks I've suddenly become a great cook.", name: 'Priya M.' },
            ].map(({ q, name }) => (
              <div key={name} className="card testimonial-card">
                <div className="testimonial-stars">
                  {[...Array(5)].map((_, i) => <span key={i} className="testimonial-star">★</span>)}
                </div>
                <p className="testimonial-quote">"{q}"</p>
                <p className="testimonial-author">— {name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────── */}
      <section className="cta-section">
        <div className="cta-bg-glow" />
        <div className="cta-content">
          <h2 className="cta-headline">
            Start cooking<br /><span className="text-gradient">smarter today.</span>
          </h2>
          <p className="cta-sub">
            Join thousands of home cooks who waste less, plan better, and eat more adventurously.
          </p>
          <Link to="/signup" className="btn-primary btn-lg hero-cta-link">
            Create free account <ArrowRight size={17} strokeWidth={2.5} />
          </Link>
          <div className="cta-perks">
            {['No credit card', 'No ads', '365K+ recipes'].map(t => (
              <span key={t} className="cta-perk">
                <span className="cta-perk-check">✓</span> {t}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
