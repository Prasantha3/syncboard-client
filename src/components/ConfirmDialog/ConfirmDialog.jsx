import Button from '../Button/Button'
import styles from './ConfirmDialog.module.css'

export default function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className={styles.backdrop} role="dialog" aria-modal="true">
      <div className={styles.dialog}>
        <p>{message}</p>
        <div className={styles.actions}>
          <Button variant="secondary" size="sm" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="danger" size="sm" onClick={onConfirm}>
            Delete
          </Button>
        </div>
      </div>
    </div>
  )
}
