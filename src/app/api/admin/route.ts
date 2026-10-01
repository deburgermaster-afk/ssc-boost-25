import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function POST(req: Request) {
  const { user, pass } = await req.json()
  if (user !== "admin" || pass !== "admin") {
    return NextResponse.json({ error: "ভুল ইউজারনেম বা পাসওয়ার্ড" }, { status: 401 })
  }
  const [totals] = await sql`
    SELECT count(*)::int AS devices,
           count(*) FILTER (WHERE finished_at IS NOT NULL)::int AS finished,
           count(*) FILTER (WHERE updated_at > now() - interval '1 day')::int AS active_today,
           coalesce(sum(mcq_index), 0)::int AS answered
    FROM devices`
  const devices = await sql`
    SELECT split_part(d.id, ':', 1) AS subject, split_part(d.id, ':', 2) AS id, d.mcq_index, d.break_done, d.finished_at, d.updated_at,
           count(a.*) FILTER (WHERE a.correct)::int AS correct
    FROM devices d LEFT JOIN answers a ON a.device_id = d.id
    GROUP BY d.id ORDER BY d.updated_at DESC LIMIT 200`
  return NextResponse.json({ totals, devices })
}
