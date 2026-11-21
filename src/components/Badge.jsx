// Insignia de estado. tone: success | danger | warning | neutral
export default function Badge({ tone = 'neutral', children }) {
  return <span className={`badge badge--${tone}`}>{children}</span>
}
