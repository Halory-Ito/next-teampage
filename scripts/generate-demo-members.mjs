/**
 * 生成演示用团队成员数据（fictional sample data）
 *
 * - 为 2021~2026 年补齐 博士(3/年) / 硕士(10/年) / 本科(3/年) 数据
 * - 2026 年已有少量样例成员，只做“补足”而不是覆盖
 * - 为每位成员在 public/images/avatars/<grade>/ 下渲染本地头像（渐变底 + 中文名）
 * - 向 teachers.ts 追加 4 位虚构教师
 *
 * 用法：bun scripts/generate-demo-members.mjs
 */

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import sharp from 'sharp'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const teamDir = join(root, 'src', 'data', 'team')
const avatarRoot = join(root, 'public', 'images', 'avatars')

/* ------------------------------------------------------------------ */
/* 名字库                                                              */
/* ------------------------------------------------------------------ */

const SURNAMES = [
  ['王', 'Wang'], ['李', 'Li'], ['张', 'Zhang'], ['刘', 'Liu'], ['陈', 'Chen'],
  ['杨', 'Yang'], ['黄', 'Huang'], ['赵', 'Zhao'], ['吴', 'Wu'], ['周', 'Zhou'],
  ['徐', 'Xu'], ['孙', 'Sun'], ['马', 'Ma'], ['朱', 'Zhu'], ['胡', 'Hu'],
  ['郭', 'Guo'], ['何', 'He'], ['林', 'Lin'], ['罗', 'Luo'], ['高', 'Gao'],
  ['郑', 'Zheng'], ['梁', 'Liang'], ['谢', 'Xie'], ['宋', 'Song'], ['唐', 'Tang'],
  ['韩', 'Han'], ['冯', 'Feng'], ['邓', 'Deng'], ['曹', 'Cao'], ['彭', 'Peng'],
  ['曾', 'Zeng'], ['肖', 'Xiao'], ['田', 'Tian'], ['董', 'Dong'], ['袁', 'Yuan'],
  ['潘', 'Pan'], ['于', 'Yu'], ['蒋', 'Jiang'], ['蔡', 'Cai'], ['余', 'Yu'],
  ['杜', 'Du'], ['叶', 'Ye'], ['程', 'Cheng'], ['苏', 'Su'], ['魏', 'Wei'],
  ['吕', 'Lv'], ['丁', 'Ding'], ['任', 'Ren'], ['沈', 'Shen'], ['孟', 'Meng'],
]

const GIVEN = [
  ['梓萱', 'ZiXuan'], ['浩然', 'HaoRan'], ['欣怡', 'XinYi'], ['俊杰', 'JunJie'],
  ['雨桐', 'YuTong'], ['博文', 'BoWen'], ['梦琪', 'MengQi'], ['宇轩', 'YuXuan'],
  ['思远', 'SiYuan'], ['嘉懿', 'JiaYi'], ['天宇', 'TianYu'], ['语嫣', 'YuYan'],
  ['明轩', 'MingXuan'], ['若曦', 'RuoXi'], ['子涵', 'ZiHan'], ['晨曦', 'ChenXi'],
  ['泽宇', 'ZeYu'], ['诗涵', 'ShiHan'], ['文昊', 'WenHao'], ['静怡', 'JingYi'],
  ['家豪', 'JiaHao'], ['雨泽', 'YuZe'], ['雅静', 'YaJing'], ['佳颖', 'JiaYing'],
  ['婉婷', 'WanTing'], ['世杰', 'ShiJie'], ['雪怡', 'XueYi'], ['思琪', 'SiQi'],
  ['慧敏', 'HuiMin'], ['鹏飞', 'PengFei'], ['海燕', 'HaiYan'], ['晓东', 'XiaoDong'],
  ['志强', 'ZhiQiang'], ['文静', 'WenJing'], ['凯文', 'KaiWen'], ['子墨', 'ZiMo'],
  ['一帆', 'YiFan'], ['安宁', 'AnNing'], ['若彤', 'RuoTong'], ['靖瑶', 'JingYao'],
  ['云熙', 'YunXi'], ['沐辰', 'MuChen'], ['修远', 'XiuYuan'], ['明哲', 'MingZhe'],
  ['书瑶', 'ShuYao'], ['清和', 'QingHe'], ['怀瑾', 'HuaiJin'], ['望舒', 'WangShu'],
  ['听澜', 'TingLan'], ['牧之', 'MuZhi'], ['远山', 'YuanShan'], ['云舟', 'YunZhou'],
]

const RESEARCH = [
  '大数据智能分析与挖掘',
  '机器学习与数据挖掘',
  '计算机视觉与图像理解',
  '自然语言处理',
  '图神经网络与图数据挖掘',
  '时序数据异常检测',
  '多模态学习与检索',
  '联邦学习与隐私计算',
  '推荐系统与用户建模',
  '遥感图像智能解译',
  '医学影像智能分析',
  '强化学习与智能决策',
  '大模型高效微调',
  '分布式机器学习系统',
  '数据安全与隐私保护',
  '知识图谱与问答系统',
  '语音信号处理',
  '工业大数据时序分析',
]

const PREV_SCHOOLS = [
  '重庆大学', '西南大学', '电子科技大学', '四川大学', '西安电子科技大学',
  '武汉大学', '华中科技大学', '哈尔滨工业大学', '中南大学', '湖南大学',
  '华南理工大学', '中山大学', '东南大学', '南京邮电大学', '杭州电子科技大学',
  '南昌大学', '昆明理工大学', '桂林电子科技大学', '山东大学', '大连理工大学',
]

const COMPANIES = [
  '华为', '腾讯', '字节跳动', '阿里巴巴', '美团', '百度', '网易', '京东',
  '大疆', '中兴通讯', '科大讯飞', '海康威视', '商汤科技', '米哈游',
  '蚂蚁集团', '中国移动', '长安汽车', '比亚迪',
]

const PHD_CAREERS = ['高校教师', '科研院所', '博士后', '算法工程师']

/* ------------------------------------------------------------------ */
/* 小工具                                                              */
/* ------------------------------------------------------------------ */

function mulberry32(seed) {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function pick(rng, arr) {
  return arr[Math.floor(rng() * arr.length)]
}

function hslToHex(h, s, l) {
  h = ((h % 360) + 360) % 360
  s /= 100
  l /= 100
  const a = s * Math.min(l, 1 - l)
  const f = (n) => {
    const k = (n + h / 30) % 12
    const c = l - a * Math.max(-1, Math.min(k - 3, Math.min(9 - k, 1)))
    return Math.round(255 * c).toString(16).padStart(2, '0')
  }
  return `#${f(0)}${f(8)}${f(4)}`
}

function hashCode(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0
  return Math.abs(h)
}

function slug(nameEn) {
  return nameEn.replace(/\s+/g, '').toLowerCase()
}

/** 由已排序的生成结果 + 追加文本，往 “最后一个 ]” 前插入新成员 */
function appendEntries(filePath, extraBlocks) {
  const raw = readFileSync(filePath, 'utf8')
  const idx = raw.lastIndexOf(']')
  if (idx === -1) throw new Error(`无法定位数组结尾：${filePath}`)
  const insert = extraBlocks.length > 0 ? `\n${extraBlocks.join('\n')}` : ''
  writeFileSync(filePath, `${raw.slice(0, idx)}${insert}\n]`)
}

/* ------------------------------------------------------------------ */
/* 教师定义（虚构，order 2~5）                                         */
/* ------------------------------------------------------------------ */

const NEW_TEACHERS = [
  {
    givenZh: '雨桐', givenEn: 'YuTong', surnameZh: '陈', surnameEn: 'Chen',
    career: '副教授',
    research: '计算机视觉与多模态学习，关注跨模态表示与图文检索问题',
    intro: '重庆邮电大学计算机科学与技术学院副教授。主要研究方向为计算机视觉、多模态学习与跨模态检索，在领域内期刊与会议发表论文 20 余篇，主持国家自然科学基金青年项目 1 项。',
  },
  {
    givenZh: '文昊', givenEn: 'WenHao', surnameZh: '郑', surnameEn: 'Zheng',
    career: '讲师',
    research: '大数据与数据库系统，关注查询优化与湖仓一体架构',
    intro: '重庆邮电大学计算机科学与技术学院讲师。研究方向为大数据存储与查询优化、湖仓一体数据架构，曾参与多项大数据平台横向项目。',
  },
  {
    givenZh: '念慈', givenEn: 'NianCi', surnameZh: '林', surnameEn: 'Lin',
    career: '副研究员',
    research: '边缘计算与智能物联网，关注资源调度与端云协同推理',
    intro: '重庆邮电大学计算机科学与技术学院副研究员。研究方向为边缘计算、智能物联网与端云协同推理，主持重庆市自然科学基金面上项目 1 项。',
  },
  {
    givenZh: '星野', givenEn: 'XingYe', surnameZh: '沈', surnameEn: 'Shen',
    career: '讲师',
    research: '网络与数据安全，关注差分隐私与联邦学习安全',
    intro: '重庆邮电大学计算机科学与技术学院讲师。研究方向为网络与数据安全、隐私保护与可信联邦学习，指导学生参加网络安全类竞赛获国家级奖项多项。',
  },
]

/* ------------------------------------------------------------------ */
/* 头像渲染                                                            */
/* ------------------------------------------------------------------ */

function avatarSvg(text, seedText) {
  const h = hashCode(seedText)
  const from = hslToHex(h, 68, 58)
  const to = hslToHex(h + 42, 70, 40)
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${from}"/>
      <stop offset="1" stop-color="${to}"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" fill="url(#g)"/>
  <text x="256" y="306" font-size="150" fill="#ffffff" text-anchor="middle" font-family="Microsoft YaHei, PingFang SC, sans-serif" font-weight="600">${text}</text>
</svg>`
}

async function renderAvatar(filePath, text, seedText) {
  mkdirSync(dirname(filePath), { recursive: true })
  await sharp(Buffer.from(avatarSvg(text, seedText)))
    .png({ compressionLevel: 9 })
    .toFile(filePath)
}

/* ------------------------------------------------------------------ */
/* 生成学生                                                            */
/* ------------------------------------------------------------------ */

const roleMeta = {
  phd: {
    variable: (y) => `phds${y}`,
    exportName: (y) => `phds${y}`,
    file: (y) => join(teamDir, 'phd', `${y}.ts`),
  },
  master: {
    variable: (y) => `masters${y}`,
    exportName: (y) => `masters${y}`,
    file: (y) => join(teamDir, 'master', `${y}.ts`),
  },
  undergrad: {
    variable: (y) => `undergrads${y}`,
    exportName: (y) => `undergrads${y}`,
    file: (y) => join(teamDir, 'undergrad', `${y}.ts`),
  },
}

// 每年每个角色需要“新生成”的人数（2026 年已有的样例成员数从目标中扣减）
const EXISTING_2026 = { phd: 1, master: 2, undergrad: 1 }
const YEAR_TARGET = { phd: 3, master: 10, undergrad: 3 }

// 姓氏 × 名的全部组合，洗牌后逐人取用，保证 96 个名字全局不重复
const combos = []
for (const [szh, spy] of SURNAMES) {
  for (const [gzh, gpy] of GIVEN) combos.push({ zh: szh + gzh, en: `${gpy} ${spy}`, given: gzh })
}

// 教师先用走 4 个组合（避免和学生重名）
const teacherComboKeys = new Set(
  NEW_TEACHERS.map((t) => `${t.surnameZh}${t.givenZh}`),
)
const pool = combos.filter((c) => !teacherComboKeys.has(c.zh))

const rng = mulberry32(20260901)
for (let i = pool.length - 1; i > 0; i--) {
  const j = Math.floor(rng() * (i + 1))
  ;[pool[i], pool[j]] = [pool[j], pool[i]]
}

const usedIds = new Set()
let cursor = 0
function nextPerson() {
  const c = pool[cursor++]
  if (!c) throw new Error('名字组合用尽，请扩充 GIVEN/SURNAMES')
  let id = slug(c.en)
  if (usedIds.has(id)) {
    let n = 2
    while (usedIds.has(`${id}-${n}`)) n += 1
    id = `${id}-${n}`
  }
  usedIds.add(id)
  return { ...c, id }
}

const researchPool = [...RESEARCH]
for (let i = researchPool.length - 1; i > 0; i--) {
  const j = Math.floor(rng() * (i + 1))
  ;[researchPool[i], researchPool[j]] = [researchPool[j], researchPool[i]]
}
let researchCursor = 0
function nextResearch() {
  return researchPool[researchCursor++ % researchPool.length]
}

function eduBlock(entries) {
  if (!entries || entries.length === 0) return ''
  const body = entries
    .map((e) => {
      const lines = [`      {`, `        startDate: '${e.startDate}',`]
      if (e.endDate) lines.push(`        endDate: '${e.endDate}',`)
      lines.push(`        school: '${e.school}',`, `      },`)
      return lines.join('\n')
    })
    .join('\n')
  return `    education: [\n${body}\n    ],\n`
}

/**
 * 生成某个角色某一年缺失的学生成员（TS 源码块）
 * @returns {string[]} 可插入数组的成员源码块
 */
function buildStudentBlocks(role, year) {
  const total = YEAR_TARGET[role]
  const count = year === 2026 ? total - EXISTING_2026[role] : total
  const blocks = []

  for (let i = 0; i < count; i++) {
    const person = nextPerson()
    const research = nextResearch()
    const gradYear = role === 'master' ? year + 3 : role === 'phd' ? year + 4 : year + 4
    const graduated = gradYear <= 2026

    let intro
    if (role === 'phd') {
      intro = `重庆邮电大学${year}级博士研究生，师从雷大江教授，主要研究方向为${research}。`
    } else if (role === 'master') {
      intro = `重庆邮电大学${year}级硕士研究生，导师为雷大江教授，主要研究方向为${research}。`
    } else {
      intro = `重庆邮电大学${year}级本科生，研究方向为${research}。`
    }

    // 教育经历
    const edu = []
    if (role === 'phd') {
      // 之前在其他高校读硕，随后进入重邮读博
      edu.push({
        startDate: `${year - 3}-09`,
        endDate: `${year}-06`,
        school: pick(rng, PREV_SCHOOLS),
      })
      edu.push({
        startDate: `${year}-09`,
        ...(graduated ? { endDate: `${year + 4}-06` } : {}),
        school: '重庆邮电大学',
      })
    } else if (role === 'master') {
      // 本科 4 年 → 重邮硕士
      edu.push({
        startDate: `${year - 4}-09`,
        endDate: `${year}-06`,
        school: pick(rng, PREV_SCHOOLS),
      })
      edu.push({
        startDate: `${year}-09`,
        ...(graduated ? { endDate: `${year + 3}-06` } : {}),
        school: '重庆邮电大学',
      })
    } else {
      // 本科只记录重邮一段
      edu.push({
        startDate: `${year}-09`,
        ...(graduated ? { endDate: `${year + 4}-06` } : {}),
        school: '重庆邮电大学',
      })
    }

    // 已毕业去向：硕士/本科去企业，博士去高校/院所/博后
    let career = ''
    if (graduated) {
      career = role === 'phd' ? pick(rng, PHD_CAREERS) : pick(rng, COMPANIES)
    }

    const avatarUrl = `/images/avatars/${year}/${person.id}.png`

    const lines = [
      `  {`,
      `    avatarUrl: '${avatarUrl}',`,
      `    grade: ${year},`,
      `    id: '${person.id}',`,
      `    role: '${role}',`,
      `    introduction: '${intro}',`,
      `    name: '${person.zh}',`,
      `    nameEn: '${person.en}',`,
      `    research: '${research}',`,
    ]
    if (career) lines.push(`    career: '${career}',`)
    lines.push(eduBlock(edu).trimEnd())
    lines.push(`  },`)

    blocks.push(lines.filter(Boolean).join('\n'))

    renderAvatar(join(avatarRoot, String(year), `${person.id}.png`), person.given, person.id)
  }

  return blocks
}

/** 生成单年文件（仅 2021~2025；2026 已有文件只做增量追加） */
function writeYearFile(role, year) {
  const meta = roleMeta[role]
  const blocks = buildStudentBlocks(role, year)
  const content = `import { Member } from '@/types/member'

export const ${meta.exportName(year)}: Member[] = [
${blocks.join('\n')}
]
`
  writeFileSync(meta.file(year), content)
}

function appendYearFile(role, year) {
  const blocks = buildStudentBlocks(role, year)
  appendEntries(roleMeta[role].file(year), blocks)
}

/* ------------------------------------------------------------------ */
/* 主流程                                                              */
/* ------------------------------------------------------------------ */

function roleExport(role, year) {
  return roleMeta[role].exportName(year)
}

async function main() {
  const years = [2021, 2022, 2023, 2024, 2025, 2026]

  for (const role of ['phd', 'master', 'undergrad']) {
    for (const year of years) {
      if (year === 2026) appendYearFile(role, year)
      else writeYearFile(role, year)
    }
  }

  // 教师头像
  for (const t of NEW_TEACHERS) {
    const id = slug(`${t.givenEn}${t.surnameEn}`)
    renderAvatar(join(avatarRoot, 'teacher', `${id}.png`), t.givenZh, `teacher-${id}`)
  }

  // 追加教师（保留原有雷大江条目，在其后插入）
  const teacherBlocks = []
  NEW_TEACHERS.forEach((t, idx) => {
    const id = slug(`${t.givenEn}${t.surnameEn}`)
    teacherBlocks.push(`  {
    avatarUrl: '/images/avatars/teacher/${id}.png',
    grade: 2026,
    id: '${id}',
    role: 'teacher',
    introduction: '${t.intro}',
    name: '${t.surnameZh}${t.givenZh}',
    nameEn: '${t.givenEn} ${t.surnameEn}',
    research: '${t.research}',
    career: '${t.career}',
    order: ${idx + 2},
  },`)
  })
  appendEntries(join(teamDir, 'teachers.ts'), teacherBlocks)

  // 更新各角色 index.ts（按年份从新到旧汇总）
  for (const role of ['phd', 'master', 'undergrad']) {
    const exportsList = years.map((y) => roleExport(role, y))
    const imports = exportsList.map((name) => `import { ${name} } from './${name.slice(-4)}'`)
    const spread = exportsList.map((name) => `...${name}`).join(', ')
    const content = `${imports.join('\n')}

export const ${role}s = [${spread}]
`
    writeFileSync(join(teamDir, role, 'index.ts'), content)
  }

  console.log('done. generated ids:', usedIds.size)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
