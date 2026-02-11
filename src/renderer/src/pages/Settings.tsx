import { useState, useEffect } from 'react'
import { Moon, Sun, User, CreditCard, Bell, Key, Check, Palette } from 'lucide-react'

const LIGHT_THEME: Record<string, string> = {
  '--bg-primary': '#f5f5f5',
  '--bg-secondary': '#ffffff',
  '--bg-tertiary': '#e8e8e8',
  '--bg-hover': '#ebebeb',
  '--text-primary': '#111111',
  '--text-secondary': '#555555',
  '--text-muted': '#888888',
  '--border': '#d4d4d4',
  '--border-light': '#c0c0c0'
}

const DARK_THEME: Record<string, string> = {
  '--bg-primary': '#0f0f0f',
  '--bg-secondary': '#1a1a1a',
  '--bg-tertiary': '#252525',
  '--bg-hover': '#2a2a2a',
  '--text-primary': '#ffffff',
  '--text-secondary': '#a0a0a0',
  '--text-muted': '#6b7280',
  '--border': '#333333',
  '--border-light': '#404040'
}

const ACCENT_COLORS = [
  { value: '#3b82f6', hover: '#2563eb', label: 'Blue' },
  { value: '#8b5cf6', hover: '#7c3aed', label: 'Purple' },
  { value: '#10b981', hover: '#059669', label: 'Green' },
  { value: '#f59e0b', hover: '#d97706', label: 'Amber' },
  { value: '#ef4444', hover: '#dc2626', label: 'Red' },
  { value: '#ec4899', hover: '#db2777', label: 'Pink' }
]

function applyTheme(mode: 'dark' | 'light') {
  const vars = mode === 'light' ? LIGHT_THEME : DARK_THEME
  const root = document.documentElement
  for (const [key, val] of Object.entries(vars)) {
    root.style.setProperty(key, val)
  }
}

function applyAccent(color: string, hover: string) {
  const root = document.documentElement
  root.style.setProperty('--accent', color)
  root.style.setProperty('--accent-hover', hover)
}

export function initTheme() {
  try {
    const savedTheme = localStorage.getItem('devdock-theme') as 'dark' | 'light' | null
    if (savedTheme) applyTheme(savedTheme)

    const savedAccent = localStorage.getItem('devdock-accent')
    if (savedAccent) {
      const match = ACCENT_COLORS.find((a) => a.value === savedAccent)
      if (match) applyAccent(match.value, match.hover)
    }
  } catch {
    // ignore
  }
}

type SettingsTab = 'theme' | 'profile' | 'billing' | 'notifications' | 'api'

const TABS: { id: SettingsTab; label: string; icon: typeof Moon }[] = [
  { id: 'theme', label: 'Theme', icon: Palette },
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'billing', label: 'Billing', icon: CreditCard },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'api', label: 'API Access', icon: Key }
]

function ThemeSettings() {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try { return (localStorage.getItem('devdock-theme') as 'dark' | 'light') || 'dark' } catch { return 'dark' }
  })
  const [accent, setAccent] = useState(() => {
    try { return localStorage.getItem('devdock-accent') || '#3b82f6' } catch { return '#3b82f6' }
  })

  useEffect(() => {
    window.electronAPI.getSettings().then((settings) => {
      if (settings.theme) {
        setTheme(settings.theme)
        applyTheme(settings.theme)
        try { localStorage.setItem('devdock-theme', settings.theme) } catch { /* */ }
      }
      if (settings.accentColor) {
        setAccent(settings.accentColor)
        const match = ACCENT_COLORS.find((a) => a.value === settings.accentColor)
        if (match) applyAccent(match.value, match.hover)
        try { localStorage.setItem('devdock-accent', settings.accentColor) } catch { /* */ }
      }
    }).catch(() => { /* use defaults */ })
  }, [])

  useEffect(() => {
    applyTheme(theme)
    try { localStorage.setItem('devdock-theme', theme) } catch { /* */ }
    window.electronAPI.saveSettings({ theme }).catch(() => { /* */ })
  }, [theme])

  const handleAccent = (color: typeof ACCENT_COLORS[number]) => {
    setAccent(color.value)
    applyAccent(color.value, color.hover)
    try { localStorage.setItem('devdock-accent', color.value) } catch { /* */ }
    window.electronAPI.saveSettings({ accentColor: color.value }).catch(() => { /* */ })
  }

  return (
    <div className="set-section">
      <h3 className="set-section-title">Appearance</h3>
      <p className="set-section-desc">Choose your preferred theme mode</p>
      <div className="set-theme-group">
        <button
          className={`set-theme-opt ${theme === 'dark' ? 'active' : ''}`}
          onClick={() => setTheme('dark')}
        >
          <div className="set-theme-preview set-theme-preview--dark">
            <div className="set-theme-bar" />
            <div className="set-theme-lines">
              <div /><div /><div />
            </div>
          </div>
          <div className="set-theme-label">
            <Moon size={15} />
            <span>Dark</span>
            {theme === 'dark' && <Check size={14} className="set-theme-check" />}
          </div>
        </button>
        <button
          className={`set-theme-opt ${theme === 'light' ? 'active' : ''}`}
          onClick={() => setTheme('light')}
        >
          <div className="set-theme-preview set-theme-preview--light">
            <div className="set-theme-bar" />
            <div className="set-theme-lines">
              <div /><div /><div />
            </div>
          </div>
          <div className="set-theme-label">
            <Sun size={15} />
            <span>Light</span>
            {theme === 'light' && <Check size={14} className="set-theme-check" />}
          </div>
        </button>
      </div>

      <h3 className="set-section-title" style={{ marginTop: 28 }}>Accent Color</h3>
      <p className="set-section-desc">Personalize your interface</p>
      <div className="set-accent-grid">
        {ACCENT_COLORS.map((color) => (
          <button
            key={color.value}
            className={`set-accent-btn ${accent === color.value ? 'selected' : ''}`}
            onClick={() => handleAccent(color)}
          >
            <span className="set-accent-swatch" style={{ background: color.value }} />
            <span className="set-accent-label">{color.label}</span>
            {accent === color.value && <Check size={12} />}
          </button>
        ))}
      </div>
    </div>
  )
}

function ProfileSettings() {
  return (
    <div className="set-section">
      <h3 className="set-section-title">Profile Information</h3>
      <p className="set-section-desc">Manage your account details</p>
      <div className="set-form">
        <div className="set-field">
          <label>Display Name</label>
          <input type="text" defaultValue="Developer" placeholder="Your name" />
        </div>
        <div className="set-field">
          <label>Email</label>
          <input type="email" defaultValue="dev@example.com" placeholder="Your email" />
        </div>
        <button className="set-save-btn">Save Changes</button>
      </div>
    </div>
  )
}

function BillingSettings() {
  return (
    <div className="set-section">
      <h3 className="set-section-title">Current Plan</h3>
      <p className="set-section-desc">Manage your subscription</p>
      <div className="set-plan">
        <div className="set-plan-header">
          <div>
            <span className="set-plan-name">Pro Plan</span>
            <span className="set-plan-badge">Active</span>
          </div>
          <span className="set-plan-price">$12<span>/month</span></span>
        </div>
        <ul className="set-plan-features">
          <li><Check size={14} /> Unlimited services</li>
          <li><Check size={14} /> Priority support</li>
          <li><Check size={14} /> Advanced logging</li>
        </ul>
        <button className="set-outline-btn">Manage Subscription</button>
      </div>
    </div>
  )
}

function NotificationSettings() {
  const [emailAlerts, setEmailAlerts] = useState(true)
  const [crashAlerts, setCrashAlerts] = useState(true)
  const [weeklyReport, setWeeklyReport] = useState(false)

  useEffect(() => {
    window.electronAPI.getSettings().then((settings) => {
      if (settings.showNotifications !== undefined) {
        setEmailAlerts(settings.showNotifications)
        setCrashAlerts(settings.showNotifications)
      }
    }).catch(() => { /* */ })
  }, [])

  const toggles = [
    { label: 'Email Alerts', desc: 'Receive email notifications for service events', value: emailAlerts, set: setEmailAlerts },
    { label: 'Crash Alerts', desc: 'Get notified immediately when a service crashes', value: crashAlerts, set: setCrashAlerts },
    { label: 'Weekly Report', desc: 'Receive a weekly summary of service activity', value: weeklyReport, set: setWeeklyReport }
  ]

  return (
    <div className="set-section">
      <h3 className="set-section-title">Notification Preferences</h3>
      <p className="set-section-desc">Control how you receive alerts</p>
      <div className="set-toggles">
        {toggles.map((t) => (
          <label key={t.label} className="set-toggle-row">
            <div>
              <span className="set-toggle-label">{t.label}</span>
              <span className="set-toggle-desc">{t.desc}</span>
            </div>
            <div className={`set-switch ${t.value ? 'on' : ''}`} onClick={() => t.set(!t.value)}>
              <div className="set-switch-thumb" />
            </div>
          </label>
        ))}
      </div>
    </div>
  )
}

function ApiSettings() {
  const [revealed, setRevealed] = useState(false)
  const maskedKey = 'sk-\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022abcd'
  const fullKey = 'sk-devdock-a1b2c3d4e5f6g7h8i9j0abcd'

  return (
    <div className="set-section">
      <h3 className="set-section-title">API Access</h3>
      <p className="set-section-desc">Manage your API keys for external integrations</p>
      <div className="set-api-box">
        <div className="set-api-label">Secret Key</div>
        <div className="set-api-row">
          <code className="set-api-key">{revealed ? fullKey : maskedKey}</code>
          <button className="set-outline-btn set-btn-sm" onClick={() => setRevealed((r) => !r)}>
            {revealed ? 'Hide' : 'Reveal'}
          </button>
        </div>
      </div>
    </div>
  )
}

export function Settings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('theme')

  const renderContent = () => {
    switch (activeTab) {
      case 'theme': return <ThemeSettings />
      case 'profile': return <ProfileSettings />
      case 'billing': return <BillingSettings />
      case 'notifications': return <NotificationSettings />
      case 'api': return <ApiSettings />
    }
  }

  return (
    <div className="set-page">
      <div className="set-header">
        <h2 className="set-title">Settings</h2>
        <p className="set-sub">Manage your preferences</p>
      </div>

      <div className="set-layout">
        <div className="set-sidebar">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`set-tab ${activeTab === id ? 'active' : ''}`}
              onClick={() => setActiveTab(id)}
            >
              <Icon size={16} />
              <span>{label}</span>
            </button>
          ))}
        </div>

        <div className="set-content">
          {renderContent()}
        </div>
      </div>

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .set-page { animation: fadeIn 0.3s ease-out; }

        .set-header {
          margin-bottom: 20px;
          animation: slideDown 0.4s ease-out;
        }
        .set-title {
          font-size: 22px;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0 0 2px 0;
        }
        .set-sub {
          font-size: 13px;
          color: var(--text-muted);
          margin: 0;
        }

        .set-layout {
          display: flex;
          gap: 0;
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: 14px;
          overflow: hidden;
        }

        .set-sidebar {
          width: 200px;
          min-width: 200px;
          border-right: 1px solid var(--border);
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .set-tab {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 8px;
          background: transparent;
          color: var(--text-secondary);
          font-size: 13px;
          font-weight: 500;
          text-align: left;
          width: 100%;
          transition: all 0.2s;
        }
        .set-tab:hover {
          background: var(--bg-hover);
          color: var(--text-primary);
        }
        .set-tab.active {
          background: rgba(59, 130, 246, 0.12);
          color: var(--accent);
        }

        .set-content {
          flex: 1;
          padding: 28px;
        }

        .set-section {}
        .set-section-title {
          font-size: 15px;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0 0 4px 0;
        }
        .set-section-desc {
          font-size: 13px;
          color: var(--text-muted);
          margin: 0 0 16px 0;
        }

        /* Theme picker */
        .set-theme-group {
          display: flex;
          gap: 12px;
        }
        .set-theme-opt {
          flex: 1;
          max-width: 200px;
          border-radius: 12px;
          border: 2px solid var(--border);
          background: var(--bg-tertiary);
          padding: 0;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.2s;
        }
        .set-theme-opt:hover {
          border-color: var(--border-light);
        }
        .set-theme-opt.active {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
        }
        .set-theme-preview {
          height: 80px;
          padding: 10px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .set-theme-preview--dark {
          background: #0f0f0f;
        }
        .set-theme-preview--light {
          background: #f5f5f5;
        }
        .set-theme-bar {
          height: 8px;
          width: 60%;
          border-radius: 4px;
        }
        .set-theme-preview--dark .set-theme-bar { background: #333; }
        .set-theme-preview--light .set-theme-bar { background: #d4d4d4; }
        .set-theme-lines {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .set-theme-lines div {
          height: 5px;
          border-radius: 3px;
        }
        .set-theme-lines div:nth-child(1) { width: 80%; }
        .set-theme-lines div:nth-child(2) { width: 60%; }
        .set-theme-lines div:nth-child(3) { width: 40%; }
        .set-theme-preview--dark .set-theme-lines div { background: #252525; }
        .set-theme-preview--light .set-theme-lines div { background: #e0e0e0; }
        .set-theme-label {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          font-size: 13px;
          font-weight: 500;
          color: var(--text-secondary);
        }
        .set-theme-opt.active .set-theme-label {
          color: var(--accent);
        }
        .set-theme-check {
          margin-left: auto;
          color: var(--accent);
        }

        /* Accent colors */
        .set-accent-grid {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .set-accent-btn {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 8px 14px;
          border-radius: 10px;
          background: var(--bg-tertiary);
          border: 2px solid var(--border);
          color: var(--text-secondary);
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        .set-accent-btn:hover {
          border-color: var(--border-light);
        }
        .set-accent-btn.selected {
          border-color: var(--accent);
          color: var(--text-primary);
        }
        .set-accent-swatch {
          width: 16px;
          height: 16px;
          border-radius: 50%;
        }
        .set-accent-label {
          font-size: 12px;
        }

        /* Form */
        .set-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
          max-width: 400px;
        }
        .set-field label {
          display: block;
          font-size: 13px;
          font-weight: 500;
          color: var(--text-secondary);
          margin-bottom: 6px;
        }
        .set-field input {
          width: 100%;
        }
        .set-save-btn {
          align-self: flex-start;
          padding: 9px 20px;
          border-radius: 10px;
          background: var(--accent);
          color: white;
          font-size: 13px;
          font-weight: 500;
          transition: all 0.2s;
        }
        .set-save-btn:hover {
          background: var(--accent-hover);
        }

        /* Plan card */
        .set-plan {
          background: var(--bg-tertiary);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 20px;
          max-width: 400px;
        }
        .set-plan-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 14px;
        }
        .set-plan-name {
          font-size: 18px;
          font-weight: 700;
          color: var(--accent);
        }
        .set-plan-badge {
          margin-left: 8px;
          font-size: 10px;
          font-weight: 600;
          color: var(--success);
          background: rgba(34, 197, 94, 0.15);
          padding: 3px 8px;
          border-radius: 20px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .set-plan-price {
          font-size: 22px;
          font-weight: 700;
          color: var(--text-primary);
        }
        .set-plan-price span {
          font-size: 13px;
          font-weight: 400;
          color: var(--text-muted);
        }
        .set-plan-features {
          list-style: none;
          padding: 0;
          margin: 0 0 16px 0;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .set-plan-features li {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: var(--text-secondary);
        }
        .set-plan-features li svg {
          color: var(--success);
        }

        /* Outline button */
        .set-outline-btn {
          padding: 8px 16px;
          border-radius: 8px;
          background: transparent;
          color: var(--accent);
          border: 1px solid var(--accent);
          font-size: 13px;
          font-weight: 500;
          transition: all 0.2s;
        }
        .set-outline-btn:hover {
          background: rgba(59, 130, 246, 0.1);
        }
        .set-btn-sm {
          padding: 6px 12px;
          font-size: 12px;
        }

        /* Toggle rows */
        .set-toggles {
          display: flex;
          flex-direction: column;
          gap: 0;
        }
        .set-toggle-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 0;
          border-bottom: 1px solid var(--border);
          cursor: pointer;
        }
        .set-toggle-row:last-child {
          border-bottom: none;
        }
        .set-toggle-label {
          display: block;
          font-size: 14px;
          font-weight: 500;
          color: var(--text-primary);
        }
        .set-toggle-desc {
          display: block;
          font-size: 12px;
          color: var(--text-muted);
          margin-top: 2px;
        }

        /* Custom switch */
        .set-switch {
          width: 44px;
          height: 24px;
          border-radius: 12px;
          background: var(--bg-tertiary);
          border: 1px solid var(--border);
          position: relative;
          cursor: pointer;
          transition: all 0.3s;
          flex-shrink: 0;
        }
        .set-switch.on {
          background: var(--accent);
          border-color: var(--accent);
        }
        .set-switch-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: white;
          position: absolute;
          top: 2px;
          left: 2px;
          transition: transform 0.3s;
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }
        .set-switch.on .set-switch-thumb {
          transform: translateX(20px);
        }

        /* API key */
        .set-api-box {
          background: var(--bg-tertiary);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 16px;
          max-width: 500px;
        }
        .set-api-label {
          font-size: 12px;
          font-weight: 500;
          color: var(--text-muted);
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .set-api-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .set-api-key {
          font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
          font-size: 13px;
          color: var(--text-secondary);
          flex: 1;
          background: var(--bg-primary);
          padding: 8px 12px;
          border-radius: 8px;
          border: 1px solid var(--border);
        }
      `}</style>
    </div>
  )
}
