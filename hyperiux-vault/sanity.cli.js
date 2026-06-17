import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: 'qrtsgg7p',
    dataset: 'production'
  },
  deployment: {
    appId: 'br8l6a6ucf3dbi2mdh8n76vd',
    /**
     * Enable auto-updates for studios.
     * Learn more at https://www.sanity.io/docs/studio/latest-version-of-sanity#k47faf43faf56
     */
    autoUpdates: true,
  }
})
