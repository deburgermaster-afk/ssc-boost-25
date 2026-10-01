import banglaMcq from "@/data/bangla/mcq.json"
import banglaShort from "@/data/bangla/short.json"
import banglaCq from "@/data/bangla/cq.json"
import banglaChapters from "@/data/bangla/chapters.json"
import mathMcq from "@/data/math/mcq.json"
import mathCq from "@/data/math/cq.json"
import mathChapters from "@/data/math/chapters.json"

export type Chapter = { id: string; title: string; author: string; kind: string }
export type Mcq = {
  id: number
  ch: string
  type?: string
  passage?: string
  q: string
  opts: string[]
  a: number
  ex?: string
}
export type Short = { id: number; ch: string; kind: "ক" | "খ"; q: string; a: string }
export type CqPart = { q: string; a: string; tip?: string }
export type Cq = { id: number; ch: string; stem: string; parts: CqPart[]; link?: string }

// One screen of a break. A CQ is split over several pages (stem + ক/খ, then
// গ/ঘ) so each page fits the fixed screen.
export type BreakPage =
  | { kind: "short"; title: string; items: Short[] }
  | { kind: "cq"; title: string; cq: Cq; n: number; of: number; parts: number[]; stem: boolean; link: boolean }

export type SubjectId = "bangla" | "math"
export type Subject = {
  id: SubjectId
  title: string
  subtitle: string
  // Show the right answer + explanation right after each MCQ (math), or only
  // at the end (Bangla).
  instant: boolean
  chapters: Chapter[]
  mcqs: Mcq[]
  mcqById: Map<number, Mcq>
  chapterById: Map<string, Chapter>
  order: number[]
  breakPages: (k: number) => BreakPage[]
}

export const MCQ_TOTAL = 500
export const BLOCK = 50
export const BREAKS = MCQ_TOTAL / BLOCK
const SHORT_PER_PAGE = 5

function make(
  base: Omit<Subject, "mcqById" | "chapterById" | "order" | "breakPages">,
  breakPages: (k: number) => BreakPage[],
): Subject {
  return {
    ...base,
    mcqById: new Map(base.mcqs.map((m) => [m.id, m])),
    chapterById: new Map(base.chapters.map((c) => [c.id, c])),
    // Chapter-wise: the build scripts already store questions in chapter order.
    order: base.mcqs.map((m) => m.id).slice(0, MCQ_TOTAL),
    breakPages,
  }
}

function shortPages(items: Short[], title: string): BreakPage[] {
  const pages: BreakPage[] = []
  for (let i = 0; i < items.length; i += SHORT_PER_PAGE) {
    pages.push({ kind: "short", title, items: items.slice(i, i + SHORT_PER_PAGE) })
  }
  return pages
}

const bShorts = banglaShort as Short[]
const bKa = bShorts.filter((s) => s.kind === "ক")
const bKha = bShorts.filter((s) => s.kind === "খ")
const bCq: Cq[] = (banglaCq as { id: number; ch: string; stem: string; parts: string[][]; link: string }[]).map((c) => ({
  ...c,
  parts: c.parts.map(([q, a]) => ({ q, a })),
}))

const bangla = make(
  {
    id: "bangla",
    title: "বাংলা ১ম পত্র",
    subtitle: "৫০০ MCQ · প্রতি ৫০টির পর ৩০ ক + ১০ খ + ১০ সৃজনশীল",
    instant: false,
    chapters: banglaChapters as Chapter[],
    mcqs: banglaMcq as Mcq[],
  },
  (k) => {
    const cqs = bCq.slice((k - 1) * 10, k * 10)
    return [
      ...shortPages(bKa.slice((k - 1) * 30, k * 30), "জ্ঞানমূলক প্রশ্ন (ক)"),
      ...shortPages(bKha.slice((k - 1) * 10, k * 10), "অনুধাবনমূলক প্রশ্ন (খ)"),
      ...cqs.flatMap((cq, i): BreakPage[] => [
        { kind: "cq", title: "সৃজনশীল প্রশ্ন", cq, n: i + 1, of: cqs.length, parts: [0, 1], stem: true, link: false },
        { kind: "cq", title: "সৃজনশীল প্রশ্ন", cq, n: i + 1, of: cqs.length, parts: [2, 3], stem: false, link: true },
      ]),
    ]
  },
)

const mCq = mathCq as Cq[]
const math = make(
  {
    id: "math",
    title: "সাধারণ গণিত",
    subtitle: "৫০০ MCQ · উত্তরের সাথে সাথে ব্যাখ্যা · প্রতি ৫০টির পর ৫ সৃজনশীল",
    instant: true,
    chapters: mathChapters as Chapter[],
    mcqs: mathMcq as Mcq[],
  },
  (k) => {
    const cqs = mCq.slice((k - 1) * 5, k * 5)
    return cqs.flatMap((cq, i): BreakPage[] => [
      { kind: "cq", title: "সৃজনশীল প্রশ্ন", cq, n: i + 1, of: cqs.length, parts: [0, 1], stem: true, link: false },
      { kind: "cq", title: "সৃজনশীল প্রশ্ন", cq, n: i + 1, of: cqs.length, parts: [2], stem: false, link: false },
      { kind: "cq", title: "সৃজনশীল প্রশ্ন", cq, n: i + 1, of: cqs.length, parts: [3], stem: false, link: false },
    ])
  },
)

export const subjects: Subject[] = [bangla, math]
export const subjectById = new Map<string, Subject>(subjects.map((s) => [s.id, s]))
export const isSubject = (x: unknown): x is SubjectId => typeof x === "string" && subjectById.has(x)

const BN = "০১২৩৪৫৬৭৮৯"
export const bn = (n: number | string) => String(n).replace(/\d/g, (d) => BN[+d])
export const LABELS = ["ক", "খ", "গ", "ঘ"]
