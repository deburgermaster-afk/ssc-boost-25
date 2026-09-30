"use client"

import { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  BLOCK,
  BREAKS,
  MCQ_TOTAL,
  LABELS,
  bn,
  breakItems,
  chapterById,
  chapters,
  mcqById,
  type Mcq,
} from "@/lib/content"
import { cn } from "@/lib/utils"

type State = {
  order: number[]
  mcqIndex: number
  breakDone: number
  finished: boolean
  answers: Record<number, number>
}

const DEVICE_KEY = "ssc-boost-device"
const BREAK_PER_PAGE = 5

function deviceId(): string {
  try {
    let id = localStorage.getItem(DEVICE_KEY)
    if (!id) {
      id = crypto.randomUUID()
      localStorage.setItem(DEVICE_KEY, id)
    }
    return id
  } catch {
    return crypto.randomUUID()
  }
}

async function post(path: string, body: object): Promise<State> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export default function Home() {
  const [id, setId] = useState("")
  const [state, setState] = useState<State | null>(null)
  const [started, setStarted] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const d = deviceId()
    setId(d)
    post("/api/state", { deviceId: d })
      .then((s) => {
        setState(s)
        // Resume straight into the exam if it was already in progress.
        if (s.mcqIndex > 0 || s.breakDone > 0) setStarted(true)
      })
      .catch(() => setError("সার্ভারে সংযোগ হচ্ছে না। আবার চেষ্টা করো।"))
  }, [])

  const call = useCallback(
    async (path: string, body: object) => {
      try {
        setState(await post(path, { deviceId: id, ...body }))
        setError("")
      } catch {
        setError("সেভ হয়নি। ইন্টারনেট দেখে আবার চাপো।")
      }
    },
    [id],
  )

  if (!state) {
    return (
      <Shell>
        <div className="flex flex-1 items-center justify-center text-sm text-neutral-500">
          {error || "লোড হচ্ছে…"}
        </div>
      </Shell>
    )
  }

  if (!started) return <Start state={state} onStart={() => setStarted(true)} />

  const breakDue = state.mcqIndex >= BLOCK * (state.breakDone + 1)
  let screen: React.ReactNode
  if (state.finished) {
    screen = <Done state={state} onRestart={() => call("/api/restart", {})} />
  } else if (breakDue) {
    const k = state.breakDone + 1
    screen = <Break key={k} k={k} onDone={() => call("/api/break", { k })} />
  } else {
    const q = mcqById.get(state.order[state.mcqIndex])!
    screen = (
      <Question
        key={q.id}
        q={q}
        n={state.mcqIndex + 1}
        onAnswer={(choice) => call("/api/answer", { qId: q.id, choice })}
      />
    )
  }

  return (
    <Shell>
      <Header state={state} onHome={() => setStarted(false)} />
      {error && <p className="mb-2 text-center text-xs font-medium">{error}</p>}
      {screen}
    </Shell>
  )
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto flex h-dvh w-full max-w-md flex-col px-4 pt-[max(12px,env(safe-area-inset-top))] pb-[max(12px,env(safe-area-inset-bottom))]">
      {children}
    </main>
  )
}

function Header({ state, onHome }: { state: State; onHome: () => void }) {
  const done = Math.min(state.mcqIndex, MCQ_TOTAL)
  return (
    <header className="mb-3 shrink-0">
      <div className="mb-2 flex items-center justify-between">
        <button onClick={onHome} className="text-sm font-semibold">
          বাংলা ১ম পত্র
        </button>
        <span className="text-xs tabular-nums text-neutral-500">
          {bn(done)} / {bn(MCQ_TOTAL)}
        </span>
      </div>
      <Progress value={(done / MCQ_TOTAL) * 100} className="h-1" />
    </header>
  )
}

function Start({ state, onStart }: { state: State; onStart: () => void }) {
  const prose = chapters.filter((c) => c.kind === "গদ্য")
  const poems = chapters.filter((c) => c.kind === "কবিতা")
  const inProgress = state.mcqIndex > 0 || state.breakDone > 0
  return (
    <Shell>
      <div className="shrink-0 pt-2">
        <p className="text-xs tracking-wide text-neutral-500">SSC 2025 · মাধ্যমিক বাংলা সাহিত্য</p>
        <h1 className="text-2xl leading-tight font-bold">বাংলা ১ম পত্র MCQ</h1>
        <p className="mt-1 text-xs text-neutral-600">
          {bn(MCQ_TOTAL)} MCQ · প্রতি {bn(BLOCK)}টির পর বিরতিতে {bn(30)} জ্ঞানমূলক + {bn(10)} অনুধাবনমূলক
        </p>
      </div>
      <Separator className="my-3" />
      <div className="grid min-h-0 flex-1 grid-cols-2 gap-x-4 overflow-hidden text-[12.5px] leading-[1.45]">
        <ChapterList title={`গদ্য (${bn(prose.length)})`} items={prose.map((c) => c.title)} />
        <ChapterList title={`কবিতা (${bn(poems.length)})`} items={poems.map((c) => c.title)} />
      </div>
      <div className="shrink-0 pt-3">
        {inProgress && (
          <p className="mb-2 text-center text-xs text-neutral-500">
            {state.finished ? "পরীক্ষা শেষ হয়েছে" : `${bn(state.mcqIndex)}টি উত্তর দেওয়া হয়েছে`}
          </p>
        )}
        <Button className="h-12 w-full text-base" onClick={onStart}>
          {state.finished ? "ফলাফল দেখো" : inProgress ? "চালিয়ে যাও" : "শুরু করো"}
        </Button>
      </div>
    </Shell>
  )
}

function ChapterList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="min-h-0">
      <p className="mb-1 text-xs font-semibold">{title}</p>
      <ol>
        {items.map((t) => (
          <li key={t} className="truncate text-neutral-700">
            {t}
          </li>
        ))}
      </ol>
    </div>
  )
}

// Long passages / multi-statement questions get a smaller type size so the
// whole question fits the fixed screen without scrolling.
function sizeFor(q: Mcq) {
  const len = (q.passage?.length ?? 0) + q.q.length + q.opts.join("").length
  if (len > 520) return "text-[13px]"
  if (len > 380) return "text-[14px]"
  if (len > 260) return "text-[15px]"
  return "text-[16px]"
}

function QuestionBody({ q, n, label }: { q: Mcq; n?: number; label?: string }) {
  return (
    <>
      <div className="mb-2 flex items-center justify-between text-xs text-neutral-500">
        <span>{label ?? `প্রশ্ন ${bn(n!)}`}</span>
        <span className="truncate pl-3">{chapterById.get(q.ch)?.title}</span>
      </div>
      {q.passage && (
        <p className="mb-3 border-l-2 border-black pl-3 leading-relaxed whitespace-pre-line text-neutral-800">
          {q.passage}
        </p>
      )}
      <p className="mb-4 leading-relaxed font-semibold whitespace-pre-line">{q.q}</p>
    </>
  )
}

function Question({ q, n, onAnswer }: { q: Mcq; n: number; onAnswer: (c: number) => Promise<void> }) {
  const [picked, setPicked] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  return (
    <>
      <div className={cn("flex min-h-0 flex-1 flex-col overflow-y-auto", sizeFor(q))}>
        <QuestionBody q={q} n={n} />
        <div className="flex flex-col gap-2">
          {q.opts.map((o, i) => (
            <button
              key={i}
              onClick={() => setPicked(i)}
              className={cn(
                "flex items-start gap-3 rounded-lg border px-3 py-2.5 text-left leading-snug transition-colors",
                picked === i ? "border-black bg-black text-white" : "border-neutral-300 active:bg-neutral-100",
              )}
            >
              <span
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-full border text-[13px]",
                  picked === i ? "border-white" : "border-neutral-400",
                )}
              >
                {LABELS[i]}
              </span>
              <span className="pt-px">{o}</span>
            </button>
          ))}
        </div>
      </div>
      <Button
        className="mt-3 h-12 w-full shrink-0 text-base"
        disabled={picked === null || saving}
        onClick={async () => {
          setSaving(true)
          await onAnswer(picked!)
          setSaving(false)
        }}
      >
        {saving ? "সেভ হচ্ছে…" : "পরবর্তী"}
      </Button>
    </>
  )
}

function Break({ k, onDone }: { k: number; onDone: () => Promise<void> }) {
  const items = breakItems(k)
  const pages = Math.ceil(items.length / BREAK_PER_PAGE)
  const key = `ssc-boost-break-${k}`
  const [page, setPage] = useState(0)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    try {
      const p = Number(localStorage.getItem(key))
      if (p > 0 && p < pages) setPage(p)
    } catch {}
  }, [key, pages])

  const go = (p: number) => {
    setPage(p)
    try {
      localStorage.setItem(key, String(p))
    } catch {}
  }

  const slice = items.slice(page * BREAK_PER_PAGE, (page + 1) * BREAK_PER_PAGE)
  const last = page === pages - 1
  return (
    <>
      <div className="mb-2 shrink-0">
        <p className="text-xs text-neutral-500">
          বিরতি {bn(k)}/{bn(BREAKS)} · পৃষ্ঠা {bn(page + 1)}/{bn(pages)}
        </p>
        <h2 className="text-lg font-bold">
          {slice[0]?.kind === "ক" ? "জ্ঞানমূলক প্রশ্ন (ক)" : "অনুধাবনমূলক প্রশ্ন (খ)"}
        </h2>
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto">
        {slice.map((s) => (
          <div key={s.id} className="border-b border-neutral-200 pb-3 last:border-0">
            <p className="text-[11px] text-neutral-500">
              {s.kind} · {chapterById.get(s.ch)?.title}
            </p>
            <p className="text-[15px] leading-snug font-semibold">{s.q}</p>
            <p className="mt-0.5 text-[14px] leading-snug text-neutral-700">{s.a}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 flex shrink-0 gap-2">
        <Button variant="outline" className="h-12 flex-1 text-base" disabled={page === 0} onClick={() => go(page - 1)}>
          আগের
        </Button>
        <Button
          className="h-12 flex-[2] text-base"
          disabled={saving}
          onClick={async () => {
            if (!last) return go(page + 1)
            setSaving(true)
            await onDone()
            setSaving(false)
          }}
        >
          {last ? (k === BREAKS ? "শেষ করো" : "MCQ-তে ফিরে যাও") : "পরের পৃষ্ঠা"}
        </Button>
      </div>
    </>
  )
}

function Done({ state, onRestart }: { state: State; onRestart: () => Promise<void> }) {
  const isRight = (id: number) => state.answers[id] === mcqById.get(id)!.a
  const wrong = state.order.filter((id) => state.answers[id] !== undefined && !isRight(id))
  const correct = state.order.filter(isRight).length
  const [i, setI] = useState(-1)
  const [confirm, setConfirm] = useState(false)

  if (i >= 0 && wrong.length > 0) {
    const q = mcqById.get(wrong[i])!
    const mine = state.answers[q.id]
    return (
      <>
        <div className={cn("flex min-h-0 flex-1 flex-col overflow-y-auto", sizeFor(q))}>
          <QuestionBody q={q} label={`ভুল ${bn(i + 1)}/${bn(wrong.length)}`} />
          <div className="flex flex-col gap-2">
            {q.opts.map((o, j) => (
              <div
                key={j}
                className={cn(
                  "flex items-start gap-3 rounded-lg border px-3 py-2.5 leading-snug",
                  j === q.a
                    ? "border-black bg-black text-white"
                    : j === mine
                      ? "border-dashed border-black"
                      : "border-neutral-200 text-neutral-500",
                )}
              >
                <span className="w-5 shrink-0">{LABELS[j]}</span>
                <span className={cn(j === mine && j !== q.a && "line-through")}>{o}</span>
                {j === q.a && <span className="ml-auto shrink-0 text-xs">সঠিক</span>}
                {j === mine && <span className="ml-auto shrink-0 text-xs">তোমার</span>}
              </div>
            ))}
          </div>
        </div>
        <div className="mt-3 flex shrink-0 gap-2">
          <Button variant="outline" className="h-12 flex-1" onClick={() => setI(i - 1)}>
            {i === 0 ? "ফলাফল" : "আগের"}
          </Button>
          <Button className="h-12 flex-[2]" onClick={() => setI(i + 1 < wrong.length ? i + 1 : -1)}>
            {i + 1 < wrong.length ? "পরের ভুল" : "ফলাফলে ফেরো"}
          </Button>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <p className="text-5xl font-bold">Done</p>
        <p className="mt-2 text-sm text-neutral-500">পরীক্ষা শেষ হয়েছে</p>
        <Separator className="my-6 w-24" />
        <p className="text-4xl font-bold tabular-nums">
          {bn(correct)}
          <span className="text-xl text-neutral-400">/{bn(MCQ_TOTAL)}</span>
        </p>
        <p className="mt-1 text-sm text-neutral-600">
          সঠিক {bn(Math.round((correct / MCQ_TOTAL) * 100))}% · ভুল {bn(wrong.length)}
        </p>
      </div>
      <div className="flex shrink-0 flex-col gap-2">
        {wrong.length > 0 && (
          <Button className="h-12 w-full text-base" onClick={() => setI(0)}>
            ভুলগুলো দেখো
          </Button>
        )}
        <Button
          variant="outline"
          className="h-12 w-full text-base"
          onClick={() => (confirm ? onRestart() : setConfirm(true))}
        >
          {confirm ? "নিশ্চিত? আবার চাপো" : "আবার শুরু করো"}
        </Button>
      </div>
    </>
  )
}
