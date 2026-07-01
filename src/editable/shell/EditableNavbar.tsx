'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown, LogIn, Menu, PlusCircle, Search, UserPlus, X } from 'lucide-react'
import { SITE_CONFIG } from '@/lib/site-config'
import { globalContent } from '@/editable/content/global.content'
import { useEditableLocalAuthSession } from '@/editable/components/EditableLocalAuthForms'

const hiddenTasks = new Set(['classified', 'profile'])

export function EditableNavbar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { session, logout } = useEditableLocalAuthSession()
  const navItems = useMemo(
    () => SITE_CONFIG.tasks.filter((task) => task.enabled && !hiddenTasks.has(task.key)).map((task) => ({ label: task.label, href: task.route })),
    []
  )

  const utilityLinks = globalContent.nav.utilityLinks || []
  const primaryAction = globalContent.nav.actions?.primary || { label: 'Post your ad', href: '/create' }

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--editable-border)] bg-[var(--editable-nav-bg)] text-[var(--editable-nav-text)] backdrop-blur-xl">
      <div className="border-b border-[var(--editable-border)] bg-[var(--slot4-cream)]">
        <div className="mx-auto flex min-h-[42px] w-full max-w-[var(--editable-container)] items-center justify-end gap-5 px-4 text-[12px] font-medium text-[var(--slot4-muted-text)] sm:px-6 lg:px-8">
          {utilityLinks.map((item) => (
            <Link key={item.href} href={item.href} className="hidden transition hover:text-[var(--slot4-page-text)] md:inline-flex">
              {item.label}
            </Link>
          ))}
          <Link
            href={primaryAction.href}
            className="inline-flex items-center rounded-md bg-[var(--slot4-cta)] px-4 py-2 font-semibold text-white transition hover:bg-[var(--slot4-cta-strong)]"
          >
            {primaryAction.label}
          </Link>
        </div>
      </div>

      <nav className="mx-auto flex min-h-[78px] w-full max-w-[var(--editable-container)] items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="group flex shrink-0 items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--slot4-accent)] text-white shadow-[0_10px_26px_rgba(70,132,50,0.22)]">
            <img src="/favicon.png?v=20260413" alt={SITE_CONFIG.name} className="h-8 w-8 object-contain" />
          </span>
          <span className="min-w-0">
            <span className="editable-display block text-[2rem] font-semibold leading-none tracking-[-0.04em] text-[var(--slot4-page-text)]">
              {SITE_CONFIG.name}
            </span>
            <span className="hidden text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--slot4-muted-text)] sm:block">
              {globalContent.nav?.tagline || SITE_CONFIG.tagline}
            </span>
          </span>
        </Link>

        <div className="hidden flex-1 items-center justify-center gap-1 xl:flex">
          {navItems.slice(0, 6).map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-4 py-2 text-[13px] font-semibold transition ${
                  active
                    ? 'bg-[var(--slot4-accent-soft)] text-[var(--slot4-accent)]'
                    : 'text-[var(--slot4-page-text)] hover:bg-white hover:text-[var(--slot4-accent)]'
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </div>

        <form action="/search" className="ml-auto hidden min-w-0 flex-1 justify-end lg:flex xl:max-w-[280px]">
          <label className="flex h-11 w-full items-center gap-2 rounded-full border border-[var(--editable-border)] bg-white px-4 shadow-[0_8px_22px_rgba(37,48,32,0.05)] transition focus-within:border-[var(--slot4-accent)]">
            <Search className="h-4 w-4 shrink-0 text-[var(--slot4-muted-text)]" />
            <input
              name="q"
              type="search"
              placeholder="Search listings"
              className="min-w-0 flex-1 bg-transparent text-sm outline-none"
            />
          </label>
        </form>

        <div className="hidden shrink-0 items-center gap-2 lg:flex">
          {session ? (
            <>
              <Link
                href="/create"
                className="inline-flex items-center gap-2 rounded-full bg-[var(--slot4-cta)] px-4 py-2.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-[var(--slot4-cta-strong)]"
              >
                <PlusCircle className="h-3.5 w-3.5" /> Create
              </Link>
              <button
                type="button"
                onClick={logout}
                className="rounded-full border border-[var(--editable-border)] px-4 py-2.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--slot4-page-text)] transition hover:border-[var(--slot4-accent)]"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-full border border-[var(--editable-border)] px-4 py-2.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--slot4-page-text)] transition hover:border-[var(--slot4-accent)]"
              >
                <LogIn className="h-3.5 w-3.5" /> Login
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-full bg-[var(--slot4-accent)] px-4 py-2.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-white transition hover:brightness-95"
              >
                <UserPlus className="h-3.5 w-3.5" /> Sign up
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="ml-auto rounded-xl border border-[var(--editable-border)] bg-white p-2.5 lg:hidden"
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      <div className="border-t border-[var(--editable-border)] bg-white/80">
        <div className="mx-auto hidden w-full max-w-[var(--editable-container)] items-center gap-2 overflow-x-auto px-4 py-3 text-[12px] font-semibold text-[var(--slot4-muted-text)] lg:flex sm:px-6 lg:px-8">
          <span className="inline-flex items-center gap-2 rounded-full bg-[var(--slot4-accent-soft)] px-3 py-1 text-[var(--slot4-accent)]">
            Browse by task <ChevronDown className="h-3.5 w-3.5" />
          </span>
          {navItems.slice(0, 7).map((item) => (
            <Link key={item.href} href={item.href} className="rounded-full px-3 py-1.5 transition hover:bg-[var(--slot4-cream)] hover:text-[var(--slot4-page-text)]">
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      {open ? (
        <div className="border-t border-[var(--editable-border)] bg-[var(--slot4-cream)] px-4 py-5 lg:hidden">
          <form action="/search" className="mb-5 flex items-center gap-2 rounded-full border border-[var(--editable-border)] bg-white px-4 py-3">
            <Search className="h-4 w-4 text-[var(--slot4-muted-text)]" />
            <input name="q" type="search" placeholder="Search listings" className="min-w-0 flex-1 bg-transparent text-sm outline-none" />
          </form>
          <div className="grid gap-2">
            {[...navItems, { label: 'Contact', href: '/contact' }, ...(session ? [{ label: 'Create', href: '/create' }] : [{ label: 'Login', href: '/login' }, { label: 'Sign up', href: '/signup' }])].map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`rounded-2xl px-4 py-3 text-sm font-semibold ${
                    active
                      ? 'bg-[var(--slot4-accent)] text-white'
                      : 'border border-[var(--editable-border)] bg-white text-[var(--slot4-page-text)]'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
            {session ? (
              <button
                type="button"
                onClick={() => {
                  logout()
                  setOpen(false)
                }}
                className="rounded-2xl border border-[var(--editable-border)] bg-white px-4 py-3 text-left text-sm font-semibold text-[var(--slot4-page-text)]"
              >
                Logout
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </header>
  )
}
