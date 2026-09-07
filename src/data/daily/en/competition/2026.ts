import { DailyGallery } from '@/types/daily'

/** Sample album images use picsum.photos (fixed seeds → stable, reproducible URLs) */
const img = (seed: string, w = 1200, h = 800) => `https://picsum.photos/seed/${seed}/${w}/${h}`

export const competition2026: DailyGallery[] = [
  {
    date: '2026-03-21',
    name: 'Big Data Challenge Preparation',
    cover: img('daily-competition-1c', 800, 450),
    description: 'Intensive pre-contest sprint: solution design, data preprocessing and model tuning.',
    gallery: [
      { url: img('daily-competition-1a'), name: 'Brainstorming' },
      { url: img('daily-competition-1b'), name: 'Data preprocessing' },
      { url: img('daily-competition-1d'), name: 'Model tuning' },
    ],
  },
  {
    date: '2026-04-10',
    name: 'CCCC · National Final',
    cover: img('daily-competition-2c', 800, 450),
    description: 'Final defense and award ceremony — the team won a national first prize.',
    gallery: [
      { url: img('daily-competition-2a'), name: 'Final defense' },
      { url: img('daily-competition-2b'), name: 'Award ceremony' },
    ],
  },
]