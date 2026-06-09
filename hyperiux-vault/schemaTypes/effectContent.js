import {defineArrayMember, defineField, defineType} from 'sanity'

const seo = defineType({
  name: 'effectSeo',
  title: 'SEO',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'SEO Title',
      type: 'string',
      validation: (rule) => rule.required().max(100),
    }),
    defineField({
      name: 'description',
      title: 'SEO Description',
      type: 'text',
      rows: 4,
      validation: (rule) => rule.required().max(370),
    }),
    defineField({
      name: 'primaryKeyword',
      title: 'Primary Keyword',
      type: 'string',
    }),
    defineField({
      name: 'secondaryKeywords',
      title: 'Secondary Keywords',
      type: 'array',
      of: [defineArrayMember({type: 'string'})],
    }),
  ],
})

const effectImage = defineType({
  name: 'effectImage',
  title: 'Image',
  type: 'object',
  fields: [
    defineField({
      name: 'url',
      title: 'Image URL',
      type: 'url',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'alt',
      title: 'Alt Text',
      type: 'string',
    }),
    defineField({
      name: 'caption',
      title: 'Caption',
      type: 'string',
    }),
  ],
  preview: {
    select: {
      title: 'caption',
      subtitle: 'url',
    },
    prepare({title, subtitle}) {
      return {
        title: title || 'Image',
        subtitle,
      }
    },
  },
})

const codeBlock = defineType({
  name: 'effectCodeBlock',
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
      type: 'string',
      initialValue: 'jsx',
    }),
    defineField({
      name: 'filename',
      title: 'Filename',
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

const tableRow = defineType({
  name: 'effectTableRow',
  title: 'Table Row',
  type: 'object',
  fields: [
    defineField({
      name: 'cells',
      title: 'Cells',
      type: 'array',
      of: [defineArrayMember({type: 'string'})],
      validation: (rule) => rule.required().min(1),
    }),
  ],
})

const tableBlock = defineType({
  name: 'effectTableBlock',
  title: 'Table',
  type: 'object',
  fields: [
    defineField({
      name: 'caption',
      title: 'Caption',
      type: 'string',
    }),
    defineField({
      name: 'headers',
      title: 'Headers',
      type: 'array',
      of: [defineArrayMember({type: 'string'})],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: 'rows',
      title: 'Rows',
      type: 'array',
      of: [defineArrayMember({type: 'effectTableRow'})],
      validation: (rule) => rule.required().min(1),
    }),
  ],
})

const calloutBlock = defineType({
  name: 'effectCalloutBlock',
  title: 'Boxed Block',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
    }),
    defineField({
      name: 'tone',
      title: 'Tone',
      type: 'string',
      initialValue: 'default',
      options: {
        list: [
          {title: 'Default', value: 'default'},
          {title: 'Info', value: 'info'},
          {title: 'Warning', value: 'warning'},
          {title: 'Success', value: 'success'},
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'content',
      title: 'Content',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [],
          lists: [{title: 'Bullet', value: 'bullet'}],
          marks: {
            decorators: [{title: 'Strong', value: 'strong'}, {title: 'Emphasis', value: 'em'}],
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
        defineArrayMember({type: 'effectCodeBlock'}),
        defineArrayMember({type: 'effectImage'}),
      ],
      validation: (rule) => rule.required().min(1),
    }),
  ],
})

const bodyBlock = defineType({
  name: 'effectBody',
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
    defineArrayMember({type: 'effectCodeBlock'}),
    defineArrayMember({type: 'effectTableBlock'}),
    defineArrayMember({type: 'effectCalloutBlock'}),
  ],
})

export const effectContent = defineType({
  name: 'effectContent',
  title: 'Effect Content',
  type: 'document',
  fields: [
    defineField({
      name: 'categorySlug',
      title: 'Category Slug',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'effectSlug',
      title: 'Effect Slug',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'title',
      title: 'Page Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'summary',
      title: 'Page Summary',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'effectBody',
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: 'relatedEffectNames',
      title: 'Related Effect Names',
      type: 'array',
      of: [defineArrayMember({type: 'string'})],
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
      categorySlug: 'categorySlug',
      effectSlug: 'effectSlug',
    },
    prepare({title, categorySlug, effectSlug}) {
      return {
        title,
        subtitle: [categorySlug, effectSlug].filter(Boolean).join(' / '),
      }
    },
  },
})

export const effectContentSchemaTypes = [
  seo,
  effectImage,
  codeBlock,
  tableRow,
  tableBlock,
  calloutBlock,
  bodyBlock,
  effectContent,
]
