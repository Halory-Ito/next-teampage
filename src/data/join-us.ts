import type { Locale } from '@/i18n/config'

/**
 * 加入课题组 · 招生信息集中配置
 *
 * 换届 / 招生季只改本文件（或对应语言块），页面无需改动。
 * 约定（惜字如金）：各板块职责唯一、信息不重复——群号、语言、加分项等
 * 同一事实只出现一次；新增内容时请看它是否已在别处写过。
 */

/** 面试考核维度 */
export type JoinUsSubject = {
  /** 维度名称，如“前后端开发编程技能” */
  name: string
  /** 补充说明，如指定语言 */
  note?: string
}

/** 加入流程步骤（可选 description 仅补充流程规则，不复述其他板块） */
export type JoinUsStep = {
  title: string
  description?: string
}

/** 联系渠道 */
export type JoinUsContact = {
  label: string
  /** 展示值，如群号 / 邮箱地址 */
  value: string
  /** 可选跳转链接（如 mailto:…） */
  href?: string
  /** 为 true 时展示“复制”按钮（用于无法直接跳转的 QQ 群号等） */
  copyable?: boolean
}

export type JoinUsContent = {
  /** 招生对象，如 “2027 级研究生” */
  recruitTarget: string
  /** 课题组简介（研究方向板块，不再罗列方向名，方向见 researchAreas） */
  intro: string
  /** 研究方向 */
  researchAreas: string[]
  /** 培养模式 / 你将获得 */
  trainingHighlights: string[]
  /** 面试考核维度（语言说明写在面试项 note 中，不另设字段） */
  interviewSubjects: JoinUsSubject[]
  /** 算法实现考核范围 */
  algorithmTopics: string[]
  /** 加分项 */
  bonuses: string[]
  /** 加入流程步骤 */
  steps: JoinUsStep[]
  /** 联系方式（群号唯一出现在这里） */
  contacts: JoinUsContact[]
}

export const joinUsByLocale: Record<Locale, JoinUsContent> = {
  'zh-cn': {
    recruitTarget: '2027 级研究生',
    intro:
      '课题组依托重庆邮电大学计算机科学与技术学院，坚持“科研 + 工程”双线并行的培养模式，成果发表于 IEEE TGRS、Information Fusion、Remote Sensing 等期刊。',
    researchAreas: ['大数据智能', '遥感图像智能处理'],
    trainingHighlights: [
      '科研训练：覆盖遥感图像处理与大数据智能',
      '成果产出：期刊论文、专利与竞赛指导',
      '工程实战：从大数据平台到算法落地',
    ],
    interviewSubjects: [
      { name: '前后端开发编程技能' },
      { name: '算法实现能力', note: 'C、C++、Java 任选一种语言实现' },
    ],
    algorithmTopics: ['数据结构基础算法', '贪心', '动态规划', '分治', '回溯'],
    bonuses: ['前后端开发有项目作品者优先考虑'],
    steps: [
      { title: '进群了解需求', description: '了解团队需求后再决定是否面试。' },
      { title: '参加面试' },
      {
        title: '二次面试（可选）',
        description: '发现差距后，可针对性学习再约一次。',
      },
      { title: '锁定意向 offer' },
    ],
    contacts: [
      {
        label: '招生咨询 QQ 群',
        value: '173394663',
        // 群主在“群管理 → 加群方式”生成加群链接后可填入 href，否则自动提供“复制群号”
        copyable: true,
      },
      { label: '导师邮箱', value: 'leidj@cqupt.edu.cn', href: 'mailto:leidj@cqupt.edu.cn' },
    ],
  },
  en: {
    recruitTarget: '2027 Graduate Students',
    intro:
      'Hosted by the School of Computer Science and Technology at Chongqing University of Posts and Telecommunications, our group follows an integrated research-plus-engineering training model, with results published in journals such as IEEE TGRS, Information Fusion and Remote Sensing.',
    researchAreas: ['Big Data Intelligence', 'Remote Sensing Image Processing'],
    trainingHighlights: [
      'Research training in remote sensing image processing & big data intelligence',
      'Output guidance for papers, patents and competitions',
      'Hands-on work from data platforms to algorithm deployment',
    ],
    interviewSubjects: [
      { name: 'Frontend & Backend Development Skills' },
      { name: 'Algorithm Implementation', note: 'Implement in one of: C, C++, Java' },
    ],
    algorithmTopics: [
      'Core Data Structures & Algorithms',
      'Greedy',
      'Dynamic Programming',
      'Divide & Conquer',
      'Backtracking',
    ],
    bonuses: ['Preference given to applicants with frontend/backend project portfolios'],
    steps: [
      {
        title: 'Join the group',
        description: 'Learn about our needs before the interview.',
      },
      { title: 'Take the interview' },
      {
        title: 'Optional second interview',
        description: 'Close the gaps with targeted study, then try again.',
      },
      { title: 'Lock an early offer' },
    ],
    contacts: [
      {
        label: 'Admission QQ Group',
        value: '173394663',
        // Fill in the join-group link generated in group settings to replace the copy button
        copyable: true,
      },
      { label: 'Advisor Email', value: 'leidj@cqupt.edu.cn', href: 'mailto:leidj@cqupt.edu.cn' },
    ],
  },
}

/** 按语言取招生信息，供页面消费 */
export function getJoinUs(locale: Locale): JoinUsContent {
  return joinUsByLocale[locale]
}
