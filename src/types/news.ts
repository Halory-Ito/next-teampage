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
  /** 成员唯一标识（中文名），跨语言一致，用作 /team/master/[id] 的 URL */
  id: string
  /** 展示用姓名，按语言本地化：zh-cn 用中文名，en 用拼音（对应团队数据的 nameEn） */
  name: string
  grade: number
  signed: string
  position: string
  intents: string[]
  honors: string[]
}
