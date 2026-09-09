import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {orderableDocumentListDeskItem} from '@sanity/orderable-document-list'
import {schemaTypes} from './schemaTypes/index.js'

export default defineConfig({
  name: 'default',
  title: 'hyperiux vault',

  projectId: 'qrtsgg7p',
  dataset: 'production',

  plugins: [
    structureTool({
      structure: (S, context) =>
        S.list()
          .title('Content')
          .items([
            orderableDocumentListDeskItem({
              type: 'effectContent',
              title: 'Effect Content',
              S,
              context,
            }),
            orderableDocumentListDeskItem({
              type: 'blogPost',
              title: 'Blog Posts',
              S,
              context,
            }),
            ...S.documentTypeListItems().filter(
              (item) => !['effectContent', 'blogPost'].includes(item.getId())
            ),
          ]),
    }),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
  },
})
