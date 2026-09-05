import { getTranslations } from 'next-intl/server'

import MemberSectionCard from './member-section-card'

type MemberResearchProps = {
  research: string
}

/** 研究方向 */
export default async function MemberResearch({ research }: MemberResearchProps) {
  const t = await getTranslations('Team.Member')
  const content = research.trim()

  return (
    <MemberSectionCard title={t('research')}>
      {content ? (
        <p className="leading-relaxed whitespace-pre-line">{content}</p>
      ) : (
        <p className="text-muted-foreground">{t('researchEmpty')}</p>
      )}
    </MemberSectionCard>
  )
}
