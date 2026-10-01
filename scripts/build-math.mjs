// Generates src/data/math/{chapters,mcq,cq}.json — SSC সাধারণ গণিত (Class 9–10).
//
// Every number in a question, its options, its explanation and every CQ
// solution is computed here, so answers are always arithmetically correct.
// Text is Bangla; math is LaTeX between $…$ (rendered with KaTeX in the app).
import fs from "node:fs"

// ───────────────────────── helpers ─────────────────────────
let seed = 9102017
const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648)
const ri = (a, b) => a + Math.floor(rnd() * (b - a + 1))
const pick = (arr) => arr[ri(0, arr.length - 1)]
const shuffle = (a) => {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
const distinct = (n, lo, hi) => {
  const s = new Set()
  while (s.size < n) s.add(ri(lo, hi))
  return [...s]
}
const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a))
const lcm = (a, b) => (a / gcd(a, b)) * b
// Rational → LaTeX (always reduced; integer when possible).
const fr = (n, d = 1) => {
  if (d < 0) (n = -n), (d = -d)
  const g = gcd(n, d) || 1
  n /= g
  d /= g
  if (d === 1) return `${n}`
  return n < 0 ? `-\\frac{${-n}}{${d}}` : `\\frac{${n}}{${d}}`
}
const r2 = (x) => Math.round(x * 100) / 100
const dec = (x) => (Number.isInteger(r2(x)) ? `${r2(x)}` : r2(x).toFixed(2))
const $ = (s) => `$${s}$`
const setTex = (arr) => (arr.length ? `\\{${[...arr].sort((a, b) => a - b).join(", ")}\\}` : "\\emptyset")
const radTex = (k, r) => (r === 1 ? `${k}` : k === 1 ? `\\sqrt{${r}}` : `${k}\\sqrt{${r}}`)
// a/√3 written the textbook way
const overRoot3 = (a) => (a % 3 === 0 ? radTex(a / 3, 3) : `\\frac{${a}}{\\sqrt{3}}`)

const mcq = []
const seen = new Set()
// Push an MCQ. `opts[0]` is the correct option; the rest are distractors.
function add(ch, q, opts, ex) {
  if (seen.has(q)) return false
  const uniq = [...new Set(opts)]
  if (uniq.length < 4) return false
  const four = [uniq[0], ...shuffle(uniq.slice(1)).slice(0, 3)]
  const order = shuffle([0, 1, 2, 3])
  seen.add(q)
  mcq.push({ ch, q, opts: order.map((i) => four[i]), a: order.indexOf(0), ex })
  return true
}
// Numeric options: correct + distractors, falling back to nearby values.
function numOpts(correct, cands, fmt = (x) => $(dec(x))) {
  const out = [fmt(correct)]
  for (const c of [...cands, correct + 1, correct - 1, correct + 2, correct * 2, correct + 10, correct - 2])
    if (Number.isFinite(c) && c >= 0) {
      const s = fmt(c)
      if (!out.includes(s)) out.push(s)
      if (out.length === 4) break
    }
  return out
}

const chapters = [
  { id: "m17", no: 17, title: "পরিসংখ্যান" },
  { id: "m9", no: 9, title: "ত্রিকোণমিতিক অনুপাত" },
  { id: "m2", no: 2, title: "সেট ও ফাংশন" },
  { id: "m10", no: 10, title: "দূরত্ব ও উচ্চতা" },
  { id: "m11", no: 11, title: "বীজগাণিতিক অনুপাত ও সমানুপাত" },
  { id: "m13", no: 13, title: "সসীম ধারা" },
  { id: "m16", no: 16, title: "পরিমিতি" },
]
const QUOTA = { m17: 72, m9: 72, m2: 72, m10: 71, m11: 71, m13: 71, m16: 71 }

// Fills chapter `ch` from fixed concept questions, then cycles templates.
function fill(ch, fixed, templates) {
  const start = mcq.length
  for (const f of fixed) add(ch, ...f)
  let guard = 0
  while (mcq.length - start < QUOTA[ch] && guard++ < 20000) pick(templates)()
  if (mcq.length - start !== QUOTA[ch]) throw new Error(`${ch}: ${mcq.length - start}/${QUOTA[ch]}`)
}

// ───────────────────────── ১৭ পরিসংখ্যান ─────────────────────────
{
  const C = "m17"
  const list = (xs) => $(xs.join(", "))
  const fixed = [
    ["অজিভ রেখা আঁকতে কোনটি প্রয়োজন?", ["ক্রমযোজিত গণসংখ্যা", "শ্রেণি মধ্যবিন্দু", "শ্রেণিব্যবধান", "গণসংখ্যা ঘনত্ব"], "অজিভ রেখায় $x$-অক্ষে শ্রেণির উচ্চসীমা আর $y$-অক্ষে **ক্রমযোজিত গণসংখ্যা** বসাতে হয়।"],
    ["গণসংখ্যা বহুভুজ আঁকতে $x$-অক্ষে কী নেওয়া হয়?", ["শ্রেণি মধ্যবিন্দু", "ক্রমযোজিত গণসংখ্যা", "শ্রেণিসংখ্যা", "পরিসর"], "গণসংখ্যা বহুভুজে আয়তলেখের আয়তগুলোর উপরিভাগের মধ্যবিন্দু, অর্থাৎ **শ্রেণি মধ্যবিন্দু** যুক্ত করা হয়।"],
    ["কোনটি কেন্দ্রীয় প্রবণতার পরিমাপ নয়?", ["পরিসর", "গড়", "মধ্যক", "প্রচুরক"], "কেন্দ্রীয় প্রবণতার পরিমাপ তিনটি: গড়, মধ্যক, প্রচুরক। **পরিসর** বিস্তারের পরিমাপ।"],
    ["শ্রেণিসংখ্যা নির্ণয়ের সূত্র কোনটি?", [$("\\frac{\\text{পরিসর}}{\\text{শ্রেণিব্যবধান}}"), $("\\text{পরিসর}\\times\\text{শ্রেণিব্যবধান}"), $("\\frac{\\text{শ্রেণিব্যবধান}}{\\text{পরিসর}}"), $("\\text{পরিসর}-\\text{শ্রেণিব্যবধান}")], "শ্রেণিসংখ্যা $=\\frac{\\text{পরিসর}}{\\text{শ্রেণিব্যবধান}}$; ভগ্নাংশ এলে পরের পূর্ণসংখ্যা নিতে হয়।"],
    ["পরিসর নির্ণয়ের সূত্র কোনটি?", [$("(\\text{সর্বোচ্চ}-\\text{সর্বনিম্ন})+1"), $("\\text{সর্বোচ্চ}+\\text{সর্বনিম্ন}"), $("\\text{সর্বোচ্চ}-\\text{সর্বনিম্ন}-1"), $("\\frac{\\text{সর্বোচ্চ}}{\\text{সর্বনিম্ন}}")], "পাঠ্যবই অনুযায়ী পরিসর $=(\\text{সর্বোচ্চ মান}-\\text{সর্বনিম্ন মান})+1$।"],
    ["মধ্যক নির্ণয়ের সূত্র $L+\\left(\\frac{n}{2}-F_c\\right)\\times\\frac{h}{f_m}$-এ $F_c$ কী?", ["মধ্যক শ্রেণির পূর্ববর্তী শ্রেণির ক্রমযোজিত গণসংখ্যা", "মধ্যক শ্রেণির গণসংখ্যা", "মোট গণসংখ্যা", "মধ্যক শ্রেণির নিম্নসীমা"], "$F_c$ = মধ্যক শ্রেণির **ঠিক আগের শ্রেণির** ক্রমযোজিত গণসংখ্যা; $f_m$ = মধ্যক শ্রেণির গণসংখ্যা।"],
    ["প্রচুরক নির্ণয়ের সূত্রে $f_1$ কী নির্দেশ করে?", ["প্রচুরক শ্রেণির গণসংখ্যা − পূর্ববর্তী শ্রেণির গণসংখ্যা", "প্রচুরক শ্রেণির গণসংখ্যা − পরবর্তী শ্রেণির গণসংখ্যা", "প্রচুরক শ্রেণির গণসংখ্যা", "মোট গণসংখ্যা"], "প্রচুরক $=L+\\frac{f_1}{f_1+f_2}\\times h$, যেখানে $f_1$ = প্রচুরক শ্রেণি − **পূর্ববর্তী** শ্রেণির গণসংখ্যা, $f_2$ = প্রচুরক শ্রেণি − **পরবর্তী** শ্রেণির গণসংখ্যা।"],
    ["সংক্ষিপ্ত পদ্ধতিতে গড় নির্ণয়ের সূত্র কোনটি?", [$("a+\\frac{\\sum f_iu_i}{n}\\times h"), $("\\frac{\\sum f_ix_i}{n}"), $("a-\\frac{\\sum f_iu_i}{n}"), $("\\frac{\\sum u_i}{n}\\times h")], "সংক্ষিপ্ত পদ্ধতি: $\\bar{x}=a+\\frac{\\sum f_iu_i}{n}\\times h$, যেখানে $u_i=\\frac{x_i-a}{h}$, $a$ = আনুমানিক গড়।"],
    ["আয়তলেখ আঁকার সময় $y$-অক্ষে কী নেওয়া হয়?", ["গণসংখ্যা", "শ্রেণিসীমা", "শ্রেণি মধ্যবিন্দু", "পরিসর"], "আয়তলেখে $x$-অক্ষে শ্রেণিসীমা ও $y$-অক্ষে **গণসংখ্যা** নেওয়া হয়।"],
    ["অবিন্যস্ত উপাত্তকে মানের ক্রমানুসারে সাজালে যে মান উপাত্তগুলোকে সমান দুই ভাগে ভাগ করে তাকে কী বলে?", ["মধ্যক", "গড়", "প্রচুরক", "পরিসর"], "ক্রমানুসারে সাজানো উপাত্তের মাঝের মান **মধ্যক**।"],
    ["উপাত্তে যে সংখ্যাটি সবচেয়ে বেশিবার থাকে তাকে কী বলে?", ["প্রচুরক", "মধ্যক", "গড়", "পরিসর"], "সর্বাধিকবার আসা মান **প্রচুরক**।"],
    ["সংক্ষিপ্ত পদ্ধতিতে $u_i$ এর মান কোনটি?", [$("\\frac{x_i-a}{h}"), $("\\frac{x_i+a}{h}"), $("\\frac{h}{x_i-a}"), $("x_i-a")], "ধাপ বিচ্যুতি $u_i=\\frac{x_i-a}{h}$।"],
    ["শ্রেণিব্যবধান কমালে শ্রেণিসংখ্যা—", ["বাড়ে", "কমে", "একই থাকে", "শূন্য হয়"], "শ্রেণিসংখ্যা $=\\frac{\\text{পরিসর}}{h}$; হর $h$ কমলে শ্রেণিসংখ্যা **বাড়ে**।"],
  ].map(([q, o, e]) => [q, o, e])

  const tMean = () => {
    const n = ri(5, 8)
    const xs = Array.from({ length: n }, () => ri(10, 60))
    const s0 = xs.reduce((a, b) => a + b, 0)
    xs[n - 1] += (n - (s0 % n)) % n
    const S = xs.reduce((a, b) => a + b, 0)
    const m = S / n
    add(C, `${list(xs)} সংখ্যাগুলোর গাণিতিক গড় কত?`, numOpts(m, [m + 1, m - 2, S / (n - 1)].map(r2)), `গড় $=\\frac{\\text{যোগফল}}{\\text{সংখ্যা}}=\\frac{${xs.join("+")}}{${n}}=\\frac{${S}}{${n}}=${m}$`)
  }
  const tMedOdd = () => {
    const n = pick([5, 7, 9])
    const xs = distinct(n, 5, 80)
    const s = [...xs].sort((a, b) => a - b)
    const k = (n + 1) / 2
    const med = s[k - 1]
    add(C, `${list(xs)} উপাত্তগুলোর মধ্যক কত?`, numOpts(med, [xs[k - 1], s[k], s[k - 2]]), `ঊর্ধ্বক্রমে সাজাই: $${s.join(", ")}$। $n=${n}$ (বিজোড়), তাই মধ্যক $=\\frac{n+1}{2}=${k}$ তম পদ $=${med}$`)
  }
  const tMedEven = () => {
    const n = pick([6, 8, 10])
    const xs = distinct(n, 5, 90)
    const s = [...xs].sort((a, b) => a - b)
    const a = s[n / 2 - 1]
    const b = s[n / 2]
    const med = (a + b) / 2
    add(C, `${list(xs)} উপাত্তগুলোর মধ্যক কত?`, numOpts(med, [a, b, xs[n / 2]]), `ঊর্ধ্বক্রমে: $${s.join(", ")}$। $n=${n}$ (জোড়), তাই মধ্যক $=\\frac{${n / 2}\\text{তম}+${n / 2 + 1}\\text{তম পদ}}{2}=\\frac{${a}+${b}}{2}=${dec(med)}$`)
  }
  const tMode = () => {
    const base = distinct(5, 10, 40)
    const md = base[0]
    const xs = shuffle([...base, md, md])
    add(C, `${list(xs)} উপাত্তগুলোর প্রচুরক কত?`, numOpts(md, base.slice(1)), `$${md}$ সংখ্যাটি সবচেয়ে বেশি (৩ বার) এসেছে, তাই প্রচুরক $=${md}$`)
  }
  const tRange = () => {
    const xs = distinct(ri(6, 9), 10, 99)
    const mx = Math.max(...xs)
    const mn = Math.min(...xs)
    const R = mx - mn + 1
    add(C, `${list(xs)} উপাত্তগুলোর পরিসর কত?`, numOpts(R, [R - 1, mx + mn, R + 1]), `পরিসর $=(\\text{সর্বোচ্চ}-\\text{সর্বনিম্ন})+1=(${mx}-${mn})+1=${R}$`)
  }
  const tClasses = () => {
    const mn = ri(10, 40)
    const mx = mn + ri(30, 70)
    const h = pick([5, 10])
    const R = mx - mn + 1
    const k = Math.ceil(R / h)
    add(C, `কোনো উপাত্তের সর্বোচ্চ মান $${mx}$, সর্বনিম্ন মান $${mn}$। শ্রেণিব্যবধান $${h}$ হলে শ্রেণিসংখ্যা কত?`, numOpts(k, [Math.floor((mx - mn) / h), k + 1, k - 1]), `পরিসর $=(${mx}-${mn})+1=${R}$; শ্রেণিসংখ্যা $=\\frac{${R}}{${h}}=${dec(R / h)}\\approx ${k}$ (ভগ্নাংশ হলে পরের পূর্ণসংখ্যা)`)
  }
  const tMid = () => {
    const h = pick([5, 10])
    const lo = ri(2, 9) * h + 1
    const hi = lo + h - 1
    const mid = (lo + hi) / 2
    add(C, `$${lo}-${hi}$ শ্রেণির মধ্যবিন্দু কত?`, numOpts(mid, [hi - lo, lo + hi, mid + 0.5, mid - 0.5]), `মধ্যবিন্দু $=\\frac{\\text{নিম্নসীমা}+\\text{উচ্চসীমা}}{2}=\\frac{${lo}+${hi}}{2}=${dec(mid)}$`)
  }
  const tFreqMean = () => {
    const xs = distinct(4, 2, 12).sort((a, b) => a - b)
    const fs_ = xs.map(() => ri(1, 6))
    const n = fs_.reduce((a, b) => a + b, 0)
    const sfx = xs.reduce((s, x, i) => s + x * fs_[i], 0)
    const m = sfx / n
    const rows = xs.map((x, i) => `${x}\\,(${fs_[i]})`).join(",\\ ")
    add(C, `একটি উপাত্তে মান (গণসংখ্যা): $${rows}$। গড় কত?`, numOpts(r2(m), [r2(xs.reduce((a, b) => a + b, 0) / 4), r2(sfx / 4), r2(m + 1)]), `$\\sum fx=${xs.map((x, i) => `${x}\\times${fs_[i]}`).join("+")}=${sfx}$, $n=\\sum f=${n}$; গড় $=\\frac{\\sum fx}{n}=\\frac{${sfx}}{${n}}=${dec(m)}$`)
  }
  const tNat = () => {
    const n = ri(5, 40)
    const m = (n + 1) / 2
    add(C, `প্রথম $${n}$টি স্বাভাবিক সংখ্যার গড় কত?`, numOpts(m, [n / 2, (n * (n + 1)) / 2, m + 1]), `$1+2+\\dots+${n}=\\frac{${n}(${n}+1)}{2}=${(n * (n + 1)) / 2}$; গড় $=\\frac{${(n * (n + 1)) / 2}}{${n}}=${dec(m)}$ (সংক্ষেপে $\\frac{n+1}{2}$)`)
  }
  const tShort = () => {
    const h = pick([5, 10])
    const a = ri(3, 8) * h + h / 2
    const n = ri(20, 60)
    const sfu = ri(-15, 25)
    const m = a + (sfu / n) * h
    add(C, `আনুমানিক গড় $a=${a}$, $\\sum f_iu_i=${sfu}$, $n=${n}$, $h=${h}$ হলে গড় কত?`, numOpts(r2(m), [r2(a + sfu / n), r2(a - (sfu / n) * h), r2(a + sfu * h)]), `$\\bar{x}=a+\\frac{\\sum f_iu_i}{n}\\times h=${a}+\\frac{${sfu}}{${n}}\\times ${h}=${dec(m)}$`)
  }
  const tMedFormula = () => {
    const h = pick([5, 10])
    const L = ri(3, 7) * h
    const fm = ri(6, 14)
    const Fc = ri(10, 30)
    const n = 2 * (Fc + ri(1, fm - 1))
    const med = L + ((n / 2 - Fc) / fm) * h
    add(C, `মধ্যক শ্রেণির নিম্নসীমা $L=${L}$, $n=${n}$, $F_c=${Fc}$, $f_m=${fm}$, $h=${h}$ হলে মধ্যক কত?`, numOpts(r2(med), [r2(L + ((n - Fc) / fm) * h), r2(L + (n / 2 / fm) * h), r2(med + h / 2)]), `মধ্যক $=L+\\left(\\frac{n}{2}-F_c\\right)\\times\\frac{h}{f_m}=${L}+(${n / 2}-${Fc})\\times\\frac{${h}}{${fm}}=${dec(med)}$`)
  }
  const tModeFormula = () => {
    const h = pick([5, 10])
    const L = ri(3, 7) * h
    const f1 = ri(1, 8)
    const f2 = ri(1, 8)
    const mo = L + (f1 / (f1 + f2)) * h
    add(C, `প্রচুরক শ্রেণির নিম্নসীমা $${L}$, $f_1=${f1}$, $f_2=${f2}$, $h=${h}$ হলে প্রচুরক কত?`, numOpts(r2(mo), [r2(L + (f2 / (f1 + f2)) * h), r2(L + (f1 / f2) * h), r2(L + h)]), `প্রচুরক $=L+\\frac{f_1}{f_1+f_2}\\times h=${L}+\\frac{${f1}}{${f1}+${f2}}\\times${h}=${dec(mo)}$`)
  }
  const table = () => {
    const h = 10
    const start = ri(2, 5) * 10 + 1
    const f = Array.from({ length: 6 }, () => ri(3, 15))
    const cls = f.map((_, i) => `${start + i * h}-${start + i * h + h - 1}`)
    return { h, start, f, cls }
  }
  const tModeClass = () => {
    const { f, cls } = table()
    const mx = Math.max(...f)
    if (f.filter((x) => x === mx).length > 1) return
    const i = f.indexOf(mx)
    const tab = cls.map((c, k) => `${c}:${f[k]}`).join(",\\ ")
    add(C, `শ্রেণি:গণসংখ্যা — $${tab}$। প্রচুরক শ্রেণি কোনটি?`, [$(cls[i]), ...cls.filter((_, k) => k !== i).map($)], `সর্বোচ্চ গণসংখ্যা $${mx}$ যে শ্রেণিতে, সেটিই প্রচুরক শ্রেণি: $${cls[i]}$`)
  }
  const tMedClass = () => {
    const { f, cls } = table()
    const n = f.reduce((a, b) => a + b, 0)
    let cum = 0
    let i = 0
    const cf = f.map((x) => (cum += x))
    while (cf[i] < n / 2) i++
    const tab = cls.map((c, k) => `${c}:${f[k]}`).join(",\\ ")
    add(C, `শ্রেণি:গণসংখ্যা — $${tab}$। মধ্যক শ্রেণি কোনটি?`, [$(cls[i]), ...cls.filter((_, k) => k !== i).map($)], `$n=${n}$, $\\frac{n}{2}=${dec(n / 2)}$। ক্রমযোজিত গণসংখ্যা: $${cf.join(", ")}$। প্রথম যে শ্রেণিতে ক্রমযোজিত গণসংখ্যা $\\ge ${dec(n / 2)}$, সেটি মধ্যক শ্রেণি: $${cls[i]}$`)
  }
  fill(C, fixed, [tMean, tMedOdd, tMedEven, tMode, tRange, tClasses, tMid, tFreqMean, tNat, tShort, tMedFormula, tModeFormula, tModeClass, tMedClass])
}

// ───────────────────────── ৯ ত্রিকোণমিতিক অনুপাত ─────────────────────────
{
  const C = "m9"
  // squared values as rationals [n, d] — exact.
  const SQ = {
    sin: { 0: [0, 1], 30: [1, 4], 45: [1, 2], 60: [3, 4], 90: [1, 1] },
    cos: { 0: [1, 1], 30: [3, 4], 45: [1, 2], 60: [1, 4], 90: [0, 1] },
    tan: { 0: [0, 1], 30: [1, 3], 45: [1, 1], 60: [3, 1] },
    sec: { 0: [1, 1], 30: [4, 3], 45: [2, 1], 60: [4, 1] },
    cosec: { 30: [4, 1], 45: [2, 1], 60: [4, 3], 90: [1, 1] },
    cot: { 30: [3, 1], 45: [1, 1], 60: [1, 3], 90: [0, 1] },
  }
  const V = {
    sin: { 0: "0", 30: "\\frac{1}{2}", 45: "\\frac{1}{\\sqrt{2}}", 60: "\\frac{\\sqrt{3}}{2}", 90: "1" },
    cos: { 0: "1", 30: "\\frac{\\sqrt{3}}{2}", 45: "\\frac{1}{\\sqrt{2}}", 60: "\\frac{1}{2}", 90: "0" },
    tan: { 0: "0", 30: "\\frac{1}{\\sqrt{3}}", 45: "1", 60: "\\sqrt{3}" },
    sec: { 0: "1", 30: "\\frac{2}{\\sqrt{3}}", 45: "\\sqrt{2}", 60: "2" },
    cosec: { 30: "2", 45: "\\sqrt{2}", 60: "\\frac{2}{\\sqrt{3}}", 90: "1" },
    cot: { 30: "\\sqrt{3}", 45: "1", 60: "\\frac{1}{\\sqrt{3}}", 90: "0" },
  }
  const T = (f, A) => `\\${f === "cosec" ? "operatorname{cosec}" : f} ${A}^\\circ`
  const T2 = (f, A) => `\\${f === "cosec" ? "operatorname{cosec}" : f}^2 ${A}^\\circ`
  const allVals = ["0", "1", "\\frac{1}{2}", "\\frac{\\sqrt{3}}{2}", "\\frac{1}{\\sqrt{2}}", "\\sqrt{3}", "\\frac{1}{\\sqrt{3}}", "2", "\\frac{2}{\\sqrt{3}}", "\\sqrt{2}"]
  const fixed = [
    ["$\\sin^2\\theta+\\cos^2\\theta$ এর মান কত?", ["$1$", "$0$", "$2$", "$\\tan\\theta$"], "মৌলিক অভেদ: $\\sin^2\\theta+\\cos^2\\theta=1$"],
    ["$\\sec^2\\theta-\\tan^2\\theta$ এর মান কত?", ["$1$", "$0$", "$-1$", "$2$"], "অভেদ: $\\sec^2\\theta=1+\\tan^2\\theta$, তাই $\\sec^2\\theta-\\tan^2\\theta=1$"],
    ["$\\operatorname{cosec}^2\\theta-\\cot^2\\theta$ এর মান কত?", ["$1$", "$0$", "$-1$", "$\\sin\\theta$"], "অভেদ: $\\operatorname{cosec}^2\\theta=1+\\cot^2\\theta$"],
    ["$\\tan\\theta$ কোনটির সমান?", ["$\\frac{\\sin\\theta}{\\cos\\theta}$", "$\\frac{\\cos\\theta}{\\sin\\theta}$", "$\\sin\\theta\\cos\\theta$", "$\\frac{1}{\\sin\\theta}$"], "$\\tan\\theta=\\frac{\\text{লম্ব}}{\\text{ভূমি}}=\\frac{\\sin\\theta}{\\cos\\theta}$"],
    ["$\\sec\\theta$ কোনটির বিপরীত অনুপাত?", ["$\\cos\\theta$", "$\\sin\\theta$", "$\\tan\\theta$", "$\\cot\\theta$"], "$\\sec\\theta=\\frac{1}{\\cos\\theta}$"],
    ["$\\tan 90^\\circ$ এর মান—", ["অসংজ্ঞায়িত", "$0$", "$1$", "$\\sqrt{3}$"], "$\\tan 90^\\circ=\\frac{\\sin 90^\\circ}{\\cos 90^\\circ}=\\frac{1}{0}$, যা **অসংজ্ঞায়িত**"],
    ["$\\sin(90^\\circ-\\theta)$ এর মান কোনটি?", ["$\\cos\\theta$", "$\\sin\\theta$", "$\\tan\\theta$", "$-\\cos\\theta$"], "পূরক কোণের অনুপাত: $\\sin(90^\\circ-\\theta)=\\cos\\theta$"],
    ["সূক্ষ্মকোণ $\\theta$ এর জন্য $\\sin\\theta$ এর মান সর্বোচ্চ কত?", ["$1$", "$\\infty$", "$2$", "$\\frac{1}{2}$"], "অতিভুজ সবচেয়ে বড় বাহু, তাই $\\sin\\theta=\\frac{\\text{লম্ব}}{\\text{অতিভুজ}}\\le 1$"],
    ["সমকোণী ত্রিভুজে $\\theta$ কোণের বিপরীত বাহুকে কী বলে?", ["লম্ব", "ভূমি", "অতিভুজ", "মধ্যমা"], "নির্দিষ্ট কোণ $\\theta$-র বিপরীত বাহু **লম্ব**, সমকোণের বিপরীত বাহু অতিভুজ।"],
    ["$(1+\\tan^2\\theta)\\cos^2\\theta$ এর মান কত?", ["$1$", "$\\sec^2\\theta$", "$0$", "$\\sin^2\\theta$"], "$(1+\\tan^2\\theta)\\cos^2\\theta=\\sec^2\\theta\\cos^2\\theta=1$"],
    ["$\\sin\\theta\\operatorname{cosec}\\theta$ এর মান কত?", ["$1$", "$0$", "$\\sin^2\\theta$", "$2$"], "$\\operatorname{cosec}\\theta=\\frac{1}{\\sin\\theta}$, তাই গুণফল $=1$"],
    ["$\\cot\\theta\\tan\\theta$ এর মান কত?", ["$1$", "$0$", "$\\cot^2\\theta$", "$-1$"], "$\\cot\\theta=\\frac{1}{\\tan\\theta}$, তাই গুণফল $1$"],
    ["সমকোণী ত্রিভুজের একটি সূক্ষ্মকোণ $30^\\circ$ হলে অপর সূক্ষ্মকোণ কত?", ["$60^\\circ$", "$30^\\circ$", "$45^\\circ$", "$90^\\circ$"], "সূক্ষ্মকোণদ্বয়ের যোগফল $90^\\circ$, তাই $90^\\circ-30^\\circ=60^\\circ$"],
  ]
  const tBasic = () => {
    const f = pick(Object.keys(V))
    const A = pick(Object.keys(V[f]))
    const v = V[f][A]
    add(C, `$${T(f, A)}$ এর মান কত?`, [$(v), ...shuffle(allVals.filter((x) => x !== v)).slice(0, 4).map($)], `আদর্শ মান-ছক থেকে: $${T(f, A)}=${v}$`)
  }
  const tSqSum = () => {
    const terms = [0, 1].map(() => {
      const f = pick(Object.keys(SQ))
      return { f, A: pick(Object.keys(SQ[f])), c: pick([1, 1, 2, 3]) }
    })
    const sign = pick([1, 1, -1])
    const [p, q] = terms
    const [n1, d1] = SQ[p.f][p.A]
    const [n2, d2] = SQ[q.f][q.A]
    const N = p.c * n1 * d2 + sign * q.c * n2 * d1
    const D = d1 * d2
    if (N < 0) return
    const c = (k) => (k === 1 ? "" : k)
    const expr = `${c(p.c)}${T2(p.f, p.A)}${sign > 0 ? "+" : "-"}${c(q.c)}${T2(q.f, q.A)}`
    const val = fr(N, D)
    add(C, `$${expr}$ এর মান কত?`, [$(val), $(fr(N + D, D)), $(fr(Math.abs(N - D), D)), $(fr(N, 2 * D)), $(fr(2 * N + D, D))], `মান বসাই: $${c(p.c)}\\left(${V[p.f][p.A]}\\right)^2${sign > 0 ? "+" : "-"}${c(q.c)}\\left(${V[q.f][q.A]}\\right)^2=${c(p.c)}\\cdot${fr(n1, d1)}${sign > 0 ? "+" : "-"}${c(q.c)}\\cdot${fr(n2, d2)}=${val}$`)
  }
  const triples = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29], [9, 40, 41]]
  const tTriple = () => {
    const [a, b, c] = pick(triples) // a = লম্ব, b = ভূমি, c = অতিভুজ
    const givenKind = pick(["tan", "sin", "cos"])
    const given = { tan: [a, b], sin: [a, c], cos: [b, c] }[givenKind]
    const ask = pick(["sin", "cos", "tan", "sec", "cosec", "cot"].filter((x) => x !== givenKind))
    const val = { sin: [a, c], cos: [b, c], tan: [a, b], sec: [c, b], cosec: [c, a], cot: [b, a] }
    const [n, d] = val[ask]
    const wrong = [[d, n], [a, b + c], [b, a + c], [a + b, c], [c, a + b]].map(([x, y]) => $(fr(x, y)))
    const fn = (f) => (f === "cosec" ? "\\operatorname{cosec}" : `\\${f}`)
    add(C, `$${fn(givenKind)}\\theta=${fr(...given)}$ হলে $${fn(ask)}\\theta$ এর মান কত?`, [$(fr(n, d)), ...wrong], `লম্ব $=${a}$, ভূমি $=${b}$ ধরলে অতিভুজ $=\\sqrt{${a}^2+${b}^2}=${c}$ (পিথাগোরাস)। তাই $${fn(ask)}\\theta=${fr(n, d)}$`)
  }
  const eqs = [
    ["2\\cos\\theta=1", 60, "\\cos\\theta=\\frac{1}{2}=\\cos60^\\circ"],
    ["2\\sin\\theta=1", 30, "\\sin\\theta=\\frac{1}{2}=\\sin30^\\circ"],
    ["\\sqrt{3}\\tan\\theta=1", 30, "\\tan\\theta=\\frac{1}{\\sqrt{3}}=\\tan30^\\circ"],
    ["\\tan\\theta=\\sqrt{3}", 60, "\\tan60^\\circ=\\sqrt{3}"],
    ["\\sin\\theta=\\cos\\theta", 45, "\\tan\\theta=1=\\tan45^\\circ"],
    ["2\\sin^2\\theta=1", 45, "\\sin\\theta=\\frac{1}{\\sqrt{2}}=\\sin45^\\circ"],
    ["4\\cos^2\\theta=3", 30, "\\cos\\theta=\\frac{\\sqrt{3}}{2}=\\cos30^\\circ"],
    ["\\sec\\theta=2", 60, "\\cos\\theta=\\frac{1}{2}=\\cos60^\\circ"],
    ["\\operatorname{cosec}\\theta=2", 30, "\\sin\\theta=\\frac{1}{2}=\\sin30^\\circ"],
    ["3\\tan^2\\theta=1", 30, "\\tan\\theta=\\frac{1}{\\sqrt{3}}"],
    ["\\cot\\theta=\\sqrt{3}", 30, "\\tan\\theta=\\frac{1}{\\sqrt{3}}"],
    ["\\tan\\theta=1", 45, "\\tan45^\\circ=1"],
  ]
  let ei = 0
  const tEq = () => {
    const [e, ans, why] = eqs[ei++ % eqs.length]
    add(C, `$${e}$ হলে $\\theta$ এর মান কত? ($0^\\circ<\\theta<90^\\circ$)`, [`$${ans}^\\circ$`, ...[30, 45, 60, 90].filter((x) => x !== ans).map((x) => `$${x}^\\circ$`)], `$${why}$, তাই $\\theta=${ans}^\\circ$`)
  }
  fill(C, fixed, [tBasic, tSqSum, tSqSum, tTriple, tTriple, tEq])
}

// ───────────────────────── ২ সেট ও ফাংশন ─────────────────────────
{
  const C = "m2"
  const fixed = [
    ["ফাঁকা সেটের প্রতীক কোনটি?", ["$\\emptyset$", "$\\{0\\}$", "$0$", "$U$"], "ফাঁকা সেট $\\emptyset$ বা $\\{\\}$; $\\{0\\}$ ফাঁকা নয়, এতে $0$ উপাদান আছে।"],
    ["$(A\\cup B)'$ কোনটির সমান?", ["$A'\\cap B'$", "$A'\\cup B'$", "$A\\cap B$", "$A\\setminus B$"], "ডি মরগানের সূত্র: $(A\\cup B)'=A'\\cap B'$"],
    ["$(A\\cap B)'$ কোনটির সমান?", ["$A'\\cup B'$", "$A'\\cap B'$", "$A\\cup B$", "$B\\setminus A$"], "ডি মরগানের সূত্র: $(A\\cap B)'=A'\\cup B'$"],
    ["$A\\cap(B\\cup C)$ কোনটির সমান?", ["$(A\\cap B)\\cup(A\\cap C)$", "$(A\\cup B)\\cap(A\\cup C)$", "$A\\cup(B\\cap C)$", "$(A\\cap B)\\cap C$"], "বণ্টন বিধি: ছেদ সংযোগের উপর বণ্টিত হয়।"],
    ["$A\\setminus B$ কোনটির সমান?", ["$A\\cap B'$", "$A\\cup B'$", "$A'\\cap B$", "$B\\cap A$"], "$A\\setminus B$ = $A$-তে আছে কিন্তু $B$-তে নেই = $A\\cap B'$"],
    ["কোনো সেট $A$ এর জন্য $A\\cup\\emptyset$ = ?", ["$A$", "$\\emptyset$", "$U$", "$A'$"], "ফাঁকা সেটের সাথে সংযোগে কিছু যোগ হয় না: $A\\cup\\emptyset=A$"],
    ["কোনো সেট $A$ এর জন্য $A\\cap\\emptyset$ = ?", ["$\\emptyset$", "$A$", "$U$", "$\\{0\\}$"], "ফাঁকা সেটের সাথে ছেদ ফাঁকা।"],
    ["$A\\subset B$ হলে $A\\cup B$ = ?", ["$B$", "$A$", "$\\emptyset$", "$A\\cap B$"], "$A$-এর সব উপাদান $B$-তে আছে, তাই সংযোগ $B$।"],
    ["অন্বয় $R$ হলো—", ["$A\\times B$ এর একটি উপসেট", "$A$ এর উপসেট", "ফাংশন সবসময়", "একটি সংখ্যা"], "অন্বয় সর্বদা কার্তেসীয় গুণজ $A\\times B$-এর উপসেট।"],
    ["যে অন্বয়ে প্রত্যেক $x$-এর জন্য একটিমাত্র $y$ থাকে তাকে কী বলে?", ["ফাংশন", "সেট", "ডোমেন", "রেঞ্জ"], "প্রতিটি ইনপুটের একটিমাত্র আউটপুট থাকলে অন্বয়টি **ফাংশন**।"],
    ["$\\{x\\in\\mathbb{N}: x<1\\}$ সেটটি কেমন?", ["ফাঁকা সেট", "সসীম সেট, ১টি উপাদান", "অসীম সেট", "সার্বিক সেট"], "$1$-এর ছোট কোনো স্বাভাবিক সংখ্যা নেই, তাই সেটটি ফাঁকা।"],
    ["স্বাভাবিক সংখ্যার সেট $\\mathbb{N}$ কোন ধরনের সেট?", ["অসীম সেট", "সসীম সেট", "ফাঁকা সেট", "একক সেট"], "স্বাভাবিক সংখ্যা গুনে শেষ করা যায় না, তাই অসীম।"],
  ]
  const tSubsets = () => {
    const n = ri(2, 7)
    const k = pick(["উপসেট", "প্রকৃত উপসেট", "শক্তি সেটের উপাদান"])
    const v = k === "প্রকৃত উপসেট" ? 2 ** n - 1 : 2 ** n
    add(C, `কোনো সেটের উপাদান সংখ্যা $${n}$ হলে এর ${k} সংখ্যা কত?`, numOpts(v, [2 ** n, 2 ** n - 1, n * n, 2 * n].filter((x) => x !== v)), k === "প্রকৃত উপসেট" ? `প্রকৃত উপসেট $=2^n-1=2^{${n}}-1=${v}$ (সেটটি নিজেকে বাদ দিয়ে)` : `উপসেট সংখ্যা $=2^n=2^{${n}}=${v}$; শক্তি সেটের উপাদান সংখ্যাও এটিই।`)
  }
  const tOps = () => {
    const A = distinct(ri(3, 5), 1, 10)
    const B = distinct(ri(3, 5), 1, 10)
    const U = A.filter((x) => B.includes(x))
    const un = [...new Set([...A, ...B])]
    const dAB = A.filter((x) => !B.includes(x))
    const dBA = B.filter((x) => !A.includes(x))
    const op = pick(["\\cup", "\\cap", "\\setminus"])
    const val = { "\\cup": un, "\\cap": U, "\\setminus": dAB }[op]
    const opts = [setTex(val), setTex(un), setTex(U), setTex(dAB), setTex(dBA), setTex([...A].slice(1))].map($)
    add(C, `$A=${setTex(A)}$, $B=${setTex(B)}$ হলে $A${op}B$ কত?`, opts, { "\\cup": `সংযোগ = দুই সেটের সব উপাদান একবার করে: $${setTex(un)}$`, "\\cap": `ছেদ = দুই সেটেই আছে এমন উপাদান: $${setTex(U)}$`, "\\setminus": `$A\\setminus B$ = $A$-তে আছে কিন্তু $B$-তে নেই: $${setTex(dAB)}$` }[op])
  }
  const tCount = () => {
    const nA = ri(10, 40)
    const nB = ri(10, 40)
    const nI = ri(2, Math.min(nA, nB) - 1)
    const v = nA + nB - nI
    add(C, `$n(A)=${nA}$, $n(B)=${nB}$, $n(A\\cap B)=${nI}$ হলে $n(A\\cup B)$ কত?`, numOpts(v, [nA + nB, nA + nB + nI, v - nI]), `$n(A\\cup B)=n(A)+n(B)-n(A\\cap B)=${nA}+${nB}-${nI}=${v}$`)
  }
  const tSurvey = () => {
    const N = ri(5, 12) * 10
    const a = ri(N / 4, N / 2)
    const b = ri(N / 4, N / 2)
    const c = ri(5, Math.min(a, b) - 2)
    const none = N - (a + b - c)
    if (none < 0) return
    add(C, `${N} জন শিক্ষার্থীর মধ্যে ${a} জন ফুটবল, ${b} জন ক্রিকেট এবং ${c} জন উভয় খেলা পছন্দ করে। কতজন কোনোটিই পছন্দ করে না?`, numOpts(none, [N - a - b, a + b - c, N - c]), `অন্তত একটি পছন্দ করে $=${a}+${b}-${c}=${a + b - c}$; কোনোটিই নয় $=${N}-${a + b - c}=${none}$`)
  }
  const tBuilder = () => {
    const kind = pick(["factor", "square", "multiple"])
    if (kind === "factor") {
      const k = pick([12, 18, 20, 24, 28, 30, 36])
      const fs_ = Array.from({ length: k }, (_, i) => i + 1).filter((x) => k % x === 0)
      add(C, `$\\{x\\in\\mathbb{N}: x, ${k}\\text{ এর গুণনীয়ক}\\}$ সেটটি তালিকা পদ্ধতিতে কোনটি?`, [$(setTex(fs_)), $(setTex(fs_.slice(1))), $(setTex(fs_.slice(0, -1))), $(setTex(fs_.filter((x) => x % 2 === 0)))], `$${k}$ কে নিঃশেষে ভাগ করে এমন স্বাভাবিক সংখ্যা: $${setTex(fs_)}$`)
    } else if (kind === "square") {
      const k = ri(10, 60)
      const s = Array.from({ length: 8 }, (_, i) => i + 1).filter((x) => x * x < k)
      add(C, `$\\{x\\in\\mathbb{N}: x^2<${k}\\}$ সেটটি কোনটি?`, [$(setTex(s)), $(setTex([...s, s.length + 1])), $(setTex(s.slice(1))), $(setTex([0, ...s]))], `$x^2<${k}$ সিদ্ধ করে এমন স্বাভাবিক সংখ্যা: ${s.map((x) => `$${x}^2=${x * x}$`).join(", ")}; তাই $${setTex(s)}$`)
    } else {
      const m = ri(3, 7)
      const up = ri(20, 40)
      const s = Array.from({ length: Math.floor(up / m) }, (_, i) => (i + 1) * m)
      add(C, `$\\{x\\in\\mathbb{N}: x, ${m}\\text{ এর গুণিতক এবং } x\\le ${up}\\}$ এর উপাদান সংখ্যা কত?`, numOpts(s.length, [s.length + 1, s.length - 1, up - m]), `গুণিতকগুলো: $${s.join(", ")}$; মোট $${s.length}$টি`)
    }
  }
  const tCart = () => {
    const m = ri(2, 5)
    const n = ri(2, 5)
    add(C, `$n(A)=${m}$ এবং $n(B)=${n}$ হলে $n(A\\times B)$ কত?`, numOpts(m * n, [m + n, 2 ** (m + n), m * n + 1]), `$n(A\\times B)=n(A)\\times n(B)=${m}\\times${n}=${m * n}$`)
  }
  const tPair = () => {
    const x = ri(2, 9)
    const y = ri(1, x - 1)
    add(C, `$(x+y,\\ ${x - y})=(${x + y},\\ x-y)$ হলে $(x, y)$ কত?`, [$(`(${x}, ${y})`), $(`(${y}, ${x})`), $(`(${x + y}, ${x - y})`), $(`(${x - 1}, ${y + 1})`)], `ক্রমজোড় সমান হলে উপাদান সমান: $x+y=${x + y}$, $x-y=${x - y}$। যোগ করে $2x=${2 * x}\\Rightarrow x=${x}$, $y=${y}$`)
  }
  const tFunc = () => {
    const a = ri(1, 3)
    const b = ri(-5, 5)
    const c = ri(-6, 6)
    const t = ri(-3, 4)
    const v = a * t * t + b * t + c
    const poly = `${a === 1 ? "" : a}x^2${b >= 0 ? "+" : "-"}${Math.abs(b)}x${c >= 0 ? "+" : "-"}${Math.abs(c)}`
    add(C, `$f(x)=${poly}$ হলে $f(${t})$ এর মান কত?`, [$(v), $(v + 2 * b * t === v ? v + 1 : a * t * t - b * t + c), $(v + 1), $(a * t * t + b * t - c), $(v - 2)], `$x=${t}$ বসাই: $${a === 1 ? "" : a}(${t})^2${b >= 0 ? "+" : "-"}${Math.abs(b)}(${t})${c >= 0 ? "+" : "-"}${Math.abs(c)}=${v}$`)
  }
  const tComp = () => {
    const n = ri(6, 10)
    const Uset = Array.from({ length: n }, (_, i) => i + 1)
    const A = distinct(ri(2, 4), 1, n)
    const Ac = Uset.filter((x) => !A.includes(x))
    add(C, `$U=${setTex(Uset)}$ এবং $A=${setTex(A)}$ হলে $A'$ কোনটি?`, [$(setTex(Ac)), $(setTex(A)), $(setTex(Ac.slice(1))), $(setTex([...Ac, A[0]]))], `$A'=U\\setminus A$ = $U$-এর যেগুলো $A$-তে নেই: $${setTex(Ac)}$`)
  }
  const tDomain = () => {
    const xs = distinct(3, 1, 9)
    const pairs = xs.map((x) => [x, x + ri(1, 4)])
    const R = pairs.map(([a, b]) => `(${a}, ${b})`).join(", ")
    const which = pick(["ডোমেন", "রেঞ্জ"])
    const v = which === "ডোমেন" ? pairs.map((p) => p[0]) : pairs.map((p) => p[1])
    const o = which === "ডোমেন" ? pairs.map((p) => p[1]) : pairs.map((p) => p[0])
    add(C, `$R=\\{${R}\\}$ অন্বয়ের ${which} কোনটি?`, [$(setTex(v)), $(setTex(o)), $(setTex([...new Set([...v, ...o])])), $(setTex(v.slice(1)))], `ডোমেন = ক্রমজোড়গুলোর **প্রথম** উপাদান, রেঞ্জ = **দ্বিতীয়** উপাদান। ${which} $=${setTex(v)}$`)
  }
  fill(C, fixed, [tSubsets, tOps, tOps, tCount, tSurvey, tBuilder, tCart, tPair, tFunc, tComp, tDomain])
}

// ───────────────────────── ১০ দূরত্ব ও উচ্চতা ─────────────────────────
{
  const C = "m10"
  const fixed = [
    ["ভূমির সমান্তরাল রেখার উপরে অবস্থিত কোনো বস্তুর দিকে তাকালে দৃষ্টিরেখা ও ভূমি-সমান্তরাল রেখার কোণকে কী বলে?", ["উন্নতি কোণ", "অবনতি কোণ", "সমকোণ", "স্থূলকোণ"], "উপরের দিকে তাকালে দৃষ্টিরেখা ও আনুভূমিক রেখার কোণ **উন্নতি কোণ**।"],
    ["উপর থেকে নিচের কোনো বস্তুর দিকে তাকালে যে কোণ উৎপন্ন হয় তাকে কী বলে?", ["অবনতি কোণ", "উন্নতি কোণ", "পূরক কোণ", "সম্পূরক কোণ"], "নিচের দিকে তাকালে আনুভূমিক রেখা ও দৃষ্টিরেখার কোণ **অবনতি কোণ**।"],
    ["একই দুই বিন্দুর মধ্যে উন্নতি কোণ ও অবনতি কোণের সম্পর্ক কী?", ["সমান", "পূরক", "সম্পূরক", "উন্নতি কোণ বড়"], "আনুভূমিক রেখা দুটি সমান্তরাল, তাই একান্তর কোণ হিসেবে উন্নতি কোণ = অবনতি কোণ।"],
    ["সূর্যের উন্নতি কোণ বাড়লে খুঁটির ছায়ার দৈর্ঘ্য—", ["কমে", "বাড়ে", "একই থাকে", "শূন্য হয় না কখনো"], "ছায়া $=h\\cot\\theta$; $\\theta$ বাড়লে $\\cot\\theta$ কমে, তাই ছায়া **কমে**।"],
    ["খুঁটির উচ্চতা ও ছায়ার দৈর্ঘ্য সমান হলে সূর্যের উন্নতি কোণ কত?", ["$45^\\circ$", "$30^\\circ$", "$60^\\circ$", "$90^\\circ$"], "$\\tan\\theta=\\frac{h}{h}=1\\Rightarrow\\theta=45^\\circ$"],
    ["উচ্চতা নির্ণয়ে সাধারণত কোন অনুপাত ব্যবহৃত হয় (ভূমি থেকে দূরত্ব জানা থাকলে)?", ["$\\tan\\theta$", "$\\sin\\theta$", "$\\sec\\theta$", "$\\operatorname{cosec}\\theta$"], "উচ্চতা (লম্ব) ও দূরত্ব (ভূমি) জড়িত, তাই $\\tan\\theta=\\frac{\\text{লম্ব}}{\\text{ভূমি}}$।"],
    ["মই দেয়ালে হেলান দিলে মইয়ের দৈর্ঘ্য সমকোণী ত্রিভুজের কোন বাহু?", ["অতিভুজ", "লম্ব", "ভূমি", "মধ্যমা"], "মই দেয়াল ও মাটির সাথে সমকোণী ত্রিভুজ গঠন করে; মই হলো **অতিভুজ**।"],
  ]
  const ds = [10, 12, 15, 18, 20, 24, 25, 30, 36, 40, 45, 50, 60]
  const heightOf = (d, th) => (th === 45 ? `${d}` : th === 60 ? radTex(d, 3) : overRoot3(d))
  const tH = () => {
    const d = pick(ds)
    const th = pick([30, 45, 60])
    const v = heightOf(d, th)
    const others = [30, 45, 60].filter((x) => x !== th).map((x) => heightOf(d, x))
    add(C, `কোনো গাছের পাদদেশ থেকে $${d}$ মিটার দূরের একটি বিন্দুতে গাছের শীর্ষের উন্নতি কোণ $${th}^\\circ$। গাছের উচ্চতা কত মিটার?`, [$(v), ...others.map($), $(`${2 * d}`), $(radTex(d, 2))], `$\\tan${th}^\\circ=\\frac{h}{${d}}\\Rightarrow h=${d}\\tan${th}^\\circ=${v}$ মিটার`)
  }
  const tD = () => {
    const h = pick(ds)
    const th = pick([30, 45, 60])
    const v = th === 45 ? `${h}` : th === 30 ? radTex(h, 3) : overRoot3(h)
    const alt = [30, 45, 60].filter((x) => x !== th).map((x) => (x === 45 ? `${h}` : x === 30 ? radTex(h, 3) : overRoot3(h)))
    add(C, `$${h}$ মিটার উঁচু একটি দালানের ছাদ থেকে ভূমির একটি বিন্দুর অবনতি কোণ $${th}^\\circ$। দালানের পাদদেশ থেকে বিন্দুটির দূরত্ব কত মিটার?`, [$(v), ...alt.map($), $(`${2 * h}`)], `অবনতি কোণ = উন্নতি কোণ $=${th}^\\circ$; $\\tan${th}^\\circ=\\frac{${h}}{d}\\Rightarrow d=\\frac{${h}}{\\tan${th}^\\circ}=${v}$ মিটার`)
  }
  const tLadder = () => {
    const l = pick([8, 10, 12, 14, 16, 18, 20, 24])
    const th = pick([30, 45, 60])
    const askH = rnd() < 0.5
    const sinv = { 30: `${l / 2}`, 45: `\\frac{${l}}{\\sqrt{2}}`, 60: radTex(l / 2, 3) }
    const cosv = { 30: radTex(l / 2, 3), 45: `\\frac{${l}}{\\sqrt{2}}`, 60: `${l / 2}` }
    const v = askH ? sinv[th] : cosv[th]
    const w = askH ? cosv[th] : sinv[th]
    add(C, `$${l}$ মিটার লম্বা একটি মই মাটির সাথে $${th}^\\circ$ কোণে দেয়ালে হেলান দিয়ে আছে। ${askH ? "মইটি দেয়ালের কত উচ্চতায় পৌঁছেছে" : "মইয়ের পাদদেশ দেয়াল থেকে কত দূরে"}?`, [$(v), $(w), $(`${l}`), $(radTex(l, 3)), $(`${2 * l}`)], askH ? `$\\sin${th}^\\circ=\\frac{h}{${l}}\\Rightarrow h=${l}\\sin${th}^\\circ=${v}$ মিটার` : `$\\cos${th}^\\circ=\\frac{d}{${l}}\\Rightarrow d=${l}\\cos${th}^\\circ=${v}$ মিটার`)
  }
  const tShadow = () => {
    const h = pick(ds)
    const th = pick([30, 45, 60])
    const shadow = th === 45 ? `${h}` : th === 30 ? radTex(h, 3) : overRoot3(h)
    add(C, `$${h}$ মিটার উঁচু খুঁটির ছায়ার দৈর্ঘ্য $${shadow}$ মিটার হলে সূর্যের উন্নতি কোণ কত?`, [`$${th}^\\circ$`, ...[30, 45, 60, 90].filter((x) => x !== th).map((x) => `$${x}^\\circ$`)], `$\\tan\\theta=\\frac{\\text{উচ্চতা}}{\\text{ছায়া}}=\\frac{${h}}{${shadow}}=${{ 30: "\\frac{1}{\\sqrt{3}}", 45: "1", 60: "\\sqrt{3}" }[th]}\\Rightarrow\\theta=${th}^\\circ$`)
  }
  const tTwo = () => {
    const d = pick([10, 20, 30, 40, 50, 60])
    const v = radTex(d / 2, 3)
    add(C, `একটি মিনারের দিকে $${d}$ মিটার এগিয়ে গেলে শীর্ষের উন্নতি কোণ $30^\\circ$ থেকে $60^\\circ$ হয়। মিনারের উচ্চতা কত মিটার?`, [$(v), $(radTex(d, 3)), $(`${d}`), $(overRoot3(d)), $(`${d / 2}`)], `কাছের বিন্দুর দূরত্ব $x$ হলে $h=x\\sqrt{3}$ এবং $h=\\frac{x+${d}}{\\sqrt{3}}$। সমান করে $3x=x+${d}\\Rightarrow x=${d / 2}$; $h=${d / 2}\\sqrt{3}=${v}$ মিটার`)
  }
  const tBroken = () => {
    const x = pick([5, 6, 8, 10, 12, 15])
    const th = pick([30, 60])
    const v = th === 30 ? radTex(x, 3) : `${x}(2+\\sqrt{3})`
    add(C, `একটি গাছ ঝড়ে ভেঙে গিয়ে ভাঙা অংশ দাঁড়ানো অংশের সাথে লেগে থেকে গোড়া থেকে $${x}$ মিটার দূরে মাটিতে $${th}^\\circ$ কোণ উৎপন্ন করে। গাছটির পূর্ণ উচ্চতা কত মিটার?`, [$(v), $(th === 30 ? `${x}(2+\\sqrt{3})` : radTex(x, 3)), $(`${2 * x}`), $(overRoot3(x)), $(radTex(x, 2))], `দাঁড়ানো অংশ $=${x}\\tan${th}^\\circ$, ভাঙা অংশ $=${x}\\sec${th}^\\circ$। মোট $=${x}(\\tan${th}^\\circ+\\sec${th}^\\circ)=${th === 30 ? `${x}\\left(\\frac{1}{\\sqrt3}+\\frac{2}{\\sqrt3}\\right)=${x}\\sqrt{3}` : `${x}(\\sqrt3+2)`}$ মিটার`)
  }
  fill(C, fixed, [tH, tH, tD, tLadder, tLadder, tShadow, tTwo, tBroken])
}

// ───────────────────────── ১১ অনুপাত ও সমানুপাত ─────────────────────────
{
  const C = "m11"
  const R = (a, b) => {
    const g = gcd(a, b)
    return `${a / g}:${b / g}`
  }
  const R3 = (a, b, c) => {
    const g = gcd(gcd(a, b), c)
    return `${a / g}:${b / g}:${c / g}`
  }
  const fixed = [
    ["$a:b=c:d$ হলে $\\frac{a+b}{b}=\\frac{c+d}{d}$—এ প্রক্রিয়াকে কী বলে?", ["যোজন", "বিয়োজন", "একান্তরকরণ", "ব্যস্তকরণ"], "উভয় পক্ষের লবে হর যোগ করা = **যোজন**।"],
    ["$a:b=c:d$ হলে $\\frac{a-b}{b}=\\frac{c-d}{d}$—এ প্রক্রিয়াকে কী বলে?", ["বিয়োজন", "যোজন", "ব্যস্তকরণ", "যোজন-বিয়োজন"], "লব থেকে হর বিয়োগ = **বিয়োজন**।"],
    ["$a:b=c:d$ হলে $\\frac{a+b}{a-b}=\\frac{c+d}{c-d}$—এ প্রক্রিয়াকে কী বলে?", ["যোজন-বিয়োজন", "যোজন", "বিয়োজন", "একান্তরকরণ"], "যোজন ও বিয়োজন একসাথে = **যোজন-বিয়োজন**।"],
    ["$a:b=c:d$ হলে $a:c=b:d$—এ প্রক্রিয়াকে কী বলে?", ["একান্তরকরণ", "ব্যস্তকরণ", "যোজন", "বিয়োজন"], "মধ্যপদ দুটি স্থান বদলালে = **একান্তরকরণ**।"],
    ["$a:b=c:d$ হলে $b:a=d:c$—এ প্রক্রিয়াকে কী বলে?", ["ব্যস্তকরণ", "একান্তরকরণ", "যোজন", "বিয়োজন"], "উভয় অনুপাত উল্টালে = **ব্যস্তকরণ**।"],
    ["অনুপাতের রাশিদ্বয় সম্পর্কে কোনটি সঠিক?", ["একই জাতীয় হতে হবে", "ভিন্ন জাতীয় হতে হবে", "একক থাকতে হবে", "শূন্য হতে পারে"], "অনুপাত তুলনা করা যায় কেবল একই জাতীয় রাশির মধ্যে; অনুপাতের কোনো একক নেই।"],
    ["$a, b, c$ ক্রমিক সমানুপাতী হলে কোনটি সঠিক?", ["$b^2=ac$", "$a^2=bc$", "$c^2=ab$", "$a+c=2b$"], "ক্রমিক সমানুপাতী: $\\frac{a}{b}=\\frac{b}{c}\\Rightarrow b^2=ac$"],
    ["$a:b$ অনুপাতের ব্যস্ত অনুপাত কোনটি?", ["$b:a$", "$a^2:b^2$", "$\\sqrt a:\\sqrt b$", "$a:b$"], "ব্যস্ত অনুপাত = পদ দুটি উল্টে দেওয়া: $b:a$"],
    ["$a:b$ অনুপাতের দ্বিভাজিত (বর্গমূলীয়) অনুপাত কোনটি?", ["$\\sqrt a:\\sqrt b$", "$a^2:b^2$", "$b:a$", "$2a:2b$"], "দ্বিভাজিত অনুপাত $=\\sqrt a:\\sqrt b$; দ্বিগুণিত (বর্গ) অনুপাত $=a^2:b^2$।"],
  ]
  const tSimplify = () => {
    const a = ri(1, 9)
    const b = ri(1, 9)
    if (gcd(a, b) !== 1 || a === b) return
    const k = ri(3, 12)
    add(C, `$${a * k}:${b * k}$ অনুপাতের লঘিষ্ঠ রূপ কোনটি?`, [$(`${a}:${b}`), $(`${b}:${a}`), $(`${a * 2}:${b}`), $(`${a}:${b * 2}`)], `উভয় পদকে গসাগু $${k}$ দিয়ে ভাগ: $${a * k}\\div${k}:${b * k}\\div${k}=${a}:${b}$`)
  }
  const tDup = () => {
    const a = ri(2, 7)
    const b = ri(2, 7)
    if (a === b) return
    const kind = pick(["dup", "sub", "inv", "trip"])
    if (kind === "sub") add(C, `$${a * a}:${b * b}$ এর দ্বিভাজিত অনুপাত কোনটি?`, [$(R(a, b)), $(R(a ** 4, b ** 4)), $(R(b * b, a * a)), $(R(2 * a * a, b * b))], `দ্বিভাজিত অনুপাত $=\\sqrt{${a * a}}:\\sqrt{${b * b}}=${R(a, b)}$`)
    else if (kind === "dup") add(C, `$${a}:${b}$ এর দ্বিগুণিত অনুপাত কোনটি?`, [$(R(a * a, b * b)), $(R(2 * a, 2 * b)), $(R(b * b, a * a)), $(R(a ** 3, b ** 3))], `দ্বিগুণিত অনুপাত $=${a}^2:${b}^2=${R(a * a, b * b)}$`)
    else if (kind === "trip") add(C, `$${a}:${b}$ এর ত্রিগুণিত অনুপাত কোনটি?`, [$(R(a ** 3, b ** 3)), $(R(3 * a, 3 * b)), $(R(a * a, b * b)), $(R(b ** 3, a ** 3))], `ত্রিগুণিত অনুপাত $=${a}^3:${b}^3=${R(a ** 3, b ** 3)}$`)
    else add(C, `$${a}:${b}$ এর ব্যস্ত অনুপাত কোনটি?`, [$(R(b, a)), $(R(a, b)), $(R(a * a, b * b)), $(R(b * b, a * a))], `ব্যস্ত অনুপাত = পদ উল্টানো: $${R(b, a)}$`)
  }
  const tCompound = () => {
    const [a, b, c, d] = [ri(1, 9), ri(1, 9), ri(1, 9), ri(1, 9)]
    if (a * c === b * d) return
    add(C, `$${a}:${b}$ ও $${c}:${d}$ এর যৌগিক অনুপাত কোনটি?`, [$(R(a * c, b * d)), $(R(a + c, b + d)), $(R(a * d, b * c)), $(R(b * d, a * c))], `যৌগিক অনুপাত = পূর্বপদের গুণফল : উত্তরপদের গুণফল $=${a}\\times${c}:${b}\\times${d}=${R(a * c, b * d)}$`)
  }
  const tMean = () => {
    const k = ri(1, 4)
    const m = ri(1, 6)
    const n = ri(1, 6)
    if (m === n) return
    const a = k * m * m
    const b = k * n * n
    const v = k * m * n
    add(C, `$${a}$ ও $${b}$ এর মধ্যসমানুপাতী কত?`, numOpts(v, [(a + b) / 2, a * b, v * 2].filter(Number.isInteger)), `মধ্যসমানুপাতী $x$ হলে $\\frac{${a}}{x}=\\frac{x}{${b}}\\Rightarrow x^2=${a}\\times${b}=${a * b}\\Rightarrow x=${v}$`)
  }
  const tThird = () => {
    const a = ri(2, 6)
    const b = a * ri(2, 4)
    const v = (b * b) / a
    add(C, `$${a}$ ও $${b}$ এর তৃতীয় সমানুপাতী কত?`, numOpts(v, [(a * a) / b, a * b, b * 2].filter(Number.isInteger)), `তৃতীয় সমানুপাতী $x$: $\\frac{${a}}{${b}}=\\frac{${b}}{x}\\Rightarrow x=\\frac{${b}^2}{${a}}=${v}$`)
  }
  const tFourth = () => {
    const a = ri(2, 6)
    const b = ri(2, 9)
    const c = a * ri(2, 5)
    const v = (b * c) / a
    add(C, `$${a}, ${b}, ${c}$ এর চতুর্থ সমানুপাতী কত?`, numOpts(v, [(a * c) / b, (a * b) / c, b + c].filter((x) => Number.isInteger(x))), `$\\frac{${a}}{${b}}=\\frac{${c}}{x}\\Rightarrow x=\\frac{${b}\\times${c}}{${a}}=${v}$`)
  }
  const tChain = () => {
    const [p, q, r, s] = [ri(1, 7), ri(1, 7), ri(1, 7), ri(1, 7)]
    if (p * r === q * s) return
    const ask = pick(["ac", "abc"])
    if (ask === "ac") add(C, `$a:b=${p}:${q}$ এবং $b:c=${r}:${s}$ হলে $a:c$ কত?`, [$(R(p * r, q * s)), $(R(p * s, q * r)), $(R(p + r, q + s)), $(R(q * s, p * r))], `$\\frac{a}{c}=\\frac{a}{b}\\times\\frac{b}{c}=\\frac{${p}}{${q}}\\times\\frac{${r}}{${s}}=${fr(p * r, q * s)}$; $a:c=${R(p * r, q * s)}$`)
    else add(C, `$a:b=${p}:${q}$ এবং $b:c=${r}:${s}$ হলে $a:b:c$ কত?`, [$(R3(p * r, q * r, q * s)), $(R3(p, q * r, s)), $(R3(p * s, q * s, q * r)), $(R3(p, q, s))], `$b$-কে সমান করতে প্রথমটিকে $${r}$ ও দ্বিতীয়টিকে $${q}$ দিয়ে গুণ: $a:b=${p * r}:${q * r}$, $b:c=${q * r}:${q * s}$; $a:b:c=${R3(p * r, q * r, q * s)}$`)
  }
  const tDivide = () => {
    const [p, q, r] = [ri(1, 6), ri(1, 6), ri(1, 6)]
    const k = ri(20, 80)
    const T = (p + q + r) * k
    const who = pick([0, 1, 2])
    const share = [p, q, r][who] * k
    const names = ["ক", "খ", "গ"]
    add(C, `$${T}$ টাকা ক, খ, গ-এর মধ্যে $${p}:${q}:${r}$ অনুপাতে ভাগ করলে ${names[who]} কত টাকা পাবে?`, numOpts(share, [[p, q, r][(who + 1) % 3] * k, T / 3, share + k].filter(Number.isInteger)), `অনুপাতের যোগফল $=${p}+${q}+${r}=${p + q + r}$; ${names[who]}-এর অংশ $=${T}\\times\\frac{${[p, q, r][who]}}{${p + q + r}}=${share}$ টাকা`)
  }
  const tCD = () => {
    const p = ri(2, 9)
    const q = ri(1, p - 1)
    add(C, `$x:y=${p}:${q}$ হলে $\\frac{x+y}{x-y}$ এর মান কত?`, [$(fr(p + q, p - q)), $(fr(p - q, p + q)), $(fr(p, q)), $(fr(p + q, q))], `যোজন-বিয়োজন: $\\frac{x+y}{x-y}=\\frac{${p}+${q}}{${p}-${q}}=${fr(p + q, p - q)}$`)
  }
  const tAge = () => {
    const A = ri(10, 40)
    const B = ri(5, A - 3)
    const t = ri(3, 10)
    if (gcd(A, B) === 1 && gcd(A + t, B + t) === 1) return
    add(C, `দুই ভাইয়ের বর্তমান বয়সের অনুপাত $${R(A, B)}$ এবং $${t}$ বছর পর হবে $${R(A + t, B + t)}$। বড় ভাইয়ের বর্তমান বয়স কত বছর?`, numOpts(A, [B, A + t, A - t]), `বর্তমান বয়স $${R(A, B).split(":")[0]}x$ ও $${R(A, B).split(":")[1]}x$ ধরে $\\frac{${R(A, B).split(":")[0]}x+${t}}{${R(A, B).split(":")[1]}x+${t}}=${fr(A + t, B + t)}$ সমাধান করলে বড় ভাই $=${A}$ বছর`)
  }
  const tExprRatio = () => {
    const a = ri(1, 6)
    const b = ri(1, 6)
    if (a === b) return
    const [p, q, r, s] = [ri(1, 3), ri(1, 3), ri(1, 3), ri(1, 3)]
    const N = p * a + q * b
    const D = r * a + s * b
    add(C, `$a:b=${a}:${b}$ হলে $(${p === 1 ? "" : p}a+${q === 1 ? "" : q}b):(${r === 1 ? "" : r}a+${s === 1 ? "" : s}b)$ কত?`, [$(R(N, D)), $(R(D, N)), $(R(N + 1, D)), $(R(p * b + q * a, D))], `$a=${a}k$, $b=${b}k$ বসাই: $(${p * a}k+${q * b}k):(${r * a}k+${s * b}k)=${N}:${D}=${R(N, D)}$`)
  }
  fill(C, fixed, [tSimplify, tDup, tCompound, tMean, tThird, tFourth, tChain, tDivide, tCD, tAge, tExprRatio])
}

// ───────────────────────── ১৩ সসীম ধারা ─────────────────────────
{
  const C = "m13"
  const fixed = [
    ["সমান্তর ধারার $n$-তম পদ কোনটি?", ["$a+(n-1)d$", "$a+nd$", "$ar^{n-1}$", "$\\frac{n}{2}(a+l)$"], "সমান্তর ধারার প্রথম পদ $a$, সাধারণ অন্তর $d$ হলে $n$-তম পদ $=a+(n-1)d$"],
    ["সমান্তর ধারার প্রথম $n$ পদের যোগফল কোনটি?", ["$\\frac{n}{2}\\{2a+(n-1)d\\}$", "$\\frac{n}{2}\\{a+(n-1)d\\}$", "$\\frac{a(r^n-1)}{r-1}$", "$n\\{2a+(n-1)d\\}$"], "$S_n=\\frac{n}{2}\\{2a+(n-1)d\\}$, অথবা $S_n=\\frac{n}{2}(a+l)$"],
    ["গুণোত্তর ধারার $n$-তম পদ কোনটি?", ["$ar^{n-1}$", "$ar^n$", "$a+(n-1)r$", "$\\frac{a}{r^{n-1}}$"], "গুণোত্তর ধারার প্রথম পদ $a$, সাধারণ অনুপাত $r$ হলে $n$-তম পদ $=ar^{n-1}$"],
    ["গুণোত্তর ধারার প্রথম $n$ পদের যোগফল ($r>1$) কোনটি?", ["$\\frac{a(r^n-1)}{r-1}$", "$\\frac{a(1-r)}{1-r^n}$", "$\\frac{n}{2}(a+l)$", "$ar^n$"], "$r>1$ হলে $S_n=\\frac{a(r^n-1)}{r-1}$; $r<1$ হলে $\\frac{a(1-r^n)}{1-r}$"],
    ["$1+2+3+\\dots+n$ = ?", ["$\\frac{n(n+1)}{2}$", "$n^2$", "$\\frac{n(n+1)(2n+1)}{6}$", "$n(n+1)$"], "প্রথম $n$টি স্বাভাবিক সংখ্যার যোগফল $\\frac{n(n+1)}{2}$"],
    ["$1^2+2^2+\\dots+n^2$ = ?", ["$\\frac{n(n+1)(2n+1)}{6}$", "$\\frac{n(n+1)}{2}$", "$\\left\\{\\frac{n(n+1)}{2}\\right\\}^2$", "$n^3$"], "বর্গের যোগফল $\\frac{n(n+1)(2n+1)}{6}$"],
    ["$1^3+2^3+\\dots+n^3$ = ?", ["$\\left\\{\\frac{n(n+1)}{2}\\right\\}^2$", "$\\frac{n(n+1)(2n+1)}{6}$", "$n^4$", "$\\frac{n(n+1)}{2}$"], "ঘনের যোগফল $\\left\\{\\frac{n(n+1)}{2}\\right\\}^2$"],
    ["প্রথম $n$টি বিজোড় স্বাভাবিক সংখ্যার যোগফল কত?", ["$n^2$", "$n(n+1)$", "$2n$", "$\\frac{n(n+1)}{2}$"], "$1+3+5+\\dots+(2n-1)=n^2$"],
    ["অনুক্রমের পদগুলো যোগ চিহ্ন দিয়ে যুক্ত করলে তাকে কী বলে?", ["ধারা", "অনুক্রম", "সেট", "ফাংশন"], "অনুক্রমের পদের যোগফলের রূপকে **ধারা** বলে।"],
    ["সমান্তর ধারার পরপর দুটি পদের পার্থক্যকে কী বলে?", ["সাধারণ অন্তর", "সাধারণ অনুপাত", "প্রথম পদ", "শেষ পদ"], "পরের পদ − আগের পদ = সাধারণ অন্তর $d$।"],
  ]
  const tNth = () => {
    const a = ri(-5, 15)
    const d = pick([-3, -2, 2, 3, 4, 5, 7])
    const n = ri(8, 30)
    const v = a + (n - 1) * d
    add(C, `$${a}, ${a + d}, ${a + 2 * d}, \\dots$ ধারার $${n}$-তম পদ কত?`, numOpts(v, [a + n * d, a + (n - 2) * d, (n - 1) * d]), `$a=${a}$, $d=${d}$; $n$-তম পদ $=a+(n-1)d=${a}+(${n}-1)(${d})=${v}$`)
  }
  const tSum = () => {
    const a = ri(1, 10)
    const d = ri(1, 6)
    const n = ri(8, 25)
    const S = (n * (2 * a + (n - 1) * d)) / 2
    add(C, `$${a}+${a + d}+${a + 2 * d}+\\dots$ ধারার প্রথম $${n}$ পদের যোগফল কত?`, numOpts(S, [n * (2 * a + (n - 1) * d), (n * (a + (n - 1) * d)) / 2, S + d].filter(Number.isInteger)), `$S_n=\\frac{n}{2}\\{2a+(n-1)d\\}=\\frac{${n}}{2}\\{2(${a})+(${n - 1})(${d})\\}=${S}$`)
  }
  const tTerms = () => {
    const a = ri(1, 10)
    const d = ri(2, 6)
    const n = ri(10, 30)
    const l = a + (n - 1) * d
    add(C, `$${a}, ${a + d}, ${a + 2 * d}, \\dots, ${l}$ ধারাটিতে কতটি পদ আছে?`, numOpts(n, [n - 1, n + 1, Math.floor(l / d)]), `$l=a+(n-1)d\\Rightarrow ${l}=${a}+(n-1)${d}\\Rightarrow n-1=${n - 1}\\Rightarrow n=${n}$`)
  }
  const tD = () => {
    const a = ri(1, 20)
    const d = ri(2, 9)
    const p = ri(2, 5)
    const q = p + ri(3, 8)
    const tp = a + (p - 1) * d
    const tq = a + (q - 1) * d
    add(C, `কোনো সমান্তর ধারার $${p}$-তম পদ $${tp}$ এবং $${q}$-তম পদ $${tq}$। সাধারণ অন্তর কত?`, numOpts(d, [(tq - tp) / q, tq - tp, d + 1].filter((x) => Number.isInteger(x))), `$(a+${q - 1}d)-(a+${p - 1}d)=${tq}-${tp}\\Rightarrow ${q - p}d=${tq - tp}\\Rightarrow d=${d}$`)
  }
  const tNat = () => {
    const n = ri(10, 50)
    const kind = pick(["n", "odd", "sq", "cube"])
    const v = { n: (n * (n + 1)) / 2, odd: n * n, sq: (n * (n + 1) * (2 * n + 1)) / 6, cube: ((n * (n + 1)) / 2) ** 2 }[kind]
    const q = { n: `$1+2+3+\\dots+${n}$ = ?`, odd: `প্রথম $${n}$টি বিজোড় সংখ্যার যোগফল কত?`, sq: `$1^2+2^2+\\dots+${n}^2$ = ?`, cube: `$1^3+2^3+\\dots+${n}^3$ = ?` }[kind]
    const ex = { n: `$\\frac{n(n+1)}{2}=\\frac{${n}\\times${n + 1}}{2}=${v}$`, odd: `$n^2=${n}^2=${v}$`, sq: `$\\frac{n(n+1)(2n+1)}{6}=\\frac{${n}\\times${n + 1}\\times${2 * n + 1}}{6}=${v}$`, cube: `$\\left\\{\\frac{n(n+1)}{2}\\right\\}^2=${(n * (n + 1)) / 2}^2=${v}$` }[kind]
    add(C, q, numOpts(v, [n * (n + 1), n * n, (n * (n + 1)) / 2, v + n].filter((x) => x !== v)), ex)
  }
  const tGP = () => {
    const a = ri(1, 5)
    const r = pick([2, 3])
    const n = ri(4, 7)
    const kind = pick(["term", "sum", "ratio"])
    const t = a * r ** (n - 1)
    const S = (a * (r ** n - 1)) / (r - 1)
    if (kind === "term") add(C, `$${a}, ${a * r}, ${a * r * r}, \\dots$ গুণোত্তর ধারার $${n}$-তম পদ কত?`, numOpts(t, [a * r ** n, a * r ** (n - 2), a * n * r]), `$ar^{n-1}=${a}\\times${r}^{${n - 1}}=${t}$`)
    else if (kind === "sum") add(C, `$${a}+${a * r}+${a * r * r}+\\dots$ ধারার প্রথম $${n}$ পদের যোগফল কত?`, numOpts(S, [t, S + t, a * (r ** n - 1)]), `$S_n=\\frac{a(r^n-1)}{r-1}=\\frac{${a}(${r}^{${n}}-1)}{${r}-1}=${S}$`)
    else add(C, `$${a}, ${a * r}, ${a * r * r}, \\dots$ ধারার সাধারণ অনুপাত কত?`, numOpts(r, [a * r - a, a, r + 1, 1 / r].filter((x) => Number.isInteger(x))), `সাধারণ অনুপাত $r=\\frac{\\text{২য় পদ}}{\\text{১ম পদ}}=\\frac{${a * r}}{${a}}=${r}$`)
  }
  const tWhich = () => {
    const a = ri(2, 15)
    const d = ri(2, 7)
    const n = ri(10, 40)
    const v = a + (n - 1) * d
    add(C, `$${a}, ${a + d}, ${a + 2 * d}, \\dots$ ধারার কততম পদ $${v}$?`, numOpts(n, [n - 1, n + 1, Math.floor(v / d)]), `$${a}+(n-1)${d}=${v}\\Rightarrow (n-1)=${(v - a) / d}\\Rightarrow n=${n}$`)
  }
  fill(C, fixed, [tNth, tSum, tTerms, tD, tNat, tGP, tGP, tWhich])
}

// ───────────────────────── ১৬ পরিমিতি ─────────────────────────
{
  const C = "m16"
  const fixed = [
    ["$1$ হেক্টর = কত বর্গমিটার?", ["$10000$", "$1000$", "$100$", "$100000$"], "$1$ হেক্টর $=100\\text{ মি}\\times100\\text{ মি}=10000$ বর্গমিটার"],
    ["$1$ লিটার = কত ঘন সেন্টিমিটার?", ["$1000$", "$100$", "$10000$", "$10$"], "$1$ লিটার $=1000$ ঘন সেমি"],
    ["সমবাহু ত্রিভুজের ক্ষেত্রফলের সূত্র কোনটি?", ["$\\frac{\\sqrt3}{4}a^2$", "$\\frac{1}{2}a^2$", "$\\sqrt3a^2$", "$\\frac{\\sqrt3}{2}a$"], "বাহু $a$ হলে ক্ষেত্রফল $=\\frac{\\sqrt3}{4}a^2$"],
    ["রম্বসের ক্ষেত্রফল কোনটি? (কর্ণ $d_1, d_2$)", ["$\\frac{1}{2}d_1d_2$", "$d_1d_2$", "$\\frac{1}{4}d_1d_2$", "$2d_1d_2$"], "রম্বসের ক্ষেত্রফল = কর্ণদ্বয়ের গুণফলের অর্ধেক।"],
    ["ট্রাপিজিয়ামের ক্ষেত্রফল কোনটি?", ["$\\frac{1}{2}(a+b)h$", "$(a+b)h$", "$\\frac{1}{2}abh$", "$abh$"], "সমান্তরাল বাহুদ্বয়ের যোগফলের অর্ধেক × উচ্চতা।"],
    ["আয়তাকার ঘনবস্তুর কর্ণের দৈর্ঘ্য কোনটি?", ["$\\sqrt{a^2+b^2+c^2}$", "$a+b+c$", "$\\sqrt{a^2+b^2}$", "$abc$"], "কর্ণ $=\\sqrt{a^2+b^2+c^2}$"],
    ["সিলিন্ডারের বক্রতলের ক্ষেত্রফল কোনটি?", ["$2\\pi rh$", "$\\pi r^2h$", "$2\\pi r(r+h)$", "$\\pi rh$"], "বক্রতল খুলে দিলে আয়ত হয়: দৈর্ঘ্য $2\\pi r$, প্রস্থ $h$; ক্ষেত্রফল $2\\pi rh$"],
    ["ত্রিভুজের ক্ষেত্রফল নির্ণয়ের হেরনের সূত্র কোনটি?", ["$\\sqrt{s(s-a)(s-b)(s-c)}$", "$\\frac12 ab$", "$s(s-a)(s-b)(s-c)$", "$\\sqrt{abc}$"], "$s=\\frac{a+b+c}{2}$ (অর্ধপরিসীমা), ক্ষেত্রফল $=\\sqrt{s(s-a)(s-b)(s-c)}$"],
    ["বৃত্তের ব্যাসার্ধ দ্বিগুণ হলে ক্ষেত্রফল কতগুণ হয়?", ["৪ গুণ", "২ গুণ", "৮ গুণ", "অপরিবর্তিত"], "ক্ষেত্রফল $\\pi r^2$; $r\\to2r$ হলে $\\pi(2r)^2=4\\pi r^2$"],
  ]
  const tRect = () => {
    const [p, q, h] = pick([[3, 4, 5], [5, 12, 13], [8, 15, 17], [6, 8, 10], [9, 12, 15]])
    const k = ri(1, 4)
    const [l, b, dg] = [p * k, q * k, h * k]
    const kind = pick(["area", "per", "diag"])
    const v = { area: l * b, per: 2 * (l + b), diag: dg }[kind]
    add(C, `একটি আয়তক্ষেত্রের দৈর্ঘ্য $${l}$ সেমি ও প্রস্থ $${b}$ সেমি। এর ${{ area: "ক্ষেত্রফল (বর্গ সেমি)", per: "পরিসীমা (সেমি)", diag: "কর্ণের দৈর্ঘ্য (সেমি)" }[kind]} কত?`, numOpts(v, [l * b, 2 * (l + b), dg, l + b].filter((x) => x !== v)), { area: `ক্ষেত্রফল $=\\text{দৈর্ঘ্য}\\times\\text{প্রস্থ}=${l}\\times${b}=${l * b}$`, per: `পরিসীমা $=2(\\text{দৈর্ঘ্য}+\\text{প্রস্থ})=2(${l}+${b})=${2 * (l + b)}$`, diag: `কর্ণ $=\\sqrt{${l}^2+${b}^2}=\\sqrt{${l * l + b * b}}=${dg}$` }[kind])
  }
  const tSquare = () => {
    const a = ri(3, 20)
    add(C, `একটি বর্গের বাহু $${a}$ সেমি হলে কর্ণের দৈর্ঘ্য কত সেমি?`, [$(radTex(a, 2)), $(radTex(a, 3)), $(`${2 * a}`), $(`${a * a}`)], `কর্ণ $=\\sqrt{a^2+a^2}=a\\sqrt2=${radTex(a, 2)}$`)
  }
  const tEqui = () => {
    const a = pick([2, 4, 6, 8, 10, 12])
    const v = radTex((a * a) / 4, 3)
    add(C, `একটি সমবাহু ত্রিভুজের বাহু $${a}$ সেমি হলে ক্ষেত্রফল কত বর্গ সেমি?`, [$(v), $(radTex((a * a) / 2, 3)), $(`${(a * a) / 2}`), $(radTex(a, 3))], `$\\frac{\\sqrt3}{4}a^2=\\frac{\\sqrt3}{4}\\times${a * a}=${v}$`)
  }
  const tHeron = () => {
    const k = ri(1, 3)
    const [a, b, c] = [13 * k, 14 * k, 15 * k]
    const s = 21 * k
    const A = 84 * k * k
    add(C, `একটি ত্রিভুজের বাহুগুলো $${a}, ${b}, ${c}$ সেমি। এর ক্ষেত্রফল কত বর্গ সেমি?`, numOpts(A, [A / 2, (a * b) / 2, s * s].filter(Number.isInteger)), `$s=\\frac{${a}+${b}+${c}}{2}=${s}$; ক্ষেত্রফল $=\\sqrt{${s}(${s}-${a})(${s}-${b})(${s}-${c})}=\\sqrt{${s}\\cdot${s - a}\\cdot${s - b}\\cdot${s - c}}=${A}$`)
  }
  const tRightTri = () => {
    const b = ri(3, 20)
    const h = ri(3, 20)
    const v = (b * h) / 2
    add(C, `একটি সমকোণী ত্রিভুজের সমকোণ সংলগ্ন বাহুদ্বয় $${b}$ সেমি ও $${h}$ সেমি। ক্ষেত্রফল কত বর্গ সেমি?`, numOpts(v, [b * h, b + h, v + 1]), `ক্ষেত্রফল $=\\frac12\\times\\text{ভূমি}\\times\\text{উচ্চতা}=\\frac12\\times${b}\\times${h}=${dec(v)}$`)
  }
  const tCircle = () => {
    const r = ri(2, 14)
    const kind = pick(["area", "circ"])
    if (kind === "area") add(C, `একটি বৃত্তের ব্যাসার্ধ $${r}$ সেমি হলে ক্ষেত্রফল কত বর্গ সেমি?`, [$(`${r * r}\\pi`), $(`${2 * r}\\pi`), $(`${r * r * 2}\\pi`), $(`${r}\\pi`)], `ক্ষেত্রফল $=\\pi r^2=\\pi\\times${r}^2=${r * r}\\pi$`)
    else add(C, `একটি বৃত্তের ব্যাসার্ধ $${r}$ সেমি হলে পরিধি কত সেমি?`, [$(`${2 * r}\\pi`), $(`${r * r}\\pi`), $(`${r}\\pi`), $(`${4 * r}\\pi`)], `পরিধি $=2\\pi r=2\\pi\\times${r}=${2 * r}\\pi$`)
  }
  const tRhombus = () => {
    const [p, q, h] = pick([[3, 4, 5], [5, 12, 13], [8, 15, 17], [6, 8, 10]])
    const [d1, d2] = [2 * p, 2 * q]
    const kind = pick(["area", "side"])
    if (kind === "area") add(C, `একটি রম্বসের কর্ণদ্বয় $${d1}$ সেমি ও $${d2}$ সেমি। এর ক্ষেত্রফল কত বর্গ সেমি?`, numOpts((d1 * d2) / 2, [d1 * d2, d1 + d2, (d1 * d2) / 4]), `ক্ষেত্রফল $=\\frac12 d_1d_2=\\frac12\\times${d1}\\times${d2}=${(d1 * d2) / 2}$`)
    else add(C, `একটি রম্বসের কর্ণদ্বয় $${d1}$ সেমি ও $${d2}$ সেমি। এর এক বাহুর দৈর্ঘ্য কত সেমি?`, numOpts(h, [h * 2, (d1 + d2) / 2, p + q]), `কর্ণদ্বয় পরস্পরকে লম্বভাবে সমদ্বিখণ্ডিত করে: বাহু $=\\sqrt{${p}^2+${q}^2}=${h}$`)
  }
  const tTrap = () => {
    const a = ri(5, 20)
    const b = ri(5, 20)
    const h = ri(2, 10) * 2
    const v = ((a + b) * h) / 2
    add(C, `একটি ট্রাপিজিয়ামের সমান্তরাল বাহুদ্বয় $${a}$ সেমি ও $${b}$ সেমি এবং উচ্চতা $${h}$ সেমি। ক্ষেত্রফল কত?`, numOpts(v, [(a + b) * h, a * b, v / 2].filter(Number.isInteger)), `$\\frac12(a+b)h=\\frac12(${a}+${b})\\times${h}=${v}$ বর্গ সেমি`)
  }
  const tCuboid = () => {
    const [a, b, c, d] = pick([[2, 3, 6, 7], [1, 4, 8, 9], [2, 6, 9, 11], [3, 4, 12, 13], [4, 4, 7, 9], [6, 6, 7, 11]])
    const k = ri(1, 3)
    const [l, w, h, dg] = [a * k, b * k, c * k, d * k]
    const kind = pick(["vol", "surf", "diag"])
    const v = { vol: l * w * h, surf: 2 * (l * w + w * h + h * l), diag: dg }[kind]
    add(C, `একটি আয়তাকার ঘনবস্তুর দৈর্ঘ্য, প্রস্থ ও উচ্চতা যথাক্রমে $${l}, ${w}, ${h}$ সেমি। এর ${{ vol: "আয়তন (ঘন সেমি)", surf: "সমগ্রতলের ক্ষেত্রফল (বর্গ সেমি)", diag: "কর্ণের দৈর্ঘ্য (সেমি)" }[kind]} কত?`, numOpts(v, [l * w * h, 2 * (l * w + w * h + h * l), dg, l * w + w * h + h * l].filter((x) => x !== v)), { vol: `আয়তন $=abc=${l}\\times${w}\\times${h}=${v}$`, surf: `সমগ্রতল $=2(ab+bc+ca)=2(${l * w}+${w * h}+${h * l})=${v}$`, diag: `কর্ণ $=\\sqrt{${l}^2+${w}^2+${h}^2}=\\sqrt{${l * l + w * w + h * h}}=${dg}$` }[kind])
  }
  const tCube = () => {
    const a = ri(2, 12)
    const kind = pick(["vol", "surf", "diag"])
    if (kind === "diag") return add(C, `একটি ঘনকের ধার $${a}$ সেমি হলে কর্ণ কত সেমি?`, [$(radTex(a, 3)), $(radTex(a, 2)), $(`${3 * a}`), $(`${a * a}`)], `ঘনকের কর্ণ $=\\sqrt{3a^2}=a\\sqrt3=${radTex(a, 3)}$`)
    const v = kind === "vol" ? a ** 3 : 6 * a * a
    add(C, `একটি ঘনকের ধার $${a}$ সেমি হলে এর ${kind === "vol" ? "আয়তন (ঘন সেমি)" : "সমগ্রতলের ক্ষেত্রফল (বর্গ সেমি)"} কত?`, numOpts(v, [a ** 3, 6 * a * a, 4 * a * a, 3 * a * a].filter((x) => x !== v)), kind === "vol" ? `আয়তন $=a^3=${a}^3=${v}$` : `সমগ্রতল $=6a^2=6\\times${a * a}=${v}$`)
  }
  const tCyl = () => {
    const r = ri(2, 10)
    const h = ri(3, 15)
    const kind = pick(["vol", "curve", "total"])
    const v = { vol: `${r * r * h}\\pi`, curve: `${2 * r * h}\\pi`, total: `${2 * r * (r + h)}\\pi` }
    add(C, `একটি সিলিন্ডারের ভূমির ব্যাসার্ধ $${r}$ সেমি ও উচ্চতা $${h}$ সেমি। এর ${{ vol: "আয়তন", curve: "বক্রতলের ক্ষেত্রফল", total: "সমগ্রতলের ক্ষেত্রফল" }[kind]} কত?`, [$(v[kind]), ...Object.keys(v).filter((x) => x !== kind).map((x) => $(v[x])), $(`${r * h}\\pi`)], { vol: `আয়তন $=\\pi r^2h=\\pi\\times${r * r}\\times${h}=${v.vol}$`, curve: `বক্রতল $=2\\pi rh=2\\pi\\times${r}\\times${h}=${v.curve}$`, total: `সমগ্রতল $=2\\pi r(r+h)=2\\pi\\times${r}(${r}+${h})=${v.total}$` }[kind])
  }
  const tPath = () => {
    const l = ri(20, 60)
    const b = ri(10, l - 5)
    const w = ri(1, 4)
    const out = (l + 2 * w) * (b + 2 * w) - l * b
    add(C, `$${l}$ মি × $${b}$ মি একটি বাগানের বাইরে চারদিকে $${w}$ মি চওড়া রাস্তা আছে। রাস্তার ক্ষেত্রফল কত বর্গমিটার?`, numOpts(out, [l * b - (l - 2 * w) * (b - 2 * w), 2 * w * (l + b), (l + 2 * w) * (b + 2 * w)]), `রাস্তাসহ $=(${l}+${2 * w})\\times(${b}+${2 * w})=${(l + 2 * w) * (b + 2 * w)}$; বাগান $=${l * b}$; রাস্তা $=${(l + 2 * w) * (b + 2 * w)}-${l * b}=${out}$`)
  }
  fill(C, fixed, [tRect, tSquare, tEqui, tHeron, tRightTri, tCircle, tRhombus, tTrap, tCuboid, tCube, tCyl, tPath])
}

// ───────────────────────── সৃজনশীল (৫০টি) ─────────────────────────
// Each: stem + 4 parts {q, a, tip?}. tip on গ/ঘ explains which formula and why.
const cq = []
const CQ = (ch, stem, parts) => cq.push({ ch, stem, parts })
const part = (q, a, tip) => ({ q, a, ...(tip && { tip }) })

// ১৭: grouped frequency table ×6, raw data ×2
for (let t = 0; t < 6; t++) {
  const h = pick([5, 10])
  const start = ri(3, 6) * h + 1
  const f = Array.from({ length: 6 }, () => ri(3, 14))
  // force a single clear modal class in the middle
  const mi = ri(1, 4)
  f[mi] = Math.max(...f) + ri(2, 4)
  const lo = f.map((_, i) => start + i * h)
  const hi = lo.map((x) => x + h - 1)
  const mid = lo.map((x, i) => (x + hi[i]) / 2)
  const n = f.reduce((a, b) => a + b, 0)
  const ai = 3
  const a = mid[ai]
  const u = mid.map((x) => (x - a) / h)
  const sfu = u.reduce((s, x, i) => s + x * f[i], 0)
  const mean = a + (sfu / n) * h
  let cum = 0
  const cf = f.map((x) => (cum += x))
  let k = 0
  while (cf[k] < n / 2) k++
  const Lm = lo[k] - 0.5
  const Fc = k ? cf[k - 1] : 0
  const med = Lm + ((n / 2 - Fc) / f[k]) * h
  const Lo = lo[mi] - 0.5
  const f1 = f[mi] - f[mi - 1]
  const f2 = f[mi] - f[mi + 1]
  const mode = Lo + (f1 / (f1 + f2)) * h
  const tab = lo.map((x, i) => `${x}-${hi[i]}`).join(" | ")
  CQ("m17", `কোনো শ্রেণির ${n} জন শিক্ষার্থীর প্রাপ্ত নম্বরের গণসংখ্যা নিবেশন সারণি:\nশ্রেণিব্যাপ্তি: ${tab}\nগণসংখ্যা: ${f.join(" | ")}`, [
    part("সারণির শ্রেণিব্যবধান ও প্রচুরক শ্রেণি নির্ণয় করো।", `শ্রেণিব্যবধান $h=${hi[0]}-${lo[0]}+1=${h}$; সর্বোচ্চ গণসংখ্যা $${f[mi]}$, তাই প্রচুরক শ্রেণি $${lo[mi]}-${hi[mi]}$।`),
    part("সংক্ষিপ্ত পদ্ধতিতে গড় নির্ণয় করো।", `আনুমানিক গড় $a=${a}$, $u_i=\\frac{x_i-${a}}{${h}}$: $${u.join(", ")}$\n$\\sum f_iu_i=${sfu}$, $n=${n}$\n$\\bar x=a+\\frac{\\sum f_iu_i}{n}\\times h=${a}+\\frac{${sfu}}{${n}}\\times${h}=${dec(mean)}$`),
    part("মধ্যক নির্ণয় করো।", `ক্রমযোজিত গণসংখ্যা: $${cf.join(", ")}$\n$\\frac{n}{2}=${dec(n / 2)}$, তাই মধ্যক শ্রেণি $${lo[k]}-${hi[k]}$\n$L=${Lm}$ (প্রকৃত নিম্নসীমা), $F_c=${Fc}$, $f_m=${f[k]}$, $h=${h}$\nমধ্যক $=L+\\left(\\frac n2-F_c\\right)\\frac{h}{f_m}=${Lm}+(${dec(n / 2)}-${Fc})\\times\\frac{${h}}{${f[k]}}=${dec(med)}$`, `**সূত্র:** মধ্যক $=L+\\left(\\frac n2-F_c\\right)\\times\\frac{h}{f_m}$\n**কীভাবে চিনবে:** প্রশ্নে 'মধ্যক' আর সারণি শ্রেণিবিন্যস্ত হলেই এই সূত্র।\n**সহজ কৌশল:** ① ক্রমযোজিত গণসংখ্যার কলাম বানাও ② $\\frac n2$ যেখানে প্রথম ছাড়িয়ে যায় সেটাই মধ্যক শ্রেণি ③ তার আগের ক্রমযোজিত সংখ্যা $F_c$ ④ নিম্নসীমা থেকে $0.5$ বাদ দিয়ে $L$ ধরো।`),
    part("প্রচুরক নির্ণয় করো।", `প্রচুরক শ্রেণি $${lo[mi]}-${hi[mi]}$, $L=${Lo}$\n$f_1=${f[mi]}-${f[mi - 1]}=${f1}$, $f_2=${f[mi]}-${f[mi + 1]}=${f2}$\nপ্রচুরক $=L+\\frac{f_1}{f_1+f_2}\\times h=${Lo}+\\frac{${f1}}{${f1 + f2}}\\times${h}=${dec(mode)}$`, `**সূত্র:** প্রচুরক $=L+\\frac{f_1}{f_1+f_2}\\times h$\n**কীভাবে চিনবে:** 'প্রচুরক' + শ্রেণিবিন্যস্ত সারণি।\n**সহজ কৌশল:** সবচেয়ে বড় গণসংখ্যার শ্রেণি বাছো; $f_1$ = এর থেকে **আগেরটা** বাদ, $f_2$ = এর থেকে **পরেরটা** বাদ। মনে রাখো: 'বড় − আগে, বড় − পরে'।`),
  ])
}
for (let t = 0; t < 2; t++) {
  const xs = Array.from({ length: 12 }, () => ri(20, 70))
  const s = [...xs].sort((a, b) => a - b)
  const S = xs.reduce((a, b) => a + b, 0)
  const mn = s[0]
  const mx = s[11]
  const med = (s[5] + s[6]) / 2
  CQ("m17", `১২ জন শ্রমিকের দৈনিক মজুরি (শত টাকায়): ${xs.join(", ")}`, [
    part("উপাত্তগুলোর পরিসর নির্ণয় করো।", `পরিসর $=(${mx}-${mn})+1=${mx - mn + 1}$`),
    part("উপাত্তগুলো ঊর্ধ্বক্রমে সাজাও।", `$${s.join(", ")}$`),
    part("গাণিতিক গড় নির্ণয় করো।", `যোগফল $=${S}$, $n=12$\nগড় $=\\frac{${S}}{12}=${dec(S / 12)}$`, `**সূত্র:** গড় $=\\frac{\\sum x}{n}$\n**কীভাবে চিনবে:** অবিন্যস্ত (সারণি ছাড়া) উপাত্ত—সরাসরি যোগ করে ভাগ।\n**সহজ কৌশল:** ৩-৪টি করে দল বানিয়ে যোগ করো, ভুল কম হবে।`),
    part("মধ্যক নির্ণয় করো।", `$n=12$ (জোড়), মধ্যক $=\\frac{6\\text{ষ্ঠ}+7\\text{ম পদ}}{2}=\\frac{${s[5]}+${s[6]}}{2}=${dec(med)}$`, `**সূত্র:** জোড় $n$ হলে মধ্যক $=\\frac{\\frac n2\\text{তম}+\\left(\\frac n2+1\\right)\\text{তম পদ}}{2}$\n**কীভাবে চিনবে:** অবিন্যস্ত উপাত্ত + মধ্যক।\n**সহজ কৌশল:** আগে **অবশ্যই** ক্রমানুসারে সাজাও, তারপর মাঝের দুটি সংখ্যার গড়।`),
  ])
}

// ৯: tanθ given ×4, identity proofs ×3
const proofs = [
  ["\\frac{1}{1+\\sin\\theta}+\\frac{1}{1-\\sin\\theta}=2\\sec^2\\theta", "বামপক্ষ $=\\frac{(1-\\sin\\theta)+(1+\\sin\\theta)}{1-\\sin^2\\theta}=\\frac{2}{\\cos^2\\theta}=2\\sec^2\\theta=$ ডানপক্ষ", "দুটি ভগ্নাংশ যোগ → লসাগু; হরে $(1+\\sin\\theta)(1-\\sin\\theta)=1-\\sin^2\\theta=\\cos^2\\theta$"],
  ["\\frac{\\sin\\theta}{1+\\cos\\theta}+\\frac{1+\\cos\\theta}{\\sin\\theta}=2\\operatorname{cosec}\\theta", "বামপক্ষ $=\\frac{\\sin^2\\theta+(1+\\cos\\theta)^2}{\\sin\\theta(1+\\cos\\theta)}=\\frac{\\sin^2\\theta+1+2\\cos\\theta+\\cos^2\\theta}{\\sin\\theta(1+\\cos\\theta)}=\\frac{2(1+\\cos\\theta)}{\\sin\\theta(1+\\cos\\theta)}=\\frac{2}{\\sin\\theta}=2\\operatorname{cosec}\\theta$", "লসাগু নিয়ে লব বিস্তার করো; $\\sin^2\\theta+\\cos^2\\theta=1$ বসিয়ে $2(1+\\cos\\theta)$ কমন নাও"],
  ["(\\sec\\theta-\\tan\\theta)(\\sec\\theta+\\tan\\theta)=1", "বামপক্ষ $=\\sec^2\\theta-\\tan^2\\theta=1=$ ডানপক্ষ", "$(a-b)(a+b)=a^2-b^2$ সূত্র, তারপর $\\sec^2\\theta-\\tan^2\\theta=1$"],
  ["\\tan\\theta+\\cot\\theta=\\sec\\theta\\operatorname{cosec}\\theta", "বামপক্ষ $=\\frac{\\sin\\theta}{\\cos\\theta}+\\frac{\\cos\\theta}{\\sin\\theta}=\\frac{\\sin^2\\theta+\\cos^2\\theta}{\\sin\\theta\\cos\\theta}=\\frac{1}{\\sin\\theta\\cos\\theta}=\\sec\\theta\\operatorname{cosec}\\theta$", "সব কিছু $\\sin, \\cos$-এ রূপান্তর করো—এটাই সবচেয়ে সহজ পথ"],
  ["\\frac{1-\\tan^2\\theta}{1+\\tan^2\\theta}=\\cos^2\\theta-\\sin^2\\theta", "বামপক্ষ $=\\frac{1-\\frac{\\sin^2\\theta}{\\cos^2\\theta}}{\\sec^2\\theta}=\\frac{\\cos^2\\theta-\\sin^2\\theta}{\\cos^2\\theta}\\times\\cos^2\\theta=\\cos^2\\theta-\\sin^2\\theta$", "হরে $1+\\tan^2\\theta=\\sec^2\\theta$; লবে $\\tan=\\frac{\\sin}{\\cos}$ বসাও"],
  ["\\sqrt{\\frac{1-\\sin\\theta}{1+\\sin\\theta}}=\\sec\\theta-\\tan\\theta", "বামপক্ষ $=\\sqrt{\\frac{(1-\\sin\\theta)^2}{1-\\sin^2\\theta}}=\\frac{1-\\sin\\theta}{\\cos\\theta}=\\sec\\theta-\\tan\\theta$", "লব-হরকে $(1-\\sin\\theta)$ দিয়ে গুণ করো, হর হবে $\\cos^2\\theta$"],
]
for (let t = 0; t < 7; t++) {
  const [a, b, c] = pick([[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25]])
  const [pf, pp, ptip] = proofs[t % proofs.length]
  const val1 = fr(c * c - a * a, b * b) // (sec²θ − tan²θ) check = 1; use (1+sinθ)(1−sinθ)… → cos²θ
  const sN = c + a
  const sD = c - a
  CQ("m9", `$\\triangle ABC$-এ $\\angle B=90^\\circ$, $\\angle C=\\theta$ এবং $\\tan\\theta=\\frac{${a}}{${b}}$।`, [
    part("$AC$ এর দৈর্ঘ্য $BC$-এর কত গুণ নির্ণয় করো।", `$AB=${a}k$, $BC=${b}k$ ধরলে $AC=\\sqrt{${a * a}k^2+${b * b}k^2}=${c}k$; তাই $AC=${fr(c, b)}\\,BC$`),
    part("$\\sin\\theta$ ও $\\cos\\theta$ নির্ণয় করো।", `$\\sin\\theta=\\frac{\\text{লম্ব}}{\\text{অতিভুজ}}=\\frac{${a}}{${c}}$, $\\cos\\theta=\\frac{\\text{ভূমি}}{\\text{অতিভুজ}}=\\frac{${b}}{${c}}$`),
    part(`$\\frac{1+\\sin\\theta}{1-\\sin\\theta}$ এর মান নির্ণয় করো।`, `$\\sin\\theta=\\frac{${a}}{${c}}$ বসাই:\n$\\frac{1+\\frac{${a}}{${c}}}{1-\\frac{${a}}{${c}}}=\\frac{${c}+${a}}{${c}-${a}}=${fr(sN, sD)}$\n(যাচাই: $1-\\sin^2\\theta=${val1}\\cos^2$-এর সমান অংশ)`, `**সূত্র:** $\\tan\\theta=\\frac{\\text{লম্ব}}{\\text{ভূমি}}$ থেকে বাহু ধরো, পিথাগোরাসে অতিভুজ।\n**কীভাবে চিনবে:** একটি অনুপাত দেওয়া, অন্য অনুপাতের রাশি চাওয়া।\n**সহজ কৌশল:** ছোট ত্রিভুজ এঁকে লম্ব $=${a}$, ভূমি $=${b}$, অতিভুজ $=${c}$ লিখে নাও; তারপর শুধু বসাও। লব-হরে ${c} দিয়ে গুণ করলে ভগ্নাংশ ঝামেলা চলে যায়।`),
    part(`প্রমাণ করো: $${pf}$`, pp, `**কোন সূত্র:** $\\sin^2\\theta+\\cos^2\\theta=1$, $\\sec^2\\theta=1+\\tan^2\\theta$, $\\operatorname{cosec}^2\\theta=1+\\cot^2\\theta$\n**কীভাবে চিনবে:** 'প্রমাণ করো' + দুই পাশে ত্রিকোণমিতিক রাশি।\n**সহজ কৌশল:** ${ptip}। সবসময় জটিল পক্ষ (সাধারণত বামপক্ষ) থেকে শুরু করো।`),
  ])
}

// ২: set operations ×4, survey ×3
for (let t = 0; t < 4; t++) {
  const n = 12
  const U = Array.from({ length: n }, (_, i) => i + 1)
  const m1 = pick([2, 3])
  const A = U.filter((x) => x % m1 === 0)
  const kk = pick([12, 18, 20, 24])
  const B = U.filter((x) => kk % x === 0)
  const C2 = U.filter((x) => x % 2 === 1 && x < pick([8, 10, 12]))
  const BuC = [...new Set([...B, ...C2])]
  const left = A.filter((x) => BuC.includes(x))
  const AB = A.filter((x) => B.includes(x))
  const AC = A.filter((x) => C2.includes(x))
  const right = [...new Set([...AB, ...AC])]
  const AuB = [...new Set([...A, ...B])]
  const comp1 = U.filter((x) => !AuB.includes(x))
  const Ac = U.filter((x) => !A.includes(x))
  const Bc = U.filter((x) => !B.includes(x))
  const comp2 = Ac.filter((x) => Bc.includes(x))
  CQ("m2", `$U=\\{x\\in\\mathbb N: x\\le ${n}\\}$, $A=\\{x\\in U: x, ${m1}\\text{ এর গুণিতক}\\}$, $B=\\{x\\in U: x, ${kk}\\text{ এর গুণনীয়ক}\\}$, $C=${setTex(C2)}$`, [
    part("$A$ ও $B$ কে তালিকা পদ্ধতিতে লেখো।", `$A=${setTex(A)}$, $B=${setTex(B)}$`),
    part("$A\\cup B$ ও $A\\cap B$ নির্ণয় করো।", `$A\\cup B=${setTex(AuB)}$, $A\\cap B=${setTex(AB)}$`),
    part("দেখাও যে, $A\\cap(B\\cup C)=(A\\cap B)\\cup(A\\cap C)$", `$B\\cup C=${setTex(BuC)}$\nবামপক্ষ $A\\cap(B\\cup C)=${setTex(left)}$\n$A\\cap B=${setTex(AB)}$, $A\\cap C=${setTex(AC)}$\nডানপক্ষ $=${setTex(right)}$\n∴ বামপক্ষ = ডানপক্ষ`, `**সূত্র:** বণ্টন বিধি $A\\cap(B\\cup C)=(A\\cap B)\\cup(A\\cap C)$\n**কীভাবে চিনবে:** 'দেখাও যে' + বন্ধনীসহ সেট—দুই পক্ষ আলাদা করে হিসাব।\n**সহজ কৌশল:** আগে বন্ধনীর ভেতর ($B\\cup C$) বের করো, তারপর বাইরেরটা। ডানপক্ষ আলাদা লাইনে করো, শেষে দুটো মিলাও।`),
    part("দেখাও যে, $(A\\cup B)'=A'\\cap B'$", `$(A\\cup B)'=U\\setminus(A\\cup B)=${setTex(comp1)}$\n$A'=${setTex(Ac)}$, $B'=${setTex(Bc)}$\n$A'\\cap B'=${setTex(comp2)}$\n∴ $(A\\cup B)'=A'\\cap B'$`, `**সূত্র:** ডি মরগানের সূত্র\n**কীভাবে চিনবে:** পূরক চিহ্ন ($'$) বন্ধনীর বাইরে।\n**সহজ কৌশল:** পূরক মানে 'U থেকে বাদ'। $U$-এর তালিকা পাশে লিখে রাখো, এক এক করে কেটে দাও।`),
  ])
}
for (let t = 0; t < 3; t++) {
  const N = ri(8, 15) * 10
  const a = ri(N * 0.4, N * 0.6)
  const b = ri(N * 0.3, N * 0.5)
  const c = ri(N * 0.1, Math.min(a, b) * 0.6)
  const atLeast = a + b - c
  const none = N - atLeast
  if (none < 0) {
    t--
    continue
  }
  const onlyA = a - c
  const onlyB = b - c
  CQ("m2", `কোনো বিদ্যালয়ের ${N} জন শিক্ষার্থীর মধ্যে ${a} জন বাংলায়, ${b} জন গণিতে এবং ${c} জন উভয় বিষয়ে A+ পেয়েছে।`, [
    part("উপাত্তগুলোকে সেট আকারে প্রকাশ করো।", `$n(U)=${N}$, $n(B)=${a}$, $n(G)=${b}$, $n(B\\cap G)=${c}$`),
    part("কতজন অন্তত একটি বিষয়ে A+ পেয়েছে?", `$n(B\\cup G)=${a}+${b}-${c}=${atLeast}$ জন`),
    part("কতজন কেবল একটি বিষয়ে A+ পেয়েছে?", `কেবল বাংলা $=${a}-${c}=${onlyA}$, কেবল গণিত $=${b}-${c}=${onlyB}$\nমোট $=${onlyA + onlyB}$ জন`, `**সূত্র:** কেবল $A=n(A)-n(A\\cap B)$\n**কীভাবে চিনবে:** 'কেবল' শব্দটি দেখলেই ছেদ বাদ দিতে হবে।\n**সহজ কৌশল:** ভেনচিত্র আঁকো—মাঝে ${c}, বাম অংশে ${a}−${c}, ডান অংশে ${b}−${c}।`),
    part("কোনো বিষয়ে A+ পায়নি এমন শিক্ষার্থীর শতকরা হার নির্ণয় করো।", `কোনোটিতে নয় $=${N}-${atLeast}=${none}$ জন\nশতকরা হার $=\\frac{${none}}{${N}}\\times100=${dec((none / N) * 100)}\\%$`, `**সূত্র:** $n(A\\cup B)=n(A)+n(B)-n(A\\cap B)$, তারপর $n(U)-n(A\\cup B)$\n**কীভাবে চিনবে:** 'কোনোটিই নয়/পায়নি' → মোট থেকে সংযোগ বাদ।\n**সহজ কৌশল:** আগে $A\\cup B$ বের করো, তারপর মোট থেকে বাদ দিয়ে $\\frac{\\text{অংশ}}{\\text{মোট}}\\times100$।`),
  ])
}

// ১০: tower approach ×4, ladder/broken ×3
for (let t = 0; t < 4; t++) {
  const d = pick([20, 30, 40, 50, 60])
  // far point at 30°, near point at 60°, distance between them d → h = d√3/2, near x = d/2
  const h = radTex(d / 2, 3)
  CQ("m10", `একটি মিনারের পাদদেশ থেকে কিছু দূরে $P$ বিন্দুতে শীর্ষের উন্নতি কোণ $30^\\circ$। মিনারের দিকে $${d}$ মিটার এগিয়ে $Q$ বিন্দুতে গেলে উন্নতি কোণ হয় $60^\\circ$।`, [
    part("উন্নতি কোণ কাকে বলে?", "ভূমির সমান্তরাল রেখার উপরে অবস্থিত কোনো বিন্দুর দিকে তাকালে দৃষ্টিরেখা ও আনুভূমিক রেখার মধ্যবর্তী কোণকে উন্নতি কোণ বলে।"),
    part("$\\tan30^\\circ$ ও $\\tan60^\\circ$ এর গুণফল কত?", "$\\frac{1}{\\sqrt3}\\times\\sqrt3=1$"),
    part("মিনারের উচ্চতা নির্ণয় করো।", `ধরি উচ্চতা $h$, $Q$ থেকে পাদদেশ $x$ মিটার।\n$\\triangle$ থেকে: $\\tan60^\\circ=\\frac hx\\Rightarrow h=\\sqrt3x$ …(১)\n$\\tan30^\\circ=\\frac{h}{x+${d}}\\Rightarrow h=\\frac{x+${d}}{\\sqrt3}$ …(২)\n(১) ও (২) থেকে $\\sqrt3x=\\frac{x+${d}}{\\sqrt3}\\Rightarrow 3x=x+${d}\\Rightarrow x=${d / 2}$\n$h=${d / 2}\\sqrt3=${dec((d / 2) * Math.sqrt(3))}$ মিটার (প্রায়)`, `**সূত্র:** $\\tan\\theta=\\frac{\\text{উচ্চতা}}{\\text{দূরত্ব}}$ দুইবার\n**কীভাবে চিনবে:** দুইটি কোণ + তাদের মাঝের দূরত্ব দেওয়া।\n**সহজ কৌশল:** কাছের দূরত্ব $x$ ধরো, দূরেরটা $x+${d}$। দুই সমীকরণে $h$ সমান করো—উত্তর সবসময় $h=\\frac{d\\sqrt3}{2}$ (30°–60° জোড়ার জন্য)।`),
    part("$Q$ বিন্দু থেকে মিনারের শীর্ষের দূরত্ব নির্ণয় করো।", `$\\cos60^\\circ=\\frac{x}{QA}\\Rightarrow QA=\\frac{${d / 2}}{\\frac12}=${d}$ মিটার`, `**সূত্র:** $\\cos\\theta=\\frac{\\text{ভূমি}}{\\text{অতিভুজ}}$\n**কীভাবে চিনবে:** 'শীর্ষের দূরত্ব' মানে দৃষ্টিরেখা = অতিভুজ।\n**সহজ কৌশল:** ভূমি ($x$) জানা আছে, অতিভুজ লাগবে → $\\cos$। লক্ষ করো $QA=d$, অর্থাৎ $\\triangle PQA$ সমদ্বিবাহু।`),
  ])
}
for (let t = 0; t < 3; t++) {
  const l = pick([10, 12, 16, 20])
  const x = pick([6, 8, 10, 12])
  CQ("m10", `$${l}$ মিটার লম্বা একটি মই দেয়ালের সাথে হেলান দিয়ে মাটির সাথে $60^\\circ$ কোণ উৎপন্ন করে। অন্যদিকে, একটি গাছ ঝড়ে ভেঙে গিয়ে গোড়া থেকে $${x}$ মিটার দূরে মাটির সাথে $30^\\circ$ কোণে লেগে আছে।`, [
    part("$\\sin60^\\circ$ এর মান লেখো।", "$\\frac{\\sqrt3}{2}$"),
    part("মইয়ের পাদদেশ দেয়াল থেকে কত দূরে?", `$\\cos60^\\circ=\\frac{d}{${l}}\\Rightarrow d=${l}\\times\\frac12=${l / 2}$ মিটার`),
    part("মইটি দেয়ালের কত উচ্চতায় পৌঁছেছে?", `$\\sin60^\\circ=\\frac{h}{${l}}\\Rightarrow h=${l}\\times\\frac{\\sqrt3}{2}=${radTex(l / 2, 3)}\\approx${dec((l / 2) * Math.sqrt(3))}$ মিটার`, `**সূত্র:** $\\sin\\theta=\\frac{\\text{লম্ব}}{\\text{অতিভুজ}}$\n**কীভাবে চিনবে:** মই = অতিভুজ (জানা), উচ্চতা = লম্ব (অজানা) → $\\sin$।\n**সহজ কৌশল:** মনে রাখো—অতিভুজ জানা থাকলে উচ্চতা চাইলে $\\sin$, দূরত্ব চাইলে $\\cos$।`),
    part("গাছটির পূর্ণ উচ্চতা নির্ণয় করো।", `দাঁড়ানো অংশ $=${x}\\tan30^\\circ=\\frac{${x}}{\\sqrt3}$\nভাঙা অংশ $=${x}\\sec30^\\circ=\\frac{${2 * x}}{\\sqrt3}$\nমোট $=\\frac{${x}+${2 * x}}{\\sqrt3}=\\frac{${3 * x}}{\\sqrt3}=${radTex(x, 3)}\\approx${dec(x * Math.sqrt(3))}$ মিটার`, `**সূত্র:** দাঁড়ানো অংশ $=d\\tan\\theta$, ভাঙা অংশ $=d\\sec\\theta$\n**কীভাবে চিনবে:** 'ভেঙে গিয়ে মাটি স্পর্শ' → ভাঙা অংশটাই অতিভুজ।\n**সহজ কৌশল:** পূর্ণ উচ্চতা = দাঁড়ানো + ভাঙা = $d(\\tan\\theta+\\sec\\theta)$; $30^\\circ$ হলে সরাসরি $d\\sqrt3$।`),
  ])
}

// ১১: ratio chain ×4, componendo ×3
for (let t = 0; t < 4; t++) {
  const [p, q, r, s] = [ri(2, 5), ri(2, 5), ri(2, 5), ri(2, 5)]
  const A = p * r
  const B = q * r
  const C3 = q * s
  const g = gcd(gcd(A, B), C3)
  const [x, y, z] = [A / g, B / g, C3 / g]
  const k = ri(20, 60)
  const T = (x + y + z) * k
  CQ("m11", `ক, খ ও গ-এর মাসিক আয়ের অনুপাত এমন যে, ক:খ $=${p}:${q}$ এবং খ:গ $=${r}:${s}$। তাদের মোট মাসিক আয় $${T * 100}$ টাকা।`, [
    part("ক:খ:গ নির্ণয় করো।", `খ-কে সমান করি: ক:খ $=${p * r}:${q * r}$, খ:গ $=${q * r}:${q * s}$\nক:খ:গ $=${x}:${y}:${z}$`),
    part("প্রত্যেকের আয় নির্ণয় করো।", `অনুপাতের যোগফল $=${x + y + z}$\nক $=${T * 100}\\times\\frac{${x}}{${x + y + z}}=${x * k * 100}$, খ $=${y * k * 100}$, গ $=${z * k * 100}$ টাকা`),
    part(`ক-এর আয় $${10}\\%$ ও খ-এর আয় $${20}\\%$ বাড়লে তাদের আয়ের নতুন অনুপাত কত?`, `নতুন ক $=${x * k * 100}\\times\\frac{110}{100}=${(x * k * 110)}$\nনতুন খ $=${y * k * 100}\\times\\frac{120}{100}=${(y * k * 120)}$\nঅনুপাত $=${x * 110}:${y * 120}=${(() => { const g2 = gcd(x * 110, y * 120); return `${(x * 110) / g2}:${(y * 120) / g2}` })()}$`, `**সূত্র:** নতুন মান = পুরাতন × $\\frac{100+\\text{বৃদ্ধির হার}}{100}$\n**কীভাবে চিনবে:** শতকরা বৃদ্ধি/হ্রাস + নতুন অনুপাত।\n**সহজ কৌশল:** পুরো টাকার অঙ্ক না ধরে শুধু অনুপাতের পদ ($${x}$ ও $${y}$) কে $110$ ও $120$ দিয়ে গুণ করো—একই উত্তর, হিসাব ছোট।`),
    part(`দেখাও যে, $\\frac{\\text{ক}+\\text{খ}}{\\text{খ}+\\text{গ}}=${fr(x + y, y + z)}$`, `ক $=${x}m$, খ $=${y}m$, গ $=${z}m$ ধরি\n$\\frac{${x}m+${y}m}{${y}m+${z}m}=\\frac{${x + y}}{${y + z}}=${fr(x + y, y + z)}$`, `**সূত্র:** অনুপাতের পদকে সাধারণ গুণক $m$ দিয়ে প্রকাশ\n**কীভাবে চিনবে:** অনুপাত জানা, রাশির মান চাওয়া।\n**সহজ কৌশল:** প্রতিটি রাশিকে 'অনুপাতের সংখ্যা × $m$' লিখে বসাও; $m$ কেটে যাবে।`),
  ])
}
for (let t = 0; t < 3; t++) {
  const p = ri(2, 7)
  const q = ri(1, p - 1)
  if (gcd(p, q) !== 1) {
    t--
    continue
  }
  const xN = 2 * p * q
  const xD = p * p + q * q
  CQ("m11", `$\\frac{\\sqrt{1+x}+\\sqrt{1-x}}{\\sqrt{1+x}-\\sqrt{1-x}}=\\frac{${p}}{${q}}$ এবং $a:b=${p}:${q}$।`, [
    part("$a:b$ এর ব্যস্ত অনুপাত লেখো।", `$b:a=${q}:${p}$`),
    part("$\\frac{a+b}{a-b}$ এর মান নির্ণয় করো।", `যোজন-বিয়োজন: $\\frac{${p}+${q}}{${p}-${q}}=${fr(p + q, p - q)}$`),
    part("প্রদত্ত সমীকরণে যোজন-বিয়োজন প্রয়োগ করে $\\frac{\\sqrt{1+x}}{\\sqrt{1-x}}$ নির্ণয় করো।", `যোজন-বিয়োজন: $\\frac{2\\sqrt{1+x}}{2\\sqrt{1-x}}=\\frac{${p}+${q}}{${p}-${q}}$\n$\\Rightarrow\\frac{\\sqrt{1+x}}{\\sqrt{1-x}}=${fr(p + q, p - q)}$`, `**সূত্র:** যোজন-বিয়োজন $\\frac{a}{b}=\\frac{c}{d}\\Rightarrow\\frac{a+b}{a-b}=\\frac{c+d}{c-d}$\n**কীভাবে চিনবে:** বামপক্ষে $\\frac{P+Q}{P-Q}$ আকার—যেখানে $P, Q$ বর্গমূল।\n**সহজ কৌশল:** যোজন-বিয়োজন করলে উপরে $2P$, নিচে $2Q$ থাকে; $2$ কেটে যায়। এটাই এক লাইনের কৌশল।`),
    part("সমীকরণটি সমাধান করো।", `$\\frac{\\sqrt{1+x}}{\\sqrt{1-x}}=${fr(p + q, p - q)}$; বর্গ করি: $\\frac{1+x}{1-x}=\\frac{${(p + q) ** 2}}{${(p - q) ** 2}}$\nআবার যোজন-বিয়োজন: $\\frac{2}{2x}=\\frac{${(p + q) ** 2}+${(p - q) ** 2}}{${(p + q) ** 2}-${(p - q) ** 2}}=\\frac{${2 * (p * p + q * q)}}{${4 * p * q}}$\n$\\Rightarrow x=${fr(xN, xD)}$`, `**সূত্র:** দুইবার যোজন-বিয়োজন + বর্গ করা\n**কীভাবে চিনবে:** বর্গমূলের ভেতরে $1+x$ ও $1-x$।\n**সহজ কৌশল:** মুখস্থ ফল: উত্তর সবসময় $x=\\frac{2pq}{p^2+q^2}$ (এখানে $p=${p}, q=${q}$)—পরীক্ষায় উত্তর মিলিয়ে নিতে কাজে লাগে।`),
  ])
}

// ১৩: AP ×4, GP ×3
for (let t = 0; t < 4; t++) {
  const a = ri(2, 12)
  const d = ri(2, 6)
  const n = ri(12, 25)
  const tn = a + (n - 1) * d
  const Sn = (n * (a + tn)) / 2
  const m = ri(8, 20)
  const Sm = (m * (2 * a + (m - 1) * d)) / 2
  CQ("m13", `একটি সমান্তর ধারা: $${a}+${a + d}+${a + 2 * d}+\\dots+${tn}$`, [
    part("ধারাটির সাধারণ অন্তর নির্ণয় করো।", `$d=${a + d}-${a}=${d}$`),
    part("ধারাটির পদসংখ্যা নির্ণয় করো।", `$${tn}=${a}+(n-1)${d}\\Rightarrow n-1=${n - 1}\\Rightarrow n=${n}$`),
    part("ধারাটির সমষ্টি নির্ণয় করো।", `$S=\\frac n2(a+l)=\\frac{${n}}{2}(${a}+${tn})=${Sn}$`, `**সূত্র:** $S_n=\\frac n2(a+l)$ (শেষ পদ জানা থাকলে)\n**কীভাবে চিনবে:** প্রথম পদ ও শেষ পদ দুটোই দেওয়া।\n**সহজ কৌশল:** শেষ পদ জানা থাকলে $2a+(n-1)d$-এর ঝামেলা না করে সরাসরি $(a+l)$ নাও—দ্রুত হয়।`),
    part(`ধারাটির প্রথম কত পদের সমষ্টি $${Sm}$?`, `$\\frac n2\\{2(${a})+(n-1)${d}\\}=${Sm}$\n$\\Rightarrow ${d}n^2+${2 * a - d}n-${2 * Sm}=0$\n$\\Rightarrow (n-${m})(${d}n+${2 * a - d + d * m})=0$\nধনাত্মক মান $n=${m}$`, `**সূত্র:** $S_n=\\frac n2\\{2a+(n-1)d\\}$ → দ্বিঘাত সমীকরণ\n**কীভাবে চিনবে:** যোগফল দেওয়া, পদসংখ্যা চাওয়া।\n**সহজ কৌশল:** সমীকরণ সাজিয়ে উৎপাদকে ভাঙো; ঋণাত্মক বা ভগ্নাংশ $n$ বাদ। দ্রুত যাচাই: $n=${m}$ বসিয়ে $S$ মিলিয়ে নাও।`),
  ])
}
for (let t = 0; t < 3; t++) {
  const a = ri(1, 4)
  const r = pick([2, 3])
  const n = ri(5, 8)
  const tn = a * r ** (n - 1)
  const S = (a * (r ** n - 1)) / (r - 1)
  const k = ri(3, n - 1)
  CQ("m13", `একটি গুণোত্তর ধারার প্রথম পদ $${a}$ এবং সাধারণ অনুপাত $${r}$।`, [
    part("ধারাটির প্রথম তিনটি পদ লেখো।", `$${a}, ${a * r}, ${a * r * r}$`),
    part(`ধারাটির $${n}$-তম পদ নির্ণয় করো।`, `$ar^{n-1}=${a}\\times${r}^{${n - 1}}=${tn}$`),
    part(`ধারাটির প্রথম $${n}$ পদের সমষ্টি নির্ণয় করো।`, `$S_n=\\frac{a(r^n-1)}{r-1}=\\frac{${a}(${r}^{${n}}-1)}{${r}-1}=\\frac{${a}\\times${r ** n - 1}}{${r - 1}}=${S}$`, `**সূত্র:** $S_n=\\frac{a(r^n-1)}{r-1}$ ($r>1$)\n**কীভাবে চিনবে:** পদগুলো গুণ করে বাড়ছে → গুণোত্তর।\n**সহজ কৌশল:** আগে $r^n$ আলাদা করে হিসাব করো (${r}^{${n}}=${r ** n}$), তারপর বসাও।`),
    part(`ধারাটির কততম পদ $${a * r ** (k - 1)}$?`, `$${a}\\times${r}^{n-1}=${a * r ** (k - 1)}\\Rightarrow ${r}^{n-1}=${r ** (k - 1)}=${r}^{${k - 1}}$\n$\\Rightarrow n-1=${k - 1}\\Rightarrow n=${k}$`, `**সূত্র:** $ar^{n-1}$ = প্রদত্ত পদ\n**কীভাবে চিনবে:** 'কততম পদ' → $n$ অজানা।\n**সহজ কৌশল:** দুই পক্ষকে $a$ দিয়ে ভাগ করে একই ভিত্তির ঘাত বানাও, তারপর ঘাত সমান করো।`),
  ])
}

// ১৬: garden path ×4, Heron triangle ×3
for (let t = 0; t < 4; t++) {
  const l = ri(4, 9) * 10
  const b = ri(2, 4) * 10
  const w = ri(1, 3)
  const rate = pick([20, 25, 30, 40])
  const outer = (l + 2 * w) * (b + 2 * w)
  const path = outer - l * b
  const inner = (l - 2 * w) * (b - 2 * w)
  const inPath = l * b - inner
  CQ("m16", `একটি আয়তাকার বাগানের দৈর্ঘ্য $${l}$ মিটার ও প্রস্থ $${b}$ মিটার। বাগানের বাইরে চারদিকে $${w}$ মিটার চওড়া একটি রাস্তা আছে।`, [
    part("বাগানের ক্ষেত্রফল ও পরিসীমা নির্ণয় করো।", `ক্ষেত্রফল $=${l}\\times${b}=${l * b}$ বর্গমিটার; পরিসীমা $=2(${l}+${b})=${2 * (l + b)}$ মিটার`),
    part("রাস্তাসহ বাগানের দৈর্ঘ্য ও প্রস্থ নির্ণয় করো।", `দৈর্ঘ্য $=${l}+2\\times${w}=${l + 2 * w}$, প্রস্থ $=${b}+2\\times${w}=${b + 2 * w}$ মিটার`),
    part(`প্রতি বর্গমিটার $${rate}$ টাকা হিসেবে রাস্তা পাকা করতে কত খরচ হবে?`, `রাস্তাসহ ক্ষেত্রফল $=${l + 2 * w}\\times${b + 2 * w}=${outer}$\nরাস্তার ক্ষেত্রফল $=${outer}-${l * b}=${path}$ বর্গমিটার\nখরচ $=${path}\\times${rate}=${path * rate}$ টাকা`, `**সূত্র:** রাস্তার ক্ষেত্রফল = (বাইরের আয়ত) − (ভেতরের আয়ত)\n**কীভাবে চিনবে:** 'বাইরে চারদিকে রাস্তা'।\n**সহজ কৌশল:** বাইরে রাস্তা হলে দৈর্ঘ্য-প্রস্থ **যোগ** $2w$; ভেতরে হলে **বিয়োগ** $2w$। তারপর বড় − ছোট।`),
    part("রাস্তাটি বাগানের ভেতরে হলে রাস্তার ক্ষেত্রফল কত হতো? বাইরের রাস্তার সাথে তুলনা করো।", `ভেতরের খালি অংশ $=(${l}-${2 * w})\\times(${b}-${2 * w})=${inner}$\nভেতরের রাস্তা $=${l * b}-${inner}=${inPath}$ বর্গমিটার\nবাইরের রাস্তা ${path} বর্গমিটার, যা ${path - inPath} বর্গমিটার বেশি।`, `**সূত্র:** ভেতরের রাস্তা $=lb-(l-2w)(b-2w)$\n**কীভাবে চিনবে:** 'ভেতরে চারদিকে'।\n**সহজ কৌশল:** বাইরের রাস্তা সর্বদা বড়, কারণ কোণের চারটি বর্গ ($4w^2$) বাড়তি যোগ হয়: পার্থক্য $=8w^2=${8 * w * w}$।`),
  ])
}
for (let t = 0; t < 3; t++) {
  const k = ri(1, 3)
  const [a, b, c] = [13 * k, 14 * k, 15 * k]
  const s = 21 * k
  const A = 84 * k * k
  const hgt = (2 * A) / b
  const rin = A / s
  CQ("m16", `একটি ত্রিভুজাকৃতি জমির তিন বাহুর দৈর্ঘ্য যথাক্রমে $${a}$ মি, $${b}$ মি ও $${c}$ মি।`, [
    part("জমিটির অর্ধপরিসীমা নির্ণয় করো।", `$s=\\frac{${a}+${b}+${c}}{2}=${s}$ মিটার`),
    part("জমিটির ক্ষেত্রফল নির্ণয় করো।", `$\\sqrt{s(s-a)(s-b)(s-c)}=\\sqrt{${s}\\times${s - a}\\times${s - b}\\times${s - c}}=${A}$ বর্গমিটার`),
    part(`$${b}$ মিটার বাহুর বিপরীত শীর্ষ থেকে ওই বাহুর উপর লম্বের দৈর্ঘ্য নির্ণয় করো।`, `ক্ষেত্রফল $=\\frac12\\times\\text{ভূমি}\\times\\text{উচ্চতা}\\Rightarrow ${A}=\\frac12\\times${b}\\times h$\n$\\Rightarrow h=\\frac{2\\times${A}}{${b}}=${dec(hgt)}$ মিটার`, `**সূত্র:** $h=\\frac{2\\times\\text{ক্ষেত্রফল}}{\\text{ভূমি}}$\n**কীভাবে চিনবে:** 'লম্বের দৈর্ঘ্য/উচ্চতা' চাওয়া, ক্ষেত্রফল আগেই জানা।\n**সহজ কৌশল:** হেরনের সূত্রে পাওয়া ক্ষেত্রফল উল্টো দিক থেকে $\\frac12bh$-তে বসাও।`),
    part("জমিটির ভেতরে সবচেয়ে বড় যে বৃত্তাকার পুকুর কাটা যাবে তার ব্যাসার্ধ ও ক্ষেত্রফল নির্ণয় করো।", `অন্তর্বৃত্তের ব্যাসার্ধ $r=\\frac{\\text{ক্ষেত্রফল}}{s}=\\frac{${A}}{${s}}=${rin}$ মিটার\nপুকুরের ক্ষেত্রফল $=\\pi r^2=${rin * rin}\\pi\\approx${dec(Math.PI * rin * rin)}$ বর্গমিটার`, `**সূত্র:** অন্তর্ব্যাসার্ধ $r=\\frac{\\Delta}{s}$, বৃত্তের ক্ষেত্রফল $\\pi r^2$\n**কীভাবে চিনবে:** 'ত্রিভুজের ভেতরে সবচেয়ে বড় বৃত্ত' = অন্তর্বৃত্ত।\n**সহজ কৌশল:** তিনটি ছোট ত্রিভুজের ক্ষেত্রফলের যোগ $=\\frac12r(a+b+c)=rs$, তাই $r=\\frac{\\Delta}{s}$।`),
  ])
}

cq.forEach((c, i) => (c.id = i + 1))
mcq.forEach((m, i) => (m.id = i + 1))

const count = (arr) => arr.reduce((o, x) => ((o[x.ch] = (o[x.ch] ?? 0) + 1), o), {})
console.log("math MCQ:", mcq.length, JSON.stringify(count(mcq)))
console.log("math CQ:", cq.length, JSON.stringify(count(cq)))
if (mcq.length !== 500 || cq.length !== 50) throw new Error("math totals wrong")
fs.mkdirSync("src/data/math", { recursive: true })
fs.writeFileSync("src/data/math/chapters.json", JSON.stringify(chapters.map((c) => ({ id: c.id, title: `${c.title}`, author: `অধ্যায় ${c.no}`, kind: "অধ্যায়" }))))
fs.writeFileSync("src/data/math/mcq.json", JSON.stringify(mcq))
fs.writeFileSync("src/data/math/cq.json", JSON.stringify(cq))
