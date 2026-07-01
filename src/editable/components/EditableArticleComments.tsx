'use client'

import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { MessageCircle, Send } from 'lucide-react'

type Comment = { id: string; name: string; comment: string; createdAt: string }

const storageKey = (slug: string) => `editable:article-comments:${slug}`

function timeAgo(value?: string) {
  if (!value) return ''
  const then = new Date(value).getTime()
  if (Number.isNaN(then)) return ''
  const mins = Math.max(1, Math.floor((Date.now() - then) / 60000))
  if (mins < 60) return `${mins} min ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} hr ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days} ${days === 1 ? 'day' : 'days'} ago`
  return new Date(then).toLocaleDateString()
}

function initial(name: string) {
  return (name.trim()[0] || 'G').toUpperCase()
}

export function EditableArticleComments({ slug, comments = [] }: { slug: string; comments?: Comment[] }) {
  const [stored, setStored] = useState<Comment[]>([])
  const [name, setName] = useState('')
  const [text, setText] = useState('')

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey(slug))
      setStored(raw ? (JSON.parse(raw) as Comment[]) : [])
    } catch {
      setStored([])
    }
  }, [slug])

  const persist = (next: Comment[]) => {
    setStored(next)
    try {
      window.localStorage.setItem(storageKey(slug), JSON.stringify(next))
    } catch {
      /* keep the in-memory list when storage is unavailable */
    }
  }

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const body = text.trim()
    if (!body) return
    const entry: Comment = {
      id: `c-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: name.trim() || 'Guest',
      comment: body,
      createdAt: new Date().toISOString(),
    }
    persist([entry, ...stored])
    setText('')
  }

  const all = useMemo(() => [...stored, ...comments], [stored, comments])

  return (
    <section className="mt-14 border-t border-[var(--editable-border)] pt-10">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--slot4-accent-soft)] text-[var(--slot4-accent)]">
          <MessageCircle className="h-5 w-5" />
        </span>
        <div>
          <h2 className="editable-display text-3xl font-semibold tracking-[-0.03em]">Comments</h2>
          <p className="text-sm text-[var(--slot4-muted-text)]">{all.length} conversation{all.length === 1 ? '' : 's'}</p>
        </div>
      </div>

      <form onSubmit={submit} className="mt-6 rounded-[1.2rem] border border-[var(--editable-border)] bg-white p-5 shadow-[0_18px_44px_rgba(37,48,32,0.08)] sm:p-6">
        <div className="grid gap-3 sm:grid-cols-[220px_minmax(0,1fr)]">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Your name"
            maxLength={60}
            className="h-12 rounded-xl border border-[var(--editable-border)] bg-[var(--slot4-cream)] px-4 text-sm outline-none transition focus:border-[var(--slot4-accent)]"
          />
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Share a useful thought or quick reaction"
            rows={3}
            maxLength={1500}
            className="min-h-[120px] w-full resize-y rounded-xl border border-[var(--editable-border)] bg-[var(--slot4-cream)] px-4 py-3 text-sm leading-6 outline-none transition focus:border-[var(--slot4-accent)]"
          />
        </div>
        <div className="mt-4 flex justify-end">
          <button
            type="submit"
            disabled={!text.trim()}
            className="inline-flex items-center gap-2 rounded-full bg-[var(--slot4-cta)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--slot4-cta-strong)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send className="h-4 w-4" /> Post comment
          </button>
        </div>
      </form>

      <div className="mt-6 grid gap-3">
        {all.map((comment) => (
          <div key={comment.id} className="rounded-[1.1rem] border border-[var(--editable-border)] bg-white p-5 shadow-[0_12px_28px_rgba(37,48,32,0.06)]">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--slot4-accent-soft)] text-sm font-semibold text-[var(--slot4-accent)]">
                {initial(comment.name)}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[var(--slot4-page-text)]">{comment.name || 'Guest'}</p>
                {comment.createdAt ? <p className="text-xs text-[var(--slot4-muted-text)]">{timeAgo(comment.createdAt)}</p> : null}
              </div>
            </div>
            <p className="mt-3 whitespace-pre-line text-sm leading-7 text-[var(--slot4-page-text)]">{comment.comment}</p>
          </div>
        ))}
        {!all.length ? <p className="rounded-[1rem] border border-dashed border-[var(--editable-border)] bg-white px-5 py-6 text-sm text-[var(--slot4-muted-text)]">Be the first to comment.</p> : null}
      </div>
    </section>
  )
}
