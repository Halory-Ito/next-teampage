import { DailyGallery } from '@/types/daily'

/** Sample album images use picsum.photos (fixed seeds → stable, reproducible URLs) */
const img = (seed: string, w = 1200, h = 800) => `https://picsum.photos/seed/${seed}/${w}/${h}`

export const memo2026: DailyGallery[] = [
  {
    date: '2026-02-06',
    name: 'Lab Daily 2026',
    cover: img('daily-memo-cover', 800, 450),
    description: 'Everyday moments in the lab at the start of the new semester.',
    gallery: [
      { url: img('daily-memo-1'), name: 'Debugging experiments' },
      { url: img('daily-memo-2'), name: 'My desk' },
      { url: img('daily-memo-3'), name: 'Late night coding' },
    ],
  },
]