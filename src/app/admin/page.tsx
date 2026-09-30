"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BLOCK, MCQ_TOTAL, bn } from "@/lib/content"

type Totals = { devices: number; finished: number; active_today: number; answered: number }
type Device = {
  id: string
  mcq_index: number
  break_done: number
  finished_at: string | null
  updated_at: string
  correct: number
}

const PER_PAGE = 8

function ago(iso: string) {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (m < 1) return "এইমাত্র"
  if (m < 60) return `${bn(m)} মি.`
  if (m < 1440) return `${bn(Math.floor(m / 60))} ঘ.`
  return `${bn(Math.floor(m / 1440))} দিন`
}

export default function Admin() {
  const [user, setUser] = useState("")
  const [pass, setPass] = useState("")
  const [error, setError] = useState("")
  const [data, setData] = useState<{ totals: Totals; devices: Device[] } | null>(null)
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(false)

  async function load() {
    setLoading(true)
    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ user, pass }),
    })
    const json = await res.json()
    setLoading(false)
    if (!res.ok) return setError(json.error)
    setError("")
    setData(json)
  }

  if (!data) {
    return (
      <main className="mx-auto flex h-dvh w-full max-w-md flex-col justify-center px-6">
        <h1 className="text-2xl font-bold">অ্যাডমিন</h1>
        <p className="mb-6 text-sm text-neutral-500">বাংলা ১ম পত্র MCQ</p>
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault()
            load()
          }}
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="u">ইউজারনেম</Label>
            <Input id="u" className="h-11 text-base" value={user} onChange={(e) => setUser(e.target.value)} autoCapitalize="none" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="p">পাসওয়ার্ড</Label>
            <Input id="p" type="password" className="h-11 text-base" value={pass} onChange={(e) => setPass(e.target.value)} />
          </div>
          {error && <p className="text-sm font-medium">{error}</p>}
          <Button className="h-12 text-base" disabled={loading}>
            {loading ? "লোড হচ্ছে…" : "লগইন"}
          </Button>
        </form>
      </main>
    )
  }

  const { totals, devices } = data
  const pages = Math.max(1, Math.ceil(devices.length / PER_PAGE))
  const rows = devices.slice(page * PER_PAGE, (page + 1) * PER_PAGE)
  const stats = [
    ["মোট ডিভাইস", totals.devices],
    ["শেষ করেছে", totals.finished],
    ["আজ সক্রিয়", totals.active_today],
    ["মোট উত্তর", totals.answered],
  ] as const

  return (
    <main className="mx-auto flex h-dvh w-full max-w-md flex-col px-4 py-4">
      <div className="flex shrink-0 items-center justify-between">
        <h1 className="text-xl font-bold">অ্যাডমিন</h1>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          রিফ্রেশ
        </Button>
      </div>
      <div className="mt-4 grid shrink-0 grid-cols-4 gap-2">
        {stats.map(([label, v]) => (
          <div key={label}>
            <p className="text-xl font-bold tabular-nums">{bn(v)}</p>
            <p className="text-[11px] leading-tight text-neutral-500">{label}</p>
          </div>
        ))}
      </div>
      <Separator className="my-4" />
      <div className="min-h-0 flex-1 overflow-hidden">
        <Table className="text-xs">
          <TableHeader>
            <TableRow>
              <TableHead>ডিভাইস</TableHead>
              <TableHead className="text-right">উত্তর</TableHead>
              <TableHead className="text-right">সঠিক</TableHead>
              <TableHead className="text-right">অবস্থা</TableHead>
              <TableHead className="text-right">শেষ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((d) => (
              <TableRow key={d.id}>
                <TableCell className="font-mono">{d.id.slice(0, 6)}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {bn(d.mcq_index)}/{bn(MCQ_TOTAL)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {d.mcq_index ? `${bn(Math.round((d.correct / d.mcq_index) * 100))}%` : "—"}
                </TableCell>
                <TableCell className="text-right">
                  {d.finished_at
                    ? "Done"
                    : d.mcq_index >= BLOCK * (d.break_done + 1)
                      ? `বিরতি ${bn(d.break_done + 1)}`
                      : "MCQ"}
                </TableCell>
                <TableCell className="text-right text-neutral-500">{ago(d.updated_at)}</TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-neutral-500">
                  এখনো কেউ শুরু করেনি
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="mt-3 flex shrink-0 items-center gap-2">
        <Button variant="outline" className="h-11 flex-1" disabled={page === 0} onClick={() => setPage(page - 1)}>
          আগের
        </Button>
        <span className="w-16 text-center text-xs tabular-nums text-neutral-500">
          {bn(page + 1)}/{bn(pages)}
        </span>
        <Button variant="outline" className="h-11 flex-1" disabled={page >= pages - 1} onClick={() => setPage(page + 1)}>
          পরের
        </Button>
      </div>
    </main>
  )
}
