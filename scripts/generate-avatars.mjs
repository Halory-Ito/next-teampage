/**
 * 为真实团队成员生成占位头像（纯 Node 实现 PNG 编码，无外部依赖）。
 * 头像颜色由成员中文名哈希决定；文件名为 `{grade}/{中文名}.png`，
 * 与 src/data/team 中成员的 avatarUrl / id 一一对应。
 *
 * 运行：bun scripts/generate-avatars.mjs
 */
import { createHash } from 'node:crypto'
import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { deflateSync } from 'node:zlib'

const OUT_DIR = path.resolve('public/images/avatars')
const SIZE = 256

/** 成员 -> 年级 */
const MEMBERS = {
  master: {
    2019: ['陈浩', '黄杰', '黄义航', '吴开力', '黄和峰', '冉港生', '白梦浩', '邹仁峰'],
    2020: ['周翔辉', '陈鹏', '罗鑫', '黄志强', '刘文杰', '黄金', '卢文糠'],
    2021: ['李彤', '魏琪', '王正', '李星星', '肖浪', '张涛', '谭家羊'],
    2022: ['张根源', '张鱼齐', '朱倩微', '李新洋', '王青艳', '罗炼'],
    2023: ['雷轩', '陈洪金', '张凯', '何霁衡', '王云倩'],
  },
  phd: {
    2024: ['邓永涛'],
  },
  undergrad: {
    2019: ['梁子龙', '梁书睿', '彭嚣', '邬翔', '傅泓瑞', '李承家', '邓先阆', '申光耀', '王波迪', '彭恒荣'],
    2020: ['马樱仪', '向杰', '刘吴荣'],
    2021: ['李雨珈', '肖潇', '邹琪', '落磊', '吴志煜', '邓科', '占嘉伟'],
    2022: ['王俊民'],
    2024: ['王艺淇'],
  },
}

/* ---------------- 基础工具 ---------------- */

const CRC_TABLE = (() => {
  const t = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c >>> 0
  }
  return t
})()

function crc32(buf) {
  let c = 0xffffffff
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const typeBuf = Buffer.from(type, 'ascii')
  const crcBuf = Buffer.alloc(4)
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])))
  return Buffer.concat([len, typeBuf, data, crcBuf])
}

function encodePng(width, height, rgba) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // color type: RGBA
  const stride = width * 4
  const raw = Buffer.alloc((stride + 1) * height)
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0 // filter: None
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride)
  }
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))])
}

function hslToRgb(h, s, l) {
  h = ((h % 360) + 360) % 360
  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = l - c / 2
  let [r, g, b] = [0, 0, 0]
  if (h < 60) [r, g, b] = [c, x, 0]
  else if (h < 120) [r, g, b] = [x, c, 0]
  else if (h < 180) [r, g, b] = [0, c, x]
  else if (h < 240) [r, g, b] = [0, x, c]
  else if (h < 300) [r, g, b] = [x, 0, c]
  else [r, g, b] = [c, 0, x]
  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)]
}

/** 姓名 -> 0-360 色相 */
function hueOf(name) {
  const hash = createHash('sha1').update(name, 'utf8').digest()
  return hash.readUInt32BE(0) % 360
}

/** 生成单张头像：对角渐变背景 + 白色半透明"人像"剪影（头部 + 肩部） */
function renderAvatar(name) {
  const hue = hueOf(name)
  const [r1, g1, b1] = hslToRgb(hue, 0.55, 0.62) // 左上
  const [r2, g2, b2] = hslToRgb(hue + 40, 0.6, 0.4) // 右下
  const buf = Buffer.alloc(SIZE * SIZE * 4)

  const cx = SIZE / 2
  const headR = SIZE * 0.14
  const headY = SIZE * 0.4
  const bodyR = SIZE * 0.3
  const bodyY = SIZE * 0.68

  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const t = (x + y) / (2 * SIZE)
      let r = r1 + (r2 - r1) * t
      let g = g1 + (g2 - g1) * t
      let b = b1 + (b2 - b1) * t
      const a = 255

      // 头部
      const dh = Math.hypot(x - cx, y - headY)
      // 肩部（上半圆）
      const db = y >= bodyY ? Math.hypot(x - cx, y - bodyY) : Infinity

      if (dh <= headR || db <= bodyR) {
        const blend = 0.85
        r = r + (255 - r) * blend
        g = g + (255 - g) * blend
        b = b + (255 - b) * blend
      }

      const i = (y * SIZE + x) * 4
      buf[i] = Math.round(r)
      buf[i + 1] = Math.round(g)
      buf[i + 2] = Math.round(b)
      buf[i + 3] = a
    }
  }
  return encodePng(SIZE, SIZE, buf)
}

/* ---------------- 主流程 ---------------- */

let count = 0
for (const role of Object.keys(MEMBERS)) {
  for (const [grade, names] of Object.entries(MEMBERS[role])) {
    for (const name of names) {
      const dir = path.join(OUT_DIR, grade)
      mkdirSync(dir, { recursive: true })
      const file = path.join(dir, `${name}.png`)
      writeFileSync(file, renderAvatar(name))
      count++
      console.log(`generated ${path.relative(OUT_DIR, file)}`)
    }
  }
}
console.log(`done: ${count} avatars -> ${OUT_DIR}`)