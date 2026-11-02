// Built using Hyperiux Vault: https://vault.hyperiux.com
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Page not found | Oris Dental',
  description: 'This page slipped through the gaps. Head back to the Oris Dental home page.',
}

// Any URL the template doesn't know lands here and shows ../not-found.tsx
const page = () => notFound()

export default page
