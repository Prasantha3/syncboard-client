import styles from './Column.module.css'

export default function Column({ title, count, children }) {
  return (
    <section className={styles.column}>
      <header className={styles.header}>
        <h2>{title}</h2>
        <span className={styles.count}>{count}</span>
      </header>
      <div className={styles.body}>{children}</div>
    </section>
  )
}
