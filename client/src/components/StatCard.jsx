const StatCard = ({ title, value, helper }) => {
  return (
    <article
      className="card"
      style={{ padding: 18, position: "relative", overflow: "hidden" }}
    >
      <div
        style={{
          color: "var(--muted)",
          fontWeight: 800,
          marginBottom: 8,
          textTransform: "uppercase",
          letterSpacing: "0.03em",
          fontSize: 12,
        }}
      >
        {title}
      </div>
      <h3 style={{ fontSize: 32, lineHeight: 1 }}>{value}</h3>
      {helper && (
        <p style={{ marginTop: 10, color: "var(--muted)" }}>{helper}</p>
      )}
    </article>
  );
};

export default StatCard;
