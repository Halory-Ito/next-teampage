import { getTranslations } from 'next-intl/server'

import type { Education } from '@/types/member'

import MemberExperienceItem from './member-experience-item'
import MemberSectionCard from './member-section-card'

type MemberEducationProps = {
  items?: Education[]
}

/** 教育经历 */
export default async function MemberEducation({ items }: MemberEducationProps) {
  const t = await getTranslations('Team.Member')
  const list = items ?? []

  return (
    <MemberSectionCard title={t('edu')}>
      {list.length > 0 ? (
        <ol className="flex flex-col divide-y divide-border">
          {list.map((item) => (
            <MemberExperienceItem
              key={`${item.startDate}-${item.school}`}
              startDate={item.startDate}
              endDate={item.endDate}
              title={item.school}
              presentLabel={t('ongoing')}
            />
          ))}
        </ol>
      ) : (
        <p className="text-muted-foreground">{t('eduEmpty')}</p>
      )}
    </MemberSectionCard>
  )
}
