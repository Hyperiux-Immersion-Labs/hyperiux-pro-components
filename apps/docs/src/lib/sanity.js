import {createClient} from '@sanity/client'
import { getEffectCategoryBySlug, getEffectCategorySlugAliases } from './categories'
import { getEffectRouteSlug, getEffectSlugAliases } from './effect-slugs'

const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const API_VERSION = '2024-01-01'

export function isSanityConfigured() {
  return Boolean(PROJECT_ID)
}

function getSanityClient() {
  if (!PROJECT_ID) {
    throw new Error('NEXT_PUBLIC_SANITY_PROJECT_ID is not set.')
  }

  return createClient({
    projectId: PROJECT_ID,
    dataset: DATASET,
    apiVersion: API_VERSION,
    useCdn: process.env.NODE_ENV === 'production',
    token: process.env.SANITY_API_TOKEN,
  })
}

function normalizeEffectEntries(entries = []) {
  return entries.map((entry) => {
    const category = getEffectCategoryBySlug(entry.categorySlug)

    return {
      ...entry,
      categorySlug: category?.slug || entry.categorySlug,
      effectSlug: getEffectRouteSlug(entry.effectSlug),
    }
  })
}

export function mergeRegistryWithSanity(effects = [], entries = []) {
  const sanityBySlug = new Map(
    normalizeEffectEntries(entries)
      .filter((entry) => entry?.effectSlug)
      .map((entry) => [entry.effectSlug, entry])
  )

  return effects.map((effect) => {
    const effectSlug = getEffectRouteSlug(effect.effectSlug || effect.slug || effect.name)
    const sanity = sanityBySlug.get(effectSlug)

    if (!sanity) return effect

    return {
      ...effect,
      // Sanity wins for all display fields
      title: sanity.title || effect.title,
      description: sanity.summary || effect.description,
      categorySlug: sanity.categorySlug,
      tier: sanity.tier || effect.tier || 'pro',
      isFeatured: sanity.isFeatured === true,
      orderRank: sanity.orderRank || effect.orderRank,
      tags: sanity.tags?.length ? sanity.tags : (effect.tags || []),
      addedAt: sanity.addedAt ? new Date(sanity.addedAt).getTime() : effect.addedAt,
      lastUpdated: sanity.lastUpdated
        ? new Date(sanity.lastUpdated).getTime()
        : sanity.updatedAt
          ? new Date(sanity.updatedAt).getTime()
          : sanity._updatedAt
            ? new Date(sanity._updatedAt).getTime()
            : effect.lastUpdated ?? effect.updatedAt,
      // Derive coverImage/videoUrl from effectSlug if not explicitly set in Sanity
      coverImage: sanity.coverImage || effectSlug,
      videoUrl: sanity.videoUrl || `${effectSlug}.mp4`,
      previewUrl: sanity.previewUrl || effect.previewUrl,
    }
  })
}

// Keep old name as alias so any other callers don't break during transition
export const applySanityCategorySlugs = mergeRegistryWithSanity

export function buildRegistryIndex(entries = []) {
  return normalizeEffectEntries(entries)
    .filter((entry) => entry?.effectSlug && entry?.categorySlug)
    .map((entry) => ({
      name: entry.effectSlug,
      slug: entry.effectSlug,
      effectSlug: entry.effectSlug,
      title: entry.title || entry.effectSlug,
      description: entry.summary || '',
      categories: [entry.categorySlug],
      categorySlug: entry.categorySlug,
      tier: entry.tier || 'pro',
      isFeatured: entry.isFeatured === true,
      orderRank: entry.orderRank || null,
      tags: entry.tags || [],
      addedAt: entry.addedAt ? new Date(entry.addedAt).getTime() : null,
      lastUpdated: entry.lastUpdated
        ? new Date(entry.lastUpdated).getTime()
        : entry.updatedAt
          ? new Date(entry.updatedAt).getTime()
          : entry._updatedAt
            ? new Date(entry._updatedAt).getTime()
            : null,
    }))
}

export function buildEffectsFromSanity(entries = []) {
  return normalizeEffectEntries(entries)
    .filter((entry) => entry?.effectSlug && entry?.categorySlug)
    .map((entry) => ({
      name: entry.effectSlug,
      slug: entry.effectSlug,
      effectSlug: entry.effectSlug,
      title: entry.title || entry.effectSlug,
      description: entry.summary || '',
      categories: [entry.categorySlug],
      categorySlug: entry.categorySlug,
      tier: entry.tier || 'pro',
      isFeatured: entry.isFeatured === true,
      orderRank: entry.orderRank || null,
      tags: entry.tags || [],
      addedAt: entry.addedAt ? new Date(entry.addedAt).getTime() : null,
      lastUpdated: entry.lastUpdated
        ? new Date(entry.lastUpdated).getTime()
        : entry.updatedAt
          ? new Date(entry.updatedAt).getTime()
          : entry._updatedAt
            ? new Date(entry._updatedAt).getTime()
            : null,
      coverImage: entry.coverImage || entry.effectSlug,
      videoUrl: entry.videoUrl || `${entry.effectSlug}.mp4`,
      previewUrl: entry.previewUrl || null,
    }))
}

export function getEffectsByCategoryFromSanity(entries = []) {
  const categories = {}
  for (const effect of buildEffectsFromSanity(entries)) {
    const cat = getEffectCategoryBySlug(effect.categorySlug)?.id || effect.categorySlug || 'other'
    if (!categories[cat]) categories[cat] = []
    categories[cat].push(effect)
  }
  return categories
}

function getCategorySlugAliases(categorySlug) {
  return getEffectCategorySlugAliases(categorySlug)
}

export async function getSanityEffectContent(categorySlug, effectSlug) {
  if (!isSanityConfigured()) {
    console.warn('Sanity is not configured. Effect content cannot be loaded.')
    return null
  }

  try {
    const client = getSanityClient()
    const categorySlugs = getCategorySlugAliases(categorySlug)
    const effectSlugs = getEffectSlugAliases(effectSlug)

    const content = await client.fetch(
      `*[_type == "effectContent" && categorySlug in $categorySlugs && effectSlug in $effectSlugs][0]{
        ...,
        addedAt,
        updatedAt,
        lastUpdated,
        _updatedAt
      }`,
      {categorySlugs, effectSlugs}
    )

    return content || null
  } catch (error) {
    console.warn(
      `Sanity effect content could not be loaded for ${categorySlug}/${effectSlug}`,
      error?.message || error
    )

    return null
  }
}

export async function getAllSanityEffectEntries() {
  if (!isSanityConfigured()) {
    console.warn('Sanity is not configured. No effect detail pages will be pre-rendered.')
    return []
  }

  try {
    const client = getSanityClient()

    const entries = await client.fetch(
      `*[_type == "effectContent" && defined(categorySlug) && defined(effectSlug)]
        | order(orderRank asc, addedAt desc, _createdAt asc){
        categorySlug,
        effectSlug,
        title,
        summary,
        tier,
        isFeatured,
        orderRank,
        tags,
        addedAt,
        lastUpdated,
        updatedAt,
        _updatedAt,
        coverImage,
        videoUrl,
        previewUrl
      }`
    )

    return normalizeEffectEntries(entries)
  } catch (error) {
    console.warn(
      'Sanity effect entries could not be loaded:',
      error?.message || error
    )

    return []
  }
}

// --- Blog ---
// Same pattern as getSanityEffectContent/getAllSanityEffectEntries above:
// never throws, falls back to null/[] with a console.warn so a Sanity outage
// degrades the blog rather than breaking the build/page.

export async function getSanityBlogPost(slug) {
  if (!isSanityConfigured()) {
    console.warn('Sanity is not configured. Blog post cannot be loaded.')
    return null
  }

  try {
    const client = getSanityClient()

    const post = await client.fetch(
      `*[_type == "blogPost" && slug.current == $slug][0]{
        ...,
        slug,
        "author": select(defined(author._ref) => author->{name, role, avatar}, author),
        categories[]->{title, "slug": slug.current},
        "tags": tags[]->name,
      }`,
      {slug}
    )

    return post || null
  } catch (error) {
    console.warn(`Sanity blog post could not be loaded for ${slug}`, error?.message || error)

    return null
  }
}

// Slugs only, for generateStaticParams at build time - at 100-200+ posts
// there's no reason to pull title/summary/coverImage/etc for every post just
// to read its slug, so this stays a separate, minimal query from the
// paginated listing query below.
export async function getAllSanityBlogSlugs() {
  if (!isSanityConfigured()) {
    console.warn('Sanity is not configured. No blog pages will be pre-rendered.')
    return []
  }

  try {
    const client = getSanityClient()

    const entries = await client.fetch(
      `*[_type == "blogPost" && defined(slug.current)]{"slug": slug.current}`
    )

    return entries || []
  } catch (error) {
    console.warn('Sanity blog slugs could not be loaded:', error?.message || error)

    return []
  }
}

const BLOG_LISTING_PROJECTION = `{
  "slug": slug.current,
  title,
  summary,
  coverImage,
  "author": select(defined(author._ref) => author->{name, role, avatar}, author),
  categories[]->{title, "slug": slug.current},
  "tags": tags[]->name,
  isFeatured,
  orderRank,
  publishedAt,
  updatedAt
}`

// Server-side paginated + filtered listing query - the page a viewer is on
// determines exactly which posts get fetched and sent down, rather than
// pulling every post and slicing/filtering in the browser. Scales to
// hundreds of posts without the listing payload growing with them.
export async function getSanityBlogEntries({category, page = 1, pageSize = 9} = {}) {
  if (!isSanityConfigured()) {
    console.warn('Sanity is not configured. No blog entries can be loaded.')
    return {posts: [], total: 0}
  }

  const safePage = Math.max(1, Number(page) || 1)
  const start = (safePage - 1) * pageSize
  const end = start + pageSize
  const categoryFilter = category ? ` && $category in categories[]->slug.current` : ''

  try {
    const client = getSanityClient()

    const result = await client.fetch(
      `{
        "total": count(*[_type == "blogPost" && defined(slug.current)${categoryFilter}]),
        "posts": *[_type == "blogPost" && defined(slug.current)${categoryFilter}]
          | order(orderRank asc, publishedAt desc, _createdAt desc, _id asc) [$start...$end] ${BLOG_LISTING_PROJECTION}
      }`,
      {category: category || null, start, end}
    )

    return {posts: result?.posts || [], total: result?.total || 0}
  } catch (error) {
    console.warn('Sanity blog entries could not be loaded:', error?.message || error)

    return {posts: [], total: 0}
  }
}

// Single featured post for the listing hero - kept as its own small query
// rather than derived from a full-list fetch.
export async function getSanityFeaturedBlogPost() {
  if (!isSanityConfigured()) return null

  try {
    const client = getSanityClient()

    return (
      (await client.fetch(
        `*[_type == "blogPost" && defined(slug.current) && isFeatured == true]
          | order(orderRank asc, publishedAt desc)[0] ${BLOG_LISTING_PROJECTION}`
      )) || null
    )
  } catch (error) {
    console.warn('Sanity featured blog post could not be loaded:', error?.message || error)

    return null
  }
}

// Up to 3 other posts sharing a category with the given post, newest first.
// Falls back to the most recent other posts when it has none/no categories,
// so the "Related Blogs" section is never empty as long as other posts exist.
// Takes the current post's slug as a plain string (not the post object) -
// getSanityBlogPost's own `post.slug` is Sanity's raw slug *object*
// ({current, _type}), and comparing that against slug.current in GROQ would
// silently never match, defeating the "exclude the current post" filter.
export async function getRelatedBlogPosts(currentSlug, post, limit = 3) {
  if (!isSanityConfigured() || !currentSlug) return []

  const categorySlugs = (post?.categories || []).map((category) => category.slug).filter(Boolean)

  try {
    const client = getSanityClient()

    const related = await client.fetch(
      `*[_type == "blogPost" && defined(slug.current) && slug.current != $slug
          && count((categories[]->slug.current)[@ in $categorySlugs]) > 0]
        | order(publishedAt desc)[0...$limit] ${BLOG_LISTING_PROJECTION}`,
      {slug: currentSlug, categorySlugs, limit}
    )

    if (related?.length >= limit || categorySlugs.length === 0) {
      return related || []
    }

    // Fewer matches than `limit` - top up with the most recent other posts,
    // skipping ones already included.
    const excludeSlugs = [currentSlug, ...related.map((item) => item.slug)]
    const fallback = await client.fetch(
      `*[_type == "blogPost" && defined(slug.current) && !(slug.current in $excludeSlugs)]
        | order(publishedAt desc)[0...$fallbackLimit] ${BLOG_LISTING_PROJECTION}`,
      {excludeSlugs, fallbackLimit: limit - related.length}
    )

    return [...related, ...(fallback || [])]
  } catch (error) {
    console.warn('Sanity related blog posts could not be loaded:', error?.message || error)

    return []
  }
}

export async function getAllSanityBlogCategories() {
  if (!isSanityConfigured()) return []

  try {
    const client = getSanityClient()

    return (
      (await client.fetch(
        `*[_type == "blogCategory"] | order(title asc){title, "slug": slug.current}`
      )) || []
    )
  } catch (error) {
    console.warn('Sanity blog categories could not be loaded:', error?.message || error)

    return []
  }
}

// Sanity shape used by the docs app:
// {
//   categorySlug: string,
//   effectSlug: string,
//   title: string,
//   summary: string,
//   addedAt?: string,
//   lastUpdated?: string,
//   updatedAt?: string,
//   seo: {
//     title: string,
//     description: string,
//     primaryKeyword?: string,
//     secondaryKeywords?: string[],
//   },
//   relatedEffectNames?: string[],
//   ctaBanner?: {
//     heading: string,
//     buttonText: string,
//     buttonLink: string,
//   },
//   body: PortableText-like array with text blocks plus custom objects:
//     effectImage, effectCodeBlock, effectTableBlock, effectCalloutBlock,
//     horizontalRule, effectFaqAccordion
// }
