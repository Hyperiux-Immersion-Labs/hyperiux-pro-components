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
      tags: sanity.tags?.length ? sanity.tags : (effect.tags || []),
      addedAt: sanity.addedAt ? new Date(sanity.addedAt).getTime() : effect.addedAt,
      // Derive coverImage/videoUrl from effectSlug if not explicitly set in Sanity
      coverImage: sanity.coverImage || effectSlug,
      videoUrl: sanity.videoUrl || `${effectSlug}.mp4`,
      previewUrl: sanity.previewUrl || effect.previewUrl,
    }
  })
}

// Keep old name as alias so any other callers don't break during transition
export const applySanityCategorySlugs = mergeRegistryWithSanity

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
      tags: entry.tags || [],
      addedAt: entry.addedAt ? new Date(entry.addedAt).getTime() : null,
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
      `*[_type == "effectContent" && categorySlug in $categorySlugs && effectSlug in $effectSlugs][0]`,
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
      `*[_type == "effectContent" && defined(categorySlug) && defined(effectSlug)][]{
        categorySlug,
        effectSlug,
        title,
        summary,
        tier,
        tags,
        addedAt,
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
