import { news } from '@/data/news'
import { projects } from '@/data/projects'
import { masters } from '@/data/team/master'
import { phds } from '@/data/team/phd'
import { teachers } from '@/data/team/teachers'
import { undergrads } from '@/data/team/undergrad'
import type { News } from '@/types/news'

/**
 * 首页 · 数据展示的统计口径
 *
 * 所有数字均从 src/data 现算，禁止硬编码：
 * 后续新增成员 / 年份新闻，只需把数据写进对应目录（并在其 index.ts 汇总），
 * 本函数会自动把新数据纳入统计。
 */

export type HomeStatKey =
  | 'students'
  | 'teachers'
  | 'furtherStudy'
  | 'bigTech'
  | 'papers'
  | 'reports'
  | 'awards'
  | 'projects'

export type HomeStats = Record<HomeStatKey, number>

/**
 * 统计某类“按人次记录”的动态（升学 / 就业等，event 为成员数组）：
 * event 是数组时按成员人数累计，是字符串时按 1 条计。
 */
function countNewsPeople(type: News['type']): number {
  return news.reduce((total, item) => {
    if (item.type !== type) return total
    return total + (Array.isArray(item.event) ? item.event.length : 1)
  }, 0)
}

/** 统计某类“按条数记录”的动态（论文录用 / 媒体报道 / 获奖等） */
function countNewsEvents(type: News['type']): number {
  return news.filter((item) => item.type === type).length
}

/** 汇总首页需要展示的全部统计项 */
export function getHomeStats(): HomeStats {
  return {
    // 在籍学生：博士 + 硕士 + 本科生
    students: phds.length + masters.length + undergrads.length,
    // 指导教师
    teachers: teachers.length,
    // 升学人数：新闻里 type=education（升学去向）名单的人次
    furtherStudy: countNewsPeople('education'),
    // 入职大厂人数：新闻里 type=career（就业去向）名单的人次
    bigTech: countNewsPeople('career'),
    // 论文数量：论文录用 / 优秀学位论文等动态条数
    papers: countNewsEvents('paper'),
    // 媒体报道次数：受邀报告 / 媒体报道等动态条数
    reports: countNewsEvents('report'),
    // 获奖数：学科竞赛 / 奖学金等动态条数
    awards: countNewsEvents('award'),
    // 研发项目数：在研 / 已结题的纵向基金与横向课题
    projects: projects.length,
  }
}
/** 动态数据的起止年份（用于“数据截止于 XXXX 年”提示） */
export function getNewsYearRange(): { from: number; to: number } | null {
  if (news.length === 0) return null
  const years = news.map((item) => Number(item.date.slice(0, 4)))
  return { from: Math.min(...years), to: Math.max(...years) }
}
