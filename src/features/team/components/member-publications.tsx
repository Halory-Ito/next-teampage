import { Suspense } from 'react'
import { AlertCircle, BookOpen, ExternalLink } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { fetchOrcidWorks, ORCID_PROFILE_URL } from '@/features/team/lib/orcid'

import PublicationsList from './publications-list'

/** 加载中的骨架屏：结构尽量与真实列表一致，避免布局跳动 */
function WorkRowSkeleton() {
  return (
    <div className="flex items-start gap-4 px-3 py-4">
      <Skeleton className="hidden h-4 w-14 shrink-0 sm:block" />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <Skeleton className="h-5 w-4/5 max-w-100" />
        <Skeleton className="h-4 w-2/5 max-w-56" />
        <div className="flex items-center gap-3">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-4 w-44" />
        </div>
      </div>
    </div>
  )
}

function MemberPublicationsFallback() {
  return (
    <Card aria-busy="true">
      <CardHeader>
        <Skeleton className="h-7 w-28" />
      </CardHeader>
      <CardContent className="flex flex-col divide-y divide-border">
        {[0, 1, 2].map((i) => (
          <WorkRowSkeleton key={i} />
        ))}
      </CardContent>
    </Card>
  )
}

function PublicationsEmpty({
  icon,
  message,
  orcid,
  linkLabel,
}: {
  icon: 'book' | 'alert'
  message: string
  orcid: string
  linkLabel?: string
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed px-6 py-10 text-center">
      {icon === 'book' ? (
        <BookOpen className="size-8 text-muted-foreground" />
      ) : (
        <AlertCircle className="size-8 text-muted-foreground" />
      )}
      <p className="text-sm text-muted-foreground">{message}</p>
      {linkLabel && orcid && (
        <a
          href={ORCID_PROFILE_URL(orcid)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-sm text-foreground underline-offset-4 hover:underline"
        >
          {linkLabel}
          <ExternalLink className="size-3.5" />
        </a>
      )}
    </div>
  )
}

async function MemberPublicationsContent({ orcid }: { orcid: string }) {
  const t = await getTranslations('Team.Member')
  const result = await fetchOrcidWorks(orcid)

  return (
    <Card>
      <CardHeader>
        <h2 className="font-heading text-xl font-semibold tracking-tight">{t('paper')}</h2>
      </CardHeader>
      <CardContent>
        {result.ok && result.works.length > 0 ? (
          <PublicationsList works={result.works} />
        ) : (
          <PublicationsEmpty
            icon={result.ok ? 'book' : 'alert'}
            message={
              result.ok
                ? t('paperNoWorks')
                : result.error === 'invalid'
                  ? t('paperInvalid')
                  : t('paperError')
            }
            orcid={orcid}
            linkLabel={t('paperViewOrcid')}
          />
        )}
      </CardContent>
    </Card>
  )
}

/** 论文列表：未提供 ORCID 时直接给出占位卡片；否则拉取期间先渲染骨架屏，数据就绪后流式替换 */
export default async function MemberPublications({ orcid }: { orcid?: string }) {
  const t = await getTranslations('Team.Member')

  if (!orcid) {
    return (
      <Card>
        <CardHeader>
          <h2 className="font-heading text-xl font-semibold tracking-tight">{t('paper')}</h2>
        </CardHeader>
        <CardContent>
          <PublicationsEmpty icon="book" message={t('paperNoOrcid')} orcid="" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Suspense fallback={<MemberPublicationsFallback />}>
      <MemberPublicationsContent orcid={orcid} />
    </Suspense>
  )
}
