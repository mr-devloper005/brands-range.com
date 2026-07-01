import type { ReactNode } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowLeft,
  ArrowUpRight,
  Bookmark,
  Building2,
  Camera,
  Download,
  ExternalLink,
  FileText,
  Mail,
  MapPin,
  Phone,
  Star,
  Tag,
  UserRound,
} from 'lucide-react'
import { buildPostMetadata, buildTaskMetadata } from '@/lib/seo'
import { fetchArticleComments, fetchTaskPostBySlug, fetchTaskPosts } from '@/lib/task-data'
import { getTaskConfig, SITE_CONFIG, type TaskKey } from '@/lib/site-config'
import type { SitePost } from '@/lib/site-connector'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { EditableArticleComments } from '@/editable/components/EditableArticleComments'
import { taskThemeStyle } from '@/editable/theme/task-themes'
import { Ads } from '@/lib/ads'

export const revalidate = 3

export async function generateEditableDetailMetadata(task: TaskKey, params: Promise<{ slug?: string; username?: string }>) {
  const resolved = await params
  const slug = resolved.slug || resolved.username || ''
  const post = await fetchTaskPostBySlug(task, slug)
  return post ? await buildPostMetadata(task, post) : await buildTaskMetadata(task)
}

export async function EditableTaskDetailRoute({ task, params }: { task: TaskKey; params: Promise<{ slug?: string; username?: string }> }) {
  const resolved = await params
  const slug = resolved.slug || resolved.username || ''
  const post = await fetchTaskPostBySlug(task, slug)
  if (!post) notFound()
  const related = (await fetchTaskPosts(task, 7)).filter((item) => item.slug !== post.slug).slice(0, 4)
  const comments = task === 'article' ? await fetchArticleComments(post.slug, 50) : []
  return <TaskDetailView task={task} post={post} related={related} comments={comments} />
}

const getContent = (post: SitePost) => (post.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {})
const asText = (value: unknown) => (typeof value === 'string' ? value.trim() : '')
const isUrl = (value: string) => value.startsWith('/') || /^https?:\/\//i.test(value)
const stripHtml = (value: string) => value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()

const getField = (post: SitePost, keys: string[]) => {
  const content = getContent(post)
  for (const key of keys) {
    const value = asText(content[key])
    if (value) return value
  }
  return ''
}

const getImages = (post: SitePost) => {
  const content = getContent(post)
  const media = Array.isArray(post.media) ? post.media.map((item) => item?.url).filter((url): url is string => typeof url === 'string' && isUrl(url)) : []
  const images = Array.isArray(content.images) ? content.images.filter((url): url is string => typeof url === 'string' && isUrl(url)) : []
  const single = ['image', 'featuredImage', 'thumbnail', 'logo', 'avatar'].map((key) => asText(content[key])).filter((url) => url && isUrl(url))
  return [...media, ...images, ...single].filter(Boolean).slice(0, 12)
}

const getBody = (post: SitePost) => {
  const content = getContent(post)
  return asText(content.body) || asText(content.description) || asText(content.details) || post.summary || 'Details will appear here once available.'
}

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

const safeUrl = (value: string) => (/^https?:\/\//i.test(value) ? value : '#')

const linkifyMarkdown = (value: string) =>
  value.replace(/\[([^\]]+)]\((https?:\/\/[^\s)]+)\)/gi, (_match, label, url) => `<a href="${safeUrl(url)}" target="_blank" rel="nofollow noopener noreferrer">${label}</a>`)

const linkifyText = (value: string) =>
  linkifyMarkdown(value).replace(/(^|[\s(>])((https?:\/\/)[^\s<)]+)/gi, (_match, prefix, url) => `${prefix}<a href="${safeUrl(url)}" target="_blank" rel="nofollow noopener noreferrer">${url}</a>`)

const hardenLinks = (html: string) =>
  html.replace(/<a\s+([^>]*href=["'][^"']+["'][^>]*)>/gi, (_match, attrs) => {
    let next = String(attrs).replace(/\s+on\w+=("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    if (!/\starget=/i.test(next)) next += ' target="_blank"'
    if (!/\srel=/i.test(next)) next += ' rel="nofollow noopener noreferrer"'
    return `<a ${next}>`
  })

const sanitizeHtml = (html: string) =>
  hardenLinks(
    html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<(iframe|object|embed)[^>]*>[\s\S]*?<\/\1>/gi, '')
      .replace(/\s+on\w+=("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
      .replace(/(href|src)=(['"])javascript:[\s\S]*?\2/gi, '$1="#"')
  )

const formatPlainText = (raw: string) => {
  const value = raw.trim()
  if (!value) return ''
  if (/<[a-z][\s\S]*>/i.test(value)) return sanitizeHtml(linkifyMarkdown(value))
  return value
    .split(/\n{2,}/)
    .map((part) => `<p>${linkifyText(escapeHtml(part).replace(/\n/g, '<br />'))}</p>`)
    .join('')
}

const summaryText = (post: SitePost) => post.summary || asText(getContent(post).description) || asText(getContent(post).excerpt) || ''
const leadText = (post: SitePost) => {
  const summary = summaryText(post)
  if (!summary) return ''
  const lead = stripHtml(summary)
  return lead && lead !== stripHtml(getBody(post)) ? lead : ''
}

const categoryOf = (post: SitePost, fallback: string) => asText(getContent(post).category) || post.tags?.[0] || fallback

const mapSrcFor = (post: SitePost) => {
  const address = getField(post, ['address', 'location', 'city'])
  const lat = getField(post, ['lat', 'latitude'])
  const lng = getField(post, ['lng', 'lon', 'longitude'])
  if (lat && lng) return `https://maps.google.com/maps?q=${encodeURIComponent(`${lat},${lng}`)}&z=14&output=embed`
  if (address) return `https://maps.google.com/maps?q=${encodeURIComponent(address)}&z=13&output=embed`
  return ''
}

const hashStr = (value: string) => {
  let h = 0
  for (let i = 0; i < value.length; i += 1) h = (h * 31 + value.charCodeAt(i)) >>> 0
  return h
}

const ratingOf = (post: SitePost) => {
  const real = Number(getContent(post).rating)
  if (real >= 1 && real <= 5) return Math.round(real * 10) / 10
  return Math.round((4 + (hashStr(post.slug || post.id || post.title || 'x') % 9) / 10) * 10) / 10
}

const detailAdSlot: Partial<Record<TaskKey, 'header' | 'sidebar' | 'in-feed' | 'article-bottom' | 'footer'>> = {
  article: 'article-bottom',
  profile: 'footer',
  listing: 'sidebar',
}

export function TaskDetailView({
  task,
  post,
  related,
  comments = [],
}: {
  task: TaskKey
  post: SitePost
  related: SitePost[]
  comments?: Array<{ id: string; name: string; comment: string; createdAt: string }>
}) {
  const taskConfig = getTaskConfig(task)
  const label = taskConfig?.label || task
  const images = getImages(post)
  const heroImage = images[0] || '/placeholder.svg?height=900&width=1200'
  const category = categoryOf(post, label)
  const price = getField(post, ['price', 'amount', 'budget'])
  const role = getField(post, ['role', 'designation', 'company', 'location'])
  const location = getField(post, ['location', 'address', 'city'])
  const phone = getField(post, ['phone', 'telephone', 'mobile'])
  const email = getField(post, ['email'])
  const website = getField(post, ['website', 'url', 'link'])
  const fileUrl = getField(post, ['fileUrl', 'pdfUrl', 'documentUrl', 'url'])
  const mapSrc = mapSrcFor(post)
  const adSlot = detailAdSlot[task]

  const heroEyebrow =
    task === 'classified'
      ? 'Classified listing'
      : task === 'listing'
        ? 'Business listing'
        : task === 'profile'
          ? 'Profile'
          : task === 'pdf'
            ? 'Document'
            : task === 'image'
              ? 'Image gallery'
              : task === 'sbm'
                ? 'Saved resource'
                : 'Article'

  return (
    <EditableSiteShell>
      <main style={taskThemeStyle(task)} className="min-h-screen bg-[#f4f5ef] text-[var(--slot4-page-text)]">
        <section className="border-b border-[var(--editable-border)] bg-[#f7f8f2]">
          <div className="mx-auto max-w-[var(--editable-container)] px-4 py-10 sm:px-6 lg:px-8">
            <BackLink task={task} />
            <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_360px]">
              <article className="min-w-0 overflow-hidden rounded-[1.4rem] border border-[var(--editable-border)] bg-white shadow-[0_24px_60px_rgba(37,48,32,0.08)]">
                <div className="relative min-h-[280px] bg-[var(--slot4-media-bg)] sm:min-h-[360px]">
                  <img src={heroImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(24,28,21,0.04),rgba(24,28,21,0.6))]" />
                  <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-8">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/82">{heroEyebrow}</p>
                    <h1 className="editable-display mt-3 text-4xl font-semibold leading-[0.98] tracking-[-0.04em] sm:text-5xl">
                      {post.title}
                    </h1>
                    <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-white/82">
                      <span>{category}</span>
                      {location ? <span>{location}</span> : null}
                      {price ? <span className="font-semibold text-[var(--slot4-highlight)]">{price}</span> : null}
                    </div>
                  </div>
                </div>

                <div className="p-6 sm:p-8">
                  {leadText(post) ? <p className="text-lg leading-8 text-[var(--slot4-muted-text)]">{leadText(post)}</p> : null}
                  <MetaRow post={post} category={category} />
                  <BodyContent post={post} />
                  {adSlot ? (
                    <div className="mx-auto max-w-6xl px-4 py-6">
                      <Ads slot={adSlot} showLabel eager className="mx-auto w-full" />
                    </div>
                  ) : null}
                  {task === 'article' ? <EditableArticleComments slug={String(post.slug || post.id || post.title || 'post')} comments={comments} /> : null}
                </div>
              </article>

              <aside className="space-y-5">
                <SectionCard title="Quick details">
                  <InfoItem icon={<Tag className="h-4 w-4" />} label="Category" value={category} />
                  {price ? <InfoItem icon={<ArrowUpRight className="h-4 w-4" />} label="Price" value={price} /> : null}
                  {role ? <InfoItem icon={<UserRound className="h-4 w-4" />} label="Role" value={role} /> : null}
                  {location ? <InfoItem icon={<MapPin className="h-4 w-4" />} label="Location" value={location} /> : null}
                </SectionCard>

                <ContactAction website={website} phone={phone} email={email} fileUrl={fileUrl} />
                {mapSrc ? <MapBox src={mapSrc} label={location || post.title} /> : null}
                <MiniGallery task={task} images={images.slice(1)} />
              </aside>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[var(--editable-container)] px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-8">
              {task === 'pdf' && fileUrl ? (
                <SectionCard title="Document preview">
                  <div className="overflow-hidden rounded-[1rem] border border-[var(--editable-border)]">
                    <iframe src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=0`} title={post.title} className="h-[70vh] w-full bg-[var(--slot4-media-bg)]" />
                  </div>
                </SectionCard>
              ) : null}

              {task === 'image' && images.length ? (
                <SectionCard title="Image collection">
                  <div className="grid gap-4 sm:grid-cols-2">
                    {images.map((image, index) => (
                      <div key={`${image}-${index}`} className="overflow-hidden rounded-[1rem] border border-[var(--editable-border)] bg-[var(--slot4-media-bg)]">
                        <img src={image} alt="" className="w-full object-cover" />
                      </div>
                    ))}
                  </div>
                </SectionCard>
              ) : null}
            </div>

            <div>
              <RelatedPanel task={task} related={related} />
            </div>
          </div>
        </section>
      </main>
    </EditableSiteShell>
  )
}

function BackLink({ task }: { task: TaskKey }) {
  const taskConfig = getTaskConfig(task)
  return (
    <Link href={taskConfig?.route || '/'} className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--slot4-muted-text)] transition hover:text-[var(--slot4-page-text)]">
      <ArrowLeft className="h-4 w-4" /> Back to {taskConfig?.label || 'posts'}
    </Link>
  )
}

function MetaRow({ post, category }: { post: SitePost; category: string }) {
  const rating = ratingOf(post)
  const filled = Math.round(rating)
  return (
    <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
      <span className="inline-flex items-center gap-[3px]">
        {[0, 1, 2, 3, 4].map((index) => (
          <Star
            key={index}
            className={`h-4 w-4 ${
              index < filled ? 'fill-[var(--slot4-accent)] text-[var(--slot4-accent)]' : 'fill-[var(--editable-border)] text-[var(--editable-border)]'
            }`}
          />
        ))}
      </span>
      <span className="font-semibold text-[var(--slot4-page-text)]">{rating.toFixed(1)}</span>
      <span className="text-[var(--slot4-muted-text)]">{SITE_CONFIG.name}</span>
      <span className="text-[var(--slot4-muted-text)]">·</span>
      <span className="text-[var(--slot4-muted-text)]">{category}</span>
    </div>
  )
}

function SectionCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-[1.25rem] border border-[var(--editable-border)] bg-white p-5 shadow-[0_18px_44px_rgba(37,48,32,0.08)] sm:p-6">
      <h2 className="editable-display text-3xl font-semibold tracking-[-0.03em]">{title}</h2>
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  )
}

function InfoItem({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 rounded-[1rem] bg-[var(--slot4-cream)] px-4 py-3 text-sm">
      <span className="mt-0.5 text-[var(--slot4-accent)]">{icon}</span>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--slot4-muted-text)]">{label}</p>
        <p className="mt-1 break-words font-medium text-[var(--slot4-page-text)]">{value}</p>
      </div>
    </div>
  )
}

function BodyContent({ post }: { post: SitePost }) {
  return (
    <div
      className="article-content mt-8 max-w-none text-[1.02rem] leading-8 text-[var(--slot4-page-text)]"
      dangerouslySetInnerHTML={{ __html: formatPlainText(getBody(post)) }}
    />
  )
}

function ContactAction({ website, phone, email, fileUrl }: { website?: string; phone?: string; email?: string; fileUrl?: string }) {
  if (!website && !phone && !email && !fileUrl) return null
  return (
    <SectionCard title="Quick actions">
      <div className="flex flex-wrap gap-3">
        {website ? (
          <Link href={website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[var(--slot4-accent)] px-5 py-3 text-sm font-semibold text-white transition hover:brightness-95">
            Website <ExternalLink className="h-4 w-4" />
          </Link>
        ) : null}
        {phone ? (
          <a href={`tel:${phone}`} className="inline-flex items-center gap-2 rounded-full border border-[var(--editable-border)] px-5 py-3 text-sm font-semibold transition hover:border-[var(--slot4-accent)]">
            <Phone className="h-4 w-4" /> Call
          </a>
        ) : null}
        {email ? (
          <a href={`mailto:${email}`} className="inline-flex items-center gap-2 rounded-full border border-[var(--editable-border)] px-5 py-3 text-sm font-semibold transition hover:border-[var(--slot4-accent)]">
            <Mail className="h-4 w-4" /> Email
          </a>
        ) : null}
        {fileUrl ? (
          <Link href={fileUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-[var(--editable-border)] px-5 py-3 text-sm font-semibold transition hover:border-[var(--slot4-accent)]">
            <Download className="h-4 w-4" /> Download
          </Link>
        ) : null}
      </div>
    </SectionCard>
  )
}

function MapBox({ src, label }: { src: string; label: string }) {
  return (
    <SectionCard title="Location">
      <div className="overflow-hidden rounded-[1rem] border border-[var(--editable-border)]">
        <div className="flex items-center gap-2 border-b border-[var(--editable-border)] bg-[var(--slot4-cream)] px-4 py-3 text-sm font-semibold text-[var(--slot4-page-text)]">
          <MapPin className="h-4 w-4 text-[var(--slot4-accent)]" /> {label}
        </div>
        <iframe src={src} title="Map" loading="lazy" className="h-72 w-full border-0" />
      </div>
    </SectionCard>
  )
}

function MiniGallery({ task, images }: { task: TaskKey; images: string[] }) {
  if (!images.length || task === 'image') return null
  return (
    <SectionCard title="Gallery">
      <div className="grid grid-cols-2 gap-3">
        {images.slice(0, 4).map((image, index) => (
          <div key={`${image}-${index}`} className="overflow-hidden rounded-[1rem] border border-[var(--editable-border)] bg-[var(--slot4-media-bg)]">
            <img src={image} alt="" className="aspect-[4/3] w-full object-cover" />
          </div>
        ))}
      </div>
    </SectionCard>
  )
}

function RelatedPanel({ task, related }: { task: TaskKey; related: SitePost[] }) {
  const taskConfig = getTaskConfig(task)
  if (!related.length) return null
  return (
    <SectionCard title="More like this">
      <div className="grid gap-3">
        {related.map((item) => (
          <RelatedCard key={item.id || item.slug} task={task} post={item} />
        ))}
      </div>
      <Link href={taskConfig?.route || '/'} className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--slot4-accent)]">
        View all {taskConfig?.label?.toLowerCase() || 'posts'} <ArrowUpRight className="h-4 w-4" />
      </Link>
    </SectionCard>
  )
}

function RelatedCard({ task, post }: { task: TaskKey; post: SitePost }) {
  const image = getImages(post)[0]
  const href = `${getTaskConfig(task)?.route || `/${task}`}/${String(post.slug || post.id || 'post')}`
  return (
    <Link href={href} className="group flex gap-3 rounded-[1rem] border border-[var(--editable-border)] p-3 transition hover:border-[var(--slot4-accent)]">
      {image ? (
        <img src={image} alt="" className="h-16 w-16 shrink-0 rounded-[0.9rem] object-cover" />
      ) : (
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[0.9rem] bg-[var(--slot4-cream)] text-[var(--slot4-muted-text)]">
          {task === 'listing' ? <Building2 className="h-5 w-5" /> : task === 'profile' ? <UserRound className="h-5 w-5" /> : task === 'image' ? <Camera className="h-5 w-5" /> : task === 'sbm' ? <Bookmark className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
        </div>
      )}
      <div className="min-w-0">
        <h3 className="line-clamp-2 text-sm font-semibold leading-6 text-[var(--slot4-page-text)] group-hover:text-[var(--slot4-accent)]">{post.title}</h3>
        <p className="mt-1 line-clamp-2 text-xs leading-5 text-[var(--slot4-muted-text)]">{stripHtml(summaryText(post)) || 'Open to view more details.'}</p>
      </div>
    </Link>
  )
}
