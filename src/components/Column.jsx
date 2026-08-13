function Column({ title, children }) {
  return (
    <div className="column">
      <h3 className="column-title">{title}</h3>
      <div className="column-content">{children}</div>
    </div>
  );
}

export default Column;