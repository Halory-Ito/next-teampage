import { DailyBlock } from '@/types/daily'

const prefix = '/images/daily'

export const blocks: DailyBlock[] = [
  {
    id: 'competition',
    name: '竞赛',
    description: '竞赛',
    cover: `${prefix}/01.png`,
  },
  {
    id: 'meeting',
    name: '会议',
    description: '会议',
    cover: `${prefix}/02.png`,
  },
  {
    id: 'tuanjian',
    name: '团建',
    description: '团建',
    cover: `${prefix}/03.png`,
  },
  {
    id: 'memo',
    name: '记念',
    description: '记念',
    cover: `${prefix}/04.png`,
  },
]
