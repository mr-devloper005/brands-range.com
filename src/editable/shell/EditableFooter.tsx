'use client'

import Link from 'next/link'
import { SITE_CONFIG } from '@/lib/site-config'
import { globalContent } from '@/editable/content/global.content'
import { useEditableLocalAuthSession } from '@/editable/components/EditableLocalAuthForms'

export function EditableFooter() {
  const year = new Date().getFullYear()
  const { session, logout } = useEditableLocalAuthSession()

  return (
    <footer className="border-t border-[var(--editable-border)] bg-[var(--editable-footer-bg)] text-[var(--editable-footer-text)]">
      <section className="bg-[#667089] text-white">
        <div className="mx-auto flex max-w-[var(--editable-container)] flex-col items-center justify-between gap-5 px-4 py-10 sm:px-6 md:flex-row lg:px-8">
          <div>
            <p className="editable-display text-4xl font-semibold tracking-[-0.04em]">Post your ad now</p>
            <p className="mt-2 text-sm text-white/80">Reach business owners, local buyers, and professionals in one place.</p>
          </div>
          <Link
            href="/create"
            className="inline-flex min-w-[220px] items-center justify-center rounded-md bg-[var(--slot4-cta)] px-8 py-4 text-lg font-semibold text-white transition hover:bg-[var(--slot4-cta-strong)]"
          >
            Post your Ad
          </Link>
        </div>
      </section>

      <section className="border-y border-[var(--editable-border)]">
        <div className="mx-auto grid max-w-[var(--editable-container)] gap-10 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:px-8">
          {(globalContent.footer.columns || []).map((column) => (
            <div key={column.title}>
              <h4 className="text-[13px] font-semibold uppercase tracking-[0.22em] text-[var(--slot4-accent)]">{column.title}</h4>
              <div className="mt-4 grid gap-3 text-sm">
                {column.links.map((item) => (
                  <Link key={item.href} href={item.href} className="text-[var(--slot4-muted-text)] transition hover:text-[var(--slot4-page-text)]">
                    {item.label}
                  </Link>
                ))}
                {column.title === 'Support' && session ? (
                  <button type="button" onClick={logout} className="text-left text-[var(--slot4-muted-text)] transition hover:text-[var(--slot4-page-text)]">
                    Logout
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="px-4 py-6 text-center text-xs leading-6 text-[var(--slot4-muted-text)]">
        <p>Copyright {year} {SITE_CONFIG.name}. All rights reserved.</p>
        <p className="mt-1">{globalContent.footer.bottomNote}</p>
      </div>
    </footer>
  )
}
