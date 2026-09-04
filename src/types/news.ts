export type News = {
  date: string
  type: 'career' | 'paper' | 'award' | 'report' | 'course'
  event: string | Career[]
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
