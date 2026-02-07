import { useState } from 'react'
import { Moon, Sun, User, CreditCard, Bell, Key } from 'lucide-react'

type SettingsTab = 'theme' | 'profile' | 'billing' | 'notifications' | 'api'

const TABS: { id: SettingsTab; label: string; icon: typeof Moon }[] = [
  { id: 'theme', label: 'Theme', icon: Moon },
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'billing', label: 'Billing', icon: CreditCard },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'api', label: 'API Access', icon: Key }
]

function ThemeSettings() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  return (
    <div className="settings-section">
      <h3 className="settings-section-title">Appearance</h3>
      <div className="theme-toggle-group">
        <button
          className={`theme-option ${theme === 'dark' ? 'active' : ''}`}
          onClick={() => setTheme('dark')}
        >
          <Moon size={20} />
          <span>Dark</span>
        </button>
        <button
          className={`theme-option ${theme === 'light' ? 'active' : ''}`}
          onClick={() => setTheme('light')}
        >
          <Sun size={20} />
          <span>Light</span>
        </button>
      </div>

      <h3 className="settings-section-title" style={{ marginTop: 28 }}>Accent Color</h3>
      <div className="accent-colors">
        {['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'].map((color) => (
          <div
            key={color}
            className="accent-swatch"
            style={{ background: color }}
            title={color}
          />
        ))}
      </div>
    </div>
  )
}

function ProfileSettings() {
  return (
    <div className="settings-section">
      <h3 className="settings-section-title">Profile Information</h3>
      <div className="settings-form">
        <div className="settings-field">
          <label>Display Name</label>
          <input type="text" defaultValue="Developer" placeholder="Your name" />
        </div>
        <div className="settings-field">
          <label>Email</label>
          <input type="email" defaultValue="dev@example.com" placeholder="Your email" />
        </div>
      </div>
    </div>
  )
}

function BillingSettings() {
  return (
    <div className="settings-section">
      <h3 className="settings-section-title">Current Plan</h3>
      <div className="plan-card">
        <div className="plan-info">
          <span className="plan-name">Pro Plan</span>
          <span className="plan-price">$12/month</span>
        </div>
        <p className="plan-desc">Unlimited services, priority support, advanced logging</p>
        <button className="btn-outline">Manage Subscription</button>
      </div>
    </div>
  )
}

function NotificationSettings() {
  const [emailAlerts, setEmailAlerts] = useState(true)
  const [crashAlerts, setCrashAlerts] = useState(true)
  const [weeklyReport, setWeeklyReport] = useState(false)

  return (
    <div className="settings-section">
      <h3 className="settings-section-title">Notification Preferences</h3>
      <div className="toggle-list">
        <label className="toggle-row">
          <div>
            <span className="toggle-label">Email Alerts</span>
            <span className="toggle-desc">Receive email notifications for service events</span>
          </div>
          <input type="checkbox" className="toggle-switch" checked={emailAlerts} onChange={(e) => setEmailAlerts(e.target.checked)} />
        </label>
        <label className="toggle-row">
          <div>
            <span className="toggle-label">Crash Alerts</span>
            <span className="toggle-desc">Get notified immediately when a service crashes</span>
          </div>
          <input type="checkbox" className="toggle-switch" checked={crashAlerts} onChange={(e) => setCrashAlerts(e.target.checked)} />
        </label>
        <label className="toggle-row">
          <div>
            <span className="toggle-label">Weekly Report</span>
            <span className="toggle-desc">Receive a weekly summary of service activity</span>
          </div>
          <input type="checkbox" className="toggle-switch" checked={weeklyReport} onChange={(e) => setWeeklyReport(e.target.checked)} />
        </label>
      </div>
    </div>
  )
}

function ApiSettings() {
  const [revealed, setRevealed] = useState(false)
  const maskedKey = 'sk-••••••••••••••••••••••••abcd'
  const fullKey = 'sk-devdock-a1b2c3d4e5f6g7h8i9j0abcd'

  return (
    <div className="settings-section">
      <h3 className="settings-section-title">API Access</h3>
      <div className="api-key-box">
        <code className="api-key">{revealed ? fullKey : maskedKey}</code>
        <button className="btn-outline btn-sm" onClick={() => setRevealed((r) => !r)}>
          {revealed ? 'Hide' : 'Reveal'}
        </button>
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
    <div className="settings-page">
      <div className="page-header">
        <h2 className="page-title">Settings</h2>
        <p className="page-subtitle">Manage your preferences</p>
      </div>

      <div className="settings-layout">
        <div className="settings-tabs">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`settings-tab ${activeTab === id ? 'active' : ''}`}
              onClick={() => setActiveTab(id)}
            >
              <Icon size={16} />
              <span>{label}</span>
            </button>
          ))}
        </div>

        <div className="settings-content">
          {renderContent()}
        </div>
      </div>

      <style>{`
        .settings-page {
          animation: fadeIn 0.3s ease-out;
        }

        .page-header {
          margin-bottom: 24px;
        }

        .page-title {
          font-size: 24px;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0 0 4px 0;
        }

        .page-subtitle {
          font-size: 14px;
          color: var(--text-muted);
          margin: 0;
        }

        .settings-layout {
          display: flex;
          gap: 24px;
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: 12px;
          overflow: hidden;
        }

        .settings-tabs {
          width: 200px;
          min-width: 200px;
          border-right: 1px solid var(--border);
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .settings-tab {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 8px;
          background: transparent;
          color: var(--text-secondary);
          font-size: 14px;
          font-weight: 500;
          text-align: left;
          width: 100%;
        }

        .settings-tab:hover {
          background: var(--bg-hover);
          color: var(--text-primary);
        }

        .settings-tab.active {
          background: rgba(59, 130, 246, 0.15);
          color: var(--accent);
        }

        .settings-content {
          flex: 1;
          padding: 24px;
        }

        .settings-section-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0 0 16px 0;
        }

        .theme-toggle-group {
          display: flex;
          gap: 12px;
        }

        .theme-option {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 24px;
          border-radius: 10px;
          background: var(--bg-tertiary);
          color: var(--text-secondary);
          border: 2px solid var(--border);
          font-size: 14px;
          font-weight: 500;
        }

        .theme-option.active {
          border-color: var(--accent);
          color: var(--accent);
          background: rgba(59, 130, 246, 0.1);
        }

        .theme-option:hover {
          border-color: var(--border-light);
        }

        .accent-colors {
          display: flex;
          gap: 12px;
        }

        .accent-swatch {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          cursor: pointer;
          border: 3px solid transparent;
          transition: transform 0.15s ease;
        }

        .accent-swatch:hover {
          transform: scale(1.15);
        }

        .settings-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
          max-width: 400px;
        }

        .settings-field label {
          display: block;
          font-size: 14px;
          font-weight: 500;
          color: var(--text-secondary);
          margin-bottom: 6px;
        }

        .settings-field input {
          width: 100%;
        }

        .plan-card {
          background: var(--bg-tertiary);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 20px;
          max-width: 400px;
        }

        .plan-info {
          display: flex;
          align-items: baseline;
          gap: 12px;
          margin-bottom: 8px;
        }

        .plan-name {
          font-size: 20px;
          font-weight: 700;
          color: var(--accent);
        }

        .plan-price {
          font-size: 14px;
          color: var(--text-muted);
        }

        .plan-desc {
          font-size: 14px;
          color: var(--text-secondary);
          margin: 0 0 16px 0;
        }

        .btn-outline {
          padding: 8px 16px;
          border-radius: 8px;
          background: transparent;
          color: var(--accent);
          border: 1px solid var(--accent);
          font-size: 14px;
          font-weight: 500;
        }

        .btn-outline:hover {
          background: rgba(59, 130, 246, 0.1);
        }

        .btn-sm {
          padding: 6px 12px;
          font-size: 13px;
        }

        .toggle-list {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .toggle-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 0;
          border-bottom: 1px solid var(--border);
          cursor: pointer;
        }

        .toggle-label {
          display: block;
          font-size: 14px;
          font-weight: 500;
          color: var(--text-primary);
        }

        .toggle-desc {
          display: block;
          font-size: 13px;
          color: var(--text-muted);
          margin-top: 2px;
        }

        .toggle-switch {
          width: 44px;
          height: 24px;
          cursor: pointer;
          accent-color: var(--accent);
        }

        .api-key-box {
          display: flex;
          align-items: center;
          gap: 12px;
          background: var(--bg-tertiary);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 16px;
        }

        .api-key {
          font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
          font-size: 14px;
          color: var(--text-secondary);
          flex: 1;
        }
      `}</style>
    </div>
  )
}
