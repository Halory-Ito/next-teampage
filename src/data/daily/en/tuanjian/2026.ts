import { DailyGallery } from '@/types/daily'

/** Sample album images use picsum.photos (fixed seeds → stable, reproducible URLs) */
const img = (seed: string, w = 1200, h = 800) => `https://picsum.photos/seed/${seed}/${w}/${h}`

export const tuanjian2026: DailyGallery[] = [
  {
    date: '2026-03-28',
    name: 'Spring Outing',
    cover: img('daily-tuanjian-1c', 800, 450),
    description: 'A spring hike to Nanshan mountain to unwind and recharge.',
    gallery: [
      { url: img('daily-tuanjian-1a'), name: 'Group photo on the trail' },
      { url: img('daily-tuanjian-1b'), name: 'Lunch break' },
    ],
  },
  {
    date: '2026-06-20',
    name: 'Annual Lab Dinner',
    cover: img('daily-tuanjian-2c', 800, 450),
    description: 'Year-end dinner to thank everyone for their hard work.',
    gallery: [
      { url: img('daily-tuanjian-2a'), name: 'Dinner photo' },
      { url: img('daily-tuanjian-2b'), name: 'Game time' },
    ],
  },
]