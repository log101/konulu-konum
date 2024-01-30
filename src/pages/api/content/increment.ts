import type { Database } from "@/lib/db"
import { createKysely } from "@vercel/postgres-kysely"
import type { APIRoute } from "astro"

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
    const result = await db
      .updateTable("contents")
      .set(eb => ({ unlocked_counter: eb("unlocked_counter", "+", 1) }))
      .where("id", "=", contentId)
      .executeTakeFirst()

    if (result) {
      return new Response(JSON.stringify({ counter: Number(result) }))
    } else {
      return new Response(null, {
        status: 404,
        statusText: "Could not increment the counter"
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
