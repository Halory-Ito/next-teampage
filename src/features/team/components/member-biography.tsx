import { getTranslations } from 'next-intl/server'

import MemberSectionCard from './member-section-card'

type MemberBiographyProps = {
  biography: string
}

/** 个人介绍 */
export default async function MemberBiography({ biography }: MemberBiographyProps) {
  const t = await getTranslations('Team.Member')
  const content = biography.trim()

  return (
    <MemberSectionCard title={t('bio')}>
      {content ? (
        <p className="leading-relaxed whitespace-pre-line">{content}</p>
      ) : (
        <p className="text-muted-foreground">{t('bioEmpty')}</p>
      )}
    </MemberSectionCard>
  )
}
