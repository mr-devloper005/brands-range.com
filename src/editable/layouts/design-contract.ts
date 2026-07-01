import type { CSSProperties } from 'react'

export const editableRootStyle = {
  '--slot4-page-bg': '#f6f6f1',
  '--slot4-page-text': '#253020',
  '--slot4-panel-bg': '#eef0e6',
  '--slot4-surface-bg': '#ffffff',
  '--slot4-muted-text': '#68745f',
  '--slot4-soft-muted-text': '#8c977f',
  '--slot4-accent': '#468432',
  '--slot4-accent-fill': '#468432',
  '--slot4-accent-soft': '#e6f3dc',
  '--slot4-on-accent': '#ffffff',
  '--slot4-dark-bg': '#293122',
  '--slot4-dark-text': '#fffdf5',
  '--slot4-media-bg': '#ebece4',
  '--slot4-cream': '#fff8e8',
  '--slot4-warm': '#fff7da',
  '--slot4-lavender': '#f1f2ea',
  '--slot4-gray': '#d8ddd2',
  '--slot4-highlight': '#ffef91',
  '--slot4-cta': '#ffa02e',
  '--slot4-cta-strong': '#f18c18',
  '--slot4-body-gradient':
    'radial-gradient(circle at top, rgba(255,239,145,0.25), transparent 30%), linear-gradient(180deg, #fdfdf8 0%, #f6f6f1 42%, #f1f3ea 100%)',
  '--editable-page-bg': '#f6f6f1',
  '--editable-page-text': '#253020',
  '--editable-container': '1280px',
  '--editable-border': '#d4dacd',
  '--editable-nav-bg': 'rgba(255,248,232,0.96)',
  '--editable-nav-text': '#253020',
  '--editable-nav-active': '#468432',
  '--editable-nav-active-text': '#ffffff',
  '--editable-cta-bg': '#ffa02e',
  '--editable-cta-text': '#ffffff',
  '--editable-search-bg': '#ffffff',
  '--editable-footer-bg': '#f7f8f1',
  '--editable-footer-text': '#253020',
} as CSSProperties

export const editablePalette = {
  pageBg: 'bg-[var(--slot4-page-bg)]',
  pageText: 'text-[var(--slot4-page-text)]',
  panelBg: 'bg-[var(--slot4-panel-bg)]',
  panelText: 'text-[var(--slot4-page-text)]',
  surfaceBg: 'bg-[var(--slot4-surface-bg)]',
  surfaceText: 'text-[var(--slot4-page-text)]',
  mutedText: 'text-[var(--slot4-muted-text)]',
  softMutedText: 'text-[var(--slot4-soft-muted-text)]',
  accentText: 'text-[var(--slot4-accent)]',
  accentBg: 'bg-[var(--slot4-accent-fill)]',
  accentSoftBg: 'bg-[var(--slot4-accent-soft)]',
  accentSoftText: 'text-[var(--slot4-accent-soft)]',
  onAccentText: 'text-[var(--slot4-on-accent)]',
  darkBg: 'bg-[var(--slot4-dark-bg)]',
  darkText: 'text-[var(--slot4-dark-text)]',
  mediaBg: 'bg-[var(--slot4-media-bg)]',
  creamBg: 'bg-[var(--slot4-cream)]',
  warmBg: 'bg-[var(--slot4-warm)]',
  lavenderBg: 'bg-[var(--slot4-lavender)]',
  grayBg: 'bg-[var(--slot4-gray)]',
  border: 'border-[var(--editable-border)]',
  darkBorder: 'border-white/12',
  shadow: 'shadow-[0_20px_50px_rgba(37,48,32,0.08)]',
  shadowStrong: 'shadow-[0_34px_80px_rgba(37,48,32,0.16)]',
  overlay: 'bg-[linear-gradient(180deg,rgba(21,29,19,0.08),rgba(21,29,19,0.82))]',
} as const

export const editableDesignContract = {
  shell: {
    page: `min-h-screen ${editablePalette.pageBg} ${editablePalette.pageText}`,
    section: 'mx-auto w-full max-w-[var(--editable-container)] px-4 sm:px-6 lg:px-8',
    sectionY: 'py-12 sm:py-16 lg:py-20',
  },
  layout: {
    safeGrid: 'grid gap-6 md:grid-cols-2 xl:grid-cols-3',
    featureGrid: 'grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center',
    rail: 'flex snap-x gap-5 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
    minRailCard: 'w-[240px] shrink-0 snap-start sm:w-[280px]',
  },
  type: {
    eyebrow: 'text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--slot4-accent)]',
    heroTitle: 'text-4xl font-semibold leading-[1.02] tracking-[-0.04em] sm:text-5xl lg:text-[4rem]',
    sectionTitle: 'text-3xl font-semibold tracking-[-0.03em] sm:text-4xl',
    body: 'text-base leading-7',
  },
  surface: {
    card: `rounded-[1.35rem] border ${editablePalette.border} ${editablePalette.surfaceBg} ${editablePalette.shadow}`,
    soft: `rounded-[1.35rem] border ${editablePalette.border} bg-[var(--slot4-cream)]`,
    dark: `rounded-[1.5rem] ${editablePalette.darkBg} ${editablePalette.darkText} ${editablePalette.shadowStrong}`,
  },
  button: {
    primary:
      'inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--slot4-cta)] px-6 py-3 text-sm font-semibold text-white transition duration-200 hover:bg-[var(--slot4-cta-strong)] active:scale-[0.98]',
    secondary:
      'inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--editable-border)] bg-white px-6 py-3 text-sm font-semibold text-[var(--slot4-page-text)] transition duration-200 hover:border-[var(--slot4-accent)] hover:text-[var(--slot4-accent)] active:scale-[0.98]',
    accent:
      'inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--slot4-accent-fill)] px-6 py-3 text-sm font-semibold text-[var(--slot4-on-accent)] transition duration-200 hover:brightness-95 active:scale-[0.98]',
  },
  media: {
    frame: `relative overflow-hidden rounded-[1.2rem] ${editablePalette.mediaBg}`,
    ratio: 'aspect-[4/3]',
  },
  motion: {
    lift: 'transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_24px_54px_rgba(37,48,32,0.14)]',
    fade: 'transition duration-300 hover:opacity-85',
  },
} as const

export const aiLayoutRules = [
  'Keep all UI-only changes inside src/editable so routing, data fetching, and task wiring stay intact.',
  'Favor classified-style search, category tabs, modular cards, and a clear orange/green action hierarchy.',
  'Use multiple card rhythms across the home and task surfaces so the site does not look templated.',
  'Keep post links built from the existing task routes and slugs.',
  'Always provide text, image, category, and metadata fallbacks so sparse post data still renders cleanly.',
] as const
