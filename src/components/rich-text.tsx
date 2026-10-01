import { memo } from "react"
import katex from "katex"
import { Figure } from "@/components/figure"
import { bn } from "@/lib/content"
import { cn } from "@/lib/utils"

// Content text: `$…$` is KaTeX math, `**…**` is bold, "\n" breaks the line.
// Digits are shown as Bangla numerals both in text and inside math.
function tex(src: string, displayMode = false) {
  return katex.renderToString(bn(src), { throwOnError: false, strict: false, output: "html", displayMode })
}

function Inline({ text }: { text: string }) {
  return text.split(/(\$[^$]+\$)/g).map((part, i) =>
    part.startsWith("$") && part.endsWith("$") && part.length > 1 ? (
      <span key={i} dangerouslySetInnerHTML={{ __html: tex(part.slice(1, -1)) }} />
    ) : (
      part.split(/(\*\*[^*]+\*\*)/g).map((t, j) =>
        t.startsWith("**") && t.endsWith("**") ? (
          <strong key={`${i}-${j}`} className="font-bold">
            {bn(t.slice(2, -2))}
          </strong>
        ) : (
          bn(t)
        ),
      )
    ),
  )
}

// Inline-only text (safe inside <p>, <button>).
export const RichText = memo(function RichText({ text, className }: { text: string; className?: string }) {
  return (
    <span className={className}>
      {text.split("\n").map((l, i) => (
        <span key={i}>
          {i > 0 && <br />}
          <Inline text={l} />
        </span>
      ))}
    </span>
  )
})

type Block =
  | { k: "line"; text: string }
  | { k: "table"; rows: string[][] }
  | { k: "fig"; spec: string }
  | { k: "math"; tex: string }
  | { k: "hr" }

function parse(text: string): Block[] {
  const out: Block[] = []
  for (const line of text.split("\n")) {
    const l = line.trim()
    if (l.startsWith("|")) {
      const cells = l
        .replace(/^\||\|$/g, "")
        .split("|")
        .map((c) => c.trim())
      const prev = out[out.length - 1]
      if (prev?.k === "table") prev.rows.push(cells)
      else out.push({ k: "table", rows: [cells] })
    } else if (l.startsWith("[fig ") && l.endsWith("]")) out.push({ k: "fig", spec: l.slice(5, -1) })
    else if (l.startsWith("$$") && l.endsWith("$$") && l.length > 4) out.push({ k: "math", tex: l.slice(2, -2) })
    else if (l === "---") out.push({ k: "hr" })
    else if (l) out.push({ k: "line", text: l })
  }
  return out
}

// Block content: tables, figures, display math, dividers and step-per-line text.
export const RichBlock = memo(function RichBlock({ text, className }: { text: string; className?: string }) {
  return (
    <div className={cn("rich flex flex-col gap-1", className)}>
      {parse(text).map((b, i) => {
        if (b.k === "hr") return <hr key={i} className="my-1.5 border-current opacity-25" />
        if (b.k === "fig") return <Figure key={i} spec={b.spec} />
        if (b.k === "math")
          return (
            <div
              key={i}
              className="overflow-x-auto overflow-y-hidden"
              dangerouslySetInnerHTML={{ __html: tex(b.tex, true) }}
            />
          )
        if (b.k === "table")
          return (
            <div key={i} className="my-1 overflow-x-auto">
              <table className="border-collapse text-[0.88em] leading-tight tabular-nums">
                <tbody>
                  {b.rows.map((r, ri) => (
                    <tr key={ri} className={cn(ri === 0 && "font-semibold")}>
                      {r.map((c, ci) => (
                        <td
                          key={ci}
                          className={cn(
                            "border border-current/25 px-1.5 py-1 text-center whitespace-nowrap",
                            (ri === 0 || ci === 0) && "bg-current/5",
                          )}
                        >
                          <Inline text={c} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        return (
          <div key={i}>
            <Inline text={b.text} />
          </div>
        )
      })}
    </div>
  )
})
