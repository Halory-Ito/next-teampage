'use client'

import {
  CheckCircle2,
  Pause,
  Play,
  RotateCcw,
  ShieldAlert,
  Trash2,
  Upload,
  UploadCloud,
  X,
  XCircle,
} from 'lucide-react'
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
  type ReactNode,
} from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/* ============================================================
 * 前端文件上传 —— 学习实验页
 * 配套文字笔记：同目录 notes.md
 *
 * 示例一览：
 *  01 最基础的上传：input[type=file] + FormData + fetch
 *  02 上传前常用判断：大小 / MIME / 扩展名 / 数量 / 文件名
 *  03 拖拽上传 + 图片即时预览（objectURL）
 *  04 上传进度与取消（对应 xhr.upload.onprogress / xhr.abort）
 *  05 大文件分片 + 断点续传（File.slice + 已上传分片记录）
 *  06 安全问题清单（前端只是第一道体验层，安全靠后端）
 *
 * 说明：本仓库没有真实上传接口，示例均为“纯前端演示”。
 * 真正发送时把 FormData 交给服务端接口（Next.js 中通常是
 * src/app/api/xxx/route.ts 的 Route Handler 或 Server Action）。
 * ============================================================ */

const MAX_SIZE = 10 * 1024 * 1024 // 10 MB
const MAX_COUNT = 3
const ACCEPT_MIME = ['image/png', 'image/jpeg']
const ACCEPT_EXT = ['png', 'jpg', 'jpeg']
// 文件名禁止 \ / : * ? " < > | 以及控制字符（\u0000-\u001f）
// oxlint-disable-next-line no-control-regex
const NAME_FORBIDDEN = /[\\/:*?"<>|\u0000-\u001f]/

/* ---------------- 通用小工具 ---------------- */

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return '-'
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  return `${(bytes / 1024 ** i).toFixed(i === 0 ? 0 : 2)} ${units[i]}`
}

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-xl border border-border/70 bg-muted/50 p-3 font-mono text-[11.5px] leading-relaxed text-foreground [tab-size:2]">
      <code>{children}</code>
    </pre>
  )
}

function ProgressBar({ percent, active }: { percent: number; active?: boolean }) {
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(percent)}
      aria-valuemin={0}
      aria-valuemax={100}
      className="h-2 w-full overflow-hidden rounded-full bg-muted"
    >
      <div
        className={cn(
          'h-full rounded-full bg-primary transition-[width] duration-150',
          active && 'animate-pulse',
        )}
        style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
      />
    </div>
  )
}

function Section({
  id,
  no,
  title,
  subtitle,
  children,
}: {
  id: string
  no: string
  title: string
  subtitle?: ReactNode
  children: ReactNode
}) {
  return (
    <section id={id} className="mt-12 scroll-mt-36">
      <div className="mb-2 flex items-baseline gap-3">
        <span className="font-mono text-xs font-semibold text-primary/80">{no}</span>
        <h2 className="font-heading text-lg font-semibold tracking-tight">{title}</h2>
      </div>
      {subtitle ? (
        <div className="mb-4 text-sm leading-6 text-muted-foreground">{subtitle}</div>
      ) : null}
      <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm sm:p-6">
        {children}
      </div>
    </section>
  )
}

function ErrorNote({ text }: { text: string }) {
  return (
    <p className="flex items-start gap-1.5 text-xs leading-5 text-destructive">
      <XCircle className="mt-0.5 size-3.5 shrink-0" />
      {text}
    </p>
  )
}

function OkNote({ text }: { text: string }) {
  return (
    <p className="flex items-start gap-1.5 text-xs leading-5 text-emerald-600 dark:text-emerald-400">
      <CheckCircle2 className="mt-0.5 size-3.5 shrink-0" />
      {text}
    </p>
  )
}

/* ============================================================
 * 01 · 最基础的上传：input + FormData + fetch
 * ============================================================ */

function DemoBasicUpload() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [files, setFiles] = useState<File[]>([])
  const [sent, setSent] = useState<string[] | null>(null)

  const pick = (list: FileList | null) => {
    if (!list || list.length === 0) return
    // input.files 是 FileList（类数组），先转成数组更好操作
    setFiles(Array.from(list))
    setSent(null)
  }

  const removeAt = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
    setSent(null)
  }

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (files.length === 0) return

    // 1) 把 File 塞进 FormData（append 第三个参数可自定义文件名）
    const formData = new FormData()
    files.forEach((file, i) => formData.append(`file_${i + 1}`, file, file.name))

    // 2) 真实发送（本仓库无后端接口，仅把表单内容打印出来演示）：
    //    await fetch('/api/upload', { method: 'POST', body: formData })
    //    注意：不要手动设置 Content-Type，浏览器会自动加上
    //    multipart/form-data; boundary=xxx

    const lines: string[] = []
    for (const [key, value] of formData.entries()) {
      lines.push(
        value instanceof File
          ? `${key} = File(name=${value.name}, type=${value.type || '未知'}, size=${formatBytes(value.size)})`
          : `${key} = ${value}`,
      )
    }
    setSent(lines)
  }

  return (
    <div className="space-y-5">
      <form onSubmit={submit}>
        <div className="flex flex-wrap items-center gap-3">
          <input
            ref={inputRef}
            type="file"
            name="file"
            multiple
            accept="image/png,image/jpeg,application/pdf"
            className="hidden"
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              pick(e.target.files)
              e.target.value = '' // 允许再次选择同一个文件时重新触发 change
            }}
          />
          <Button type="button" variant="outline" onClick={() => inputRef.current?.click()}>
            <Upload /> 选择文件（可多选）
          </Button>
          <Button type="submit" disabled={files.length === 0}>
            提交（演示）
          </Button>
          {files.length > 0 ? (
            <Button type="button" variant="ghost" size="sm" onClick={() => setFiles([])}>
              清空
            </Button>
          ) : null}
        </div>

        {files.length > 0 ? (
          <ul className="mt-4 divide-y divide-border/70 rounded-xl border border-border/70">
            {files.map((file, i) => (
              <li
                key={`${file.name}-${file.lastModified}-${i}`}
                className="flex items-center gap-3 px-3 py-2 text-sm"
              >
                <span className="min-w-0 flex-1 truncate">{file.name}</span>
                <span className="hidden text-xs text-muted-foreground sm:inline">
                  {file.type || '未知类型'}
                </span>
                <span className="font-mono text-xs text-muted-foreground">
                  {formatBytes(file.size)}
                </span>
                <button
                  type="button"
                  aria-label={`移除 ${file.name}`}
                  onClick={() => removeAt(i)}
                  className="text-muted-foreground transition-colors hover:text-destructive"
                >
                  <X className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-xs text-muted-foreground">
            尚未选择文件。accept 属性只影响系统文件选择框的筛选，不是安全校验；真正校验见下一节。
          </p>
        )}
      </form>

      <div>
        <p className="mb-2 text-xs font-medium text-muted-foreground">
          真正的“发送”只需要三行（当前为演示模式，仅打印 FormData 内容）：
        </p>
        <CodeBlock>{`const formData = new FormData()
files.forEach((file) => formData.append('files', file))

const res = await fetch('/api/upload', { method: 'POST', body: formData })
// 不要手动设置 Content-Type，浏览器会补上 multipart/form-data; boundary=...`}</CodeBlock>
      </div>

      {sent ? (
        <div className="space-y-2 rounded-xl border border-primary/30 bg-primary/5 p-3">
          <OkNote text="已构造 FormData，本 demo 未真正发送。请求体会是下面这样的 multipart 表单：" />
          {sent.map((line) => (
            <p key={line} className="font-mono text-[11.5px] leading-5 text-muted-foreground">
              {line}
            </p>
          ))}
        </div>
      ) : null}
    </div>
  )
}

/* ============================================================
 * 02 · 常用判断：大小 / MIME / 扩展名 / 数量 / 文件名
 * ============================================================ */

type RuleKey = 'size' | 'mime' | 'ext' | 'count' | 'name'

const RULE_ITEMS: { key: RuleKey; title: string; tip: string }[] = [
  { key: 'size', title: '大小 ≤ 10 MB', tip: '比较 file.size（单位是字节）' },
  {
    key: 'mime',
    title: 'MIME 白名单：image/png、image/jpeg',
    tip: 'file.type 来自浏览器解析，可伪造，见 06 节',
  },
  {
    key: 'ext',
    title: '扩展名白名单：.png / .jpg / .jpeg',
    tip: '与 MIME 双检查，降低“改名绕过”概率',
  },
  { key: 'count', title: '数量 ≤ 3 个', tip: '多文件时检查 files.length' },
  {
    key: 'name',
    title: '文件名：无非法字符、长度 ≤ 80',
    tip: '上传前清洗；更稳妥的是服务端一律重命名',
  },
]

const RULE_DEFAULT: Record<RuleKey, boolean> = {
  size: true,
  mime: true,
  ext: true,
  count: true,
  name: false,
}

function DemoValidate() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [files, setFiles] = useState<File[]>([])
  const [rules, setRules] = useState<Record<RuleKey, boolean>>(RULE_DEFAULT)
  const [submitted, setSubmitted] = useState(false)

  const toggle = (key: RuleKey) => setRules((prev) => ({ ...prev, [key]: !prev[key] }))

  const pick = (list: FileList | null) => {
    if (!list) return
    setFiles(Array.from(list))
    setSubmitted(false)
  }

  // 校验逻辑集中在一个函数里：返回“文件索引 or null(全局) + 错误信息”
  const errors = useMemo(() => {
    const result: { index: number | null; text: string }[] = []
    if (files.length === 0) return result

    if (rules.count && files.length > MAX_COUNT) {
      result.push({
        index: null,
        text: `一次最多上传 ${MAX_COUNT} 个文件，当前选了 ${files.length} 个`,
      })
    }

    files.forEach((file, index) => {
      if (rules.size && file.size > MAX_SIZE) {
        result.push({
          index,
          text: `大小 ${formatBytes(file.size)} 超过 ${formatBytes(MAX_SIZE)} 限制`,
        })
      }
      if (rules.mime && !ACCEPT_MIME.includes(file.type)) {
        result.push({
          index,
          text: `MIME「${file.type || '(空)'}」不在白名单：${ACCEPT_MIME.join(' / ')}`,
        })
      }
      const dot = file.name.lastIndexOf('.')
      const ext = dot > 0 ? file.name.slice(dot + 1).toLowerCase() : ''
      if (rules.ext && !ACCEPT_EXT.includes(ext)) {
        result.push({
          index,
          text: `扩展名「.${ext || '(无)'}」不允许，仅支持 .png / .jpg / .jpeg`,
        })
      }
      if (rules.name) {
        if (NAME_FORBIDDEN.test(file.name)) {
          result.push({ index, text: '文件名含非法字符（\\ / : * ? " < > | 或控制字符）' })
        }
        if (file.name.length > 80) {
          result.push({ index, text: `文件名长度 ${file.name.length} 超过 80` })
        }
      }
    })
    return result
  }, [files, rules])

  const pass = files.length > 0 && errors.length === 0

  return (
    <div className="space-y-5">
      <div>
        <p className="mb-3 text-xs font-medium text-muted-foreground">
          勾选要演示的校验规则（改动实时重算）：
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {RULE_ITEMS.map((item) => (
            <label
              key={item.key}
              className={cn(
                'flex cursor-pointer items-start gap-2 rounded-lg border p-2.5 text-sm transition-colors',
                rules[item.key] ? 'border-primary/40 bg-primary/5' : 'border-border/70',
              )}
            >
              <input
                type="checkbox"
                checked={rules[item.key]}
                onChange={() => toggle(item.key)}
                className="mt-0.5 accent-(--primary)"
              />
              <span className="min-w-0">
                <span className="block font-medium">{item.title}</span>
                <span className="block text-xs text-muted-foreground">{item.tip}</span>
              </span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            pick(e.target.files)
            e.target.value = ''
          }}
        />
        <Button type="button" variant="outline" onClick={() => inputRef.current?.click()}>
          <Upload /> 选择测试文件
        </Button>
      </div>

      {files.length > 0 ? (
        <ul className="divide-y divide-border/70 rounded-xl border border-border/70">
          {files.map((file, index) => {
            const fileErrors = errors.filter((e) => e.index === index)
            return (
              <li key={`${file.name}-${file.lastModified}`} className="px-3 py-2.5">
                <div className="flex items-center gap-3 text-sm">
                  <span className="min-w-0 flex-1 truncate">{file.name}</span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {formatBytes(file.size)}
                  </span>
                </div>
                {fileErrors.length > 0 ? (
                  <div className="mt-1.5 space-y-1">
                    {fileErrors.map((e) => (
                      <ErrorNote key={e.text} text={e.text} />
                    ))}
                  </div>
                ) : (
                  <OkNote text="该文件通过所选规则" />
                )}
              </li>
            )
          })}
        </ul>
      ) : null}

      {errors.some((e) => e.index === null) ? (
        <div className="space-y-1">
          {errors
            .filter((e) => e.index === null)
            .map((e) => (
              <ErrorNote key={e.text} text={e.text} />
            ))}
        </div>
      ) : null}

      {pass ? <OkNote text={`${files.length} 个文件全部通过，可以提交`} /> : null}

      <div className="flex items-center gap-3">
        <Button type="button" disabled={!pass} onClick={() => setSubmitted(true)}>
          提交上传
        </Button>
        {submitted ? (
          <OkNote text="已提交（演示）" />
        ) : (
          <ErrorNote text="未通过校验，按钮禁用 —— 这就是“先判断、后提交”的体验层" />
        )}
      </div>
    </div>
  )
}

/* ============================================================
 * 03 · 拖拽上传 + 图片即时预览（objectURL）
 * ============================================================ */

interface PreviewItem {
  id: number
  file: File
  url: string
}

let previewSeq = 0

function DemoDragPreview() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [items, setItems] = useState<PreviewItem[]>([])
  const [dragging, setDragging] = useState(false)
  const [tip, setTip] = useState('')
  const depthRef = useRef(0)
  const itemsRef = useRef(items)
  itemsRef.current = items

  // 组件卸载时统一回收所有 objectURL，避免内存泄漏
  useEffect(() => {
    return () => {
      itemsRef.current.forEach((item) => URL.revokeObjectURL(item.url))
    }
  }, [])

  const addFiles = (list: FileList | null) => {
    if (!list || list.length === 0) return
    const arr = Array.from(list)
    // 常见判断示例：只收图片，且 ≤ 5MB
    const images = arr.filter((f) => f.type.startsWith('image/') && f.size <= 5 * 1024 * 1024)
    const rejected = arr.length - images.length

    const next = images.map((file) => ({
      id: ++previewSeq,
      file,
      // 为每个文件生成一个“本地内存地址”，可直接塞进 <img src>
      url: URL.createObjectURL(file),
    }))
    setItems((prev) => [...prev, ...next])
    setTip(
      rejected > 0
        ? `已忽略 ${rejected} 个不符合条件的文件（仅支持图片且 ≤ 5MB）`
        : `已添加 ${images.length} 张图片（objectURL 仅在当前页面会话内有效）`,
    )
  }

  const removeItem = (id: number) => {
    setItems((prev) => {
      const target = prev.find((item) => item.id === id)
      if (target) URL.revokeObjectURL(target.url) // 删除后立刻回收
      return prev.filter((item) => item.id !== id)
    })
  }

  const clearAll = () => {
    setItems((prev) => {
      prev.forEach((item) => URL.revokeObjectURL(item.url))
      return []
    })
  }

  const onDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    depthRef.current = 0
    setDragging(false)
    addFiles(e.dataTransfer.files)
  }

  return (
    <div className="space-y-5">
      <label
        onDragEnter={(e) => {
          e.preventDefault()
          depthRef.current += 1
          setDragging(true)
        }}
        onDragOver={(e) => {
          e.preventDefault()
          e.dataTransfer.dropEffect = 'copy'
        }}
        onDragLeave={(e) => {
          e.preventDefault()
          depthRef.current -= 1
          if (depthRef.current === 0) setDragging(false)
        }}
        onDrop={onDrop}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-12 text-center transition-colors',
          dragging
            ? 'border-primary bg-primary/10'
            : 'border-border hover:border-primary/60 hover:bg-muted/40',
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            addFiles(e.target.files)
            e.target.value = ''
          }}
        />
        <UploadCloud
          className={cn('size-9', dragging ? 'text-primary' : 'text-muted-foreground')}
        />
        <span className="text-sm font-medium">拖拽图片到这里，或点击选择文件</span>
        <span className="max-w-md text-xs leading-5 text-muted-foreground">
          拖拽的本质是读取
          e.dataTransfer.files；出于浏览器安全限制，网页永远拿不到文件的完整本地路径，只有 File 对象
        </span>
      </label>

      {tip ? <p className="text-xs text-muted-foreground">{tip}</p> : null}

      {items.length > 0 ? (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              已选 {items.length} 张
            </span>
            <Button type="button" variant="ghost" size="sm" onClick={clearAll}>
              <Trash2 /> 全部移除
            </Button>
          </div>
          <ul className="flex flex-wrap gap-3">
            {items.map((item) => (
              <li key={item.id} className="w-24">
                <div className="group relative">
                  {/* 预览用的 src 就是 objectURL，不需要上传就能显示 */}
                  <img
                    src={item.url}
                    alt={item.file.name}
                    className="h-24 w-24 rounded-lg border border-border object-cover"
                  />
                  <button
                    type="button"
                    aria-label={`移除 ${item.file.name}`}
                    onClick={() => removeItem(item.id)}
                    className="absolute -right-2 -top-2 rounded-full bg-background p-0.5 text-muted-foreground shadow ring-1 ring-border transition-colors hover:text-destructive"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
                <p
                  className="mt-1 truncate text-[11px] text-muted-foreground"
                  title={item.file.name}
                >
                  {item.file.name}
                </p>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          预览采用 URL.createObjectURL(file)，用完要 revokeObjectURL 回收内存（本示例在移除 / 清空 /
          卸载时回收）。 另一种转 base64 的方式见 notes.md 3.1 节，两者取舍也在其中。
        </p>
      )}
    </div>
  )
}

/* ============================================================
 * 04 · 上传进度与取消
 * （对应真实代码 xhr.upload.onprogress + xhr.abort()）
 * ============================================================ */

function DemoProgress() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [percent, setPercent] = useState(0)
  const [phase, setPhase] = useState<'idle' | 'running' | 'done' | 'cancelled'>('idle')
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const percentRef = useRef(0)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  const stop = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  const pick = (list: FileList | null) => {
    if (!list || list.length === 0) return
    setFile(list[0])
    stop()
    percentRef.current = 0
    setPercent(0)
    setPhase('idle')
  }

  // 本 demo 没有后端，用定时器模拟 xhr.upload.onprogress 的进度回调
  const start = () => {
    if (!file) return
    if (percentRef.current >= 100) {
      percentRef.current = 0
      setPercent(0)
    }
    setPhase('running')
    timerRef.current = setInterval(() => {
      percentRef.current = Math.min(100, percentRef.current + 3 + Math.random() * 8)
      setPercent(percentRef.current)
      if (percentRef.current >= 100) {
        stop()
        setPhase('done')
      }
    }, 160)
  }

  const cancel = () => {
    stop()
    percentRef.current = 0
    setPercent(0)
    setPhase('cancelled')
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            pick(e.target.files)
            e.target.value = ''
          }}
        />
        <Button type="button" variant="outline" onClick={() => inputRef.current?.click()}>
          <Upload /> 选择文件
        </Button>
        {file ? (
          <>
            <Button
              type="button"
              onClick={start}
              disabled={phase === 'running' || phase === 'done'}
            >
              {phase === 'idle' ? (
                <>
                  <Play /> 开始上传
                </>
              ) : (
                '重新上传'
              )}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={cancel}
              disabled={phase !== 'running'}
            >
              <X /> 取消（对应 xhr.abort()）
            </Button>
          </>
        ) : null}
      </div>

      {file ? (
        <div className="space-y-2 rounded-xl border border-border/70 p-4">
          <p className="truncate text-sm">
            {file.name}
            <span className="ml-2 font-mono text-xs text-muted-foreground">
              {formatBytes(file.size)}
            </span>
          </p>
          <ProgressBar percent={percent} active={phase === 'running'} />
          <p className="text-right font-mono text-xs text-muted-foreground">
            {Math.round(percent)}%
          </p>
          {phase === 'running' ? (
            <p className="text-xs text-muted-foreground">
              上传中……（进度事件频率由浏览器决定，这里 160ms 模拟一次）
            </p>
          ) : null}
          {phase === 'done' ? (
            <OkNote text="上传完成（演示）。真实场景以 HTTP 响应是否成功为准，而不是进度 100%。" />
          ) : null}
          {phase === 'cancelled' ? (
            <ErrorNote text="已取消。真实场景调用 xhr.abort() 后应释放资源并提示用户。" />
          ) : null}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          选择一个文件，观察“开始 / 进度 / 取消”三种状态。
        </p>
      )}

      <div>
        <p className="mb-2 text-xs font-medium text-muted-foreground">
          换成真实接口时的写法（要点：进度事件在 xhr.upload 上、取消用 abort）：
        </p>
        <CodeBlock>{`const xhr = new XMLHttpRequest()
xhr.open('POST', '/api/upload')

// 进度事件挂在 xhr.upload 上（上传方向），不是 xhr 本体
xhr.upload.onprogress = (e) => {
  if (e.lengthComputable) {
    setPercent(Math.round((e.loaded / e.total) * 100))
  }
}
xhr.onload = () => setPhase('done')   // HTTP 2xx 才算成功
xhr.onerror = () => setPhase('error')

xhr.send(formData)

// 取消上传
xhr.abort()`}</CodeBlock>
      </div>
    </div>
  )
}

/* ============================================================
 * 05 · 大文件：分片上传 + 断点续传（File.slice）
 * ============================================================ */

const CHUNK_SIZE = 2 * 1024 * 1024 // 每个分片 2MB
type ChunkState = 'pending' | 'uploading' | 'done'

function DemoChunkUpload() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [chunks, setChunks] = useState<ChunkState[]>([])
  const [running, setRunning] = useState(false)
  const [finished, setFinished] = useState(false)
  const statusRef = useRef<ChunkState[]>([])
  const runningRef = useRef(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const applyChunks = (next: ChunkState[]) => {
    statusRef.current = next
    setChunks(next.slice())
  }

  const mark = (index: number, state: ChunkState) => {
    const next = statusRef.current.slice()
    next[index] = state
    applyChunks(next)
  }

  const pick = (list: FileList | null) => {
    const f = list?.[0] ?? null
    setFile(f)
    setRunning(false)
    runningRef.current = false
    setFinished(false)
    if (timerRef.current) clearTimeout(timerRef.current)
    if (!f) {
      applyChunks([])
      return
    }
    const count = Math.max(1, Math.ceil(f.size / CHUNK_SIZE))
    applyChunks(Array.from<ChunkState>({ length: count }).fill('pending'))
  }

  const uploadNext = () => {
    if (!runningRef.current) return // 被暂停了，别再继续
    const index = statusRef.current.findIndex((s) => s === 'pending')
    if (index === -1) {
      runningRef.current = false
      setRunning(false)
      setFinished(true)
      return
    }
    mark(index, 'uploading')
    timerRef.current = setTimeout(
      () => {
        // 真实场景：这里发送 fetch('/api/upload/chunk', { method:'POST',
        // body: 切片 Blob })；收到 2xx 后把该片标记为“服务端已接收”
        mark(index, 'done')
        uploadNext()
      },
      300 + Math.random() * 500,
    )
  }

  const start = () => {
    if (!file || running) return
    runningRef.current = true
    setRunning(true)
    setFinished(false)
    uploadNext()
  }

  const pause = () => {
    runningRef.current = false
    if (timerRef.current) clearTimeout(timerRef.current)
    // 把“正在传但没传完”的那片还原为 pending，续传时重传它
    const uploading = statusRef.current.findIndex((s) => s === 'uploading')
    if (uploading !== -1) mark(uploading, 'pending')
    setRunning(false)
  }

  const restart = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    runningRef.current = false
    setRunning(false)
    setFinished(false)
    if (!file) return
    const count = Math.max(1, Math.ceil(file.size / CHUNK_SIZE))
    applyChunks(Array.from<ChunkState>({ length: count }).fill('pending'))
  }

  // 演示“断点续传”：假设上一次上传中，服务端已经收到了前 2 片
  const simulateServerHasChunks = () => {
    if (running) return
    const count = statusRef.current.length
    const keep = Math.min(2, count)
    for (let i = 0; i < keep; i += 1) {
      const next = statusRef.current.slice()
      next[i] = 'done'
      applyChunks(next)
    }
    setFinished(false)
  }

  const doneCount = chunks.filter((s) => s === 'done').length
  const percent = chunks.length === 0 ? 0 : (doneCount / chunks.length) * 100
  const statusText = finished
    ? '全部分片上传完成'
    : running
      ? `正在上传第 ${chunks.findIndex((s) => s === 'uploading') + 1} 片……`
      : doneCount > 0
        ? `已上传 ${doneCount}/${chunks.length} 片，可继续续传`
        : '等待开始'

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            pick(e.target.files)
            e.target.value = ''
          }}
        />
        <Button type="button" variant="outline" onClick={() => inputRef.current?.click()}>
          <Upload /> 选择文件（建议 5MB 以上便于观察）
        </Button>
        {file ? (
          <>
            {!running && !finished ? (
              <Button type="button" onClick={start}>
                <Play /> {doneCount > 0 ? '继续上传（断点续传）' : '开始上传'}
              </Button>
            ) : null}
            {running ? (
              <Button type="button" variant="secondary" onClick={pause}>
                <Pause /> 暂停
              </Button>
            ) : null}
            {!running && !finished ? (
              <Button
                type="button"
                variant="outline"
                onClick={simulateServerHasChunks}
                disabled={doneCount > 0}
              >
                模拟：服务器已有前 2 片
              </Button>
            ) : null}
            <Button type="button" variant="ghost" onClick={restart}>
              <RotateCcw /> 重置
            </Button>
          </>
        ) : null}
      </div>

      {file ? (
        <div className="space-y-3 rounded-xl border border-border/70 p-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
            <span className="min-w-0 truncate">{file.name}</span>
            <span className="font-mono text-xs text-muted-foreground">
              {formatBytes(file.size)} · {chunks.length} 片 × {formatBytes(CHUNK_SIZE)}
            </span>
          </div>

          <ProgressBar percent={percent} active={running} />
          <p className="flex items-center justify-between font-mono text-xs text-muted-foreground">
            <span>{statusText}</span>
            <span>{Math.round(percent)}%</span>
          </p>

          <div>
            <div className="mb-1.5 flex gap-3 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <i className="size-2.5 rounded-sm bg-muted ring-1 ring-border" /> pending
              </span>
              <span className="flex items-center gap-1">
                <i className="size-2.5 animate-pulse rounded-sm bg-primary" /> uploading
              </span>
              <span className="flex items-center gap-1">
                <i className="size-2.5 rounded-sm bg-primary/25 ring-1 ring-primary/40" /> done
              </span>
            </div>
            <div className="grid grid-cols-8 gap-1.5 sm:grid-cols-12 lg:grid-cols-16">
              {chunks.map((state, index) => (
                <div
                  key={index}
                  title={`第 ${index + 1} 片：${state}`}
                  className={cn(
                    'flex h-7 items-center justify-center rounded-md font-mono text-[10px]',
                    state === 'done' && 'bg-primary/25 text-primary ring-1 ring-primary/40',
                    state === 'uploading' && 'animate-pulse bg-primary text-primary-foreground',
                    state === 'pending' && 'bg-muted text-muted-foreground ring-1 ring-border',
                  )}
                >
                  {index + 1}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          选择文件后按每片 {formatBytes(CHUNK_SIZE)}{' '}
          切片演示：先“开始”，中途“暂停”，再点“继续上传”，已完成的片会被跳过 ——
          这就是断点续传的核心思路。
        </p>
      )}

      <div>
        <p className="mb-2 text-xs font-medium text-muted-foreground">
          真实场景的切片与发送（每片是一个独立 HTTP 请求，服务端按“文件标识 +
          分片序号”暂存，全部到齐后合并）：
        </p>
        <CodeBlock>{`const CHUNK_SIZE = 2 * 1024 * 1024
const total = Math.ceil(file.size / CHUNK_SIZE)

for (let i = 0; i < total; i += 1) {
  // File.slice() 得到的是一个 Blob 切片，不拷贝整份文件进内存
  const blob = file.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE)

  const fd = new FormData()
  fd.append('fileId', fileId)   // 唯一标识，如文件 hash
  fd.append('index', String(i))
  fd.append('total', String(total))
  fd.append('chunk', blob)

  await fetch('/api/upload/chunk', { method: 'POST', body: fd })
}

// 续传：先问服务端已收到哪些 index，跳过它们再传剩余的`}</CodeBlock>
      </div>
    </div>
  )
}

/* ============================================================
 * 06 · 安全问题清单
 * ============================================================ */

const SECURITY_ITEMS: { title: string; body: string }[] = [
  {
    title: '前端校验只是体验优化，不是安全措施',
    body: 'file.size、file.type、扩展名判断全都可以被 curl、改包、写脚本轻松绕过。真正的校验必须在服务端（以及网关/对象存储侧）再做一遍。',
  },
  {
    title: '不要相信扩展名与 Content-Type',
    body: '两者都可伪造：把 exe 改成 .png 并不改变内容。服务端应检查文件内容（魔数，如 PNG 文件头 89 50 4E 47），必要时调用专业识别 / 杀毒服务。',
  },
  {
    title: '小心“看起来无害”的文件（XSS 高危区）',
    body: 'SVG 里可以写 <script>，HTML/XML 可携带脚本，图片 EXIF 也可能藏载荷。不要用用户原始文件名拼 URL 或作为 Content-Disposition，不要让上传目录被当成可执行的静态资源直接访问。',
  },
  {
    title: '服务端限制大小、数量、速率',
    body: '业务层限大小只是其一，Web 服务器/网关层也要限制请求体大小与并发，防止超大文件、压缩炸弹（解压后极大）与刷流量拖垮服务。',
  },
  {
    title: '存储层设计原则',
    body: '服务端一律重命名为随机名存储（防路径穿越 ../、防覆盖他人文件），记录真实名与扩展名到数据库；存储目录禁止执行脚本；文件放独立目录或对象存储。',
  },
  {
    title: '鉴权、签名 URL 与传输安全',
    body: '上传/下载都要鉴权；私有文件使用带时效的预签名 URL；全程 HTTPS；设置防盗链与合理缓存。文件删除要级联清理（数据库记录 + 存储对象）。',
  },
  {
    title: '前端开发注意',
    body: 'accept 只是文件选择框的筛选，不拦任何人；objectURL / base64 数据不要泄露给第三方标签页，用后 revoke；渲染用户上传的 SVG/HTML 前必须净化。',
  },
]

function SecurityChecklist() {
  return (
    <div className="space-y-3">
      <p className="flex items-center gap-2 text-sm">
        <ShieldAlert className="size-4 text-destructive" />
        一句话总结：<b>前端负责体验（判断 & 反馈），后端负责安全（校验 & 存储）。</b>
      </p>
      <ul className="grid gap-3 md:grid-cols-2">
        {SECURITY_ITEMS.map((item) => (
          <li key={item.title} className="rounded-xl border border-border/80 p-3.5">
            <p className="mb-1 text-sm font-medium">{item.title}</p>
            <p className="text-xs leading-5 text-muted-foreground">{item.body}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ============================================================
 * 页面主体
 * ============================================================ */

const TOPICS = [
  { id: 'basic', no: '01', title: '最基础的上传' },
  { id: 'check', no: '02', title: '常用判断' },
  { id: 'preview', no: '03', title: '拖拽与预览' },
  { id: 'progress', no: '04', title: '进度与取消' },
  { id: 'chunk', no: '05', title: '分片与续传' },
  { id: 'security', no: '06', title: '安全问题' },
]

export default function TestPage() {
  return (
    <main className="w-full max-w-4xl px-4 pb-24">
      <header className="text-center">
        <p className="text-xs font-medium tracking-[0.3em] text-primary/70">
          FRONT-END FILE UPLOAD
        </p>
        <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight">
          前端文件上传 · 学习与实验
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
          从最基础的上传方法、上传前的常用判断，到常见使用场景（拖拽预览、进度取消、大文件分片断点续传）与安全问题。
          所有示例均可直接操作；每个示例下方的代码块是<b>真实场景的写法</b>。
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          配套图文笔记：
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono">src/app/test/notes.md</code>
        </p>
        <nav className="mt-5 flex flex-wrap justify-center gap-2">
          {TOPICS.map((topic) => (
            <a
              key={topic.id}
              href={`#${topic.id}`}
              className="rounded-full border border-border/80 px-3 py-1 font-mono text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
            >
              {topic.no} {topic.title}
            </a>
          ))}
        </nav>
      </header>

      <Section
        id="basic"
        no="01"
        title="最基础的上传"
        subtitle={
          <>
            网页上传的源头是{' '}
            <code className="rounded bg-muted px-1 font-mono text-xs">input type="file"</code>。
            选中的文件出现在{' '}
            <code className="rounded bg-muted px-1 font-mono text-xs">input.files</code>
            （FileList）里，每个元素是
            <code className="rounded bg-muted px-1 font-mono text-xs">File</code> 对象，它继承了
            Blob，带 name / size / type / lastModified 四个常用属性。拿到 File 后用{' '}
            <code className="rounded bg-muted px-1 font-mono text-xs">FormData</code>{' '}
            打包发出即可（方式 A，AJAX 不刷新页面）。 另外还有方式 B：原生表单提交（action +
            enctype="multipart/form-data"，会整页刷新、看不到进度），详见 notes.md 第 1 节。
          </>
        }
      >
        <DemoBasicUpload />
      </Section>

      <Section
        id="check"
        no="02"
        title="上传前的常用判断"
        subtitle={
          <>
            上传前最常见的几类判断：是否选择了文件、数量上限、大小上限、MIME /
            扩展名白名单、文件名清洗。
            下面把规则做成开关，选择一个文件立即重算，体验“先判断、后提交”的完整流程。
          </>
        }
      >
        <DemoValidate />
      </Section>

      <Section
        id="preview"
        no="03"
        title="拖拽上传与图片即时预览"
        subtitle={
          <>
            两个高频场景：① 把选择框换成好看的<b>拖拽区域</b>（监听 dragenter / dragover /
            drop，读取
            <code className="rounded bg-muted px-1 font-mono text-xs">dataTransfer.files</code>）；②
            图片<b>上传前预览</b>，用
            <code className="rounded bg-muted px-1 font-mono text-xs">
              URL.createObjectURL(file)
            </code>{' '}
            生成一个本页有效的地址直接给
            <code className="rounded bg-muted px-1 font-mono text-xs">img</code>
            ，不需要先上传到服务器。
          </>
        }
      >
        <DemoDragPreview />
      </Section>

      <Section
        id="progress"
        no="04"
        title="上传进度与取消"
        subtitle={
          <>
            想看上传进度必须用 XMLHttpRequest：进度事件挂在{' '}
            <code className="rounded bg-muted px-1 font-mono text-xs">xhr.upload</code> 上， 取消用{' '}
            <code className="rounded bg-muted px-1 font-mono text-xs">xhr.abort()</code>。fetch
            目前无法监听上传进度。下面用定时器模拟同样的节奏。
          </>
        }
      >
        <DemoProgress />
      </Section>

      <Section
        id="chunk"
        no="05"
        title="大文件：分片上传与断点续传"
        subtitle={
          <>
            大文件（如视频）一次性上传容易超时、失败难重来。常规做法：用{' '}
            <code className="rounded bg-muted px-1 font-mono text-xs">File.slice()</code>{' '}
            切成若干片逐片上传， 服务端记下“已收到哪些片”，中断后重传时<b>跳过已完成的片</b>
            就是断点续传。试试：开始 → 暂停 → 继续。
          </>
        }
      >
        <DemoChunkUpload />
      </Section>

      <Section
        id="security"
        no="06"
        title="安全问题清单"
        subtitle="上传是最容易被攻击的功能之一（反弹 shell、存储型 XSS、盗刷流量……）。以下每一条都值得在生产代码里核对一遍："
      >
        <SecurityChecklist />
      </Section>

      <footer className="mt-14 border-t border-border/70 pt-6 text-center text-xs text-muted-foreground">
        本实验页不包含服务端代码；把 FormData 交给真实接口（Next.js 中为 src/app/api/…/route.ts 的
        Route Handler 或 Server Action）即可完成上传。完整原理与代码注释见{' '}
        <code className="rounded bg-muted px-1.5 py-0.5 font-mono">src/app/test/notes.md</code>。
      </footer>
    </main>
  )
}
