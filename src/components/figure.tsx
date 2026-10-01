// Small SVG geometry figures for math explanations. Specs come from
// `[fig {...}]` lines in the content (see scripts/math-format.mjs).
import { bn } from "@/lib/content"

type Spec = Record<string, string | number | boolean | string[] | undefined> & { t: string }

const W = 260
const H = 150

function Label({ x, y, children, anchor = "middle" }: { x: number; y: number; children?: unknown; anchor?: "start" | "middle" | "end" }) {
  if (children === undefined || children === "" || children === false) return null
  return (
    <text x={x} y={y} textAnchor={anchor} dominantBaseline="middle" fontSize={12} fill="currentColor" stroke="none">
      {bn(String(children))}
    </text>
  )
}

// Angle arc at (cx, cy) from angle a0 to a1 (degrees, SVG y-down so positive = counter-clockwise on screen).
function Arc({ cx, cy, r, a0, a1 }: { cx: number; cy: number; r: number; a0: number; a1: number }) {
  const p = (a: number) => [cx + r * Math.cos((a * Math.PI) / 180), cy - r * Math.sin((a * Math.PI) / 180)]
  const [x0, y0] = p(a0)
  const [x1, y1] = p(a1)
  return <path d={`M${x0},${y0} A${r},${r} 0 0 0 ${x1},${y1}`} fill="none" />
}

const deg = (dx: number, dy: number) => (Math.atan2(-dy, dx) * 180) / Math.PI

function RightTriangle(s: Spec) {
  // C (angle θ) bottom-left, B (90°) bottom-right, A top-right.
  const C = [25, 125]
  const B = [172, 125]
  const A = [172, 25]
  const pts = (s.pts as string[]) ?? []
  const hyp = deg(A[0] - C[0], A[1] - C[1])
  return (
    <>
      {s.wall && <path d="M172,15 L172,130 M172,20 l8,-6 M172,40 l8,-6 M172,60 l8,-6 M172,80 l8,-6 M172,100 l8,-6 M172,120 l8,-6" strokeWidth={1} />}
      <line x1={10} y1={125} x2={235} y2={125} strokeWidth={1} />
      <polygon points={`${C} ${B} ${A}`} fill="none" strokeWidth={s.tree ? 1.5 : 1.6} strokeDasharray={undefined} />
      {s.tree && <line x1={A[0]} y1={A[1]} x2={C[0]} y2={C[1]} strokeWidth={2.5} />}
      <path d={`M${B[0] - 10},${B[1]} L${B[0] - 10},${B[1] - 10} L${B[0]},${B[1] - 10}`} fill="none" strokeWidth={1} />
      <Arc cx={C[0]} cy={C[1]} r={22} a0={0} a1={hyp} />
      <Label x={C[0] + 34} y={C[1] - 8}>{s.ang}</Label>
      <Label x={B[0] + (s.wall ? 14 : 8)} y={(A[1] + B[1]) / 2} anchor="start">{s.a}</Label>
      <Label x={(B[0] + C[0]) / 2} y={B[1] + 14}>{s.b}</Label>
      <Label x={(A[0] + C[0]) / 2 - 8} y={(A[1] + C[1]) / 2 - 10} anchor="end">{s.c}</Label>
      <Label x={A[0]} y={A[1] - 10}>{pts[0]}</Label>
      <Label x={B[0] + 10} y={B[1] + 12}>{pts[1]}</Label>
      <Label x={C[0] - 10} y={C[1] + 12}>{pts[2]}</Label>
    </>
  )
}

function Elevation(s: Spec) {
  if (s.down) {
    // Observer on a building (left) looking down at a point on the ground (right).
    const T = [50, 30]
    const P = [215, 125]
    const a = deg(P[0] - T[0], P[1] - T[1])
    return (
      <>
        <line x1={10} y1={125} x2={240} y2={125} strokeWidth={1} />
        <rect x={30} y={30} width={20} height={95} fill="none" />
        <line x1={T[0]} y1={T[1]} x2={235} y2={T[1]} strokeDasharray="4 3" strokeWidth={1} />
        <line x1={T[0]} y1={T[1]} x2={P[0]} y2={P[1]} />
        <Arc cx={T[0]} cy={T[1]} r={30} a0={a} a1={0} />
        <Label x={T[0] + 44} y={T[1] + 12} anchor="start">{s.ang}</Label>
        <Label x={24} y={78} anchor="end">{s.h}</Label>
        <Label x={(T[0] + P[0]) / 2} y={139}>{s.d}</Label>
        <circle cx={P[0]} cy={P[1]} r={2.5} fill="currentColor" />
      </>
    )
  }
  const O = [30, 125]
  const X = 200
  const top = 28
  const a = deg(X - O[0], top - O[1])
  return (
    <>
      <line x1={10} y1={125} x2={240} y2={125} strokeWidth={1} />
      {s.obj === "tree" ? (
        <>
          <line x1={X} y1={125} x2={X} y2={top + 18} strokeWidth={3} />
          <circle cx={X} cy={top + 14} r={14} fill="none" />
        </>
      ) : s.obj === "pole" ? (
        <line x1={X} y1={125} x2={X} y2={top} strokeWidth={3} />
      ) : (
        <rect x={X - 8} y={top} width={16} height={125 - top} fill="none" />
      )}
      <line x1={O[0]} y1={O[1]} x2={X} y2={top} strokeDasharray="4 3" />
      <Arc cx={O[0]} cy={O[1]} r={26} a0={0} a1={a} />
      <Label x={O[0] + 38} y={O[1] - 9}>{s.ang}</Label>
      <Label x={X + 14} y={(top + 125) / 2} anchor="start">{s.h}</Label>
      <Label x={(O[0] + X) / 2} y={139}>{s.d}</Label>
    </>
  )
}

function Elevation2(s: Spec) {
  const P = [20, 125]
  const Q = [120, 125]
  const X = 220
  const top = 25
  return (
    <>
      <line x1={5} y1={125} x2={250} y2={125} strokeWidth={1} />
      <rect x={X - 6} y={top} width={12} height={125 - top} fill="none" />
      <line x1={P[0]} y1={P[1]} x2={X} y2={top} strokeDasharray="4 3" />
      <line x1={Q[0]} y1={Q[1]} x2={X} y2={top} strokeDasharray="4 3" />
      <Arc cx={P[0]} cy={P[1]} r={24} a0={0} a1={deg(X - P[0], top - P[1])} />
      <Arc cx={Q[0]} cy={Q[1]} r={18} a0={0} a1={deg(X - Q[0], top - Q[1])} />
      <Label x={P[0] + 36} y={P[1] - 7}>{s.a1}</Label>
      <Label x={Q[0] + 28} y={Q[1] - 12}>{s.a2}</Label>
      <Label x={(P[0] + Q[0]) / 2} y={139}>{s.d}</Label>
      <Label x={(Q[0] + X) / 2} y={139}>{s.x}</Label>
      <Label x={X + 12} y={75} anchor="start">{s.h}</Label>
      {s.pts && (
        <>
          <Label x={P[0]} y={113}>P</Label>
          <Label x={Q[0]} y={113}>Q</Label>
          <Label x={X} y={top - 10}>A</Label>
        </>
      )}
    </>
  )
}

function Venn(s: Spec) {
  return (
    <>
      <rect x={8} y={8} width={W - 16} height={H - 16} fill="none" strokeWidth={1} />
      <circle cx={100} cy={78} r={50} fill="none" />
      <circle cx={160} cy={78} r={50} fill="none" />
      <Label x={70} y={20}>{s.A}</Label>
      <Label x={190} y={20}>{s.B}</Label>
      <Label x={78} y={80}>{s.a}</Label>
      <Label x={130} y={80}>{s.ab}</Label>
      <Label x={182} y={80}>{s.b}</Label>
      <Label x={W - 14} y={H - 18} anchor="end">{s.out}</Label>
      <Label x={14} y={H - 18} anchor="start">{s.U}</Label>
    </>
  )
}

function Rect(s: Spec) {
  const sq = !!s.sq
  const [x, y, w, h] = sq ? [80, 25, 100, 100] : [45, 35, 170, 85]
  const path = s.path as string | undefined
  const g = 13
  return (
    <>
      {path === "out" && <rect x={x - g} y={y - g} width={w + 2 * g} height={h + 2 * g} fill="currentColor" fillOpacity={0.08} />}
      {path === "out" && <rect x={x - g} y={y - g} width={w + 2 * g} height={h + 2 * g} fill="none" strokeWidth={1} />}
      <rect x={x} y={y} width={w} height={h} style={{ fill: path === "out" ? "var(--background)" : "none" }} />
      {path === "in" && <rect x={x} y={y} width={w} height={h} fill="currentColor" fillOpacity={0.08} />}
      {path === "in" && <rect x={x + g} y={y + g} width={w - 2 * g} height={h - 2 * g} style={{ fill: "var(--background)" }} strokeWidth={1} />}
      {s.diag && <line x1={x} y1={y + h} x2={x + w} y2={y} strokeDasharray="4 3" />}
      <Label x={x + w / 2} y={y + h + (path === "out" ? g + 10 : 12)}>{s.l}</Label>
      <Label x={x - (path === "out" ? g + 4 : 5)} y={y + h / 2} anchor="end">{s.b}</Label>
      {path && <Label x={x + w + (path === "out" ? 2 : -2)} y={y + (path === "out" ? -g - 6 : g / 2 + 1)} anchor={path === "out" ? "start" : "end"}>{`রাস্তা ${s.w}`}</Label>}
      {s.diag && <Label x={x + w / 2 + 8} y={y + h / 2 - 8} anchor="start">{s.dl ?? "কর্ণ"}</Label>}
    </>
  )
}

function Triangle(s: Spec) {
  const [Ax, Ay] = s.eq ? [130, 26] : [95, 25]
  const Bp = s.eq ? [73, 125] : [35, 125]
  const Cp = s.eq ? [187, 125] : [225, 125]
  return (
    <>
      <polygon points={`${Ax},${Ay} ${Bp} ${Cp}`} fill="none" />
      {s.h && (
        <>
          <line x1={Ax} y1={Ay} x2={Ax} y2={125} strokeDasharray="4 3" />
          <path d={`M${Ax},115 L${Ax + 10},115 L${Ax + 10},125`} fill="none" strokeWidth={1} />
          <Label x={Ax + 6} y={75} anchor="start">{s.h}</Label>
        </>
      )}
      <Label x={(Bp[0] + Cp[0]) / 2 + (s.h ? 20 : 0)} y={139}>{s.b}</Label>
      <Label x={(Ax + Bp[0]) / 2 - 8} y={(Ay + Bp[1]) / 2} anchor="end">{s.c}</Label>
      <Label x={(Ax + Cp[0]) / 2 + 8} y={(Ay + Cp[1]) / 2} anchor="start">{s.a}</Label>
    </>
  )
}

function Trapezium(s: Spec) {
  return (
    <>
      <polygon points="30,120 230,120 175,35 85,35" fill="none" />
      <line x1={85} y1={35} x2={85} y2={120} strokeDasharray="4 3" />
      <path d="M85,110 L95,110 L95,120" fill="none" strokeWidth={1} />
      <Label x={130} y={24}>{s.a}</Label>
      <Label x={130} y={134}>{s.b}</Label>
      <Label x={78} y={80} anchor="end">{s.h}</Label>
    </>
  )
}

function Circle(s: Spec) {
  return (
    <>
      <circle cx={130} cy={75} r={58} fill="none" />
      <circle cx={130} cy={75} r={2.5} fill="currentColor" />
      <line x1={130} y1={75} x2={188} y2={75} />
      <Label x={124} y={86} anchor="end">O</Label>
      <Label x={159} y={66}>{s.r}</Label>
    </>
  )
}

function Rhombus(s: Spec) {
  return (
    <>
      <polygon points="130,12 225,75 130,138 35,75" fill="none" />
      <line x1={35} y1={75} x2={225} y2={75} strokeDasharray="4 3" />
      <line x1={130} y1={12} x2={130} y2={138} strokeDasharray="4 3" />
      <path d="M130,65 L140,65 L140,75" fill="none" strokeWidth={1} />
      <Label x={85} y={66}>{s.d1}</Label>
      <Label x={137} y={110} anchor="start">{s.d2}</Label>
      {s.side && <Label x={186} y={36} anchor="start">{s.side}</Label>}
    </>
  )
}

function Cuboid(s: Spec) {
  const [x, y, w, h, dx, dy] = [40, 50, 130, 80, 45, -32]
  return (
    <>
      <rect x={x} y={y} width={w} height={h} fill="none" />
      <polyline points={`${x},${y} ${x + dx},${y + dy} ${x + w + dx},${y + dy} ${x + w},${y}`} fill="none" />
      <polyline points={`${x + w + dx},${y + dy} ${x + w + dx},${y + h + dy} ${x + w},${y + h}`} fill="none" />
      <polyline points={`${x},${y + h} ${x + dx},${y + h + dy} ${x + dx},${y + dy}`} fill="none" strokeDasharray="3 3" strokeWidth={1} />
      <polyline points={`${x + dx},${y + h + dy} ${x + w + dx},${y + h + dy}`} fill="none" strokeDasharray="3 3" strokeWidth={1} />
      <Label x={x + w / 2} y={y + h + 13}>{s.l}</Label>
      <Label x={x - 6} y={y + h / 2} anchor="end">{s.h}</Label>
      <Label x={x + w + dx / 2 + 8} y={y + h + dy / 2 + 4} anchor="start">{s.w}</Label>
    </>
  )
}

function Cylinder(s: Spec) {
  return (
    <>
      <ellipse cx={130} cy={28} rx={60} ry={13} fill="none" />
      <path d="M70,28 L70,118 M190,28 L190,118" />
      <path d="M70,118 A60,13 0 0 0 190,118" fill="none" />
      <path d="M70,118 A60,13 0 0 1 190,118" fill="none" strokeDasharray="3 3" strokeWidth={1} />
      <line x1={130} y1={28} x2={190} y2={28} />
      <circle cx={130} cy={28} r={2} fill="currentColor" />
      <Label x={160} y={20}>{s.r}</Label>
      <Label x={198} y={75} anchor="start">{s.h}</Label>
    </>
  )
}

const KINDS: Record<string, (s: Spec) => React.ReactNode> = {
  rt: RightTriangle,
  elev: Elevation,
  elev2: Elevation2,
  venn: Venn,
  rect: Rect,
  tri: Triangle,
  trap: Trapezium,
  circle: Circle,
  rhombus: Rhombus,
  cuboid: Cuboid,
  cyl: Cylinder,
}

export function Figure({ spec }: { spec: string }) {
  let s: Spec
  try {
    s = JSON.parse(spec)
  } catch {
    return null
  }
  const Kind = KINDS[s.t]
  if (!Kind) return null
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="my-1 block h-auto w-full max-w-[260px]"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinejoin="round"
      fill="none"
      role="img"
    >
      {Kind(s)}
    </svg>
  )
}
