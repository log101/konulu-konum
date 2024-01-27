import type { Generated } from "kysely"

export interface Database {
  contents: ContentTable
}

export interface ContentTable {
  id: Generated<string>
  url: string
  blob_url: string
  loc: string
  author: string
  description: string
}
