// Builds src/data/mcq.json and src/data/short.json from content/*.txt.
//
// One item per line, fields separated by " | ":
//   M question | opt ক | opt খ | opt গ | opt ঘ | answer(ক/খ/গ/ঘ)       সাধারণ MCQ
//   B stem | i | ii | iii | answer(ক/খ/গ/ঘ)                          বহুপদী সমাপ্তিসূচক
//   P passage                                     starts an অভিন্ন তথ্যভিত্তিক group;
//   PM … / PB …                                   following M/B lines that use it
//   K question | answer                          জ্ঞানমূলক (ক)
//   H question | answer                          অনুধাবনমূলক (খ)
// "\n" inside a field becomes a line break. Lines starting with # are comments.
import fs from "node:fs"

const chapters = JSON.parse(fs.readFileSync("src/data/chapters.json", "utf8"))
const L = ["ক", "খ", "গ", "ঘ"]
const MULTI = ["i ও ii", "i ও iii", "ii ও iii", "i, ii ও iii"]
const mcq = []
const short = []
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
  fs.readFileSync(file, "utf8")
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
      } else errors.push(`${where}: unknown tag "${tag}"`)
    })
}

mcq.forEach((m, i) => (m.id = i + 1))
const shortOut = [...shuffle(short.filter((s) => s.kind === "ক")), ...shuffle(short.filter((s) => s.kind === "খ"))]
shortOut.forEach((s, i) => (s.id = i + 1))

const count = (arr, key) => arr.reduce((o, x) => ((o[x[key]] = (o[x[key]] ?? 0) + 1), o), {})
console.log("MCQ:", mcq.length, count(mcq, "type"))
console.log("short:", count(short, "kind"))
console.log("per chapter MCQ:", count(mcq, "ch"))
if (errors.length) {
  console.error(errors.join("\n"))
  process.exit(1)
}
fs.writeFileSync("src/data/mcq.json", JSON.stringify(mcq))
fs.writeFileSync("src/data/short.json", JSON.stringify(shortOut))
