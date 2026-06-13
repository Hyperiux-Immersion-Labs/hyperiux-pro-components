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

export function applySanityCategorySlugs(effects = [], entries = []) {
  const entryByEffectSlug = new Map(
    normalizeEffectEntries(entries)
      .filter((entry) => entry?.effectSlug && entry?.categorySlug)
      .map((entry) => [entry.effectSlug, entry.categorySlug])
  )

  return effects.map((effect) => {
    const effectSlug = getEffectRouteSlug(effect.effectSlug || effect.slug || effect.name)
    const categorySlug = entryByEffectSlug.get(effectSlug)

    if (!categorySlug) return effect

    return {
      ...effect,
      categorySlug,
    }
  })
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
        effectSlug
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
