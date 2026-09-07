import { DailyGallery } from '@/types/daily'

/** 示例相册图片使用 picsum.photos 网图（seed 固定，URL 稳定可复现） */
const img = (seed: string, w = 1200, h = 800) => `https://picsum.photos/seed/${seed}/${w}/${h}`

export const tuanjian2026: DailyGallery[] = [
  {
    date: '2026-03-28',
    name: '春季踏青团建',
    cover: img('daily-tuanjian-1c', 800, 450),
    description: '春游南山，爬山踏青、放松身心。',
    gallery: [
      { url: img('daily-tuanjian-1a'), name: '山间合影' },
      { url: img('daily-tuanjian-1b'), name: '午餐时光' },
    ],
  },
  {
    date: '2026-06-20',
    name: '实验室年度聚餐',
    cover: img('daily-tuanjian-2c', 800, 450),
    description: '年终聚餐，感谢大家一年的付出。',
    gallery: [
      { url: img('daily-tuanjian-2a'), name: '聚餐合影' },
      { url: img('daily-tuanjian-2b'), name: '游戏环节' },
    ],
  },
]