# 前端文件上传：从入门到安全（学习笔记）

> 配套实验代码：`src/app/test/page.tsx`（同一目录，可直接运行操作）。
> 本文按「方法 → 判断 → 场景 → 安全」的顺序展开，示例序号与实验页保持一致。

---

## 目录

1. [名词速览](#1-名词速览)
2. [最基础的上传方法](#2-最基础的上传方法)
3. [拿到文件：input、FileList 与 File 对象](#3-拿到文件inputfilelist-与-file-对象)
4. [上传前的常用判断（校验清单）](#4-上传前的常用判断校验清单)
5. [常见使用场景](#5-常见使用场景)
6. [安全问题（重点）](#6-安全问题重点)
7. [把接口放到哪：Next.js 工程建议](#7-把接口放到哪nextjs-工程建议)
8. [参考链接](#8-参考链接)
9. [附录：实验页示例与本文对照表](#9-附录实验页示例与本文对照表)

---

## 1. 名词速览

| 名词 | 是什么 | 一句话理解 |
| --- | --- | --- |
| `Blob` | 二进制大对象 | 浏览器里“一段二进制数据”的统称 |
| `File` | 一种特殊 `Blob` | 带文件名/类型/修改时间的文件；用户选中的每个文件就是一个 `File` |
| `FileList` | 文件列表（类数组） | `input.files`、`dataTransfer.files` 的类型 |
| `FormData` | 表单数据容器 | 配合 `multipart/form-data` 把文件发给服务器 |
| `URL.createObjectURL` | 本地内存地址 | 给 `Blob/File` 生成一个当前页面可用的 URL（如放进 `<img src>`） |
| `FileReader` | 读取器 | 把文件读成 base64 字符串、文本、二进制等 |
| `DataTransfer` | 拖拽数据载体 | 拖拽事件里装着被拖的文件（`dataTransfer.files`） |

---

## 2. 最基础的上传方法

### 2.1 方式 A：原生表单提交（整页跳转）

最早、最朴素的方式：一个 `<form>` + `<input type="file">`，提交时浏览器自动把表单编码成 `multipart/form-data` 发到 `action` 指向的地址。

```html
<form action="/api/upload" method="post" enctype="multipart/form-data">
  <input type="file" name="file" />
  <button type="submit">上传</button>
</form>
```

要点：

- `method` 必须是 `post`；
- **`enctype="multipart/form-data"` 不能省略**，否则文件内容不会被编码进去（默认的 `application/x-www-form-urlencoded` 只适合文本）；
- 缺点：提交后整页跳转/刷新，看不到进度，失败体验差。现代站点基本都改用方式 B。

### 2.2 方式 B：JS 打包 FormData，用 XHR / fetch 发送（推荐）

步骤固定为三步：

1. 从 `input.files` 取出 `File`；
2. `append` 进 `FormData`；
3. 用 `fetch` 或 `XMLHttpRequest` 发出。

```ts
// 拿到用户选择的文件（多个）
const fileInput = document.querySelector<HTMLInputElement>('input[type="file"]')
const files = fileInput?.files ? Array.from(fileInput.files) : []

const formData = new FormData()
// 逐个 append；第 3 个参数可以自定义发送过去的文件名
files.forEach((file, i) => formData.append(`file_${i + 1}`, file, file.name))

// 用 fetch 发送（对应实验页 01）
const res = await fetch('/api/upload', {
  method: 'POST',
  body: formData,
})
if (!res.ok) throw new Error(`上传失败：${res.status}`)
```

两个常见坑：

- **不要手动设置 `Content-Type`**。`body` 是 `FormData` 时，浏览器会自动补上 `multipart/form-data; boundary=xxxx`。一旦手写 `Content-Type: application/json` 之类，multipart 边界缺失，服务端将无法解析。
- **`fetch` 看不到上传进度**。需要进度条就用 `XMLHttpRequest`（见 §5.4），或用基于 XHR 的库（axios 上传走 XHR）。

### 2.3 各方式对比

| 方式 | 是否刷新页面 | 能否监听进度 | 适合 |
| --- | --- | --- | --- |
| 原生表单提交 | 整页跳转 | 否 | 无 JS 兜底页 |
| `fetch` + FormData | 否 | 否（下载进度可读） | 绝大多数上传 |
| `XMLHttpRequest` + FormData | 否 | **是**（`xhr.upload.onprogress`） | 需要进度条 / 取消 |
| 转 base64 后当字符串提交 | 否 | 否 | 特殊场景（不推荐用于大文件，见 §5.1） |

---

## 3. 拿到文件：input、FileList 与 File 对象

### 3.1 三种获取 File 的途径

```html
<!-- ① 文件选择框 -->
<input type="file" id="picker" multiple accept="image/*" />
```

```ts
// ① 从 input 读
const input = document.getElementById('picker') as HTMLInputElement
input.addEventListener('change', () => {
  const files = input.files // FileList（类数组，先转数组更方便）
  console.log(Array.from(files ?? []))
})

// ② 从拖拽事件读（见 §5.2）
dropZone.addEventListener('drop', (e) => {
  const files = e.dataTransfer?.files
})

// ③ 代码里凭空造一个 File（常用于测试 / 前端压缩图片后上传）
const blob = new Blob([new Uint8Array([1, 2, 3])], { type: 'application/octet-stream' })
const fake = new File([blob], 'demo.bin', { lastModified: Date.now() })
```

### 3.2 `input` 的两个常用属性

- `multiple`：允许一次选多个文件。
- `accept`：**只是文件选择框里的筛选/快捷入口**，例如 `accept="image/png,image/jpeg,.pdf"`。它不阻止任何“非预期文件”——拖拽、改包都能绕过，**安全校验不能靠它**（见 §6）。

### 3.3 File 对象的常用属性

| 属性 | 说明 | 示例 |
| --- | --- | --- |
| `file.name` | 文件名（含扩展名） | `"报告.png"` |
| `file.size` | 字节数 | `2_097_152`（2 MB） |
| `file.type` | MIME 类型（可伪造） | `"image/png"` |
| `file.lastModified` | 最后修改时间（毫秒时间戳） | `1720000000000` |

> 前端能从 `File` 里读取的只有这些元信息，**永远拿不到文件的本地绝对路径**（如 `C:\Users\...`），这是浏览器安全模型决定的，与网页权限无关。

---

## 4. 上传前的常用判断（校验清单）

校验要分两层：**选择后立即校验**（即时反馈）+ **提交前再校验**（防止“选中后修改了文件”等边角情况）。集中写成一个校验函数，两边复用。对应实验页 **02**。

```ts
const MAX_SIZE = 10 * 1024 * 1024 // 10 MB
const MAX_COUNT = 3
const ACCEPT_MIME = ['image/png', 'image/jpeg']
const ACCEPT_EXT = ['png', 'jpg', 'jpeg']

interface CheckResult {
  ok: boolean
  errors: string[] // 每个文件一条或多条错误
}

function checkFile(file: File): string[] {
  const errors: string[] = []

  // ① 大小：file.size 单位是字节，注意换算（1 MB = 1024 * 1024 B）
  if (file.size > MAX_SIZE) {
    errors.push(`文件超过 ${MAX_SIZE / 1024 / 1024} MB 限制`)
  }

  // ② MIME 白名单：file.type 来自浏览器读取，攻击者可伪造，见 §6
  if (!ACCEPT_MIME.includes(file.type)) {
    errors.push(`类型 ${file.type || '(空)'} 不在允许范围`)
  }

  // ③ 扩展名白名单：与 MIME 双检查，提高“改后缀绕过”的成本
  const dot = file.name.lastIndexOf('.')
  const ext = dot > 0 ? file.name.slice(dot + 1).toLowerCase() : ''
  if (!ACCEPT_EXT.includes(ext)) {
    errors.push(`扩展名 .${ext || '(无)'} 不允许`)
  }

  // ④ 文件名清洗：禁掉路径分隔符与特殊字符（真实存储一律服务端重命名）
  if (/[\\/:*?"<>|]/.test(file.name)) {
    errors.push('文件名包含非法字符')
  }
  if (file.name.length > 80) {
    errors.push('文件名过长')
  }

  return errors
}

// 多文件场景再加一条“数量”判断（放在循环外）
function checkList(files: File[]): CheckResult {
  const errors: string[] = []
  if (files.length === 0) return { ok: false, errors: ['未选择文件'] }
  if (files.length > MAX_COUNT) errors.push(`最多上传 ${MAX_COUNT} 个文件`)
  files.forEach((f) => errors.push(...checkFile(f)))
  return { ok: errors.length === 0, errors }
}
```

**体验层交互**：校验不通过时给出逐条红色错误、禁用“提交”按钮（见实验页 02）；提交成功才允许继续。**再次强调：这里的判断只对正常用户友好，拦不住恶意请求，服务端必须重做一遍（§6）。**

---

## 5. 常见使用场景

### 5.1 图片即时预览：objectURL vs base64

**不用上传就能预览**，两条路（对应实验页 **03**）：

```ts
// 路线一：objectURL（推荐）
const url = URL.createObjectURL(file) // 形如 blob:http://localhost:3000/xxxx
img.src = url
// 用完后回收，否则内存泄漏：
// URL.revokeObjectURL(url)

// 路线二：base64
const reader = new FileReader()
reader.onload = () => {
  img.src = reader.result as string // 形如 data:image/png;base64,xxxx
}
reader.readAsDataURL(file)
```

| 对比 | `URL.createObjectURL` | `FileReader` + base64 |
| --- | --- | --- |
| 内存 | 引用原文件，开销小 | 额外复制一份 base64 字符串 |
| 体积 | 不变 | 比原文件大约 **+33%**（base64 编码开销） |
| 可保存/发后端 | 不能（仅当前页面会话内有效） | 可以当字符串提交 |
| 适合 | 展示、预览、本地处理 | 极小的文件、需要文本形态 |

结论：**预览用 objectURL；不要为“上传”把大文件转 base64**。需要裁剪/压缩图片时再考虑 `canvas.toBlob` → 新 `File`。

### 5.2 拖拽上传

拖拽不是新协议，本质还是把 `dataTransfer.files` 交给和 input 一样的处理函数（对应实验页 **03**）：

```ts
// 关键：一定要 preventDefault，否则浏览器会直接打开该文件
zone.addEventListener('dragenter', (e) => e.preventDefault())
zone.addEventListener('dragover', (e) => {
  e.preventDefault()
  e.dataTransfer!.dropEffect = 'copy' // 光标显示为“复制”
})
zone.addEventListener('drop', (e) => {
  e.preventDefault()
  const files = Array.from(e.dataTransfer?.files ?? [])
  handleFiles(files) // 与 input change 共用同一段校验/上传逻辑
})
```

- `dragleave` 在子元素间移动时会反复触发，处理高亮用“进入计数”而不是简单布尔值（实验页里有实现）。
- 拖文件夹：`dragover` 里检查 `e.dataTransfer.items` 中是否存在 `webkitGetAsEntry()`，浏览器兼容性参差，通常建议另给 `<input webkitdirectory>` 入口。

### 5.3 多文件、上传队列

- `multiple` 一次拿多个；前端逐条校验并展示每个文件的状态（等待 / 上传中 / 成功 / 失败）。
- 失败的文件提供“重试”按钮，重试只需要重新 `fetch` 该文件对应的 FormData——所以状态里要**保留 File 对象本身**（只存 `name/size/type` 元信息无法重发）。
- 真实上传接口常见设计：`POST /api/upload` 一次收一个文件（大文件好做进度与重试），小文件也可一次多文件。

### 5.4 进度条与取消（XHR 才是正主）

`fetch` 至今无法监听“上传”进度，所以上传进度要用 `XMLHttpRequest`（对应实验页 **04**）：

```ts
const xhr = new XMLHttpRequest()
xhr.open('POST', '/api/upload')

// 进度事件挂在 xhr.upload 上（上传方向），不是 xhr 本体！
xhr.upload.onprogress = (e) => {
  if (e.lengthComputable) {
    const percent = Math.round((e.loaded / e.total) * 100)
    console.log(`${percent}%`)
  }
}
xhr.onload = () => console.log('成功（HTTP 2xx）') // 以响应结果为准，别只看进度到 100%
xhr.onerror = () => console.log('网络错误')
xhr.send(formData)

// 取消上传（用户点“取消”按钮时）
xhr.abort()
```

经验：

- “进度 100%”只代表浏览器把请求发出去了，**不等于服务端保存成功**，最终以 HTTP 响应为准；
- 取消后应释放状态并提示用户；不要用假进度条糊弄成功率判断。

### 5.5 大文件：分片上传 + 断点续传

一个 2 GB 视频一次性 POST，网络一抖就全废。常规方案（对应实验页 **05**）：

1. 客户端用 **`File.slice()`** 把文件切成固定大小的片（如 2 MB），逐片发独立请求；
2. 每片带上 `fileId + index + total`，服务端暂存各片；
3. 全部到齐后服务端合并，或上传到对象存储的分片接口（如 OSS Multipart Upload、S3 multipart）；
4. **断点续传** = 重传前先问服务端“已收到哪些 index”，**跳过已完成的分片**；前端崩溃/刷新后重来，剩余片数可能已记录在服务端（或本地 IndexedDB），这就是“续传”。

```ts
const CHUNK_SIZE = 2 * 1024 * 1024 // 2 MB
const total = Math.ceil(file.size / CHUNK_SIZE)

// slice 返回的是一个“切片视图”Blob，不会把整份文件复制进内存
for (let i = 0; i < total; i += 1) {
  const chunk = file.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE)

  const fd = new FormData()
  fd.append('fileId', fileId) // 同一文件的唯一标识（可用内容 hash）
  fd.append('index', String(i))
  fd.append('total', String(total))
  fd.append('chunk', chunk)

  const res = await fetch('/api/upload/chunk', { method: 'POST', body: fd })
  if (!res.ok) {
    // 失败重试（带退避）；重试几次仍失败就中断并记录断点
  }
}
```

工程细节：

- **并发控制**：不要 200 片一起发，维护一个 3~5 并发的小池子，或串行上传 + 失败重试；
- **秒传**：发送前先算文件 hash（`crypto.subtle.digest`），请求“按 hash 查重”，服务端已有就直接返回成功，省去整次上传；
- 真实系统里，“分片序号 → 服务端状态”的映射由后端接口提供，前端只管把 pending 的片发完。

### 5.6 直传 OSS / 对象存储（预签名 URL）

中小站点把文件转发给业务服务器再落盘没问题；文件量大时，走**“客户端直传对象存储”**避免业务服务器带宽成为瓶颈：

```
客户端 ──(1) 请求签名──▶ 业务服务
   │                        │ (返回预签名 URL / 上传凭证)
   │                        │
   └──(2) PUT/PostObject────▶ OSS / S3 / COS  （不经过业务服务器）
                              │ (3) 回调通知业务服务
```

前端通常只需要“请求 → 拿到签名 → 直接 PUT 文件”：

```ts
// 1) 向自己的后端要一个带时效的预签名上传地址
const { url } = await fetch('/api/upload/presign', { method: 'POST', body: JSON.stringify({ name: file.name, size: file.size }) }).then((r) => r.json())

// 2) 直接把二进制 PUT 过去（对象存储侧自己会校验 Content-Type/大小策略）
await fetch(url, { method: 'PUT', body: file })
```

### 5.7 其它

- **组件库原理**：antd `Upload`、Element `el-upload` 内部也就是「input/拖拽 + FormData + XHR 进度」的封装，看懂上面这些，任何组件库都能调明白。
- **视频/音频/文件列表**：与图片预览同理，`URL.createObjectURL` 可以直接给 `<video>` / `<audio>` / `<a download>` 用。

---

## 6. 安全问题（重点）

一句话：**前端校验负责体验，后端校验负责安全。** 页面上的每一条 JS 校验，用 curl 都能绕过去：

```bash
# 绕过“只能传图片”的纯前端判断，直接上传一个 shell
curl -X POST http://example.com/api/upload \
  -H "Content-Type: multipart/form-data" \
  -F "file=@shell.php;type=image/png;filename=avatar.png"
```

### 6.1 服务端必须重做的校验

| 项 | 说明 |
| --- | --- |
| 大小限制 | 业务层 + Web 服务器/网关层双重限制（还防压缩炸弹：zip 解压后可能数百倍大） |
| 类型白名单 | MIME 与扩展名都可伪造，按**文件内容魔数**判断（如 PNG 头 `89 50 4E 47`、JPEG 头 `FF D8 FF`） |
| 恶意内容 | 杀毒/沙箱扫描、图片重编码（`re-encode`，顺带清掉 EXIF 载荷） |

### 6.2 文件名与存储

- **不要信任用户文件名**：`../../../etc/passwd`、Windows 保留名、超长名、控制字符都要防；
- 服务端**一律重命名存储**（如 `uuid + 白名单扩展名`），把 `原名/扩展名/大小/上传者` 记进数据库；
- 上传目录禁止执行脚本（`nginx`/容器内不可执行 + 不落业务代码目录）；
- 尽量放对象存储（OSS/S3/COS），天然隔离执行环境，还自带 CDN 与生命周期策略。

### 6.3 内容型 XSS（最容易被忽视）

- **SVG / HTML 可直接携带脚本**：一个 `avatar.svg` 里写 `<script>`，如果被当资源直接访问或嵌入页面，就是存储型 XSS；
- 返回下载时用 `Content-Disposition: attachment; filename="..."`（配合服务端生成的安全文件名）；
- 需要在线预览用户文件时，放独立域名/子域、净化内容、并用 CSP 限制脚本来源；
- `<img src="用户文件">` 渲染本身不会执行 SVG 内脚本，但**直接 `<iframe>`/导航打开**就会执行，别把用户可上传的目录当静态站点根目录直接伺服。

### 6.4 资源滥用与限流

- 网关/负载均衡限制单请求体大小、并发、单用户速率（防盗刷存储与带宽）；
- 未登录/低频用户配额限制；超限返回 413/429；
- 注意压缩炸弹与解压后容量上限。

### 6.5 私密性与传输

- 上传/下载都要鉴权，不能“拿到 URL 就能下载”；
- 私有桶使用**带时效的预签名 URL**，过期自动失效；
- 全程 HTTPS；敏感文件设置合理缓存与防盗链；删除时级联清理（库记录 + 存储对象）。

### 6.6 前端侧 checklist（开发时逐条过）

- [ ] `accept` 只当体验，不当校验；
- [ ] 不把用户可控内容直接拼进 URL / `innerHTML` / iframe；
- [ ] objectURL 与 base64 用完即释放，不泄漏给第三方页面；
- [ ] 生产上传**永远走 HTTPS**，防中间人改包。

---

## 7. 把接口放到哪：Next.js 工程建议

本实验页是纯前端演示，没有真实接收端。在这个仓库（Next.js App Router）里，接口通常是：

- **Route Handler**：新建 `src/app/api/upload/route.ts`，读取 `request.formData()`，把 `File` 写盘/转存对象存储，返回 JSON。**Route Handler 默认不限制请求体大小**，业务层自行控制。
- **Server Action**：注意其默认**请求体上限是 1 MB**（含 multipart 边界等开销），需要传大文件时在 `next.config` 里配置 `experimental.serverActions.bodySizeLimit`，或干脆改走 Route Handler / 直传对象存储。

一个最小 Route Handler 示例：

```ts
// src/app/api/upload/route.ts
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const form = await request.formData()
  const file = form.get('file')

  if (!(file instanceof File)) {
    return NextResponse.json({ error: '缺少文件字段' }, { status: 400 })
  }
  // 服务端校验：大小 / 魔数 / 扩展名白名单（见 §6.1）
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: '文件过大' }, { status: 413 })
  }

  const bytes = Buffer.from(await file.arrayBuffer())
  // TODO: 重命名后落盘（独立上传目录）或转存对象存储，并记录元数据

  return NextResponse.json({ ok: true, size: bytes.byteLength })
}
```

> 前端实验页（page.tsx）里 fetch 的目标地址换成这个 `/api/upload` 即可跑通真实上传。

---

## 8. 参考链接

- MDN File：<https://developer.mozilla.org/docs/Web/API/File>
- MDN Blob：<https://developer.mozilla.org/docs/Web/API/Blob>
- MDN FormData：<https://developer.mozilla.org/docs/Web/API/FormData>
- MDN FileReader：<https://developer.mozilla.org/docs/Web/API/FileReader>
- MDN URL.createObjectURL / revokeObjectURL：<https://developer.mozilla.org/docs/Web/API/URL/createObjectURL_static>
- MDN XMLHttpRequest.upload（进度）：<https://developer.mozilla.org/docs/Web/API/XMLHttpRequest/upload>
- MDN File.slice：<https://developer.mozilla.org/docs/Web/API/Blob/slice>
- MDN DataTransfer.files：<https://developer.mozilla.org/docs/Web/API/DataTransfer/files>
- OWASP 文件上传建议：<https://owasp.org/www-community/vulnerabilities/Unrestricted_File_Upload>
- 阿里云 OSS 直传/签名 URL、S3 Presigned URL：搜 “OSS 服务端签名后直传”、“S3 presigned URL”

---

## 9. 附录：实验页示例与本文对照表

| 实验页 (page.tsx) | 交互 | 对应笔记 |
| --- | --- | --- |
| `DemoBasicUpload`（01） | 多选文件 → 构造 FormData → 打印请求体形态 | §2.2、§3 |
| `DemoValidate`（02） | 规则开关 + 选择文件即时逐条报错 | §4 |
| `DemoDragPreview`（03） | 拖拽 / 点击选择 → objectURL 缩略图预览 | §5.1、§5.2 |
| `DemoProgress`（04） | 模拟进度条 + 取消（附真实 XHR 代码） | §5.4 |
| `DemoChunkUpload`（05） | 2MB 切片逐片上传，可暂停 / 续传 / 模拟服务器已有前 2 片 | §5.5 |
| `SecurityChecklist`（06） | 静态安全清单 | §6 |
