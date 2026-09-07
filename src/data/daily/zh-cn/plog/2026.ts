import { DailyGallery } from '@/types/daily'

/** 示例相册图片使用 picsum.photos 网图（seed 固定，URL 稳定可复现） */
const img = (seed: string, w = 1200, h = 800) => `https://picsum.photos/seed/${seed}/${w}/${h}`

export const plog2026: DailyGallery[] = [
  {
    date: '2026-02-06',
    name: '实验室日常2026',
    cover: img('daily-plog-cover', 800, 450),
    description: '随手记录的研究生生活片段。',
    gallery: [
      { url: img('daily-plog-1'), name: '组会现场' },
      { url: img('daily-plog-2'), name: '校园风景' },
    ],
  },
]