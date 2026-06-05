import {createClient} from '@sanity/client'
import { getEffectContent, effectContent } from './effect-content'

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

function getLocalEffectEntries() {
  return Object.entries(effectContent).flatMap(([categorySlug, effects]) =>
    Object.keys(effects).map((effectSlug) => ({
      categorySlug,
      effectSlug,
    }))
  )
}

export async function getSanityEffectContent(categorySlug, effectSlug) {
  if (!isSanityConfigured()) {
    return getEffectContent(categorySlug, effectSlug)
  }

  try {
    const client = getSanityClient()

    return await client.fetch(
      `*[_type == "effectContent" && categorySlug == $categorySlug && effectSlug == $effectSlug][0]`,
      {categorySlug, effectSlug}
    )
  } catch (error) {
    console.warn(
      `Falling back to local effect content for ${categorySlug}/${effectSlug}:`,
      error?.message || error
    )

    return getEffectContent(categorySlug, effectSlug)
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
