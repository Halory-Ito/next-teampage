import { News } from '@/types/news'

export const news2021: News[] = [
  {
    date: '2021-03-18',
    type: 'paper',
    event:
      '团队2019级硕士研究生韩雨昕的论文“面向轻量化遥感图像语义分割的深度可分离卷积方法”被IEEE Journal of Selected Topics in Applied Earth Observations and Remote Sensing（JSTARS）录用',
  },
  {
    date: '2021-04-24',
    type: 'award',
    event:
      '雷大江教授指导的本科生参赛队在第十二届“蓝桥杯”全国软件和信息技术专业人才大赛全国总决赛中荣获二等奖2项、三等奖1项',
  },
  {
    date: '2021-06-01',
    type: 'career',
    event: [
      {
        id: 'chenli',
        name: '陈立',
        grade: 2018,
        signed: '腾讯科技（深圳）有限公司',
        intents: ['华为技术有限公司', '字节跳动有限公司'],
        position: '大数据开发工程师',
        honors: ['一等学业奖学金（2019）', '国家奖学金（2020）'],
      },
      {
        id: 'gaoqiming',
        name: '高启铭',
        grade: 2018,
        signed: '网易（杭州）网络有限公司',
        intents: ['中冶赛迪重庆信息技术有限公司'],
        position: '数据开发工程师',
        honors: ['二等学业奖学金（2019）', '二等学业奖学金（2020）'],
      },
    ],
  },
  {
    date: '2021-06-24',
    type: 'paper',
    event:
      '2018级硕士研究生郑婉婷硕士毕业论文“基于深度学习的遥感图像全色锐化方法研究”被答辩组推荐为校级优秀硕士毕业论文',
  },
  {
    date: '2021-10-15',
    type: 'report',
    event:
      '雷大江教授应邀在重庆市计算机学会2021年学术年会作题为《大数据智能：从平台到算法》的特邀学术报告',
  },
  {
    date: '2021-12-06',
    type: 'course',
    event: '雷大江教授负责的课程《大数据技术》获评重庆邮电大学2021年度校级一流本科课程',
  },
]
