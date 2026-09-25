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
    // Published documents only. With a token and this apiVersion the default
    // perspective is "raw", which also returns drafts - any unpublished
    // Studio edit then shows up as a duplicate effect card on the live site.
    perspective: 'published',
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

    if (!content) return null

    // jsxCode/tsxCode hold the full effect source. This content object is
    // handed to the client component (and serialized into the RSC payload
    // for every visitor), so the source is dropped here - it's only ever
    // served through /api/effects/[slug]/copy after access + limit checks.
    const { jsxCode, tsxCode, ...pageContent } = content
    return pageContent
  } catch (error) {
    console.warn(
      `Sanity effect content could not be loaded for ${categorySlug}/${effectSlug}`,
      error?.message || error
    )

    return null
  }
}

// Full component source for the effect page's "Copy code" dropdown. Server
// only - call it after the access/limit checks in /api/effects/[slug]/copy.
// Published documents only (drafts may hold unreviewed code), regardless of
// whether the client's token could otherwise see drafts.
export async function getSanityEffectSource(effectSlug) {
  if (!isSanityConfigured()) return null

  const client = getSanityClient()
  const effectSlugs = getEffectSlugAliases(effectSlug)

  return client.fetch(
    `*[_type == "effectContent" && effectSlug in $effectSlugs && !(_id in path("drafts.**"))][0]{
      tier,
      jsxCode,
      tsxCode
    }`,
    {effectSlugs}
  )
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
