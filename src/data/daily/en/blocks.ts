import { DailyBlock } from '@/types/daily'

const prefix = '/images/daily'

export const blocks: DailyBlock[] = [
  {
    id: 'competition',
    name: 'Competition',
    description: 'Competition',
    cover: `${prefix}/01.png`,
  },
  {
    id: 'meeting',
    name: 'Meeting',
    description: 'Meeting',
    cover: `${prefix}/02.png`,
  },
  {
    id: 'tuanjian',
    name: 'Activity',
    description: 'Team Activity',
    cover: `${prefix}/03.png`,
  },
  {
    id: 'memo',
    name: 'Memo',
    description: 'Memories',
    cover: `${prefix}/04.png`,
  },
]