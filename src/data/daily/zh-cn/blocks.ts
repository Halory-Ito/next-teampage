import { DailyBlock } from '@/types/daily'

const prefix = '/images/daily'

export const blocks: DailyBlock[] = [
  {
    id: 'competition',
    name: '竞赛',
    description: '团队参加大数据与人工智能竞赛的备赛、答辩与获奖记录',
    cover: `${prefix}/01.png`,
  },
  {
    id: 'meeting',
    name: '会议',
    description: '组会研讨、学术会议与外部交流活动的影像记录',
    cover: `${prefix}/02.png`,
  },
  {
    id: 'tuanjian',
    name: '团建',
    description: '实验室团建与集体活动的欢乐瞬间',
    cover: `${prefix}/03.png`,
  },
  {
    id: 'memo',
    name: '记念',
    description: '实验室日常与毕业季的珍贵纪念',
    cover: `${prefix}/04.png`,
  },
]
