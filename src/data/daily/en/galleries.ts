import { DailyGallery } from '@/types/daily'

import { builds } from './build'
import { competitions } from './competition'
import { meetings } from './meeting'
import { memos } from './memo'
import { plogs } from './plog'

/**
 * block.id -> 该板块下的所有 gallery（相册）。
 * 后续为某个板块补数据时：新建 data/daily/<id>/ 目录并在下方登记即可。
 */
const blockGalleries: Record<string, DailyGallery[]> = {
  competition: competitions,
  meeting: meetings,
  build: builds,
  memo: memos,
  plog: plogs,
}

export function getBlockGalleries(blockId: string): DailyGallery[] {
  return blockGalleries[blockId] ?? []
}
