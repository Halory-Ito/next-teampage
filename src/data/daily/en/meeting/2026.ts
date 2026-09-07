import { DailyGallery } from '@/types/daily'

/** Sample album images use picsum.photos (fixed seeds → stable, reproducible URLs) */
const img = (seed: string, w = 1200, h = 800) => `https://picsum.photos/seed/${seed}/${w}/${h}`

export const meeting2026: DailyGallery[] = [
  {
    date: '2026-03-06',
    name: 'Weekly Group Seminar',
    cover: img('daily-meeting-1c', 800, 450),
    description: 'Weekly seminar: paper sharing and progress reports from each project.',
    gallery: [
      { url: img('daily-meeting-1a'), name: 'Paper sharing' },
      { url: img('daily-meeting-1b'), name: 'Progress report' },
    ],
  },
  {
    date: '2026-05-15',
    name: 'Academic Conference',
    cover: img('daily-meeting-2c', 800, 450),
    description: 'Attending an academic conference to exchange the latest research with peers.',
    gallery: [
      { url: img('daily-meeting-2a'), name: 'Keynote session' },
      { url: img('daily-meeting-2b'), name: 'Networking' },
    ],
  },
]