export type DailyBlock = {
  id: string
  name: string
  description: string
  cover: string
}

export type DailyPhoto = {
  url: string
  name?: string
}

export type DailyGallery = {
  name: string
  cover: string
  date: string
  gallery: DailyPhoto[]
  description?: string
}
