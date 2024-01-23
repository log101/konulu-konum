export const prerender = false

import { put } from "@vercel/blob"
import type { Generated } from "kysely"
import type { APIRoute } from "astro"
import { createKysely } from "@vercel/postgres-kysely"

interface ContentTable {
  id: Generated<number>
  blob_url: string
  loc: string
  description: string
}

interface Database {
  contents: ContentTable
}

export const POST: APIRoute = async ({ request }) => {
  const data = await request.formData()

  const image = data.get("selected-photo") as File
  const description = data.get("description")
  const geolocation = data.get("geolocation")

  console.log(image, description, geolocation)

  if (!image || !geolocation) {
    return new Response(null, {
      status: 400,
      statusText: "Image and geolocation are required fields"
    })
  }

  const pos = geolocation.toString().split(",")

  if (pos.length !== 2) {
    return new Response(null, {
      status: 400,
      statusText: "Geolocation not correctly formatted"
    })
  }

  const blob = await put(image.name, image, { access: "public", token: import.meta.env.BLOB_READ_WRITE_TOKEN })

  const db = createKysely<Database>({ connectionString: import.meta.env.POSTGRES_URL })

  const res = await db
    .insertInto("contents")
    .values({
      blob_url: blob.url,
      description: description?.toString() ?? "",
      loc: `SRID=4326;POINT(${pos[0]} ${pos[1]})`
    })
    .returning("blob_url")
    .executeTakeFirst()

  if (res?.blob_url) {
    return new Response(
      JSON.stringify({
        message: "Succesfully added content"
      })
    )
  } else {
    return new Response(null, {
      status: 500,
      statusText: "Error while saving data"
    })
  }
}
