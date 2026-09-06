import { Member } from '@/types/member'

export const phds2026: Member[] = [
  {
    avatarUrl: '/images/avatars/2026/weijiale.webp',
    grade: 2026,
    id: 'karaku',
    role: 'phd',
    introduction: '我是xxx',
    name: '魏佳乐',
    nameEn: 'JiaLe Wei',
    research: 'SR',
    career: '腾讯',
    email: 'halory4869@gmail.com',
    githubLink: 'https://github.com/Halory-Ito',
    homepage: 'https://shizuku.halory.fun',
    orcid: '0009-0001-8716-2162',
  },

  {
    avatarUrl: '/images/avatars/2026/xueyitang.png',
    grade: 2026,
    id: 'xueyitang',
    role: 'phd',
    introduction: '重庆邮电大学2026级博士研究生，师从雷大江教授，主要研究方向为医学影像智能分析。',
    name: '唐雪怡',
    nameEn: 'XueYi Tang',
    research: '医学影像智能分析',
    education: [
      {
        startDate: '2023-09',
        endDate: '2026-06',
        school: '华中科技大学',
      },
      {
        startDate: '2026-09',
        school: '重庆邮电大学',
      },
    ],
  },
  {
    avatarUrl: '/images/avatars/2026/chenxizheng.png',
    grade: 2026,
    id: 'chenxizheng',
    role: 'phd',
    introduction:
      '重庆邮电大学2026级博士研究生，师从雷大江教授，主要研究方向为机器学习与数据挖掘。',
    name: '郑晨曦',
    nameEn: 'ChenXi Zheng',
    research: '机器学习与数据挖掘',
    education: [
      {
        startDate: '2023-09',
        endDate: '2026-06',
        school: '昆明理工大学',
      },
      {
        startDate: '2026-09',
        school: '重庆邮电大学',
      },
    ],
  },
]
