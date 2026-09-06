// TODO(i18n): English placeholder — content mirrors zh-cn until translated

import { News } from '@/types/news'

export const news2026: News[] = [
  {
    date: '2026-06-02',
    type: 'paper',
    event:
      '2023级硕士研究生张凯硕士毕业论文“基于动态核先验的非局部深度展开全色锐化方法研究”被答辩组推荐为校级优秀硕士毕业论文',
  },
  {
    date: '2026-06-01',
    type: 'career',
    event: [
      {
        id: 'leixuan',
        name: '雷轩',
        grade: 2023,
        signed: '杭州华为云计算技术有限公司',
        intents: ['海康威视', '中科紫东太初（北京）科技有限公司'],
        position: '软件开发工程师',
        honors: ['三等学业奖学金（2024）', '三等学业奖学金（2025）'],
      },
      {
        id: 'chenhongjin',
        name: '陈洪金',
        grade: 2023,
        signed: '海思技术有限公司',
        intents: ['成都樟宜科技有限公司'],
        position: '软件开发工程师',
        honors: ['三等学业奖学金（2024）', '三等学业奖学金（2025）'],
      },
    ],
  },
  {
    date: '2026-06-01',
    type: 'recruit',
    event:
      '项目组2027级研究生招生咨询QQ群“173394663”已经开放，项目组面试内容为前后端开发编程技能+算法实现能力（C、C++、Java任选一种实现），前后端开发有项目作品者优先考虑，算法实现包括数据结构基础算法、贪心、动态规划、分治、回溯。有意向的同学可以先进群了解团队需求后再面试，也可以通过面试了解目前掌握技能与团队需求之间差距，针对性学习后二次面试，通过面试可提前锁定意向offer。',
    pinned: true,
  },
]
