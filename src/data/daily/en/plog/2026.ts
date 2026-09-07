import { DailyGallery } from '@/types/daily'

/** Sample album images use picsum.photos (fixed seeds → stable, reproducible URLs) */
const img = (seed: string, w = 1200, h = 800) => `https://picsum.photos/seed/${seed}/${w}/${h}`

export const plog2026: DailyGallery[] = [
  {
    date: '2026-02-06',
    name: 'Lab Daily 2026',
    cover: img('daily-plog-cover', 800, 450),
    description: 'Scattered snapshots of graduate school life.',
    gallery: [
      { url: img('daily-plog-1'), name: 'Seminar scene' },
      { url: img('daily-plog-2'), name: 'Campus scenery' },
    ],
  },
]