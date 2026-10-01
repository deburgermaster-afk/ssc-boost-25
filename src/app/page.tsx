"use client"

import { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Guide } from "@/components/guide"
import { RichBlock, RichText } from "@/components/rich-text"
import {
  BLOCK,
  BREAKS,
  MCQ_TOTAL,
  LABELS,
  bn,
  subjects,
  subjectById,
  type BreakPage,
  type Mcq,
  type Subject,
  type SubjectId,
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
const SUBJECT_KEY = "ssc-boost-subject"

function store(key: string, value?: string | null) {
  try {
    if (value === undefined) return localStorage.getItem(key)
    if (value === null) localStorage.removeItem(key)
    else localStorage.setItem(key, value)
  } catch {}
  return null
}

function deviceId(): string {
  let id = store(DEVICE_KEY)
  if (!id) {
    id = crypto.randomUUID()
    store(DEVICE_KEY, id)
  }
  return id
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

const inProgress = (s: State) => s.mcqIndex > 0 || s.breakDone > 0

export default function Home() {
  const [id, setId] = useState("")
  const [states, setStates] = useState<Partial<Record<SubjectId, State>>>({})
  const [open, setOpen] = useState<SubjectId | null>(null)
  const [started, setStarted] = useState(false)
  const [error, setError] = useState("")
  // Math shows the result of the last answer until "পরবর্তী" is pressed.
  const [reveal, setReveal] = useState<{ qId: number; choice: number } | null>(null)

  useEffect(() => {
    const d = deviceId()
    setId(d)
    Promise.all(subjects.map((s) => post("/api/state", { subject: s.id, deviceId: d })))
      .then((list) => {
        const next = Object.fromEntries(subjects.map((s, i) => [s.id, list[i]]))
        setStates(next)
        // Resume straight into the subject that was open before the refresh.
        const last = store(SUBJECT_KEY)
        if (last && subjectById.has(last) && inProgress(next[last])) {
          setOpen(last as SubjectId)
          setStarted(true)
        }
      })
      .catch(() => setError("সার্ভারে সংযোগ হচ্ছে না। আবার চেষ্টা করো।"))
  }, [])

  const call = useCallback(
    async (subject: SubjectId, path: string, body: object, then?: () => void) => {
      try {
        const s = await post(path, { subject, deviceId: id, ...body })
        // Same tick as the state update, so the next question never flashes
        // before the feedback screen.
        then?.()
        setStates((prev) => ({ ...prev, [subject]: s }))
        setError("")
        return true
      } catch {
        setError("সেভ হয়নি। ইন্টারনেট দেখে আবার চাপো।")
        return false
      }
    },
    [id],
  )

  const loaded = subjects.every((s) => states[s.id])
  if (!loaded) {
    return (
      <Shell>
        <div className="flex flex-1 items-center justify-center text-sm text-neutral-500">{error || "লোড হচ্ছে…"}</div>
      </Shell>
    )
  }

  if (!open) {
    return (
      <SubjectList
        states={states as Record<SubjectId, State>}
        onOpen={(s) => {
          setOpen(s)
          setStarted(false)
        }}
      />
    )
  }

  const subject = subjectById.get(open)!
  const state = states[open]!
  const goHome = () => {
    store(SUBJECT_KEY, null)
    setStarted(false)
    setOpen(null)
    setReveal(null)
  }

  if (!started) {
    return (
      <Start
        subject={subject}
        state={state}
        onBack={goHome}
        onStart={() => {
          store(SUBJECT_KEY, subject.id)
          setStarted(true)
        }}
      />
    )
  }

  const breakDue = state.mcqIndex >= BLOCK * (state.breakDone + 1)
  let screen: React.ReactNode
  if (reveal) {
    const q = subject.mcqById.get(reveal.qId)!
    screen = (
      <Feedback
        key={`r${q.id}`}
        subject={subject}
        q={q}
        n={state.order.indexOf(q.id) + 1}
        choice={reveal.choice}
        onNext={() => setReveal(null)}
      />
    )
  } else if (state.finished) {
    screen = <Done subject={subject} state={state} onRestart={() => call(subject.id, "/api/restart", {})} />
  } else if (breakDue) {
    const k = state.breakDone + 1
    screen = (
      <Break key={`${subject.id}${k}`} subject={subject} k={k} onDone={() => call(subject.id, "/api/break", { k })} />
    )
  } else {
    const q = subject.mcqById.get(state.order[state.mcqIndex])!
    screen = (
      <Question
        key={`${subject.id}${q.id}`}
        subject={subject}
        q={q}
        n={state.mcqIndex + 1}
        onAnswer={async (choice) => {
          await call(subject.id, "/api/answer", { qId: q.id, choice }, () => {
            if (subject.instant) setReveal({ qId: q.id, choice })
          })
        }}
      />
    )
  }

  return (
    <Shell>
      <Header subject={subject} state={state} onHome={goHome} />
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

function SubjectList({ states, onOpen }: { states: Record<SubjectId, State>; onOpen: (s: SubjectId) => void }) {
  return (
    <Shell>
      <div className="shrink-0 pt-2">
        <p className="text-xs tracking-wide text-neutral-500">মাধ্যমিক · গুরুত্বপূর্ণ MCQ ও সৃজনশীল</p>
        <h1 className="text-3xl leading-tight font-bold">SSC 2025</h1>
      </div>
      <Separator className="my-4" />
      <div className="flex min-h-0 flex-1 flex-col">
        {subjects.map((s, i) => {
          const st = states[s.id]
          const done = Math.min(st.mcqIndex, MCQ_TOTAL)
          return (
            <div key={s.id}>
              {i > 0 && <Separator className="my-4" />}
              <button className="w-full text-left" onClick={() => onOpen(s.id)}>
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-xl font-bold">{s.title}</p>
                  <span className="shrink-0 text-xs tabular-nums text-neutral-500">
                    {st.finished ? "Done" : `${bn(done)}/${bn(MCQ_TOTAL)}`}
                  </span>
                </div>
                <p className="mt-0.5 text-[12.5px] leading-snug text-neutral-600">{s.subtitle}</p>
                <p className="mt-1 line-clamp-2 text-[12px] leading-snug text-neutral-500">
                  {s.chapters.map((c) => c.title).join(" · ")}
                </p>
                <Progress value={(done / MCQ_TOTAL) * 100} className="mt-2 h-1" />
              </button>
              <Button
                variant={inProgress(st) ? "default" : "outline"}
                className="mt-3 h-11 w-full text-base"
                onClick={() => onOpen(s.id)}
              >
                {st.finished ? "ফলাফল দেখো" : inProgress(st) ? "চালিয়ে যাও" : "খোলো"}
              </Button>
            </div>
          )
        })}
      </div>
      <p className="shrink-0 pt-3 text-center text-[11px] text-neutral-400">প্রগ্রেস স্বয়ংক্রিয়ভাবে সেভ হয়</p>
    </Shell>
  )
}

function Header({ subject, state, onHome }: { subject: Subject; state: State; onHome: () => void }) {
  const done = Math.min(state.mcqIndex, MCQ_TOTAL)
  return (
    <header className="mb-3 shrink-0">
      <div className="mb-2 flex items-center justify-between">
        <button onClick={onHome} className="text-sm font-semibold">
          ← {subject.title}
        </button>
        <span className="text-xs tabular-nums text-neutral-500">
          {bn(done)} / {bn(MCQ_TOTAL)}
        </span>
      </div>
      <Progress value={(done / MCQ_TOTAL) * 100} className="h-1" />
    </header>
  )
}

function Start({
  subject,
  state,
  onStart,
  onBack,
}: {
  subject: Subject
  state: State
  onStart: () => void
  onBack: () => void
}) {
  const groups = [...new Set(subject.chapters.map((c) => c.kind))].map((kind) => ({
    kind,
    items: subject.chapters.filter((c) => c.kind === kind),
  }))
  const twoCol = groups.length > 1
  return (
    <Shell>
      <div className="shrink-0 pt-2">
        <button onClick={onBack} className="mb-1 text-xs text-neutral-500">
          ← সব বিষয়
        </button>
        <h1 className="text-2xl leading-tight font-bold">{subject.title} MCQ</h1>
        <p className="mt-1 text-xs text-neutral-600">{subject.subtitle}</p>
      </div>
      <Separator className="my-3" />
      <div
        className={cn(
          "grid min-h-0 flex-1 gap-x-4 overflow-hidden leading-[1.45]",
          twoCol ? "grid-cols-2 text-[12.5px]" : "grid-cols-1 text-[15px]",
        )}
      >
        {groups.map((g) => (
          <div key={g.kind} className="min-h-0">
            <p className="mb-1 text-xs font-semibold">
              {twoCol ? `${g.kind} (${bn(g.items.length)})` : "অধ্যায় (এই ক্রমে)"}
            </p>
            <ol className={cn(!twoCol && "flex flex-col gap-1.5")}>
              {g.items.map((c) => (
                <li key={c.id} className="truncate text-neutral-700">
                  {twoCol ? c.title : `${c.author} — ${c.title}`}
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>
      <div className="shrink-0 pt-3">
        {inProgress(state) && (
          <p className="mb-2 text-center text-xs text-neutral-500">
            {state.finished ? "পরীক্ষা শেষ হয়েছে" : `${bn(state.mcqIndex)}টি উত্তর দেওয়া হয়েছে`}
          </p>
        )}
        <Button className="h-12 w-full text-base" onClick={onStart}>
          {state.finished ? "ফলাফল দেখো" : inProgress(state) ? "চালিয়ে যাও" : "শুরু করো"}
        </Button>
      </div>
    </Shell>
  )
}

// Long passages / multi-statement questions get a smaller type size so the
// whole question fits the fixed screen without scrolling.
function sizeFor(q: Mcq, extra = 0) {
  const len = (q.passage?.length ?? 0) + q.q.length + q.opts.join("").length + extra
  if (len > 520) return "text-[13px]"
  if (len > 380) return "text-[14px]"
  if (len > 260) return "text-[15px]"
  return "text-[16px]"
}

function QuestionBody({ subject, q, n, label }: { subject: Subject; q: Mcq; n?: number; label?: string }) {
  return (
    <>
      <div className="mb-2 flex items-center justify-between text-xs text-neutral-500">
        <span>{label ?? `প্রশ্ন ${bn(n!)}`}</span>
        <span className="truncate pl-3">{subject.chapterById.get(q.ch)?.title}</span>
      </div>
      {q.passage && (
        <p className="mb-3 border-l-2 border-black pl-3 leading-relaxed text-neutral-800">
          <RichText text={q.passage} />
        </p>
      )}
      <RichBlock text={q.q} className="mb-4 leading-relaxed font-semibold" />
    </>
  )
}

function Question({
  subject,
  q,
  n,
  onAnswer,
}: {
  subject: Subject
  q: Mcq
  n: number
  onAnswer: (c: number) => Promise<void>
}) {
  const [picked, setPicked] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  return (
    <>
      <div className={cn("flex min-h-0 flex-1 flex-col overflow-y-auto", sizeFor(q))}>
        <QuestionBody subject={subject} q={q} n={n} />
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
              <span className="pt-px">
                <RichText text={o} />
              </span>
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
        {saving ? "সেভ হচ্ছে…" : subject.instant ? "উত্তর দাও" : "পরবর্তী"}
      </Button>
    </>
  )
}

// `compact` (instant feedback) shows only the right answer and the chosen one,
// leaving room for the worked explanation.
function Options({ q, mine, compact }: { q: Mcq; mine: number | undefined; compact?: boolean }) {
  return (
    <div className="flex flex-col gap-2">
      {q.opts.map((o, j) => (compact && j !== q.a && j !== mine ? null : (
        <div
          key={j}
          className={cn(
            "flex items-start gap-3 rounded-lg border px-3 py-2 leading-snug",
            j === q.a
              ? "border-black bg-black text-white"
              : j === mine
                ? "border-dashed border-black"
                : "border-neutral-200 text-neutral-500",
          )}
        >
          <span className="w-5 shrink-0">{LABELS[j]}</span>
          <span className={cn(j === mine && j !== q.a && "line-through")}>
            <RichText text={o} />
          </span>
          {j === q.a && <span className="ml-auto shrink-0 text-xs">সঠিক</span>}
          {j === mine && j !== q.a && <span className="ml-auto shrink-0 text-xs">তোমার</span>}
        </div>
      )))}
    </div>
  )
}

function Explanation({ q }: { q: Mcq }) {
  if (!q.ex) return null
  return (
    <div className="mt-3 border-l-2 border-black pl-3 leading-snug">
      <p className="mb-0.5 text-xs font-semibold text-neutral-500">ব্যাখ্যা</p>
      <RichBlock text={q.ex} />
    </div>
  )
}

function Feedback({
  subject,
  q,
  n,
  choice,
  onNext,
}: {
  subject: Subject
  q: Mcq
  n: number
  choice: number
  onNext: () => void
}) {
  const right = choice === q.a
  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto text-[14px]">
        <QuestionBody subject={subject} q={q} label={`প্রশ্ন ${bn(n)} · ${right ? "সঠিক ✓" : "ভুল ✗"}`} />
        <Options q={q} mine={choice} compact />
        <Explanation q={q} />
      </div>
      <Button className="mt-3 h-12 w-full shrink-0 text-base" onClick={onNext}>
        পরবর্তী
      </Button>
    </>
  )
}

function BreakView({ subject, page }: { subject: Subject; page: BreakPage }) {
  if (page.kind === "short") {
    return (
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto">
        {page.items.map((s) => (
          <div key={s.id} className="border-b border-neutral-200 pb-3 last:border-0">
            <p className="text-[11px] text-neutral-500">
              {s.kind} · {subject.chapterById.get(s.ch)?.title}
            </p>
            <p className="text-[15px] leading-snug font-semibold">{s.q}</p>
            <p className="mt-0.5 text-[14px] leading-snug text-neutral-700">{s.a}</p>
          </div>
        ))}
      </div>
    )
  }
  const { cq } = page
  // Math CQs show the full worked solution in blue on one scrollable page.
  const full = subject.instant
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto text-[14px] leading-snug">
      <p className="text-[11px] text-neutral-500">
        সৃজনশীল {bn(page.n)}/{bn(page.of)} · {subject.chapterById.get(cq.ch)?.title}
      </p>
      {page.stem ? (
        <div className="border-l-2 border-black pl-3 text-neutral-800">
          <p className="mb-0.5 text-[11px] font-semibold text-neutral-500">উদ্দীপক</p>
          <RichBlock text={cq.stem} />
        </div>
      ) : (
        <p className="line-clamp-2 text-[12px] text-neutral-500">
          <RichText text={cq.stem.split("\n")[0]} />
        </p>
      )}
      {page.parts.map((i) => {
        const p = cq.parts[i]
        return (
          <div key={i} className="border-b border-neutral-200 pb-3 last:border-0">
            <p className="font-semibold">
              {LABELS[i]}. <RichText text={p.q} />
            </p>
            {p.guide && <Guide steps={p.guide} />}
            {p.guide && <p className="mt-3 text-[11px] font-semibold text-neutral-500">সম্পূর্ণ সমাধান</p>}
            <RichBlock text={p.a} className={cn("mt-1", full ? "text-blue-700" : "text-neutral-700")} />
            {p.tip && (
              <div className={cn("mt-2 rounded-md border border-dashed px-3 py-2 text-[13px]", full ? "border-blue-700 text-blue-700" : "border-black")}>
                <RichBlock text={p.tip} />
              </div>
            )}
          </div>
        )
      })}
      {page.link && cq.link && (
        <div className="border-l-2 border-black pl-3">
          <p className="text-[11px] font-semibold text-neutral-500">উদ্দীপক ↔ পাঠ্য সংযোগ</p>
          <RichText text={cq.link} />
        </div>
      )}
    </div>
  )
}

function Break({ subject, k, onDone }: { subject: Subject; k: number; onDone: () => Promise<unknown> }) {
  const pages = subject.breakPages(k)
  const key = `ssc-boost-break-${subject.id}-${k}`
  const [page, setPage] = useState(0)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const p = Number(store(key))
    if (p > 0 && p < pages.length) setPage(p)
  }, [key, pages.length])

  const go = (p: number) => {
    setPage(p)
    store(key, String(p))
  }

  const cur = pages[page]
  const last = page === pages.length - 1
  return (
    <>
      <div className="mb-2 shrink-0">
        <p className="text-xs text-neutral-500">
          বিরতি {bn(k)}/{bn(BREAKS)} · পৃষ্ঠা {bn(page + 1)}/{bn(pages.length)}
        </p>
        <h2 className="text-lg font-bold">{cur.title}</h2>
      </div>
      <BreakView subject={subject} page={cur} />
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

function Done({ subject, state, onRestart }: { subject: Subject; state: State; onRestart: () => Promise<unknown> }) {
  const isRight = (id: number) => state.answers[id] === subject.mcqById.get(id)!.a
  const wrong = state.order.filter((id) => state.answers[id] !== undefined && !isRight(id))
  const correct = state.order.filter(isRight).length
  const [i, setI] = useState(-1)
  const [confirm, setConfirm] = useState(false)

  if (i >= 0 && wrong.length > 0) {
    const q = subject.mcqById.get(wrong[i])!
    return (
      <>
        <div className={cn("flex min-h-0 flex-1 flex-col overflow-y-auto", sizeFor(q, q.ex?.length ?? 0))}>
          <QuestionBody subject={subject} q={q} label={`ভুল ${bn(i + 1)}/${bn(wrong.length)}`} />
          <Options q={q} mine={state.answers[q.id]} />
          <Explanation q={q} />
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
        <p className="mt-2 text-sm text-neutral-500">{subject.title} পরীক্ষা শেষ হয়েছে</p>
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
