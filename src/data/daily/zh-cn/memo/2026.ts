import { DailyGallery } from '@/types/daily'

/** 示例相册图片使用 picsum.photos 网图（seed 固定，URL 稳定可复现） */
const img = (seed: string, w = 1200, h = 800) => `https://picsum.photos/seed/${seed}/${w}/${h}`

export const memo2026: DailyGallery[] = [
  {
    date: '2026-02-06',
    name: '实验室日常2026',
    cover: img('daily-memo-cover', 800, 450),
    description: '新学期实验室的点滴日常。',
    gallery: [
      { url: img('daily-memo-1'), name: '实验调试' },
      { url: img('daily-memo-2'), name: '工位一角' },
      { url: img('daily-memo-3'), name: '深夜加班' },
    ],
  },
]