import type { Metadata } from 'next'
import { SchemaJsonLd } from '@/components/seo/schema-jsonld'
import { SITE_CONFIG, type TaskKey } from '@/lib/site-config'
import { buildPageMetadata } from '@/lib/seo'
import { fetchHomeTaskFeed, fetchHomeTimeSections, type HomeTimeSection } from '@/lib/task-data'
import { pagesContent } from '@/editable/content/pages.content'
import type { SitePost } from '@/lib/site-connector'
import { EditableHomeCta, EditableHomeHero, EditableMagazineSplit, EditableStoryRail, EditableTimeCollections } from '@/editable/sections/HomeSections'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { Ads } from '@/lib/ads'
import { getMockPostsForTask } from '@/lib/mock-posts'
export const revalidate = 300

const hiddenTasks = new Set(['classified', 'profile'])

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    path: '/',
    title: pagesContent.home.metadata.title,
    description: pagesContent.home.metadata.description,
    openGraphTitle: pagesContent.home.metadata.openGraphTitle,
    openGraphDescription: pagesContent.home.metadata.openGraphDescription,
    image: SITE_CONFIG.defaultOgImage,
    keywords: [...pagesContent.home.metadata.keywords],
  })
}

type TaskFeedItem = { task: (typeof SITE_CONFIG.tasks)[number]; posts: SitePost[] }

function uniquePosts(posts: SitePost[]) {
  return Array.from(new Map(posts.map((post) => [post.slug || post.id || post.title, post])).values())
}

export default async function HomePage() {
  const visibleTasks = SITE_CONFIG.tasks.filter((task) => task.enabled && !hiddenTasks.has(task.key))
  const primaryTask = (visibleTasks[0]?.key || 'article') as TaskKey
  const primaryRoute = SITE_CONFIG.taskViews[primaryTask] || `/${primaryTask}`
  const taskFeed: TaskFeedItem[] = await fetchHomeTaskFeed(12, { timeoutMs: 2500 })
  const visibleFeed = taskFeed.filter(({ task }) => !hiddenTasks.has(task.key))
  const feedPosts = visibleFeed.find(({ task }) => task.key === primaryTask)?.posts || visibleFeed.flatMap(({ posts }) => posts)
  const fallbackPosts = visibleTasks.flatMap((task) => getMockPostsForTask(task.key)).slice(0, 24)
  const primaryPosts = uniquePosts((feedPosts.length ? feedPosts : fallbackPosts)).slice(0, 24)
  const timeSections: HomeTimeSection[] = await fetchHomeTimeSections(primaryTask, { limit: 8, timeoutMs: 2500 })
  const visibleTimeSections = timeSections.filter((section) => !hiddenTasks.has(section.task))
  const baseUrl = SITE_CONFIG.baseUrl.replace(/\/$/, '')

  return (
    <EditableSiteShell>
      <main>
      <SchemaJsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: SITE_CONFIG.name,
          url: baseUrl,
          potentialAction: {
            '@type': 'SearchAction',
            target: `${baseUrl}/search?q={search_term_string}`,
            'query-input': 'required name=search_term_string',
          },
        }}
      />
      <EditableHomeHero primaryTask={primaryTask} primaryRoute={primaryRoute} posts={primaryPosts} timeSections={visibleTimeSections} />
      <div className="mx-auto max-w-6xl px-4 py-6">
  <Ads slot="header" showLabel eager className="mx-auto w-full" />
</div>

      <EditableStoryRail primaryTask={primaryTask} primaryRoute={primaryRoute} posts={primaryPosts} timeSections={visibleTimeSections} />
      <EditableMagazineSplit primaryTask={primaryTask} primaryRoute={primaryRoute} posts={primaryPosts} timeSections={visibleTimeSections} />

      <EditableTimeCollections primaryTask={primaryTask} primaryRoute={primaryRoute} posts={primaryPosts} timeSections={visibleTimeSections} />
      <div className="mx-auto max-w-6xl px-4 py-6">
  <Ads slot="sidebar" showLabel eager className="mx-auto w-full" />
</div>
      <EditableHomeCta />
      </main>
    </EditableSiteShell>
  )
}

