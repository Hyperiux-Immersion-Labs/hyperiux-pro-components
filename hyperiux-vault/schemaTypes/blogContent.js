import {orderRankField, orderRankOrdering} from '@sanity/orderable-document-list'
import {defineArrayMember, defineField, defineType} from 'sanity'

// Reuses effectContent.js's already-generic object types (effectImage,
// effectCodeBlock, effectTableBlock, effectCalloutBlock, horizontalRule,
// effectFaqAccordion, effectBody, effectCtaBanner, effectSeo) rather than
// redefining parallel blog-prefixed copies - nothing about those types is
// effect-specific, so a blogPost's body/coverImage/ctaBanner/seo fields just
// point `type:` at the same names. Only truly new types live here.

const author = defineType({
  name: 'blogAuthor',
  title: 'Author',
  type: 'object',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'role',
      title: 'Role',
      description: 'Shown under the name, e.g. "Content Writer at Hyperiux"',
      type: 'string',
    }),
    defineField({
      name: 'avatar',
      title: 'Avatar',
      type: 'effectImage',
    }),
  ],
  preview: {
    select: {
      title: 'name',
    },
  },
})

const category = defineType({
  name: 'blogCategory',
  title: 'Blog Category',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'title'},
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'title',
    },
  },
})

export const blogPost = defineType({
  name: 'blogPost',
  title: 'Blog Post',
  type: 'document',
  orderings: [orderRankOrdering],
  fields: [
    orderRankField({type: 'blogPost'}),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'title'},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'summary',
      title: 'Summary',
      description: 'Shown on the listing page and as the fallback SEO description.',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover Image',
      type: 'effectImage',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'blogAuthor',
    }),
    defineField({
      name: 'categories',
      title: 'Categories',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'blogCategory'}]})],
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [defineArrayMember({type: 'string'})],
    }),
    defineField({
      name: 'isFeatured',
      title: 'Featured',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'updatedAt',
      title: 'Updated At',
      type: 'datetime',
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'effectBody',
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: 'ctaBanner',
      title: 'CTA Section',
      type: 'effectCtaBanner',
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'effectSeo',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'slug.current',
    },
  },
})

export const blogContentSchemaTypes = [author, category, blogPost]
