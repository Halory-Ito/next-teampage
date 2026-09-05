import { getTranslations } from 'next-intl/server'

import type { WorkHistory } from '@/types/member'

import MemberExperienceItem from './member-experience-item'
import MemberSectionCard from './member-section-card'

type MemberWorkHistoryProps = {
  items?: WorkHistory[]
}

/** 工作经历 */
export default async function MemberWorkHistory({ items }: MemberWorkHistoryProps) {
  const t = await getTranslations('Team.Member')
  const list = items ?? []

  return (
    <MemberSectionCard title={t('work')}>
      {list.length > 0 ? (
        <ol className="flex flex-col divide-y divide-border">
          {list.map((item) => (
            <MemberExperienceItem
              key={`${item.startDate}-${item.company}-${item.position}`}
              startDate={item.startDate}
              endDate={item.endDate}
              title={item.position}
              subtitle={item.company}
              presentLabel={t('ongoing')}
            />
          ))}
        </ol>
      ) : (
        <p className="text-muted-foreground">{t('workEmpty')}</p>
      )}
    </MemberSectionCard>
  )
}
