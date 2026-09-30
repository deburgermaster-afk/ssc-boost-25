import mcqData from "@/data/mcq.json"
import shortData from "@/data/short.json"
import chapterData from "@/data/chapters.json"

export type Chapter = { id: string; title: string; author: string; kind: "গদ্য" | "কবিতা" }
export type Mcq = {
  id: number
  ch: string
  type: "সাধারণ" | "বহুপদী" | "অভিন্ন"
  passage?: string
  q: string
  opts: [string, string, string, string]
  a: number
}
export type Short = { id: number; ch: string; kind: "ক" | "খ"; q: string; a: string }

export const chapters = chapterData as Chapter[]
export const mcqs = mcqData as Mcq[]
export const shorts = shortData as Short[]

export const MCQ_TOTAL = 500
export const BLOCK = 50
export const BREAKS = MCQ_TOTAL / BLOCK
export const KA_PER_BREAK = 30
export const KHA_PER_BREAK = 10

export const mcqById = new Map(mcqs.map((m) => [m.id, m]))
export const chapterById = new Map(chapters.map((c) => [c.id, c]))

const kas = shorts.filter((s) => s.kind === "ক")
const khas = shorts.filter((s) => s.kind === "খ")

export function breakItems(k: number): Short[] {
  return [
    ...kas.slice((k - 1) * KA_PER_BREAK, k * KA_PER_BREAK),
    ...khas.slice((k - 1) * KHA_PER_BREAK, k * KHA_PER_BREAK),
  ]
}

const BN = "০১২৩৪৫৬৭৮৯"
export const bn = (n: number | string) => String(n).replace(/\d/g, (d) => BN[+d])
export const LABELS = ["ক", "খ", "গ", "ঘ"]
