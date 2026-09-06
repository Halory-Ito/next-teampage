/**
 * type: 入职大厂、升学、论文、获奖、媒体报道、课程发布、课题组招募、研发项目数
 */
export type News = {
  date: string
  type: 'career' | 'education' | 'paper' | 'award' | 'report' | 'course' | 'recruit' | 'project'
  event: string | Career[]
  pinned?: boolean
  links?: LinkItem[]
}

type LinkItem = {
  label: string
  url: string
}

type Career = {
  id: string
  name: string
  grade: number
  signed: string
  position: string
  intents: string[]
  honors: string[]
}
