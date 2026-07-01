import { slot4BrandConfig } from '@/editable/theme/brand.config'

export const globalContent = {
  site: {
    name: slot4BrandConfig.siteName,
    tagline: slot4BrandConfig.tagline || 'Local discovery for modern business owners',
    domain: slot4BrandConfig.domain,
    baseUrl: slot4BrandConfig.baseUrl,
  },
  nav: {
    tagline: 'Local discovery for modern business owners',
    utilityLinks: [
      { label: 'Favourites', href: '/search' },
      { label: 'My Account', href: '/login' },
      { label: 'Help', href: '/contact' },
    ],
    primaryLinks: [
      { label: 'Listings', href: '/listings' },
      { label: 'Articles', href: '/articles' },
    ],
    actions: {
      primary: { label: 'Post your ad', href: '/create' },
      secondary: { label: 'Contact', href: '/contact' },
    },
  },
  footer: {
    tagline: 'Business listings, articles, and practical local discovery',
    description:
      'Browse opportunities, showcase your business, and keep useful local information within easy reach.',
    columns: [
      {
        title: 'Explore',
        links: [
          { label: 'Articles', href: '/articles' },
          { label: 'Search', href: '/search' },
        ],
      },
      {
        title: 'Support',
        links: [
          { label: 'About', href: '/about' },
          { label: 'Contact', href: '/contact' },
          { label: 'Create Post', href: '/create' },
        ],
      },
    ],
    bottomNote: 'Built for clean discovery, practical browsing, and polished presentation.',
  },
  commonLabels: {
    readMore: 'Read more',
    viewAll: 'View all',
    explore: 'Explore',
    latest: 'Latest',
    related: 'Related',
    published: 'Published',
  },
} as const
