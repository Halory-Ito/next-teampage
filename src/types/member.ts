export type Member = {
  id: string
  grade: number
  avatarUrl: string
  role: 'teacher' | 'phd' | 'master' | 'undergrad'
  name: string
  nameEn: string
  homepage?: string
  email?: string
  orcid?: string
  githubLink?: string
  introduction: string
  research: string
  career?: string
  order?: number
}
