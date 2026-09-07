import { DailyBlock } from '@/types/daily'

const prefix = '/images/daily'

export const blocks: DailyBlock[] = [
  {
    id: 'competition',
    name: 'Competition',
    description: 'Preparing for, presenting at and winning big-data & AI competitions',
    cover: `${prefix}/01.jpg`,
  },
  {
    id: 'meeting',
    name: 'Meetings',
    description: 'Group seminars, academic conferences and external exchanges',
    cover: `${prefix}/02.jpg`,
  },
  {
    id: 'build',
    name: 'Team Building',
    description: 'Fun moments from lab team-building and group activities',
    cover: `${prefix}/03.jpg`,
  },
  {
    id: 'memo',
    name: 'Memories',
    description: 'Precious memories of lab life and graduation season',
    cover: `${prefix}/04.jpg`,
  },
]
