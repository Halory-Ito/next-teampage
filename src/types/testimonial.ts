/** 首页 · 学生评价单条 */
export type Testimonial = {
  id: string
  /** 姓名（展示用首字/末字生成圆形头像） */
  name: string
  /** 身份或毕业去向，如“2018级硕士 · 腾讯” */
  role: string
  /** 评价正文 */
  quote: string
}
