# Team Homepage SSG

一个面向**高校课题组 / 实验室**的团队主页模板。内容与界面分离：所有成员、新闻、日常相册、项目、招生信息都以 TypeScript 数据文件的形式维护，页面组件只负责渲染。换一个课题组，只需要替换 `src/data` 里的数据、`messages` 里的界面文案和一张 logo，无需改动页面逻辑。

仓库中的数据仅作示例，请按下面的「快速替换指南」改成你自己团队的内容。

## 功能概览

| 页面 | 路径 | 说明 |
| --- | --- | --- |
| 首页 | `/` | 课题组简介、自动统计的数据看板、学生评价 |
| 团队 | `/team` | 按角色（教师 / 博士 / 硕士 / 本科）分组，可按年级筛选 |
| 成员详情 | `/team/[role]/[id]` | 个人主页：研究方向、简介、教育经历、工作经历，并按 ORCID 自动拉取论文列表 |
| 新闻 | `/news` | 按年份轮盘筛选的动态时间线，支持置顶 |
| 日常 | `/daily` | 板块宫格入口（如竞赛 / 组会 / 团建 / 回忆），点击进入相册 |
| 日常详情 | `/daily/[id]` | 某个板块下的相册网格，点击相册用全屏滑块浏览图片 |
| 加入我们 | `/join-us` | 招生对象、研究方向、考核要求、加入流程、联系方式 |

其他特性：

- **国际化**：内置 `en` / `zh-cn` 两套语言，通过 cookie（`NEXT_LOCALE`）切换，不体现在 URL 上；可自行增删语言。
- **深色模式**：`next-themes` 提供，跟随系统并可手动切换。
- **SEO**：`app/sitemap.ts`、`app/robots.ts` 自动生成站点地图与爬虫规则，页面级 metadata 走 `messages` 中的文案。
- **自动统计**：首页的「学生数 / 教师数 / 升学 / 就业 / 论文 / 获奖 / 项目」等数字全部由数据实时计算，不写死在组件里。
- **ORCID 集成**：成员填写 `orcid` 字段后，详情页自动拉取其公开论文，缺失的期刊/会议名会按 DOI 去 Crossref 补全。

## 技术栈

| 分类 | 选型 |
| --- | --- |
| 框架 | Next.js（App Router）+ React |
| 语言 | TypeScript（严格模式） |
| 样式 | Tailwind CSS v4 + shadcn 风格组件（`src/components/ui`） |
| 国际化 | next-intl |
| 动画 / 交互 | framer-motion、gsap、ogl（WebGL 效果） |
| 图标 | lucide-react |
| 包管理 | bun（同时兼容 npm / pnpm / yarn） |
| 代码检查 / 格式化 | oxlint / oxfmt |

## 快速开始

环境要求：Node.js 20+，推荐使用 [Bun](https://bun.sh)。

```bash
bun install       # 安装依赖
bun dev           # 启动开发服务器，访问 http://localhost:3000
bun run build     # 生产构建
bun start         # 启动生产服务
bun run lint      # 代码检查
bun run fmt       # 代码格式化
```

## 环境变量

| 变量 | 必填 | 说明 |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | 生产环境建议填写 | 站点部署地址，用于 metadataBase、OG 图片绝对 URL、sitemap 与 robots。未配置时回退到 `http://localhost:3000` |

在项目根目录新建 `.env.local`：

```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.example
```

## 目录结构

```text
.
├─ messages/                  # 界面文案（UI 文案唯一来源）
│  ├─ en.json
│  └─ zh-cn.json
├─ public/
│  ├─ logo.svg                # 站点 logo
│  └─ images/
│     ├─ avatars/<grade>/     # 成员头像，文件名与成员 id 一致
│     └─ daily/               # 日常板块封面与相册图片
├─ scripts/                   # 示例数据 / 占位头像生成脚本（见文末说明）
└─ src/
   ├─ app/                    # 路由与页面（App Router）
   ├─ components/             # 通用组件与 ui 基础组件
   ├─ config/site.ts          # 站点级配置（部署地址等）
   ├─ data/                   # ★ 内容数据，日常只需改这里
   │  ├─ team/<locale>/       # 成员：teachers / phd / master / undergrad
   │  ├─ news/<locale>/       # 新闻动态
   │  ├─ daily/<locale>/      # 日常板块与相册
   │  ├─ projects/<locale>/   # 研发项目
   │  ├─ home/<locale>/       # 首页学生评价
   │  └─ join-us.ts           # 招生信息
   ├─ features/               # 按业务域拆分的组件与逻辑
   ├─ i18n/                   # 语言配置与 locale 读写
   └─ types/                  # 各数据结构的类型定义
```

约定：`src/data/<域>/index.ts` 负责把各语言、各年级的数据汇总导出，页面只消费汇总结果；`src/data/<域>/<locale>/` 放具体内容。

## 内容维护指南

### 1. 团队成员

成员数据按「语言 → 角色 → 年级」组织：

```text
src/data/team/<locale>/
├─ teachers.ts              # 教师（一个数组，用 order 控制展示顺序）
├─ phd/<year>.ts            # 博士，文件名即入学年份
├─ master/<year>.ts         # 硕士
├─ undergrad/<year>.ts      # 本科生
└─ index.ts                 # 汇总为本语言的 teamByRole
```

新增一个年级时，在该角色的 `index.ts` 里补一行 `import` 和展开即可。成员字段（见 `src/types/member.ts`）：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | string | 唯一标识，同时用作详情页 URL 与头像文件名，跨语言保持一致 |
| `name` / `nameEn` | string | 中文名 / 英文名，按语言展示 |
| `role` | `teacher` / `phd` / `master` / `undergrad` | 所属角色 |
| `grade` | number | 入学年份，用于年级筛选与统计 |
| `avatarUrl` | string | 头像路径，通常为 `/images/avatars/<grade>/<id>.png` |
| `introduction` | string | 个人简介 |
| `research` | string | 研究方向 |
| `career` | string? | 职称或毕业去向 |
| `education` / `workHistory` | 数组? | 教育经历 / 工作经历 |
| `email` / `homepage` / `githubLink` / `orcid` | string? | 联系方式与学术主页，`orcid` 用于自动拉取论文 |
| `order` | number? | 排序权重（主要用于教师） |

**示例骨架**

```ts
import { Member } from '@/types/member'

export const masters2026: Member[] = [
  {
    id: 'zhangsan',
    name: '张三',
    nameEn: 'San Zhang',
    role: 'master',
    grade: 2026,
    avatarUrl: '/images/avatars/2026/zhangsan.png',
    introduction: '研究方向与个人经历介绍……',
    research: '遥感图像智能解译',
    email: 'zhangsan@example.com',
    orcid: '0000-0000-0000-0000',
  },
]
```

### 2. 新闻动态

```text
src/data/news/<locale>/<year>.ts   # 每年一个文件，index.ts 汇总
```

字段（见 `src/types/news.ts`）：

| 字段 | 说明 |
| --- | --- |
| `date` | `YYYY-MM-DD`，决定归属年份与排序 |
| `type` | `career` / `education` / `paper` / `award` / `report` / `course` / `recruit` / `project` |
| `event` | `string`（一条文字动态）或 `Career[]`（就业/去向名单，逐人展示） |
| `pinned` | 可选，置顶 |
| `links` | 可选，`{ label, url }[]` 相关链接 |

`Career` 条目中的 `id` 与团队成员的 `id` 对应，会链接到该成员的详情页。

### 3. 日常相册

```text
src/data/daily/<locale>/
├─ blocks.ts                 # 顶层板块：id / name / description / cover
├─ galleries.ts              # block.id -> 该板块的相册数组
└─ <block-id>/<year>.ts      # 具体相册
```

- 新增板块：在 `blocks.ts` 增加一项，并在 `galleries.ts` 中登记对应相册数组，新的路由 `/daily/<id>` 会自动生效。
- 新增相册：在对应板块目录下加文件，再到 `galleries.ts` 里 import + 登记。
- 相册字段：`name`、`cover`、`date`、`gallery`（`{ url, name? }[]`）、可选 `description`。

### 4. 研发项目

`src/data/projects/<locale>/index.ts`，字段见 `src/types/project.ts`：`id`、`name`、`category`（如纵向基金 / 横向课题）、`sponsor`、`period`。首页「研发项目」计数会随数组长度自动更新。

### 5. 首页数据看板的口径

统计逻辑集中在 `src/features/home/lib/home-stats.ts`，全部从 `src/data` 现算，**不要在组件里写死数字**：

- 学生数 = 博士 + 硕士 + 本科人数；教师数 = 教师条目数。
- 升学 / 就业人数 = 新闻中 `type` 为 `education` / `career` 的人次（`event` 为数组时逐个累加）。
- 论文 / 媒体报道 / 获奖数 = 对应 `type` 的新闻条数。
- 研发项目数 = `projects` 数组长度。

因此，只要按上面的规范录入数据，首页看板就会同步更新。

### 6. 学生评价

`src/data/home/<locale>/testimonials.ts`，字段为 `id`、`name`、`role`（身份或毕业去向）、`quote`（正文）。

### 7. 招生信息

集中在 `src/data/join-us.ts` 的 `joinUsByLocale` 中，按语言配置招生对象、研究方向、培养亮点、面试考核项、算法范围、加分项、加入流程与联系方式。招生季只改这一个文件即可。

### 8. 界面文案与站点名称

- 所有界面文字（导航、按钮、空态、SEO 标题/描述等）都在 `messages/en.json` 与 `messages/zh-cn.json` 中，两个文件结构一致。
- 站点名称对应 `Layout.title` 与 `Metadata.siteName`；logo 替换 `public/logo.svg`。

### 9. 增删语言

1. 在 `src/i18n/config.ts` 的 `locales` 中加入新语言代码。
2. 新建 `messages/<locale>.json`，结构参照现有文件。
3. 为每个内容域新建 `src/data/<域>/<locale>/`，并在对应的 `index.ts` 里注册；`join-us.ts` 里补一个语言块。
4. 如有需要，在 `src/components/locale-toggle.tsx` 的 `items` 中加上语言选项。

## 快速替换指南（换一个课题组）

1. 修改 `messages/*.json`：站点名称、首页简介、SEO 文案、各类界面文字。
2. 替换 `public/logo.svg`，替换 `public/images/` 下的头像与图片。
3. 清空并重写 `src/data/team/<locale>/` 下的成员数据与 `src/data/news/<locale>/` 下的动态。
4. 重写 `src/data/daily/`、`src/data/projects/`、`src/data/home/`、`src/data/join-us.ts`。
5. 在 `next.config.ts` 的 `images.remotePatterns` 中配置你使用的外链图片域名（当前示例允许 `picsum.photos`）。
6. 设置 `NEXT_PUBLIC_SITE_URL` 后部署。

## 部署

本站使用 cookie 记录语言，页面依赖请求状态，因此应以常规的 Node 运行时服务部署（Vercel、自建服务器等），而非纯静态导出。

- **Vercel**：导入仓库后会自动识别 Next.js，配置好 `NEXT_PUBLIC_SITE_URL` 环境变量即可。
- **自建**：`bun run build` 后执行 `bun start`，建议前置反向代理并配置好 HTTPS。

部署完成后可访问 `/sitemap.xml` 与 `/robots.txt` 检查 SEO 输出是否指向正确域名。

## 关于 `scripts/`

`scripts/generate-avatars.mjs` 与 `scripts/generate-demo-members.mjs` 只用于**生成演示数据与占位头像**（纯 Node 生成 PNG、批量填充虚构成员）。正式使用时请替换为真实数据，并按需保留或删除这两个脚本及其配置。

## 许可证

未附带许可证文件时，请根据实际需要自行添加（如 MIT）。
