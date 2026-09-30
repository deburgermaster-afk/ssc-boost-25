# SSC Boost 25 — বাংলা ১ম পত্র MCQ

Mobile-first practice app for SSC বাংলা ১ম পত্র (Class 9–10 *মাধ্যমিক বাংলা সাহিত্য*), covering only the
32 chapters highlighted for the exam (17 গদ্য + 15 কবিতা).

- **500 MCQs** per run, drawn at random from a pool of 617 (সাধারণ, বহুপদী সমাপ্তিসূচক, অভিন্ন তথ্যভিত্তিক).
  Forward-only, no feedback until the end.
- **Break after every 50 MCQs**: 30 জ্ঞানমূলক (ক) + 10 অনুধাবনমূলক (খ) with answers shown — 300 ক + 100 খ in total.
- **Progress saved per device** in Postgres (Neon); refreshing resumes exactly where you left off.
- **Done screen** with score and a review of wrong answers.
- **Admin** at `/admin` (username `admin`, password `admin`) — device count, progress and scores.

## Content

- `book/full.txt` — OCR text of the NCTB book (Tesseract, Bangla), `book/chapters/*.txt` — per chapter.
- `content/<chapter>.txt` — the questions, one per line (format documented in `scripts/build-content.mjs`).
- `npm run content` regenerates `src/data/mcq.json` and `src/data/short.json`.

## Run locally

```bash
npm install
echo 'DATABASE_URL=postgres://...' > .env.local
npm run dev
```

Schema (`schema.sql`) must exist in the database.
