import { put } from "@vercel/blob"
import type { APIRoute } from "astro"
import { createKysely } from "@vercel/postgres-kysely"
import { customAlphabet } from "nanoid"

import type { Database } from "../../lib/db"

export const POST: APIRoute = async ({ request }) => {
  const data = await request.formData()

  const image = data.get("selected-photo") as File
  const author = data.get("author")
  const description = data.get("description")
  const geolocation = data.get("geolocation")

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

  const nanoid = customAlphabet("abcdefghijklmnoprstuvyz", 10)

  const newUrl = nanoid()

  const res = await db
    .insertInto("contents")
    .values({
      url: `${newUrl.slice(0, 3)}-${newUrl.slice(3, 7)}-${newUrl.slice(7)}`,
      blob_url: blob.url,
      author: author?.toString() ?? "",
      description: description?.toString() ?? "",
      loc: `SRID=4326;POINT(${pos[0]} ${pos[1]})`
    })
    .returning("url")
    .executeTakeFirst()

  if (res?.url) {
    return new Response(
      JSON.stringify({
        url: res.url
      })
    )
  } else {
    return new Response(null, {
      status: 500,
      statusText: "Error while saving data"
    })
  }
}

export const GET: APIRoute = async ({ request }) => {
  const contentId = new URL(request.url).searchParams.get("id")

  if (!contentId) {
    return new Response(null, {
      status: 400,
      statusText: "Content id is required"
    })
  }

  const db = createKysely<Database>({ connectionString: import.meta.env.POSTGRES_URL })

  try {
    const content = await db
      .selectFrom("contents")
      .select(({ fn }) => ["blob_url", fn<string>("ST_AsGeoJSON", ["loc"]).as("loc"), "description", "author"])
      .where("url", "=", contentId)
      .executeTakeFirst()

    if (content) {
      return new Response(JSON.stringify(content))
    } else {
      return new Response(null, {
        status: 404,
        statusText: "Content not found"
      })
    }
  } catch (error) {
    console.error("Error fetching content:", error)
    return new Response(null, {
      status: 500,
      statusText: "Error while fetching content"
    })
  }
}
