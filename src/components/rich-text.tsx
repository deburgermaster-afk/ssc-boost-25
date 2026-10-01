import { memo } from "react"
import katex from "katex"
import { bn } from "@/lib/content"

// Renders content text: `$…$` is KaTeX math, `**…**` is bold, "\n" breaks the
// line. Digits are shown as Bangla numerals both in text and inside math.
function render(tex: string) {
  return katex.renderToString(bn(tex), { throwOnError: false, strict: false, output: "html" })
}

function Inline({ text }: { text: string }) {
  return text.split(/(\$[^$]+\$)/g).map((part, i) =>
    part.startsWith("$") && part.endsWith("$") && part.length > 1 ? (
      <span key={i} dangerouslySetInnerHTML={{ __html: render(part.slice(1, -1)) }} />
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

export const RichText = memo(function RichText({ text, className }: { text: string; className?: string }) {
  const lines = text.split("\n")
  return (
    <span className={className}>
      {lines.map((l, i) => (
        <span key={i}>
          {i > 0 && <br />}
          <Inline text={l} />
        </span>
      ))}
    </span>
  )
})
