// Layout helpers for the math content.
//
// Content lines understood by the app (src/components/rich-text.tsx):
//   | a | b | c |        table row (first row is the header)
//   [fig {...json}]      geometry figure (src/components/figure.tsx)
//   $$ … $$              display math
//   ---                  horizontal divider
// Anything else is a text line with inline $…$ math and **bold**.

export const tbl = (rows) => rows.map((r) => `| ${r.join(" | ")} |`).join("\n")
export const fig = (o) => `[fig ${JSON.stringify(o)}]`

// TeX → plain label text for figures (√ and simple fractions only).
export const plain = (t) =>
  String(t)
    .replace(/\\frac\{([^{}]*)\}\{\\sqrt\{(\d+)\}\}/g, "$1/√$2")
    .replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}/g, "$1/$2")
    .replace(/\\sqrt\{(\d+)\}/g, "√$1")
    .replace(/\\sqrt(\d)/g, "√$1")

// Splits TeX at top-level "=" and "\Rightarrow" (outside braces).
function splitTop(tex) {
  const out = []
  let depth = 0
  let cur = ""
  let rel = null
  for (let i = 0; i < tex.length; i++) {
    const ch = tex[i]
    if (ch === "\\") {
      if (depth === 0 && /^\\Rightarrow(?![a-zA-Z])/.test(tex.slice(i))) {
        out.push({ rel, piece: cur })
        rel = "\\Rightarrow"
        cur = ""
        i += "\\Rightarrow".length - 1
        continue
      }
      const m = /^\\([a-zA-Z]+|.)/.exec(tex.slice(i))
      cur += m[0]
      i += m[0].length - 1
      continue
    }
    if (ch === "{") depth++
    if (ch === "}") depth--
    if (ch === "=" && depth === 0) {
      out.push({ rel, piece: cur })
      rel = "="
      cur = ""
      continue
    }
    cur += ch
  }
  out.push({ rel, piece: cur })
  return out
}

// "a=b=c\Rightarrow x=d" → aligned rows, one step per row.
function rowsOf(toks, lhs) {
  const rows = []
  let row = lhs
  let hasAmp = false
  for (const t of toks.slice(1)) {
    if (t.rel === "=") {
      if (!hasAmp) {
        row += ` &= ${t.piece}`
        hasAmp = true
      } else {
        rows.push(row)
        row = `&= ${t.piece}`
      }
    } else {
      rows.push(hasAmp ? row : `& ${row}`)
      row = `\\Rightarrow ${t.piece}`
      hasAmp = false
    }
  }
  rows.push(hasAmp ? row : `& ${row}`)
  // Drop empty leading rows ("$\\Rightarrow x=1$") and repeated results ("=\\frac{9}{10}=\\frac{9}{10}").
  const val = (r) => r.replace(/^.*?&=?/, "").trim()
  return rows.filter((r, i) => r.replace(/[&\s]/g, "") !== "" && !(i > 0 && r.startsWith("&=") && val(r) === val(rows[i - 1])))
}

const isBlock = (l) => /^\s*(\||\[fig |\$\$|---)/.test(l)
const display = (rows) => `$$\\begin{aligned}${rows.join("\\\\")}\\end{aligned}$$`

// Rewrites one compact line into vertical steps: equation chains become
// aligned display math, "; " and "। " start new lines, units stay attached.
function vertLine(line) {
  if (isBlock(line)) return [line]
  const segs = line.split(/(\$[^$]+\$)/g).filter((s) => s !== "")
  const out = []
  let buf = ""
  let last = null // the display block that may still take a unit / "= x"
  let prevMath = false
  const flush = () => {
    const t = buf.trim()
    if (t) out.push(t)
    buf = ""
  }
  for (let seg of segs) {
    if (seg.startsWith("$") && seg.endsWith("$") && seg.length > 1) {
      const tex = seg.slice(1, -1)
      const toks = tex.includes("\\begin") ? [{ piece: tex }] : splitTop(tex)
      if (toks.length >= 3) {
        let lhs = toks[0].piece
        if (!lhs.trim()) {
          const m = /([^;।:,()*]*)$/.exec(buf)
          const tail = m[1].trim()
          if (tail && tail.length <= 40) {
            // "$n$-তম পদ" → n\text{-তম পদ}
            lhs = tail
              .split(/(\$[^$]+\$)/g)
              .filter(Boolean)
              .map((t) => (t.startsWith("$") ? t.slice(1, -1) : `\\text{${t}}`))
              .join("")
            buf = buf.slice(0, buf.length - m[1].length)
          }
        }
        if (last && !lhs.trim() && !buf.trim()) {
          // continues the previous chain, e.g. "…=81=3^4$\n$\\Rightarrow n-1=4"
          last.rows.push(...rowsOf(toks, lhs))
        } else {
          flush()
          last = { rows: rowsOf(toks, lhs) }
          out.push(last)
        }
      } else if (last && toks.length === 2 && !toks[0].piece.trim() && !buf.trim()) {
        last.rows.push(`&= ${toks[1].piece}`)
      } else {
        buf += seg
        last = null
      }
      prevMath = true
      continue
    }
    // text segment
    if (last) {
      const m = /^([^;।,$]*)/.exec(seg)
      const unit = m[1].trim()
      if (unit && unit.length <= 16) {
        last.rows[last.rows.length - 1] += `\\ \\text{${unit}}`
        seg = seg.slice(m[0].length)
      } else if (unit) last = null
    }
    if (prevMath) seg = seg.replace(/^\s*,\s*/, "\n")
    seg = seg.replace(/;\s*/g, "\n").replace(/।\s*/g, "।\n").replace(/\s*([①-⑳])/g, "\n$1")
    const parts = seg.split("\n")
    buf += parts[0]
    for (const p of parts.slice(1)) {
      flush()
      last = null
      buf = p
    }
    if (buf.trim()) last = null
    prevMath = false
  }
  flush()
  return out.map((x) => (typeof x === "string" ? x : display(x.rows)))
}

export const vert = (text) =>
  text
    .split("\n")
    .flatMap(vertLine)
    .filter((l) => l.trim() !== "")
    .join("\n")

// ─────────────── "কোনটা কী ধরবে" legend ───────────────
const mathOf = (s) => (s.match(/\$\$?[^$]+\$?\$/g) ?? []).join(" ")
const strip = (tex) =>
  tex
    .replace(/\\(text|operatorname|mathbb)\{[^}]*\}/g, " ")
    .replace(/\\[a-zA-Z]+/g, " ")
const sym = (s) => {
  const esc = s.replace(/[\\^$.*+?()[\]{}|]/g, "\\$&")
  const re = new RegExp(`(^|[^A-Za-z_])${esc}(?![A-Za-z])`)
  return (c) => re.test(c.stripped)
}
const raw = (s) => (c) => c.tex.includes(s)
const word = (s) => (c) => c.text.includes(s)

const DICT = {
  m17: [
    [sym("L"), "$L$ = নির্দিষ্ট শ্রেণির (মধ্যক/প্রচুরক শ্রেণির) প্রকৃত নিম্নসীমা = নিম্নসীমা $-\\,0.5$"],
    [sym("n"), "$n$ = মোট গণসংখ্যা ($\\sum f$) বা উপাত্তের মোট সংখ্যা"],
    [sym("F_c"), "$F_c$ = মধ্যক শ্রেণির ঠিক আগের শ্রেণির ক্রমযোজিত গণসংখ্যা"],
    [sym("f_m"), "$f_m$ = মধ্যক শ্রেণির গণসংখ্যা"],
    [sym("f_1"), "$f_1$ = প্রচুরক শ্রেণির গণসংখ্যা $-$ আগের শ্রেণির গণসংখ্যা"],
    [sym("f_2"), "$f_2$ = প্রচুরক শ্রেণির গণসংখ্যা $-$ পরের শ্রেণির গণসংখ্যা"],
    [sym("h"), "$h$ = শ্রেণিব্যবধান (প্রতি শ্রেণিতে কয়টি মান)"],
    [sym("a"), "$a$ = আনুমানিক গড় (মাঝের দিকের যেকোনো শ্রেণির মধ্যমান)"],
    [sym("x_i"), "$x_i$ = শ্রেণি মধ্যমান $=\\frac{\\text{নিম্নসীমা}+\\text{উচ্চসীমা}}{2}$"],
    [sym("f_i"), "$f_i$ = ওই শ্রেণির গণসংখ্যা"],
    [sym("u_i"), "$u_i$ = ধাপ বিচ্যুতি $=\\frac{x_i-a}{h}$"],
    [raw("\\bar"), "$\\bar x$ = গাণিতিক গড়"],
    [raw("\\sum"), "$\\sum$ = সবগুলোর যোগফল"],
  ],
  m9: [
    [raw("\\theta"), "$\\theta$ = যে সূক্ষ্মকোণের অনুপাত চাওয়া হয়েছে"],
    [word("লম্ব"), "লম্ব = $\\theta$ কোণের বিপরীত বাহু"],
    [word("ভূমি"), "ভূমি = $\\theta$ কোণ ও সমকোণের মাঝের বাহু"],
    [word("অতিভুজ"), "অতিভুজ = সমকোণের বিপরীত বাহু (সবচেয়ে বড়)"],
    [sym("k"), "$k$ = সমানুপাতিক ধ্রুবক (যেকোনো ধনাত্মক সংখ্যা)"],
  ],
  m2: [
    [sym("U"), "$U$ = সার্বিক সেট (সব উপাদান)"],
    [raw("\\cup"), "$\\cup$ = সংযোগ: যেকোনো একটিতে থাকলেই নেবে"],
    [raw("\\cap"), "$\\cap$ = ছেদ: দুটিতেই থাকতে হবে"],
    [raw("\\setminus"), "$A\\setminus B$ = $A$-তে আছে কিন্তু $B$-তে নেই"],
    [raw("'"), "$A'$ = পূরক সেট: $U$ থেকে $A$-এর উপাদান বাদ"],
    [raw("n("), "$n(A)$ = সেট $A$-এর উপাদান সংখ্যা"],
    [raw("\\emptyset"), "$\\emptyset$ = ফাঁকা সেট (কোনো উপাদান নেই)"],
    [raw("\\mathbb{N}"), "$\\mathbb{N}$ = স্বাভাবিক সংখ্যার সেট $\\{1, 2, 3, \\dots\\}$"],
    [raw("A\\times B"), "$A\\times B$ = কার্তেসীয় গুণজ: সব ক্রমজোড় $(a, b)$"],
  ],
  m10: [
    [sym("h"), "$h$ = উচ্চতা (সমকোণী ত্রিভুজের লম্ব)"],
    [sym("d"), "$d$ = ভূমি বরাবর দূরত্ব (সমকোণী ত্রিভুজের ভূমি)"],
    [sym("x"), "$x$ = অজানা ভূমি-দূরত্ব (কাছের বিন্দু থেকে পাদদেশ)"],
    [raw("\\theta"), "$\\theta$ = উন্নতি/অবনতি কোণ"],
  ],
  m11: [
    [sym("k"), "$k$ = সাধারণ গুণক (অনুপাতের প্রতিটি পদকে $k$ দিয়ে গুণ)"],
    [sym("m"), "$m$ = সাধারণ গুণক"],
  ],
  m13: [
    [sym("a"), "$a$ = প্রথম পদ"],
    [sym("d"), "$d$ = সাধারণ অন্তর (পরের পদ $-$ আগের পদ)"],
    [sym("r"), "$r$ = সাধারণ অনুপাত (পরের পদ $\\div$ আগের পদ)"],
    [sym("n"), "$n$ = পদসংখ্যা (কততম পদ)"],
    [sym("l"), "$l$ = শেষ পদ"],
    [raw("S_n"), "$S_n$ = প্রথম $n$টি পদের সমষ্টি"],
  ],
  m16: [
    [sym("s"), "$s$ = অর্ধপরিসীমা $=\\frac{a+b+c}{2}$"],
    [sym("r"), "$r$ = ব্যাসার্ধ"],
    [sym("h"), "$h$ = উচ্চতা"],
    [raw("\\pi"), "$\\pi\\approx3.1416$"],
  ],
}

// Builds the legend lines for the symbols used in `text` (plus `context`, e.g. the question).
export function legend(ch, text, context = "") {
  const all = `${context}\n${text}`
  const tex = mathOf(all)
  const c = { tex, stripped: strip(tex), text: all }
  return (DICT[ch] ?? []).filter(([test]) => test(c)).map(([, line]) => line)
}

export const withLegend = (body, lines) =>
  lines.length ? `${body}\n---\n**কোনটা কী ধরবে:**\n${lines.join("\n")}` : body
