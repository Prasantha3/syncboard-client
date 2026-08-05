import styles from './StatusViews.module.css'

export default function Spinner({ label = 'Loading…' }) {
  return (
    <div className={styles.status} role="status" aria-live="polite">
      <div className={styles.spinner} />
      <p>{label}</p>
    </div>
  )
}
