import { useState, useEffect } from 'react'
import { X, FolderOpen } from 'lucide-react'
import type { ServiceConfig } from '../../../shared/types'

interface AddServiceModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (config: ServiceConfig) => Promise<{ success: boolean; message?: string }>
}

export function AddServiceModal({ isOpen, onClose, onSubmit }: AddServiceModalProps) {
  const [name, setName] = useState('')
  const [command, setCommand] = useState('')
  const [cwd, setCwd] = useState('')
  const [port, setPort] = useState('')
  const [autoStart, setAutoStart] = useState(false)
  const [autoRestart, setAutoRestart] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      window.electronAPI.getCwd().then((dir) => {
        setCwd(dir)
      }).catch(() => {
        setCwd('')
      })
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name.trim() || !command.trim() || !cwd.trim()) {
      setError('Name, command, and directory are required')
      return
    }

    setLoading(true)

    const config: ServiceConfig = {
      name: name.trim(),
      command: command.trim(),
      cwd: cwd.trim(),
      port: port ? parseInt(port, 10) : undefined,
      autoStart,
      autoRestart
    }

    const result = await onSubmit(config)

    if (result.success) {
      resetForm()
      onClose()
    } else {
      setError(result.message || 'Failed to add service')
    }

    setLoading(false)
  }

  const resetForm = () => {
    setName('')
    setCommand('')
    setCwd('')
    setPort('')
    setAutoStart(false)
    setAutoRestart(false)
    setError('')
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add New Service</h2>
          <button className="close-btn" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Service Name</label>
            <input
              id="name"
              type="text"
              placeholder="e.g., Backend API"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="command">Command</label>
            <input
              id="command"
              type="text"
              placeholder="e.g., npm run dev"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="cwd">Working Directory</label>
            <div className="input-with-icon">
              <input
                id="cwd"
                type="text"
                placeholder="e.g., C:\Projects\my-app"
                value={cwd}
                onChange={(e) => setCwd(e.target.value)}
              />
              <FolderOpen size={18} className="input-icon" />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="port">Port (optional)</label>
            <input
              id="port"
              type="number"
              placeholder="e.g., 3000"
              value={port}
              onChange={(e) => setPort(e.target.value)}
            />
          </div>

          <div className="form-row">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={autoStart}
                onChange={(e) => setAutoStart(e.target.checked)}
              />
              <span>Auto-start on launch</span>
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={autoRestart}
                onChange={(e) => setAutoRestart(e.target.checked)}
              />
              <span>Auto-restart on crash</span>
            </label>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={handleClose}>
              Cancel
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Service'}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.2s ease-out;
        }

        .modal {
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: 16px;
          width: 100%;
          max-width: 500px;
          margin: 20px;
          animation: fadeIn 0.3s ease-out;
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          border-bottom: 1px solid var(--border);
        }

        .modal-header h2 {
          font-size: 18px;
          font-weight: 600;
          margin: 0;
        }

        .close-btn {
          background: none;
          color: var(--text-muted);
          padding: 4px;
          border-radius: 6px;
        }

        .close-btn:hover {
          background: var(--bg-tertiary);
          color: var(--text-primary);
        }

        form {
          padding: 24px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          font-size: 14px;
          font-weight: 500;
          color: var(--text-secondary);
          margin-bottom: 8px;
        }

        .form-group input {
          width: 100%;
        }

        .input-with-icon {
          position: relative;
        }

        .input-with-icon input {
          padding-right: 40px;
        }

        .input-icon {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
        }

        .form-row {
          display: flex;
          gap: 24px;
          margin-bottom: 20px;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: var(--text-secondary);
          cursor: pointer;
        }

        .checkbox-label input {
          width: 16px;
          height: 16px;
          cursor: pointer;
        }

        .error-message {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid var(--danger);
          color: var(--danger);
          padding: 12px;
          border-radius: 8px;
          font-size: 14px;
          margin-bottom: 20px;
        }

        .modal-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
        }

        .btn-cancel,
        .btn-submit {
          padding: 10px 20px;
          border-radius: 8px;
          font-weight: 500;
        }

        .btn-cancel {
          background: var(--bg-tertiary);
          color: var(--text-secondary);
          border: 1px solid var(--border);
        }

        .btn-cancel:hover {
          background: var(--bg-hover);
          color: var(--text-primary);
        }

        .btn-submit {
          background: var(--accent);
          color: white;
        }

        .btn-submit:hover:not(:disabled) {
          background: var(--accent-hover);
        }
      `}</style>
    </div>
  )
}
