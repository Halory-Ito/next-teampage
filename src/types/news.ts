export type News = {
  date: string
  type: 'career' | 'paper' | 'award' | 'report' | 'course' | 'recruit'
  event: string | Career[]
  pinned?: boolean
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
