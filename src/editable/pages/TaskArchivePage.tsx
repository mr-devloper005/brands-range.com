import type { ReactNode } from 'react'
import Link from 'next/link'
import {
  ArrowUpRight,
  ChevronDown,
  FileText,
  Globe,
  Grid2X2,
  List,
  MapPin,
  Phone,
  Search,
  Star,
  UserRound,
} from 'lucide-react'
import { buildTaskMetadata } from '@/lib/seo'
import { CATEGORY_OPTIONS, normalizeCategory } from '@/lib/categories'
import { fetchPaginatedTaskPosts, buildPostUrl } from '@/lib/task-data'
import { getTaskConfig, type TaskKey } from '@/lib/site-config'
import type { SiteFeedPagination, SitePost } from '@/lib/site-connector'
import { taskPageMetadata } from '@/config/site.content'
import { taskPageVoices } from '@/editable/content/task-pages.content'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { getTaskTheme, taskThemeStyle } from '@/editable/theme/task-themes'
import { Ads } from '@/lib/ads'

export const revalidate = 3

export const taskMetadata = (task: TaskKey, path: string) =>
  buildTaskMetadata(task, {
    path,
    title: taskPageMetadata[task]?.title,
    description: taskPageMetadata[task]?.description,
  })

const getContent = (post: SitePost) => (post.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {})
const asText = (value: unknown) => (typeof value === 'string' ? value.trim() : '')
const isUrl = (value: string) => value.startsWith('/') || /^https?:\/\//i.test(value)
const stripHtml = (value: string) => value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()

const getImages = (post: SitePost) => {
  const content = getContent(post)
  const media = Array.isArray(post.media) ? post.media.map((item) => item?.url).filter((url): url is string => typeof url === 'string' && isUrl(url)) : []
  const images = Array.isArray(content.images) ? content.images.filter((url): url is string => typeof url === 'string' && isUrl(url)) : []
  const single = ['image', 'featuredImage', 'thumbnail', 'logo', 'avatar'].map((key) => asText(content[key])).filter((url) => url && isUrl(url))
  return [...media, ...images, ...single].filter(Boolean).slice(0, 8)
}

const placeholder = '/placeholder.svg?height=900&width=1200'
const getImage = (post: SitePost) => getImages(post)[0] || placeholder
const getCategory = (post: SitePost, fallback: string) => asText(getContent(post).category) || post.tags?.[0] || fallback
const getSummary = (post: SitePost) =>
  stripHtml(post.summary || asText(getContent(post).description) || asText(getContent(post).excerpt) || asText(getContent(post).body) || 'Open this post to view more details.')
const getField = (post: SitePost, keys: string[]) => {
  const content = getContent(post)
  for (const key of keys) {
    const value = asText(content[key])
    if (value) return value
  }
  return ''
}

const hashStr = (value: string) => {
  let h = 0
  for (let index = 0; index < value.length; index += 1) h = (h * 31 + value.charCodeAt(index)) >>> 0
  return h
}

const ratingOf = (post: SitePost) => {
  const real = Number(getContent(post).rating)
  if (real >= 1 && real <= 5) return Math.round(real * 10) / 10
  return Math.round((3.9 + (hashStr(post.slug || post.id || post.title || 'x') % 11) / 10) * 10) / 10
}

const archiveAdSlot: Partial<Record<TaskKey, 'header' | 'sidebar' | 'in-feed' | 'article-bottom' | 'footer'>> = {
  article: 'in-feed',
  profile: 'sidebar',
  listing: 'header',
}

function pageHref(basePath: string, category: string, page: number) {
  const params = new URLSearchParams()
  if (category && category !== 'all') params.set('category', category)
  if (page > 1) params.set('page', String(page))
  const query = params.toString()
  return query ? `${basePath}?${query}` : basePath
}

export async function EditableTaskArchiveRoute({
  task,
  searchParams,
  basePath,
}: {
  task: TaskKey
  searchParams?: Promise<{ category?: string; page?: string }>
  basePath?: string
}) {
  const resolved = (await searchParams) || {}
  const page = Math.max(1, Math.floor(Number(resolved.page) || 1))
  const category = resolved.category ? normalizeCategory(resolved.category) : 'all'
  const taskConfig = getTaskConfig(task)
  const { posts, pagination } = await fetchPaginatedTaskPosts(task, { page, limit: 24, category })
  return <TaskArchiveView task={task} posts={posts} pagination={pagination} category={category} basePath={basePath || taskConfig?.route || `/${task}`} />
}

export function TaskArchiveView({
  task,
  posts,
  pagination,
  category,
  basePath,
}: {
  task: TaskKey
  posts: SitePost[]
  pagination: SiteFeedPagination
  category: string
  basePath: string
}) {
  const taskConfig = getTaskConfig(task)
  const voice = taskPageVoices[task]
  const theme = getTaskTheme(task)
  const page = pagination.page || 1
  const label = taskConfig?.label || task
  const categoryLabel = category === 'all' ? 'All categories' : CATEGORY_OPTIONS.find((item) => item.slug === category)?.name || category
  const adSlot = archiveAdSlot[task]

  return (
    <EditableSiteShell>
      <main style={taskThemeStyle(task)} className="min-h-screen bg-[#f4f5ef] text-[var(--slot4-page-text)]">
        <section className="border-b border-[var(--editable-border)] bg-[#f7f8f2]">
          <div className="mx-auto max-w-[var(--editable-container)] px-4 py-10 sm:px-6 lg:px-8">
            <div className="text-sm text-[var(--slot4-muted-text)]">
              <Link href="/" className="hover:text-[var(--slot4-page-text)]">Home</Link> <span className="px-1">›</span> {label}
            </div>

            <div className="mt-5 rounded-[1.1rem] border border-[var(--editable-border)] bg-[#dfe3e8] p-4 shadow-[0_22px_60px_rgba(37,48,32,0.08)] sm:p-5">
              <form action={basePath} className="grid gap-3 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.9fr)_minmax(0,1fr)_110px]">
                <input
                  name="q"
                  placeholder={`Search ${label.toLowerCase()}`}
                  className="h-12 rounded-md border border-white/70 bg-white px-4 text-sm outline-none"
                />
                <div className="relative">
                  <select
                    name="category"
                    defaultValue={category}
                    className="h-12 w-full appearance-none rounded-md border border-white/70 bg-white px-4 pr-10 text-sm outline-none"
                    aria-label={voice?.filterLabel || 'Filter category'}
                  >
                    <option value="all">All categories</option>
                    {CATEGORY_OPTIONS.map((item) => (
                      <option key={item.slug} value={item.slug}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--slot4-muted-text)]" />
                </div>
                <input
                  name="location"
                  placeholder="City or location"
                  className="h-12 rounded-md border border-white/70 bg-white px-4 text-sm outline-none"
                />
                <button className="h-12 rounded-md bg-[var(--slot4-accent)] px-5 text-sm font-semibold text-white transition hover:brightness-95">
                  Search
                </button>
              </form>

              {voice?.chips?.length ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {voice.chips.map((chip) => (
                    <span key={chip} className="rounded-full bg-white/65 px-3 py-1 text-xs font-medium text-[var(--slot4-muted-text)]">
                      {chip}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="editable-display text-4xl font-semibold tracking-[-0.04em] text-[var(--slot4-page-text)]">{voice?.headline || `Browse ${label}`}</h1>
                <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--slot4-muted-text)]">{voice?.description || theme.note}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="inline-flex overflow-hidden rounded-md border border-[var(--editable-border)] bg-white text-sm">
                  <span className="inline-flex items-center gap-2 border-r border-[var(--editable-border)] px-4 py-2.5 font-semibold text-[var(--slot4-accent)]">
                    <List className="h-4 w-4" /> Classifieds
                  </span>
                  <span className="inline-flex items-center gap-2 px-4 py-2.5 text-[var(--slot4-muted-text)]">
                    <Grid2X2 className="h-4 w-4" /> Gallery
                  </span>
                </div>
                <span className="rounded-md border border-[var(--editable-border)] bg-white px-4 py-2.5 text-sm text-[var(--slot4-muted-text)]">
                  {posts.length} result{posts.length === 1 ? '' : 's'} · {categoryLabel}
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[var(--editable-container)] px-4 py-8 sm:px-6 lg:px-8">
          {adSlot ? (
            <div className="mx-auto max-w-6xl px-4 py-6">
              <Ads slot={adSlot} showLabel eager className="mx-auto w-full" />
            </div>
          ) : null}

          {posts.length ? (
            <div className="grid gap-5">
              {posts.map((post, index) => (
                <ArchivePostCard key={post.id || post.slug || `${post.title}-${index}`} post={post} task={task} basePath={basePath} index={index} />
              ))}
            </div>
          ) : (
            <div className="rounded-[1.2rem] border border-dashed border-[var(--editable-border)] bg-white px-8 py-16 text-center">
              <Search className="mx-auto h-8 w-8 text-[var(--slot4-muted-text)]" />
              <h2 className="editable-display mt-5 text-3xl font-semibold tracking-[-0.03em]">No posts found</h2>
              <p className="mt-2 text-sm leading-7 text-[var(--slot4-muted-text)]">
                Try another filter or browse a wider category.
              </p>
            </div>
          )}

          {posts.length ? (
            <nav className="mt-10 flex flex-wrap items-center justify-center gap-3 text-sm">
              {pagination.hasPrevPage ? (
                <Link href={pageHref(basePath, category, page - 1)} className="rounded-full border border-[var(--editable-border)] bg-white px-5 py-2.5 font-medium transition hover:border-[var(--slot4-accent)]">
                  Previous
                </Link>
              ) : null}
              <span className="rounded-full border border-[var(--editable-border)] bg-white px-5 py-2.5 font-medium text-[var(--slot4-muted-text)]">
                Page {page} of {pagination.totalPages || 1}
              </span>
              {pagination.hasNextPage ? (
                <Link href={pageHref(basePath, category, page + 1)} className="rounded-full border border-[var(--editable-border)] bg-white px-5 py-2.5 font-medium transition hover:border-[var(--slot4-accent)]">
                  Next
                </Link>
              ) : null}
            </nav>
          ) : null}
        </section>
      </main>
    </EditableSiteShell>
  )
}

function ArchivePostCard({ post, task, basePath, index }: { post: SitePost; task: TaskKey; basePath: string; index: number }) {
  const href = post.slug ? `${basePath}/${post.slug}` : buildPostUrl(task, String(post.slug || post.id || 'post'))
  if (task === 'profile') return <ProfileArchiveCard post={post} href={href} />
  if (task === 'image') return <ImageArchiveCard post={post} href={href} index={index} />
  if (task === 'pdf') return <PdfArchiveCard post={post} href={href} />
  if (task === 'sbm') return <BookmarkArchiveCard post={post} href={href} />
  if (task === 'article') return <ArticleArchiveCard post={post} href={href} index={index} />
  if (task === 'listing') return <ListingArchiveCard post={post} href={href} />
  return <ClassifiedArchiveCard post={post} href={href} />
}

function Stars({ post }: { post: SitePost }) {
  const rating = ratingOf(post)
  const filled = Math.round(rating)
  return (
    <div className="mt-2 flex items-center gap-2">
      <span className="inline-flex items-center gap-[3px]">
        {[0, 1, 2, 3, 4].map((index) => (
          <Star
            key={index}
            className={`h-4 w-4 ${index < filled ? 'fill-[var(--slot4-accent)] text-[var(--slot4-accent)]' : 'fill-[var(--editable-border)] text-[var(--editable-border)]'}`}
          />
        ))}
      </span>
      <span className="text-sm font-semibold text-[var(--slot4-page-text)]">{rating.toFixed(1)}</span>
    </div>
  )
}

function ShellCard({ children, href }: { children: ReactNode; href: string }) {
  return (
    <Link
      href={href}
      className="group block overflow-hidden rounded-[1.2rem] border border-[var(--editable-border)] bg-white transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_54px_rgba(37,48,32,0.1)]"
    >
      {children}
    </Link>
  )
}

function ClassifiedArchiveCard({ post, href }: { post: SitePost; href: string }) {
  const image = getImage(post)
  const location = getField(post, ['location', 'address', 'city'])
  const price = getField(post, ['price', 'amount', 'budget'])
  const category = getCategory(post, 'Classified')
  return (
    <ShellCard href={href}>
      <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <div className="relative min-h-[220px] overflow-hidden rounded-[1rem] bg-[var(--slot4-media-bg)]">
          <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="rounded-full bg-[var(--slot4-accent-soft)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--slot4-accent)]">
              {category}
            </span>
            {price ? <span className="editable-display text-3xl font-semibold tracking-[-0.03em] text-[var(--slot4-accent)]">{price}</span> : null}
          </div>
          <h2 className="editable-display mt-3 text-3xl font-semibold leading-[1.02] tracking-[-0.035em]">{post.title}</h2>
          <Stars post={post} />
          <p className="mt-4 line-clamp-3 text-sm leading-7 text-[var(--slot4-muted-text)]">{getSummary(post)}</p>
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-[var(--slot4-muted-text)]">
            {location ? (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-[var(--slot4-accent)]" /> {location}
              </span>
            ) : null}
            <span className="inline-flex items-center gap-1.5">
              <ArrowUpRight className="h-4 w-4 text-[var(--slot4-accent)]" /> Open post
            </span>
          </div>
        </div>
      </div>
    </ShellCard>
  )
}

function ListingArchiveCard({ post, href }: { post: SitePost; href: string }) {
  const image = getImage(post)
  const phone = getField(post, ['phone', 'telephone', 'mobile'])
  const website = getField(post, ['website', 'url'])
  const location = getField(post, ['location', 'address', 'city'])
  return (
    <ShellCard href={href}>
      <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <div className="relative min-h-[200px] overflow-hidden rounded-[1rem] bg-[var(--slot4-media-bg)]">
          <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--slot4-accent)]">{getCategory(post, 'Business')}</p>
          <h2 className="editable-display mt-2 text-3xl font-semibold leading-[1.02] tracking-[-0.035em]">{post.title}</h2>
          <Stars post={post} />
          <p className="mt-4 line-clamp-3 text-sm leading-7 text-[var(--slot4-muted-text)]">{getSummary(post)}</p>
          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[var(--slot4-muted-text)]">
            {location ? <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4 text-[var(--slot4-accent)]" /> {location}</span> : null}
            {phone ? <span className="inline-flex items-center gap-1.5"><Phone className="h-4 w-4 text-[var(--slot4-accent)]" /> {phone}</span> : null}
            {website ? <span className="inline-flex items-center gap-1.5"><Globe className="h-4 w-4 text-[var(--slot4-accent)]" /> Website</span> : null}
          </div>
        </div>
      </div>
    </ShellCard>
  )
}

function ArticleArchiveCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  return (
    <ShellCard href={href}>
      <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <div className="relative min-h-[210px] overflow-hidden rounded-[1rem] bg-[var(--slot4-media-bg)]">
          <img src={getImage(post)} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--slot4-accent)]">
            <span>{getCategory(post, 'Article')}</span>
            <span className="text-[var(--slot4-muted-text)]">No. {String(index + 1).padStart(2, '0')}</span>
          </div>
          <h2 className="editable-display mt-2 text-3xl font-semibold leading-[1.02] tracking-[-0.035em]">{post.title}</h2>
          <Stars post={post} />
          <p className="mt-4 line-clamp-3 text-sm leading-7 text-[var(--slot4-muted-text)]">{getSummary(post)}</p>
        </div>
      </div>
    </ShellCard>
  )
}

function ImageArchiveCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  return (
    <Link href={href} className="group block overflow-hidden rounded-[1.2rem] border border-[var(--editable-border)] bg-white transition hover:-translate-y-1 hover:shadow-[0_20px_48px_rgba(37,48,32,0.1)]">
      <div className={`relative overflow-hidden bg-[var(--slot4-media-bg)] ${index % 3 === 0 ? 'aspect-[16/11]' : 'aspect-[4/3]'}`}>
        <img src={getImage(post)} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,rgba(17,24,16,0.78))]" />
        <div className="absolute inset-x-0 bottom-0 p-5 text-white">
          <span className="rounded-full bg-white/14 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em]">
            {getCategory(post, 'Image')}
          </span>
          <h2 className="editable-display mt-3 text-3xl font-semibold leading-[1.02] tracking-[-0.035em]">{post.title}</h2>
        </div>
      </div>
    </Link>
  )
}

function BookmarkArchiveCard({ post, href }: { post: SitePost; href: string }) {
  const website = getField(post, ['website', 'url', 'link'])
  return (
    <ShellCard href={href}>
      <div className="flex gap-4 p-5 sm:p-6">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[var(--slot4-accent-soft)] text-[var(--slot4-accent)]">
          <Globe className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--slot4-accent)]">{getCategory(post, 'Resource')}</p>
          <h2 className="editable-display mt-2 text-2xl font-semibold leading-[1.04] tracking-[-0.03em]">{post.title}</h2>
          <p className="mt-3 line-clamp-3 text-sm leading-7 text-[var(--slot4-muted-text)]">{getSummary(post)}</p>
          {website ? <p className="mt-4 truncate text-sm font-semibold text-[var(--slot4-accent)]">{website.replace(/^https?:\/\//, '').replace(/\/$/, '')}</p> : null}
        </div>
      </div>
    </ShellCard>
  )
}

function PdfArchiveCard({ post, href }: { post: SitePost; href: string }) {
  return (
    <ShellCard href={href}>
      <div className="flex gap-5 p-5 sm:p-6">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[1rem] bg-[var(--slot4-cream)] text-[var(--slot4-accent)]">
          <FileText className="h-7 w-7" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--slot4-accent)]">{getCategory(post, 'Document')}</p>
          <h2 className="editable-display mt-2 text-2xl font-semibold leading-[1.04] tracking-[-0.03em]">{post.title}</h2>
          <p className="mt-3 line-clamp-3 text-sm leading-7 text-[var(--slot4-muted-text)]">{getSummary(post)}</p>
        </div>
      </div>
    </ShellCard>
  )
}

function ProfileArchiveCard({ post, href }: { post: SitePost; href: string }) {
  const image = getImages(post)[0]
  const role = getField(post, ['role', 'designation', 'company', 'location'])
  return (
    <ShellCard href={href}>
      <div className="flex flex-col items-center gap-4 p-6 text-center">
        <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-[var(--slot4-media-bg)]">
          {image ? <img src={image} alt="" className="h-full w-full object-cover" /> : <UserRound className="h-10 w-10 text-[var(--slot4-muted-text)]" />}
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--slot4-accent)]">{getCategory(post, 'Profile')}</p>
          <h2 className="editable-display mt-2 text-2xl font-semibold leading-[1.04] tracking-[-0.03em]">{post.title}</h2>
          {role ? <p className="mt-2 text-sm text-[var(--slot4-muted-text)]">{role}</p> : null}
          <Stars post={post} />
        </div>
      </div>
    </ShellCard>
  )
}
