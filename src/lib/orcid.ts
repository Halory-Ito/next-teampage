/**
 * ORCID Public API 论文拉取服务
 *
 * - 使用官方公开接口：GET https://pub.orcid.org/v3.0/{orcid}/works
 * - 公开接口无需鉴权，返回该 ORCID 账号下可见的全部 work summary
 * - 通过 Next.js fetch 缓存 + revalidate 控制请求频率（默认每 24h 重新验证一次）
 * - 网络异常 / 限流等一律降级为可读的错误信息，不阻塞页面渲染
 */

const ORCID_API_BASE = 'https://pub.orcid.org/v3.0'

/** 与站点语言无关的成果类型 -> 中文展示文案 */
const ORCID_TYPE_LABELS: Record<string, string> = {
  'journal-article': '期刊论文',
  'conference-paper': '会议论文',
  'book': '学术专著',
  'book-chapter': '专著章节',
  'edited-book': '编著',
  'dissertation': '学位论文',
  'thesis': '学位论文',
  'preprint': '预印本',
  'working-paper': '工作论文',
  'report': '研究报告',
  'dataset': '数据集',
  'patent': '专利',
  'software': '软件',
}

const ORCID_ID_PATTERN = /^\d{4}-\d{4}-\d{4}-\d{3}[0-9X]$/

export interface OrcidWork {
  /** ORCID 内部编号，用作列表 key */
  putCode: string
  title: string
  /** ORCID 原文类型标识，如 journal-article */
  type: string
  year?: number
  /** 期刊 / 会议 / 出版社等出处 */
  journal?: string
  doi?: string
  url?: string
}

export type OrcidWorksResult =
  | { ok: true; works: OrcidWork[] }
  | { ok: false; error: 'invalid' | 'network' | 'rate-limit' }

export const ORCID_PROFILE_URL = (orcid: string) => `https://orcid.org/${orcid}`

export function orcidTypeLabel(type: string): string {
  return ORCID_TYPE_LABELS[type] ?? type
}

/* ---------- ORCID v3 响应的最小结构定义 ---------- */

interface OrcidTextValue {
  value?: string | null
}

interface OrcidTitle {
  title?: OrcidTextValue | null
}

interface OrcidPublicationDate {
  year?: OrcidTextValue | null
  month?: OrcidTextValue | null
  day?: OrcidTextValue | null
}

interface OrcidExternalId {
  'external-id-type'?: string
  'external-id-value'?: string
  'external-id-relationship'?: string
}

interface OrcidWorkSummary {
  'put-code'?: string
  title?: OrcidTitle | null
  'journal-title'?: OrcidTitle | null
  type?: string
  'publication-date'?: OrcidPublicationDate | null
  'external-ids'?: { 'external-id'?: OrcidExternalId[] } | null
  url?: { value?: string | null } | null
}

interface OrcidWorksResponse {
  group?: Array<{ 'work-summary'?: OrcidWorkSummary[] }>
}

/* ---------- 解析与归一化 ---------- */

function textValue(v?: OrcidTextValue | null): string | undefined {
  return v?.value?.trim() || undefined
}

function titleTextValue(v?: OrcidTitle | null): string | undefined {
  return v?.title?.value?.trim() || undefined
}

function findDoi(summary: OrcidWorkSummary): string | undefined {
  const ids = summary['external-ids']?.['external-id'] ?? []
  return ids.find(
    (id) => id['external-id-type']?.toLowerCase() === 'doi',
  )?.['external-id-value']
}

/** 同一篇论文可能被多个来源重复登记（group 分组），挑选信息最完整的一条展示 */
function pickRepresentative(summaries: OrcidWorkSummary[]): OrcidWorkSummary | undefined {
  if (summaries.length === 0) return undefined
  return (
    summaries.find((s) => s.title?.title?.value && findDoi(s)) ??
    summaries.find((s) => s.title?.title?.value) ??
    summaries[0]
  )
}

function parseWorkSummary(summary: OrcidWorkSummary): OrcidWork | null {
  const title = summary.title?.title?.value?.trim()
  if (!title) return null

  const yearRaw = textValue(summary['publication-date']?.year)
  return {
    putCode: summary['put-code'] ?? '',
    title,
    type: summary.type ?? 'other',
    year: yearRaw ? Number(yearRaw) : undefined,
    journal: titleTextValue(summary['journal-title']),
    doi: findDoi(summary),
    url: textValue(summary.url),
  }
}

/* ---------- 对外接口 ---------- */

/**
 * 拉取某个 ORCID 下的公开论文成果（按年份倒序）。
 * 失败时返回可展示的错误码，由调用方决定如何降级展示。
 */
export async function fetchOrcidWorks(orcid: string): Promise<OrcidWorksResult> {
  if (!ORCID_ID_PATTERN.test(orcid)) {
    return { ok: false, error: 'invalid' }
  }

  try {
    const res = await fetch(`${ORCID_API_BASE}/${orcid}/works`, {
      headers: { Accept: 'application/json' },
      // 24h 内复用缓存，避免每个请求都打到 ORCID
      next: { revalidate: 60 * 60 * 24 },
    })

    // 该 ORCID 无公开记录时官方接口返回 404，等价于"暂无成果"
    if (res.status === 404) return { ok: true, works: [] }
    if (res.status === 429) return { ok: false, error: 'rate-limit' }
    if (!res.ok) return { ok: false, error: 'network' }

    const data = (await res.json()) as OrcidWorksResponse
    const works: OrcidWork[] = []

    for (const group of data.group ?? []) {
      const representative = pickRepresentative(group['work-summary'] ?? [])
      const work = representative ? parseWorkSummary(representative) : null
      if (work) works.push(work)
    }

    works.sort((a, b) => {
      const byYear = (b.year ?? 0) - (a.year ?? 0)
      if (byYear !== 0) return byYear
      return Number(b.putCode) - Number(a.putCode)
    })

    return { ok: true, works }
  } catch {
    return { ok: false, error: 'network' }
  }
}
