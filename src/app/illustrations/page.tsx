import { Illustration, ILLUSTRATION_LABELS, type IllustrationName } from '@/components/ui/illustrations'

const CATEGORY_ILLUSTRATIONS = Object.keys(ILLUSTRATION_LABELS) as IllustrationName[]

/** Review-only gallery for Phase 2 category art; it is not part of quick-add. */
export default function IllustrationPreviewPage() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--surface-canvas)', color: 'var(--text)', padding: '48px 24px', fontFamily: 'var(--font-body)' }}>
      <div style={{ width: '100%', maxWidth: 880, margin: '0 auto' }}>
        <p style={{ color: 'var(--accent)', fontSize: 13, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', margin: 0 }}>Phase 2.2 review</p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--type-screen-title-size)', lineHeight: 'var(--type-screen-title-line-height)', margin: '8px 0 12px' }}>Category illustrations</h1>
        <p style={{ color: 'var(--sub)', lineHeight: 1.5, margin: '0 0 28px', maxWidth: 600 }}>Review each category illustration at its 48px artboard and the 32px minimum. This route is a visual preview only; none of this art is wired into quick-add yet.</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          {CATEGORY_ILLUSTRATIONS.map((name) => (
            <article key={name} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 20 }}>
              <h2 style={{ fontSize: 16, lineHeight: '22px', margin: '0 0 20px', fontWeight: 600 }}>{ILLUSTRATION_LABELS[name]}</h2>
              <div style={{ display: 'flex', alignItems: 'end', gap: 24 }}>
                <div style={{ display: 'grid', gap: 8, justifyItems: 'center' }}>
                  <Illustration name={name} label={ILLUSTRATION_LABELS[name]} />
                  <span style={{ fontSize: 12, color: 'var(--muted)' }}>48px</span>
                </div>
                <div style={{ display: 'grid', gap: 8, justifyItems: 'center' }}>
                  <Illustration name={name} size={32} />
                  <span style={{ fontSize: 12, color: 'var(--muted)' }}>32px</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  )
}
