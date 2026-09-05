export type Member = {
  id: string
  grade: number
  avatarUrl: string
  role: 'teacher' | 'phd' | 'master' | 'undergrad'
  name: string
  nameEn: string
  education?: Education[]
  workHistory?: WorkHistory[]
  homepage?: string
  email?: string
  orcid?: string
  githubLink?: string
  introduction: string
  research: string
  career?: string
  order?: number
}

export type Education = {
  startDate: string
  endDate?: string
  school: string
}

export type WorkHistory = {
  startDate: string
  endDate: string
  position: string
  company: string
}
