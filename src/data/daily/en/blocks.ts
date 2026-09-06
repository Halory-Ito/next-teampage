// TODO(i18n): English placeholder — content mirrors zh-cn until translated

import { DailyBlock } from '@/types/daily'

const prefix = '/images/daily'

export const blocks: DailyBlock[] = [
  {
    id: 'competition',
    name: 'Competition',
    description: '竞赛',
    cover: `${prefix}/01.png`,
  },
  {
    id: 'meeting',
    name: 'Meeting',
    description: '会议',
    cover: `${prefix}/02.png`,
  },
  {
    id: 'tuanjian',
    name: 'Activity',
    description: '团建',
    cover: `${prefix}/03.png`,
  },
  {
    id: 'memo',
    name: 'Memo',
    description: '记念',
    cover: `${prefix}/04.png`,
  },
]
