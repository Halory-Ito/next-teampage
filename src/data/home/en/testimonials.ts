import { Testimonial } from '@/types/testimonial'

/**
 * Homepage · Student testimonials
 *
 * Based on real group members (see src/data/team/en/master). Names, cohorts,
 * placements and the facts in the quotes match the team records.
 */
export const homeTestimonials: Testimonial[] = [
  {
    id: 'chenhao',
    name: 'Hao Chen',
    role: '2019 Master · Algorithm Engineer at Baidu',
    quote:
      'During my master\u2019s, my paper was accepted by IEEE TGRS, I received the National Scholarship, and my thesis was rated an excellent university master\u2019s thesis. Our advisor guided us through every step of research while trusting us to own the full engineering pipeline. As an algorithm engineer at Baidu now, the rigorous habits and the ability to work independently that I built in the group still benefit me every day.',
  },
  {
    id: 'huangyihang',
    name: 'YiHang Huang',
    role: '2019 Master · Web Frontend Engineer at Meituan',
    quote:
      'My paper was accepted by IEEE TGRS and my thesis was rated an excellent university master\u2019s thesis. During job-hunting season, our advisor\u2019s advice and the experience shared by senior students helped me land an internship at Meituan and eventually a full-time position. The group taught me not only research methods but also hands-on engineering practice, so I could get up to speed quickly after joining.',
  },
  {
    id: 'zhanggenyuan',
    name: 'GenYuan Zhang',
    role: '2022 Master · Application Development Engineer at Tencent',
    quote:
      'In my final year I received the National Scholarship, published my paper in IEEE TGRS, and my thesis was rated an excellent university master\u2019s thesis of 2025. From pansharpening research to engineering practice on big data platforms, the group\u2019s training was well-rounded. Now an application development engineer at Tencent in Shenzhen, I am deeply grateful to my advisor and teammates.',
  },
]