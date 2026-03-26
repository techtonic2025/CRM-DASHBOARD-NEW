import { Modal } from './Modal'

interface Props {
  message: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({ message, onConfirm, onCancel }: Props) {
  return (
    <Modal title="Conferma eliminazione" onClose={onCancel}>
      <p className="text-[var(--text-secondary)] mb-6">{message}</p>
      <div className="flex gap-3 justify-end">
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded-xl border border-[var(--bg-border)] hover:bg-[var(--bg-hover)] transition text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        >
          Annulla
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 transition text-white text-sm font-semibold"
        >
          Elimina
        </button>
      </div>
    </Modal>
  )
}
