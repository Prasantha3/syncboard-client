import Button from '../Button/Button'
import styles from './StatusViews.module.css'

export default function ErrorBanner({ message, onRetry }) {
  return (
    <div className={styles.status} role="alert">
      <p className={styles.errorText}>Something went wrong: {message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  )
}
