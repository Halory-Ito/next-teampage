import { DailyGallery } from '@/types/daily'

/** 示例相册图片使用 picsum.photos 网图（seed 固定，URL 稳定可复现） */
const img = (seed: string, w = 1200, h = 800) => `https://picsum.photos/seed/${seed}/${w}/${h}`

export const meeting2026: DailyGallery[] = [
  {
    date: '2026-03-06',
    name: '周三组会研讨',
    cover: img('daily-meeting-1c', 800, 450),
    description: '每周组会：论文分享与各方向进展汇报。',
    gallery: [
      { url: img('daily-meeting-1a'), name: '论文分享' },
      { url: img('daily-meeting-1b'), name: '进展汇报' },
    ],
  },
  {
    date: '2026-05-15',
    name: '学术会议交流',
    cover: img('daily-meeting-2c', 800, 450),
    description: '赴外地参加学术会议，与同行交流最新研究成果。',
    gallery: [
      { url: img('daily-meeting-2a'), name: '大会报告' },
      { url: img('daily-meeting-2b'), name: '同行交流' },
    ],
  },
]