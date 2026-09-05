/**
 * ORCID Public API 论文拉取服务
 *
 * - 使用官方公开接口：GET https://pub.orcid.org/v3.0/{orcid}/works
 * - 公开接口无需鉴权，返回该 ORCID 账号下可见的全部 work summary
 * - 通过 Next.js fetch 缓存 + revalidate 控制请求频率（默认每 24h 重新验证一次）
 * - 网络异常 / 限流等一律降级为可读的错误信息，不阻塞页面渲染
 *
 * 期刊 / 会议名称有两级来源：
 *   1. ORCID work summary 的 journal-title 字段（结构为 { value }）
 *   2. 若 ORCID 未登记出处（会议论文常见），按 DOI 去 Crossref 补全 container-title
 */

const ORCID_API_BASE = 'https://pub.orcid.org/v3.0'
const CROSSREF_API_BASE = 'https://api.crossref.org/works'

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

/* ---------- ORCID v3 响应的最小结构定义 ---------- */

interface OrcidTextValue {
  value?: string | null
}

interface OrcidTitle {
  title?: OrcidTextValue | null
}

/**
 * work summary 中 journal-title 的两种实际结构：
 * 多数来源为 { value }，少数历史来源为 { title: { value } }
 */
interface OrcidJournalTitle {
  value?: string | null
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
  'journal-title'?: OrcidJournalTitle | null
  type?: string
  'publication-date'?: OrcidPublicationDate | null
  'external-ids'?: { 'external-id'?: OrcidExternalId[] } | null
  url?: { value?: string | null } | null
}

interface OrcidWorksResponse {
  group?: Array<{ 'work-summary'?: OrcidWorkSummary[] }>
}

/* ---------- Crossref 响应的最小结构定义 ---------- */

interface CrossrefMessage {
  'container-title'?: string[]
  event?: { name?: string | null }
}

interface CrossrefResponse {
  message?: CrossrefMessage
}

/* ---------- 解析与归一化 ---------- */

function textValue(v?: OrcidTextValue | null): string | undefined {
  return v?.value?.trim() || undefined
}

/** journal-title 兼容两种结构取第一个非空值 */
function journalTitleValue(v?: OrcidJournalTitle | null): string | undefined {
  return textValue(v) ?? textValue(v?.title)
}

function findDoi(summary: OrcidWorkSummary): string | undefined {
  const ids = summary['external-ids']?.['external-id'] ?? []
  return ids.find((id) => id['external-id-type']?.toLowerCase() === 'doi')?.['external-id-value']
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
    journal: journalTitleValue(summary['journal-title']),
    doi: findDoi(summary),
    url: textValue(summary.url),
  }
}

/**
 * 通过 Crossref 按 DOI 查询期刊 / 会议名称。
 * 失败或记录缺失时返回 undefined（由调用方静默降级，不影响列表渲染）。
 */
async function fetchCrossrefContainerTitle(doi: string): Promise<string | undefined> {
  try {
    const res = await fetch(`${CROSSREF_API_BASE}/${encodeURIComponent(doi)}`, {
      headers: { Accept: 'application/json' },
      // Crossref 元数据几乎不变，缓存 30 天
      next: { revalidate: 60 * 60 * 24 * 30 },
    })
    if (!res.ok) return undefined

    const data = (await res.json()) as CrossrefResponse
    const container = data.message?.['container-title']?.find((item) => item.trim())
    if (container) return container.trim()

    // 部分会议只登记在 event 字段
    const eventName = data.message?.event?.name?.trim()
    return eventName || undefined
  } catch {
    return undefined
  }
}

/**
 * 并行（受限并发）为缺少出处的作品补全期刊 / 会议名。
 * 只会请求有 DOI 且 ORCID 未给出 journal-title 的作品。
 */
async function backfillMissingJournals(works: OrcidWork[]): Promise<void> {
  const pending = works.filter((work) => !work.journal && work.doi)
  if (pending.length === 0) return

  const CONCURRENCY = 6
  let cursor = 0

  const worker = async () => {
    while (cursor < pending.length) {
      const work = pending[cursor]
      cursor += 1
      work.journal = await fetchCrossrefContainerTitle(work.doi!)
    }
  }

  const workers = Array.from({ length: Math.min(CONCURRENCY, pending.length) }, () => worker())
  await Promise.all(workers)
}

/* ---------- 对外接口 ---------- */

/**
 * 拉取某个 ORCID 下的公开论文成果（按年份倒序）。
 * 论文出处优先取 ORCID journal-title，缺失时按 DOI 从 Crossref 补全。
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

    await backfillMissingJournals(works)

    return { ok: true, works }
  } catch {
    return { ok: false, error: 'network' }
  }
}
