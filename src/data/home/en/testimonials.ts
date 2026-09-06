// TODO(i18n): English placeholder — content mirrors zh-cn until translated

import { Testimonial } from '@/types/testimonial'

/**
 * 首页 · 学生评价
 *
 * 当前为示例占位数据，接入真实访谈 / 问卷后直接替换此数组即可，
 * 首页组件会自动渲染，无需改动视图层。
 */
export const homeTestimonials: Testimonial[] = [
  {
    id: 'chenli',
    name: '陈立',
    role: '2018级硕士 · 腾讯 大数据开发工程师',
    quote:
      '在课题组两年，我从只会写课设作业，到能独立负责大数据平台模块的搭建与调优。老师会带着我们一行行过代码，也会放手让每个人在真实项目里承担完整链路，这种锻炼让我入职后能很快上手。',
  },
  {
    id: 'caimingjun',
    name: '蔡明峻',
    role: '2021级硕士 · 国家奖学金 / 论文发表于 IEEE TGRS',
    quote:
      '从想法、实验到论文被 TGRS 录用，每一步都有老师逐字逐句帮我们打磨。组里共享文献、互相评审代码的氛围特别好，做科研不是闭门造车，而是一群人一起把问题想透。',
  },
  {
    id: 'shenwangshu',
    name: '沈望舒',
    role: '2022级硕士 · 美团 算法工程师',
    quote:
      '求职季里，老师的推荐和学长学姐的内推给了我很大帮助。组里培养的不只是算法能力，还有工程思维和表达习惯，这些在面试与实习中都非常受用。',
  },
]
