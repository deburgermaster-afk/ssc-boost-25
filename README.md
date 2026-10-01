# SSC Boost 25 — বাংলা ১ম পত্র ও সাধারণ গণিত MCQ

Mobile-first SSC 2025 practice app with two subjects on the home screen. Each subject keeps its own
progress per device in Postgres (Neon); refreshing resumes exactly where you left off.

### বাংলা ১ম পত্র
Class 9–10 *মাধ্যমিক বাংলা সাহিত্য*, only the 32 chapters highlighted for the exam (17 গদ্য + 15 কবিতা).

- **500 MCQs, chapter-wise** (সাধারণ, বহুপদী সমাপ্তিসূচক, অভিন্ন তথ্যভিত্তিক). Forward-only, answers reviewed at the end.
- **Break after every 50 MCQs**: 30 জ্ঞানমূলক (ক) + 10 অনুধাবনমূলক (খ) + 10 সৃজনশীল with গ/ঘ answers and the
  উদ্দীপক ↔ পাঠ্য connection.

### সাধারণ গণিত
Chapters 17 (পরিসংখ্যান), 9, 2, 10, 11, 13, 16 — in that order.

- **500 MCQs, chapter-wise**, with the right answer and a worked explanation shown immediately after each
  answer: one step per line (KaTeX, Bangla numerals), tables, geometry figures (triangles, heights &
  distances, Venn diagrams, shapes and solids) and a "কোনটা কী ধরবে" legend explaining every symbol.
- **Break after every 50 MCQs**: 5 সৃজনশীল, each on one scrollable page with the full worked solution in blue; গ and ঘ include which সূত্র to use, how to
  recognise it, and the easiest way to apply it, plus a step-by-step guide (↓ flow): which formula → the উদ্দীপক with the needed values marked in blue → plug in → answer → how the গ result is used in ঘ.

### Common
- **Done screen** with score and a review of wrong answers.
- **Admin** at `/admin` (username `admin`, password `admin`) — progress and scores per device and subject.

## Content

- `book/full.txt` — OCR text of the NCTB Bangla book (Tesseract), `book/chapters/*.txt` — per chapter.
- `content/<chapter>.txt` (+ `*.cq.txt`) — Bangla questions, one per line (format in `scripts/build-content.mjs`).
- `npm run content` regenerates `src/data/bangla/*.json` and `src/data/math/*.json`
  (math questions are generated with computed answers by `scripts/build-math.mjs`).

## Run locally

```bash
npm install
echo 'DATABASE_URL=postgres://...' > .env.local
npm run dev
```

Schema (`schema.sql`) must exist in the database.
