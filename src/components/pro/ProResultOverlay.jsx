export default function ProResultOverlay({ result, onClose, onNewQuery }) {
  return (
    <div style={{
      position: 'absolute',
      bottom: 30,
      left: 280,        // 260px sidebar + 20px gap
      zIndex: 1050,
      width: 340,
      maxWidth: 'calc(100% - 300px)',
      background: 'rgba(9,21,42,.96)',
      backdropFilter: 'blur(14px)',
      border: '1px solid rgba(91,175,214,.28)',
      borderRadius: 12,
      boxShadow: '0 8px 40px rgba(0,0,0,.75)',
      overflow: 'hidden',
      fontFamily: 'inherit',
    }}>

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '9px 14px',
        background: 'rgba(14,165,233,.07)',
        borderBottom: '1px solid rgba(91,175,214,.1)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            fontSize: 10, fontWeight: 700, color: 'var(--accent)',
            textTransform: 'uppercase', letterSpacing: '.5px',
          }}>✦ KI-Analyse</span>
          {result.location?.name && (
            <span style={{
              fontSize: 10, color: '#7dd3fc',
              background: 'rgba(14,165,233,.1)',
              border: '1px solid rgba(14,165,233,.18)',
              borderRadius: 8, padding: '1px 7px',
            }}>
              📍 {result.location.name}
            </span>
          )}
        </div>
        <button onClick={onClose} style={{
          background: 'none', border: 'none', color: 'var(--muted)',
          fontSize: 14, cursor: 'pointer', lineHeight: 1, padding: '0 0 0 8px',
        }}>✕</button>
      </div>

      {/* Body */}
      <div style={{ padding: '12px 14px 10px' }}>

        {/* Headline */}
        <div style={{
          fontSize: 13, fontWeight: 700, color: '#fff',
          lineHeight: 1.4, marginBottom: 10,
        }}>
          {result.headline}
        </div>

        {/* Insights */}
        {result.insights?.slice(0, 4).map((ins, i) => (
          <div key={i} style={{
            display: 'flex', gap: 8, alignItems: 'flex-start',
            padding: '5px 0',
            borderTop: i > 0 ? '1px solid rgba(91,175,214,.06)' : 'none',
          }}>
            <span style={{
              color: 'var(--accent)', fontSize: 9,
              marginTop: 4, flexShrink: 0,
            }}>▸</span>
            <span style={{
              fontSize: 12, color: 'rgba(255,255,255,.82)', lineHeight: 1.5,
            }}>{ins}</span>
          </div>
        ))}

        {/* Warning */}
        {result.warning && (
          <div style={{
            marginTop: 10, padding: '7px 10px',
            background: 'rgba(245,158,11,.07)',
            border: '1px solid rgba(245,158,11,.2)',
            borderRadius: 6, fontSize: 11, color: '#fcd34d', lineHeight: 1.45,
          }}>
            ⚠ {result.warning}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '7px 14px 10px',
        borderTop: '1px solid rgba(91,175,214,.07)',
      }}>
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,.25)' }}>
          {result.layers?.length || 0} Layer aktiviert
        </span>
        <button
          onClick={onNewQuery}
          style={{
            background: 'none', border: '1px solid rgba(91,175,214,.2)',
            borderRadius: 5, color: 'var(--accent)', fontSize: 10,
            padding: '3px 9px', cursor: 'pointer', fontFamily: 'inherit',
            transition: 'border-color .15s',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(91,175,214,.2)'}
        >
          ← Neue Anfrage
        </button>
      </div>
    </div>
  )
}
