import { ArrowLeft } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { blocks } from '@/data/daily/blocks'
import { getBlockGalleries } from '@/data/daily/galleries'
import DailyGalleryGrid from '@/features/daily/components/daily-gallery-grid'

type PageProps = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const block = blocks.find((b) => b.id === id)
  return {
    title: block ? block.name : '动态板块',
  }
}

export default async function DailyBlockPage({ params }: PageProps) {
  const { id } = await params
  const block = blocks.find((b) => b.id === id)
  if (!block) notFound()

  const galleries = getBlockGalleries(id)

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <header className="flex flex-col">
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              nativeButton={false}
              className=" text-muted-foreground"
              render={<Link href="/daily" aria-label="返回全部板块" />}
            >
              <ArrowLeft aria-hidden="true" />
            </Button>
            <h1 className="font-heading text-2xl font-medium">{block.name}</h1>
          </div>
          <span className="text-sm text-muted-foreground">共 {galleries.length} 个相册</span>
        </div>
        {block.description && block.description !== block.name && (
          <p className="text-sm text-muted-foreground">{block.description}</p>
        )}
      </header>

      <DailyGalleryGrid galleries={galleries} />
    </div>
  )
}
