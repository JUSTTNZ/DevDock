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

    try {
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add service')
    } finally {
      setLoading(false)
    }
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
          <button className="modal-close" onClick={handleClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-form-group">
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

          <div className="modal-form-group">
            <label htmlFor="command">Command</label>
            <input
              id="command"
              type="text"
              placeholder="e.g., npm run dev"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
            />
          </div>

          <div className="modal-form-group">
            <label htmlFor="cwd">Working Directory</label>
            <div className="modal-input-row">
              <input
                id="cwd"
                type="text"
                placeholder="e.g., C:\Projects\my-app"
                value={cwd}
                onChange={(e) => setCwd(e.target.value)}
              />
              <button
                type="button"
                className="modal-browse"
                onClick={async () => {
                  const folder = await window.electronAPI.browseFolder()
                  if (folder) setCwd(folder)
                }}
                title="Browse for folder"
              >
                <FolderOpen size={16} />
              </button>
            </div>
          </div>

          <div className="modal-form-group">
            <label htmlFor="port">Port (optional)</label>
            <input
              id="port"
              type="number"
              placeholder="e.g., 3000"
              value={port}
              onChange={(e) => setPort(e.target.value)}
            />
          </div>

          <div className="modal-checks">
            <label className="modal-check">
              <input
                type="checkbox"
                checked={autoStart}
                onChange={(e) => setAutoStart(e.target.checked)}
              />
              <span>Auto-start on launch</span>
            </label>

            <label className="modal-check">
              <input
                type="checkbox"
                checked={autoRestart}
                onChange={(e) => setAutoRestart(e.target.checked)}
              />
              <span>Auto-restart on crash</span>
            </label>
          </div>

          {error && <div className="modal-error">{error}</div>}

          <div className="modal-actions">
            <button type="button" className="modal-btn-cancel" onClick={handleClose}>
              Cancel
            </button>
            <button type="submit" className="modal-btn-submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Service'}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes modalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modalSlideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: modalFadeIn 0.2s ease-out;
        }

        .modal {
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: 16px;
          width: 100%;
          max-width: 480px;
          margin: 20px;
          animation: modalSlideUp 0.3s ease-out;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          border-bottom: 1px solid var(--border);
        }
        .modal-header h2 {
          font-size: 17px;
          font-weight: 600;
          margin: 0;
          color: var(--text-primary);
        }
        .modal-close {
          background: none;
          color: var(--text-muted);
          padding: 6px;
          border-radius: 8px;
          transition: all 0.2s;
        }
        .modal-close:hover {
          background: var(--bg-tertiary);
          color: var(--text-primary);
        }

        form {
          padding: 24px;
        }

        .modal-form-group {
          margin-bottom: 18px;
        }
        .modal-form-group label {
          display: block;
          font-size: 13px;
          font-weight: 500;
          color: var(--text-secondary);
          margin-bottom: 6px;
        }
        .modal-form-group input {
          width: 100%;
        }

        .modal-input-row {
          position: relative;
        }
        .modal-input-row input {
          padding-right: 40px;
        }
        .modal-browse {
          position: absolute;
          right: 4px;
          top: 50%;
          transform: translateY(-50%);
          background: var(--bg-tertiary);
          color: var(--text-muted);
          border: 1px solid var(--border);
          border-radius: 6px;
          padding: 6px 10px;
          cursor: pointer;
          display: flex;
          align-items: center;
          transition: all 0.2s;
        }
        .modal-browse:hover {
          background: var(--bg-hover);
          color: var(--accent);
          border-color: var(--accent);
        }

        .modal-checks {
          display: flex;
          gap: 20px;
          margin-bottom: 18px;
        }
        .modal-check {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 13px;
          color: var(--text-secondary);
          cursor: pointer;
        }
        .modal-check input {
          width: 16px;
          height: 16px;
          cursor: pointer;
          accent-color: var(--accent);
        }

        .modal-error {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #f87171;
          padding: 10px 14px;
          border-radius: 10px;
          font-size: 13px;
          margin-bottom: 18px;
        }

        .modal-actions {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
        }
        .modal-btn-cancel,
        .modal-btn-submit {
          padding: 9px 20px;
          border-radius: 10px;
          font-weight: 500;
          font-size: 13px;
          transition: all 0.2s;
        }
        .modal-btn-cancel {
          background: var(--bg-tertiary);
          color: var(--text-secondary);
          border: 1px solid var(--border);
        }
        .modal-btn-cancel:hover {
          background: var(--bg-hover);
          color: var(--text-primary);
        }
        .modal-btn-submit {
          background: var(--accent);
          color: white;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.25);
        }
        .modal-btn-submit:hover:not(:disabled) {
          background: var(--accent-hover);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.35);
        }
        .modal-btn-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  )
}
