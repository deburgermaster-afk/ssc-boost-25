import { RichBlock } from "@/components/rich-text"
import { bn, type GuideStep } from "@/lib/content"
import { cn } from "@/lib/utils"

// Vertical step flow: উদ্দীপক → সূত্র → মান → বসাই → উত্তর → ঘ-তে ব্যবহার.
export function Guide({ steps }: { steps: GuideStep[] }) {
  return (
    <div className="mt-2">
      <p className="mb-1.5 text-[11px] font-semibold text-neutral-500">ধাপে ধাপে বুঝে নাও</p>
      {steps.map((s, i) => (
        <div key={i}>
          {i > 0 && (
            <svg viewBox="0 0 20 22" className="mx-auto my-0.5 block h-5 w-5 text-blue-700" aria-hidden>
              <path d="M10 1 V19 M3 12 L10 20 L17 12" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
          <div className={cn("rounded-md border px-3 py-2 text-neutral-900", i === steps.length - 1 && s.t.includes("ঘ") ? "border-blue-700 bg-blue-50/60" : "border-neutral-300")}>
            <p className="mb-1 flex items-center gap-2 text-[12.5px] font-bold">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-black text-[11px] text-white">{bn(i + 1)}</span>
              {s.t}
            </p>
            <RichBlock text={s.b} className="text-[13px]" />
          </div>
        </div>
      ))}
    </div>
  )
}
