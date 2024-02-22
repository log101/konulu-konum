import { createClient } from "@supabase/supabase-js"
import type { APIRoute } from "astro"
import { createKysely } from "@vercel/postgres-kysely"
import { customAlphabet } from "nanoid"
import sharpService from "astro/assets/services/sharp"

import type { Database } from "@/lib/db"

export const POST: APIRoute = async ({ request }) => {
  const formData = await request.formData()

  const image = formData.get("selected-photo") as File
  const author = formData.get("author")
  const description = formData.get("description")
  const geolocation = formData.get("geolocation")

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

  const supabaseUrl = import.meta.env.SUPABASE_URL
  const supabaseKey = import.meta.env.SUPABASE_KEY
  const supabase = createClient(supabaseUrl, supabaseKey)

  const nanoid = customAlphabet("abcdefghijklmnoprstuvyz", 10)

  const randomImageId = nanoid()

  const imageName = `${image.name.replace(/\.[^/.]+$/, "")}${randomImageId}.jpg`

  const imageBuf = await image.arrayBuffer()

  const { data } = await sharpService.transform(
    new Uint8Array(imageBuf),
    { src: imageName },
    { domains: [], remotePatterns: [], service: { entrypoint: "", config: { limitInputPixels: false } } }
  )

  const { error } = await supabase.storage.from("images").upload(`public/${imageName}`, data, {
    cacheControl: "3600",
    upsert: false
  })

  if (error) {
    console.error(error.message, imageName, error.cause)
    return new Response(null, {
      status: 400,
      statusText: error.message
    })
  }

  const imagePublicUrl = `https://sozfqjbdyppxfwhqktja.supabase.co/storage/v1/object/public/images/public/${imageName}`

  const db = createKysely<Database>({ connectionString: import.meta.env.POSTGRES_URL })

  const newUrl = nanoid()

  const res = await db
    .insertInto("contents")
    .values({
      url: `${newUrl.slice(0, 3)}-${newUrl.slice(3, 7)}-${newUrl.slice(7)}`,
      blob_url: imagePublicUrl,
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
      .select(({ fn }) => [
        "id",
        "blob_url",
        fn<string>("ST_AsGeoJSON", ["loc"]).as("loc"),
        "description",
        "author",
        "created_at",
        "unlocked_counter"
      ])
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
