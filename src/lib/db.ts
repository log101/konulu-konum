export interface Database {
  contents: ContentTable
}

export interface ContentTable {
  id: string
  url: string
  blob_url: string
  loc: string
  author: string
  description: string
  created_at: string
  radius: number
  unlocked_counter: number
}
