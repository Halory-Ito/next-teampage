import { Project } from '@/types/project'

/**
 * 研发项目清单（中文，示例占位数据）。
 * 后续新增项目只需追加到本数组，首页“研发项目数”会自动更新。
 */
export const projects: Project[] = [
  {
    id: 'nsfc-remote-sensing',
    name: '面向遥感大数据智能解译的深度展开网络关键技术研究',
    category: '纵向基金',
    sponsor: '国家自然科学基金',
    period: '2022—2025',
  },
  {
    id: 'cqupt-teaching-reform',
    name: '大数据技术核心课程群建设与产教融合培养模式改革',
    category: '纵向基金',
    sponsor: '重庆市教委基金',
    period: '2021—2023',
  },
  {
    id: 'power-grid-platform',
    name: '电力行业大数据分析平台规划与搭建',
    category: '横向课题',
    sponsor: '电力行业企业',
    period: '2022—2024',
  },
  {
    id: 'health-bigdata',
    name: '儿童医疗健康大数据智能应用系统研发',
    category: '横向课题',
    sponsor: '医疗行业企业',
    period: '2020—2023',
  },
]
