import {createClient} from '@sanity/client'
import { getEffectContent, effectContent } from './effect-content'

const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const API_VERSION = '2024-01-01'

const CATEGORY_SLUG_ALIASES = {
  'text-animations': ['text-animations', 'text-effects'],
  'text-effects': ['text-effects', 'text-animations'],
  loaders: ['loaders', 'website-loaders'],
  'website-loaders': ['website-loaders', 'loaders'],
  'website-loader': ['website-loader', 'loaders', 'website-loaders'],
  'webgl-effects': ['webgl-effects', 'webgl'],
  webgl: ['webgl', 'webgl-effects'],
  transitions: ['transitions', 'page-transitions'],
  'page-transitions': ['page-transitions', 'transitions'],
  scroll: ['scroll', 'scroll-effects', 'scroll-animations'],
  'scroll-effects': ['scroll-effects', 'scroll', 'scroll-animations'],
  'scroll-animations': ['scroll-animations', 'scroll-effects', 'scroll'],
  cursor: ['cursor', 'cursor-effects'],
  'cursor-effects': ['cursor-effects', 'cursor'],
}

function getCategorySlugCandidates(categorySlug) {
  return [
    ...(CATEGORY_SLUG_ALIASES[categorySlug] || [categorySlug]),
  ].filter((slug, index, slugs) => slug && slugs.indexOf(slug) === index)
}

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

function getLocalEffectEntries() {
  return Object.entries(effectContent).flatMap(([categorySlug, effects]) =>
    Object.keys(effects).map((effectSlug) => ({
      categorySlug,
      effectSlug,
    }))
  )
}

function getLocalEffectContent(categorySlugs, effectSlug) {
  for (const slug of categorySlugs) {
    const content = getEffectContent(slug, effectSlug)

    if (content) return content
  }

  for (const slug of Object.keys(effectContent)) {
    const content = getEffectContent(slug, effectSlug)

    if (content) return content
  }

  return null
}

export function applySanityCategorySlugs(effects = [], entries = []) {
  const entryByEffectSlug = new Map(
    entries
      .filter((entry) => entry?.effectSlug && entry?.categorySlug)
      .map((entry) => [entry.effectSlug, entry.categorySlug])
  )

  return effects.map((effect) => {
    const effectSlug = effect.effectSlug || effect.slug || effect.name
    const categorySlug = entryByEffectSlug.get(effectSlug)

    if (!categorySlug) return effect

    return {
      ...effect,
      categorySlug,
    }
  })
}

export async function getSanityEffectContent(categorySlug, effectSlug) {
  const categorySlugs = getCategorySlugCandidates(categorySlug)

  if (!isSanityConfigured()) {
    return getLocalEffectContent(categorySlugs, effectSlug)
  }

  try {
    const client = getSanityClient()

    const content = await client.fetch(
      `*[_type == "effectContent" && categorySlug in $categorySlugs && effectSlug == $effectSlug][0]`,
      {categorySlugs, effectSlug}
    )

    if (content) return content

    return await client.fetch(
      `*[_type == "effectContent" && effectSlug == $effectSlug][0]`,
      {effectSlug}
    )
  } catch (error) {
    console.warn(
      `Falling back to local effect content for ${categorySlug}/${effectSlug}:`,
      error?.message || error
    )

    return getLocalEffectContent(categorySlugs, effectSlug)
  }
}

export async function getAllSanityEffectEntries() {
  if (!isSanityConfigured()) {
    return getLocalEffectEntries()
  }

  try {
    const client = getSanityClient()

    return await client.fetch(
      `*[_type == "effectContent" && defined(categorySlug) && defined(effectSlug)][]{
        categorySlug,
        effectSlug
      }`
    )
  } catch (error) {
    console.warn(
      'Falling back to local effect entries because Sanity could not be reached:',
      error?.message || error
    )

    return getLocalEffectEntries()
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
//   body: PortableText-like array with text blocks plus custom objects:
//     effectImage, effectCodeBlock, effectTableBlock, effectCalloutBlock
// }
