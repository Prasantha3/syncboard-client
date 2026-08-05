import styles from './StatusViews.module.css'

export default function EmptyState({ label = 'Nothing here yet', hint }) {
  return (
    <div className={styles.status}>
      <p className={styles.emptyLabel}>{label}</p>
      {hint && <p className={styles.emptyHint}>{hint}</p>}
    </div>
  )
}
