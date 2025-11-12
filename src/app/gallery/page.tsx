import { Metadata } from 'next'
import GalleryClient from './GalleryClient'

export const metadata: Metadata = {
  title: 'Gallery | GLITZFUSION',
  description: 'Explore our creative journey through stunning visuals, behind-the-scenes moments, and artistic expressions that showcase the magic of GLITZFUSION.',
}

export default function GalleryPage() {
  return <GalleryClient />
}
