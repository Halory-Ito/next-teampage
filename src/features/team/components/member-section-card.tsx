import type { ReactNode } from 'react'

import { Card, CardContent, CardHeader } from '@/components/ui/card'

type MemberSectionCardProps = {
  /** 已按当前语言本地化的区块标题 */
  title: string
  children: ReactNode
}

/** 成员详情页通用内容区块：本地化标题 + 内容 */
export default function MemberSectionCard({ title, children }: MemberSectionCardProps) {
  return (
    <Card>
      <CardHeader>
        <h2 className="font-heading text-xl font-semibold tracking-tight">{title}</h2>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}
