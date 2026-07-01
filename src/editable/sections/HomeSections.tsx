import Link from 'next/link'
import {
  ArrowRight,
  Bookmark,
  Building2,
  ChevronRight,
  FileText,
  Image as ImageIcon,
  Megaphone,
  Star,
  UserRound,
} from 'lucide-react'
import type { SitePost } from '@/lib/site-connector'
import type { HomeTimeSection } from '@/lib/task-data'
import type { TaskKey } from '@/lib/site-config'
import { SITE_CONFIG } from '@/lib/site-config'
import { pagesContent } from '@/editable/content/pages.content'
import { getEditablePostImage, getEditableExcerpt, getEditableCategory, postHref } from '@/editable/cards/PostCards'
import { EditableHeroCollage } from '@/editable/sections/EditableHeroCollage'

type HomeSectionProps = {
  primaryTask: TaskKey
  primaryRoute: string
  posts: SitePost[]
  timeSections: HomeTimeSection[]
}

const taskIcon: Record<TaskKey, typeof FileText> = {
  article: FileText,
  listing: Building2,
  classified: Megaphone,
  image: ImageIcon,
  sbm: Bookmark,
  pdf: FileText,
  profile: UserRound,
}

const container = 'mx-auto w-full max-w-[var(--editable-container)] px-4 sm:px-6 lg:px-8'
const hiddenTasks = new Set(['classified', 'profile'])

function dedupePosts(posts: SitePost[]) {
  const seen = new Set<string>()
  const out: SitePost[] = []
  for (const post of posts) {
    const key = post.slug || post.id || post.title
    if (!key || seen.has(key)) continue
    seen.add(key)
    out.push(post)
  }
  return out
}

function latestPostImages(posts: SitePost[], max = 8) {
  const seen = new Set<string>()
  const out: string[] = []
  for (const post of posts) {
    const image = getEditablePostImage(post)
    if (!image || image.includes('placeholder') || seen.has(image)) continue
    seen.add(image)
    out.push(image)
    if (out.length >= max) break
  }
  return out
}

function safePosts(posts: SitePost[], timeSections: HomeTimeSection[]) {
  return dedupePosts([...posts, ...timeSections.flatMap((section) => section.posts)])
}

function ratingOf(post: SitePost) {
  const content = post?.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {}
  const real = Number(content.rating)
  if (real >= 1 && real <= 5) return Math.round(real * 10) / 10
  const base = (post.slug || post.id || post.title || '').length
  return Math.round((4 + ((base % 9) + 1) / 10) * 10) / 10
}

function RatingRow({ post }: { post: SitePost }) {
  const rating = ratingOf(post)
  const filled = Math.round(rating)
  return (
    <div className="mt-2 flex items-center gap-2">
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
      <span className="text-sm font-semibold text-[var(--slot4-page-text)]">{rating.toFixed(1)}</span>
    </div>
  )
}

export function EditableHomeHero({ primaryTask, posts, timeSections }: HomeSectionProps) {
  const pool = safePosts(posts, timeSections)
  const heroImages = latestPostImages(pool)
  const taskLinks = SITE_CONFIG.tasks.filter((task) => task.enabled && !hiddenTasks.has(task.key)).slice(0, 6)

  return (
    <section className="overflow-hidden">
      <div className="relative min-h-[640px] border-b border-[var(--editable-border)] sm:min-h-[700px]">
        <EditableHeroCollage images={heroImages} />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(16,20,17,0.2)_0%,rgba(16,20,17,0.55)_100%)]" />
        <div className={`relative flex min-h-[640px] flex-col justify-center py-14 sm:min-h-[700px] ${container}`}>
          <div className="mx-auto w-full max-w-5xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-white/78">
              {pagesContent.home.hero.badge || 'Business owners welcome'}
            </p>
            <h1 className="editable-display mt-4 text-5xl font-semibold leading-[0.95] tracking-[-0.04em] text-white sm:text-6xl lg:text-[4.8rem]">
              Find local businesses, services, and fresh opportunities
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-white/88 sm:text-lg">
              Search business listings, useful articles, and practical local recommendations across {SITE_CONFIG.name}.
            </p>
          </div>
          <div className="mx-auto mt-12 grid w-full max-w-5xl grid-cols-2 overflow-hidden rounded-[1.2rem] border border-white/20 bg-[rgba(121,131,145,0.82)] shadow-[0_22px_60px_rgba(18,29,20,0.18)] sm:grid-cols-3 lg:grid-cols-6">
            {taskLinks.map((task) => {
              const Icon = taskIcon[task.key] || FileText
              return (
                <Link
                  key={task.key}
                  href={task.route}
                  className="flex min-h-[86px] flex-col items-center justify-center gap-3 border border-white/10 px-3 text-center text-white transition hover:bg-white/12"
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-sm font-semibold">{task.label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

function FeaturedCard({ post, href }: { post: SitePost; href: string }) {
  return (
    <Link href={href} className="group grid overflow-hidden rounded-[1.4rem] border border-[var(--editable-border)] bg-white shadow-[0_22px_52px_rgba(37,48,32,0.08)] lg:grid-cols-[1.05fr_0.95fr]">
      <div className="relative min-h-[320px] overflow-hidden bg-[var(--slot4-media-bg)]">
        <img src={getEditablePostImage(post)} alt={post.title} className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" />
      </div>
      <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--slot4-accent)]">Featured listing</p>
        <h2 className="editable-display mt-4 text-4xl font-semibold leading-[0.98] tracking-[-0.04em] text-[var(--slot4-page-text)]">
          {post.title}
        </h2>
        <RatingRow post={post} />
        <p className="mt-4 text-[15px] leading-7 text-[var(--slot4-muted-text)]">{getEditableExcerpt(post, 200) || 'Open the full post to view details, images, and contact information.'}</p>
        <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--slot4-accent)]">
          View details <ArrowRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  )
}

function CompactCategoryCard({ task }: { task: (typeof SITE_CONFIG.tasks)[number] }) {
  const Icon = taskIcon[task.key] || FileText
  return (
    <Link
      href={task.route}
      className="group flex items-center gap-4 rounded-[1.15rem] border border-[var(--editable-border)] bg-white px-4 py-5 shadow-[0_16px_34px_rgba(37,48,32,0.06)] transition hover:-translate-y-1 hover:border-[var(--slot4-accent)]"
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--slot4-accent-soft)] text-[var(--slot4-accent)]">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="text-base font-semibold text-[var(--slot4-page-text)]">{task.label}</p>
        <p className="text-sm text-[var(--slot4-muted-text)]">Browse updated posts</p>
      </div>
    </Link>
  )
}

export function EditableStoryRail({ primaryTask, primaryRoute, posts, timeSections }: HomeSectionProps) {
  const pool = safePosts(posts, timeSections)
  const featured = pool[0]
  const categories = SITE_CONFIG.tasks.filter((task) => task.enabled && !hiddenTasks.has(task.key)).slice(0, 6)

  return (
    <section className="bg-[var(--slot4-page-bg)]">
      <div className={`py-12 sm:py-14 ${container}`}>
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--slot4-accent)]">Top picks</p>
                <h2 className="editable-display mt-2 text-3xl font-semibold tracking-[-0.04em]">Browse standout posts first</h2>
              </div>
              <Link href={primaryRoute} className="hidden items-center gap-2 text-sm font-semibold text-[var(--slot4-accent)] sm:inline-flex">
                See all <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            {featured ? (
              <FeaturedCard post={featured} href={postHref(primaryTask, featured, primaryRoute)} />
            ) : (
              <div className="rounded-[1.4rem] border border-dashed border-[var(--editable-border)] bg-white px-6 py-12 text-center text-[var(--slot4-muted-text)]">
                New featured posts will appear here soon.
              </div>
            )}
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--slot4-accent)]">Browse sections</p>
            <div className="mt-4 grid gap-4">
              {categories.map((task) => (
                <CompactCategoryCard key={task.key} task={task} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function HorizontalCard({ post, href, eyebrow }: { post: SitePost; href: string; eyebrow: string }) {
  return (
    <Link
      href={href}
      className="group grid overflow-hidden rounded-[1.2rem] border border-[var(--editable-border)] bg-white transition hover:-translate-y-1 hover:shadow-[0_20px_48px_rgba(37,48,32,0.1)] sm:grid-cols-[220px_minmax(0,1fr)]"
    >
      <div className="relative min-h-[180px] bg-[var(--slot4-media-bg)]">
        <img src={getEditablePostImage(post)} alt={post.title} className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" />
      </div>
      <div className="p-5 sm:p-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--slot4-accent)]">{eyebrow}</p>
        <h3 className="editable-display mt-2 text-3xl font-semibold leading-[1.02] tracking-[-0.035em]">{post.title}</h3>
        <RatingRow post={post} />
        <p className="mt-3 line-clamp-3 text-sm leading-7 text-[var(--slot4-muted-text)]">{getEditableExcerpt(post, 180)}</p>
        <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[var(--slot4-accent)]">
          Open post <ArrowRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  )
}

function EditorialListCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  return (
    <Link href={href} className="group flex gap-4 rounded-[1.15rem] border border-[var(--editable-border)] bg-white p-4 transition hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(37,48,32,0.08)]">
      <span className="editable-display flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[var(--slot4-cream)] text-2xl font-semibold text-[var(--slot4-accent)]">
        {index + 1}
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--slot4-accent)]">
          {getEditableCategory(post) || 'Discovery'}
        </p>
        <h3 className="mt-1 text-lg font-semibold leading-7 text-[var(--slot4-page-text)] group-hover:text-[var(--slot4-accent)]">{post.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--slot4-muted-text)]">{getEditableExcerpt(post, 105)}</p>
      </div>
    </Link>
  )
}

export function EditableMagazineSplit({ primaryTask, primaryRoute, posts, timeSections }: HomeSectionProps) {
  const pool = safePosts(posts, timeSections)
  const lead = pool.slice(1, 4)
  const list = pool.slice(4, 9)

  if (!pool.length) return null

  return (
    <section className="bg-[var(--slot4-warm)]">
      <div className={`py-14 sm:py-16 ${container}`}>
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--slot4-accent)]">Fresh activity</p>
            <h2 className="editable-display mt-2 text-3xl font-semibold tracking-[-0.04em]">Recent finds with quick scan summaries</h2>
            <div className="mt-6 grid gap-5">
              {lead.map((post, index) => (
                <HorizontalCard
                  key={post.id || post.slug || `${post.title}-${index}`}
                  post={post}
                  href={postHref(primaryTask, post, primaryRoute)}
                  eyebrow={index === 0 ? 'New arrival' : 'Recently added'}
                />
              ))}
            </div>
          </div>

          <div>
            <div className="rounded-[1.3rem] border border-[var(--editable-border)] bg-white p-5 shadow-[0_18px_44px_rgba(37,48,32,0.08)] sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--slot4-accent)]">Editor's index</p>
                  <h3 className="editable-display mt-2 text-3xl font-semibold tracking-[-0.04em]">Shortlist</h3>
                </div>
                <Link href={primaryRoute} className="text-sm font-semibold text-[var(--slot4-accent)]">
                  View all
                </Link>
              </div>
              <div className="mt-5 grid gap-4">
                {list.map((post, index) => (
                  <EditorialListCard key={post.id || post.slug || `${post.title}-${index}`} post={post} href={postHref(primaryTask, post, primaryRoute)} index={index} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function ImageFirstCard({ post, href }: { post: SitePost; href: string }) {
  return (
    <Link href={href} className="group block overflow-hidden rounded-[1.2rem] border border-[var(--editable-border)] bg-white transition hover:-translate-y-1 hover:shadow-[0_20px_48px_rgba(37,48,32,0.1)]">
      <div className="relative aspect-[4/3] overflow-hidden bg-[var(--slot4-media-bg)]">
        <img src={getEditablePostImage(post)} alt={post.title} className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" loading="lazy" />
        <span className="absolute left-4 top-4 rounded-full bg-white/92 px-3 py-1 text-[11px] font-semibold text-[var(--slot4-page-text)]">
          {getEditableCategory(post) || 'Featured'}
        </span>
      </div>
      <div className="p-5">
        <h3 className="editable-display text-2xl font-semibold leading-[1.03] tracking-[-0.03em] text-[var(--slot4-page-text)]">{post.title}</h3>
        <p className="mt-3 line-clamp-3 text-sm leading-7 text-[var(--slot4-muted-text)]">{getEditableExcerpt(post, 135)}</p>
      </div>
    </Link>
  )
}

const sectionCopy: Record<string, { eyebrow: string; title: string }> = {
  spotlight: { eyebrow: 'Latest this week', title: 'Newly published opportunities' },
  browse: { eyebrow: 'Popular now', title: 'What people are opening most' },
  index: { eyebrow: 'From the archive', title: 'Useful posts worth keeping nearby' },
}

export function EditableTimeCollections({ primaryTask, primaryRoute, posts, timeSections }: HomeSectionProps) {
  const sections =
    timeSections.length > 0
      ? timeSections
      : ([
          { key: 'spotlight', posts: posts.slice(0, 4), href: primaryRoute },
          { key: 'browse', posts: posts.slice(4, 8), href: primaryRoute },
          { key: 'index', posts: posts.slice(8, 12), href: primaryRoute },
        ] as Pick<HomeTimeSection, 'key' | 'posts' | 'href'>[])

  const visible = sections.filter((section) => section.posts.length)
  if (!visible.length) return null

  return (
    <>
      {visible.map((section, index) => {
        const copy = sectionCopy[section.key] || { eyebrow: 'Discover', title: 'More to explore' }
        return (
          <section key={section.key} className={index % 2 === 0 ? 'bg-[var(--slot4-page-bg)]' : 'bg-[var(--slot4-lavender)]'}>
            <div className={`py-12 sm:py-14 ${container}`}>
              <div className="mb-7 flex items-end justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--slot4-accent)]">{copy.eyebrow}</p>
                  <h2 className="editable-display mt-2 text-3xl font-semibold tracking-[-0.04em]">{copy.title}</h2>
                </div>
                <Link href={section.href || primaryRoute} className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--slot4-accent)]">
                  See all <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                {section.posts.slice(0, 8).map((post, itemIndex) => (
                  <ImageFirstCard key={post.id || post.slug || `${post.title}-${itemIndex}`} post={post} href={postHref(primaryTask, post, primaryRoute)} />
                ))}
              </div>
            </div>
          </section>
        )
      })}
    </>
  )
}

export function EditableHomeCta() {
  return (
    <section id="get-app" className="bg-[#667089] text-white">
      <div className={`flex flex-col items-center justify-between gap-6 py-16 text-center md:flex-row md:text-left ${container}`}>
        <div>
          <h2 className="editable-display text-4xl font-semibold tracking-[-0.04em]">Ready to be discovered?</h2>
          <p className="mt-3 max-w-2xl text-base leading-7 text-white/84">
            Share a listing or publish an update that helps people find you faster.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-4 md:justify-end">
          <Link href="/create" className="inline-flex items-center gap-2 rounded-md bg-[var(--slot4-cta)] px-8 py-4 text-base font-semibold text-white transition hover:bg-[var(--slot4-cta-strong)]">
            Post your Ad
          </Link>
          <Link href="/contact" className="inline-flex items-center gap-2 rounded-md border border-white/40 px-8 py-4 text-base font-semibold text-white transition hover:bg-white/10">
            Contact us
          </Link>
        </div>
      </div>
    </section>
  )
}
