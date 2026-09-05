/** 研发项目单条 */
export type Project = {
  id: string
  name: string
  /** 项目类别，如「纵向基金」「横向课题」 */
  category?: string
  /** 项目来源 / 委托方 */
  sponsor?: string
  /** 时间范围，如“2021—2024” */
  period?: string
}
