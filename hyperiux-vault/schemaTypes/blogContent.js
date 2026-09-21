import {orderRankField, orderRankOrdering} from '@sanity/orderable-document-list'
import {defineArrayMember, defineField, defineType} from 'sanity'

// Slug fields accept whatever is typed and only normalise it - lowercasing,
// trimming, and collapsing whitespace/punctuation into single hyphens. A
// hand-written slug is kept as written; it is never regenerated from the
// title. Sanity leaves manual input completely untouched by default, which is
// how a trailing space once shipped in a published slug and silently 404'd the
// page - the route matches slug.current exactly.
function slugify(input) {
  return String(input || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 96)
}

// Catches anything that reached the field without going through slugify -
// pasted values, imports, or documents written straight through the API.
function isCleanSlug(value) {
  const current = value?.current

  if (!current) return 'Required'
  if (current !== current.trim()) return 'Cannot start or end with a space'
  if (current !== slugify(current)) {
    return `Use lowercase letters, numbers and hyphens only - e.g. "${slugify(current)}"`
  }

  return true
}

// Shared by every slug field below: Generate still fills from the title, and
// anything typed by hand is kept, just normalised.
const slugOptions = {source: 'title', slugify, maxLength: 96}


const blogCodeBlock = defineType({
  name: 'blogCodeBlock',
  title: 'Code Block',
  type: 'object',
  fields: [
    defineField({
      name: 'code',
      title: 'Code',
      type: 'text',
      rows: 16,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'language',
      title: 'Language',
      description:
        'Used for syntax highlighting only. Pick whatever the snippet actually is - leave it empty and the highlighter auto-detects.',
      type: 'string',
      options: {
        list: [
          {title: 'JavaScript', value: 'javascript'},
          {title: 'JSX', value: 'jsx'},
          {title: 'TypeScript', value: 'typescript'},
          {title: 'TSX', value: 'tsx'},
          {title: 'CSS', value: 'css'},
          {title: 'HTML', value: 'xml'},
          {title: 'JSON', value: 'json'},
          {title: 'Shell', value: 'bash'},
          {title: 'GLSL / WebGL shader', value: 'glsl'},
          {title: 'Plain text', value: 'plaintext'},
        ],
      },
    }),
    defineField({
      name: 'filename',
      title: 'Filename',
      description: 'Optional. Leave empty for a bare code block with no header.',
      type: 'string',
    }),
  ],
  preview: {
    select: {
      title: 'filename',
      subtitle: 'language',
    },
    prepare({title, subtitle}) {
      return {
        title: title || 'Code block',
        subtitle: subtitle || 'code',
      }
    },
  },
})

// Mirrors effectBody, with blogCodeBlock in place of effectCodeBlock. Kept as
// its own type so changes to the blog editor never reach the effect pages.
const blogBody = defineType({
  name: 'blogBody',
  title: 'Body',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      styles: [
        {title: 'Normal', value: 'normal'},
        {title: 'H2', value: 'h2'},
        {title: 'H3', value: 'h3'},
        {title: 'Quote', value: 'blockquote'},
      ],
      lists: [
        {title: 'Bullet', value: 'bullet'},
        {title: 'Numbered', value: 'number'},
      ],
      marks: {
        decorators: [
          {title: 'Strong', value: 'strong'},
          {title: 'Emphasis', value: 'em'},
          {title: 'Code', value: 'code'},
        ],
        annotations: [
          {
            name: 'link',
            title: 'Link',
            type: 'object',
            fields: [defineField({name: 'href', title: 'URL', type: 'url'})],
          },
        ],
      },
    }),
    defineArrayMember({type: 'effectImage'}),
    defineArrayMember({type: 'blogCodeBlock'}),
    // Legacy. Posts written before blogCodeBlock existed still hold
    // effectCodeBlock entries, and the Portable Text editor stops rendering an
    // array at the first block whose type the schema disallows - which hid the
    // rest of a 113-block body in Studio. Kept allowed so those documents stay
    // editable. Note BlogBodyRenderer routes it through BlogCodeBlock anyway,
    // so no blog post shows the JS/TS toggle regardless of which type a block
    // is stored as. Drop this member once no blogPost holds one:
    //   *[_type == "blogPost" && count(body[_type == "effectCodeBlock"]) > 0]
    defineArrayMember({type: 'effectCodeBlock'}),
    defineArrayMember({type: 'effectTableBlock'}),
    defineArrayMember({type: 'effectCalloutBlock'}),
    defineArrayMember({type: 'horizontalRule'}),
    defineArrayMember({type: 'effectFaqAccordion'}),
  ],
})

const author = defineType({
  name: 'blogAuthor',
  title: 'Author',
  type: 'document',
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
      subtitle: 'role',
      media: 'avatar',
    },
  },
})

const category = defineType({
  name: 'blogCategory',
  title: 'Category',
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
      description:
        'Type one directly, or click Generate to build it from the title. Either way it is normalised to lowercase-and-hyphens.',
      type: 'slug',
      options: slugOptions,
      validation: (rule) => rule.required().custom(isCleanSlug),
    }),
  ],
  preview: {
    select: {
      title: 'title',
    },
  },
})

const tag = defineType({
  name: 'blogTag',
  title: 'Tag',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'name',
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
      description:
        'Type one directly, or click Generate to build it from the title. Either way it is normalised to lowercase-and-hyphens.',
      type: 'slug',
      options: slugOptions,
      validation: (rule) => rule.required().custom(isCleanSlug),
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
      type: 'reference',
      to: [{type: 'blogAuthor'}],
      initialValue: {_type: 'reference', _ref: 'blogAuthor.hitesh-bhardwaj'},
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
      of: [defineArrayMember({type: 'reference', to: [{type: 'blogTag'}]})],
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
      type: 'blogBody',
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

export const blogContentSchemaTypes = [blogCodeBlock, blogBody, author, category, tag, blogPost]
