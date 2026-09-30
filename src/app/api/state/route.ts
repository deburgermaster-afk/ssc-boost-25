import { NextResponse } from "next/server"
import { getState, validId } from "@/lib/state"

export async function POST(req: Request) {
  const { deviceId } = await req.json()
  if (!validId(deviceId)) return NextResponse.json({ error: "bad id" }, { status: 400 })
  return NextResponse.json(await getState(deviceId))
}
