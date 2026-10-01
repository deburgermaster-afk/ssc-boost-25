// Builds src/data/bangla/{mcq,short,cq}.json from content/*.txt.
//
// One item per line, fields separated by " | ":
//   M question | opt ক | opt খ | opt গ | opt ঘ | answer(ক/খ/গ/ঘ)       সাধারণ MCQ
//   B stem | i | ii | iii | answer(ক/খ/গ/ঘ)                          বহুপদী সমাপ্তিসূচক
//   P passage                                     starts an অভিন্ন তথ্যভিত্তিক group;
//   PM … / PB …                                   following M/B lines that use it
//   K question | answer                          জ্ঞানমূলক (ক)
//   H question | answer                          অনুধাবনমূলক (খ)
//   C উদ্দীপক | ক q | ক a | খ q | খ a | গ q | গ a | ঘ q | ঘ a | connection   সৃজনশীল
// "\n" inside a field becomes a line break. Lines starting with # are comments.
import fs from "node:fs"

const chapters = JSON.parse(fs.readFileSync("src/data/bangla/chapters.json", "utf8"))
const L = ["ক", "খ", "গ", "ঘ"]
const MULTI = ["i ও ii", "i ও iii", "ii ও iii", "i, ii ও iii"]
const mcq = []
const short = []
const cq = []
const errors = []

// Small deterministic PRNG so the break order is stable between builds.
let seed = 20250101
const rand = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648)
const shuffle = (a) => {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

for (const ch of chapters) {
  const file = `content/${ch.id}.txt`
  if (!fs.existsSync(file)) {
    errors.push(`missing ${file}`)
    continue
  }
  let passage
  const extra = `content/${ch.id}.cq.txt`
  ;(fs.readFileSync(file, "utf8") + "\n" + (fs.existsSync(extra) ? fs.readFileSync(extra, "utf8") : ""))
    .split("\n")
    .forEach((raw, ln) => {
      const line = raw.trim()
      if (!line || line.startsWith("#")) return
      const sp = line.indexOf(" ")
      const tag = line.slice(0, sp)
      const f = line.slice(sp + 1).split(" | ").map((s) => s.trim().replaceAll("\\n", "\n"))
      const where = `${file}:${ln + 1}`
      const ans = (x) => {
        const i = L.indexOf(x)
        if (i < 0) errors.push(`${where}: bad answer "${x}"`)
        return i
      }
      if (tag === "P") passage = f.join(" | ")
      else if (tag === "M" || tag === "PM") {
        if (f.length !== 6) return errors.push(`${where}: M needs 6 fields, got ${f.length}`)
        // Authoring puts the answer anywhere; shuffle so ক/খ/গ/ঘ are evenly used.
        const order = shuffle([0, 1, 2, 3])
        const a = ans(f[5])
        mcq.push({
          ch: ch.id,
          type: tag === "M" ? "সাধারণ" : "অভিন্ন",
          ...(tag === "PM" && { passage }),
          q: f[0],
          opts: order.map((i) => f[1 + i]),
          a: order.indexOf(a),
        })
      } else if (tag === "B" || tag === "PB") {
        if (f.length !== 5) return errors.push(`${where}: B needs 5 fields, got ${f.length}`)
        mcq.push({
          ch: ch.id,
          type: tag === "B" ? "বহুপদী" : "অভিন্ন",
          ...(tag === "PB" && { passage }),
          q: `${f[0]}\ni. ${f[1]}\nii. ${f[2]}\niii. ${f[3]}\nনিচের কোনটি সঠিক?`,
          opts: MULTI,
          a: ans(f[4]),
        })
      } else if (tag === "K" || tag === "H") {
        if (f.length !== 2) return errors.push(`${where}: ${tag} needs 2 fields, got ${f.length}`)
        short.push({ ch: ch.id, kind: tag === "K" ? "ক" : "খ", q: f[0], a: f[1] })
      } else if (tag === "C") {
        if (f.length !== 10) return errors.push(`${where}: C needs 10 fields, got ${f.length}`)
        const [stem, kaQ, kaA, khaQ, khaA, gaQ, gaA, ghaQ, ghaA, link] = f
        cq.push({ ch: ch.id, stem, parts: [[kaQ, kaA], [khaQ, khaA], [gaQ, gaA], [ghaQ, ghaA]], link })
      } else errors.push(`${where}: unknown tag "${tag}"`)
    })
}

// Everything is chapter-wise: MCQs run chapter by chapter, and each break's
// ক/খ/সৃজনশীল slices follow the same chapter order, so a break revisits the
// chapters that were just practised.
const TOTALS = { mcq: 500, ka: 300, kha: 100, cq: 100 }

// Largest-remainder split of `total` across chapters, capped by what each has.
function allocate(avail, total) {
  const sum = avail.reduce((a, b) => a + b, 0)
  if (sum < total) errors.push(`need ${total}, only ${sum} available`)
  const raw = avail.map((n) => (n * total) / sum)
  const out = raw.map(Math.floor)
  const order = raw.map((r, i) => [r - out[i], i]).sort((a, b) => b[0] - a[0])
  for (let k = 0, left = total - out.reduce((a, b) => a + b, 0); left > 0 && k < order.length * (total + 1); k++) {
    const i = order[k % order.length][1]
    if (out[i] < avail[i]) (out[i]++, left--)
  }
  return out
}

// Drop surplus plain MCQs evenly (passage/বহুপদী items are always kept).
function trim(items, keep) {
  let drop = items.length - keep
  const plain = items.map((q, i) => (q.type === "সাধারণ" ? i : -1)).filter((i) => i >= 0)
  const gone = new Set()
  for (let k = 0; drop > 0 && k < plain.length; k++, drop--) gone.add(plain[Math.floor((k * plain.length) / (items.length - keep))])
  return items.filter((_, i) => !gone.has(i))
}

const byCh = (arr) => chapters.map((c) => arr.filter((x) => x.ch === c.id))
const pick = (groups, total) => {
  const quota = allocate(groups.map((g) => g.length), total)
  return groups.map((g, i) => g.slice(0, quota[i]))
}

const mcqGroups = byCh(mcq)
const mcqQuota = allocate(mcqGroups.map((g) => g.length), TOTALS.mcq)
const mcqOut = mcqGroups.flatMap((g, i) => shuffle(trim(g, mcqQuota[i])))
mcqOut.forEach((m, i) => (m.id = i + 1))

const kaOut = pick(byCh(short.filter((s) => s.kind === "ক")), TOTALS.ka).flat()
const khaOut = pick(byCh(short.filter((s) => s.kind === "খ")), TOTALS.kha).flat()
const shortOut = [...kaOut, ...khaOut]
shortOut.forEach((s, i) => (s.id = i + 1))
const cqOut = pick(byCh(cq), TOTALS.cq).flat()
cqOut.forEach((c, i) => (c.id = i + 1))

const count = (arr, key) => arr.reduce((o, x) => ((o[x[key]] = (o[x[key]] ?? 0) + 1), o), {})
console.log("MCQ:", mcqOut.length, "of", mcq.length, count(mcqOut, "type"))
console.log("ক:", kaOut.length, "খ:", khaOut.length, "CQ:", cqOut.length, "of", cq.length)
console.log("MCQ per chapter:", JSON.stringify(count(mcqOut, "ch")))
console.log("CQ per chapter:", JSON.stringify(count(cq, "ch")))
if (mcqOut.length !== TOTALS.mcq || kaOut.length !== TOTALS.ka || khaOut.length !== TOTALS.kha || cqOut.length !== TOTALS.cq)
  errors.push("totals do not match")
if (errors.length) {
  console.error(errors.join("\n"))
  process.exit(1)
}
fs.writeFileSync("src/data/bangla/mcq.json", JSON.stringify(mcqOut))
fs.writeFileSync("src/data/bangla/short.json", JSON.stringify(shortOut))
fs.writeFileSync("src/data/bangla/cq.json", JSON.stringify(cqOut))
