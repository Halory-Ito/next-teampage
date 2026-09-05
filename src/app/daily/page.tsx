'use client'
import ChromaGrid, { ChromaItem } from '@/components/ChromaGrid'
import { blocks } from '@/data/daily/blocks'

export default function DailyPage() {
  const items: ChromaItem[] = blocks.map((block) => ({
    image: block.cover,
    title: block.name,
    borderColor: '',
    gradient: '',
    url: `/daily/${block.id}`,
    subtitle: block.description,
  }))
  return (
    <div className="mx-auto flex min-h-[calc(100dvh-8rem)] w-full max-w-3xl items-center justify-center">
      <ChromaGrid items={items} radius={300} damping={0.45} fadeOut={0.6} ease="power3.out" />
    </div>
  )
}
