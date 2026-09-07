import { DailyGallery } from '@/types/daily'

/** 示例相册图片使用 picsum.photos 网图（seed 固定，URL 稳定可复现） */
const img = (seed: string, w = 1200, h = 800) => `https://picsum.photos/seed/${seed}/${w}/${h}`

export const competition2026: DailyGallery[] = [
  {
    date: '2026-03-21',
    name: '大数据智能挑战赛备赛',
    cover: img('daily-competition-1c', 800, 450),
    description: '赛前集中突击：方案设计、数据预处理与模型调优。',
    gallery: [
      { url: img('daily-competition-1a'), name: '方案讨论' },
      { url: img('daily-competition-1b'), name: '数据预处理' },
      { url: img('daily-competition-1d'), name: '模型调优' },
    ],
  },
  {
    date: '2026-04-10',
    name: '中国高校计算机大赛 · 决赛',
    cover: img('daily-competition-2c', 800, 450),
    description: '决赛答辩现场与颁奖合影，团队荣获全国一等奖。',
    gallery: [
      { url: img('daily-competition-2a'), name: '决赛答辩' },
      { url: img('daily-competition-2b'), name: '颁奖合影' },
    ],
  },
]