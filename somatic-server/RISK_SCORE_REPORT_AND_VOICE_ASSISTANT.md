# Risk-Score Report + Voice Assistant

This note documents the feature added on top of the existing SOMATIC
mastitis-risk pipeline: a plain-language report for every risk score, and a
voice assistant that reads it aloud in an Indian accent.

## What was added

### Backend (`somatic-server`)

| File | What it does |
|---|---|
| `src/services/report/riskScoreReportService.js` | **New.** Pure function that maps any 0–100 risk score to one of 5 bands (Very Low 0–20, Low 21–40, Moderate 41–60, High 61–80, Very High 81–100) and returns the Risk Level, a plain-language summary, a Recommendation title + action checklist, and an optional clinical note. It deliberately **excludes** the illustrative sample sensor patterns ("EC → elevated", "pH → elevated", "Temp → abnormal", "Yield → reduced") from the source spec — those are documentation-only examples, not derived from the cow's real reading, so they are never reproduced in a generated report. |
| `src/controllers/reportController.js` | **Edited.** Added `getRiskScoreReport` (`GET /api/reports/risk-score/:score`) and `getRiskScoreGuide` (`GET /api/reports/risk-score-guide`, one example report per band). |
| `src/routes/reportRoutes.js` | **Edited.** Registered the two new routes (literal path before the `:score` param route, so `/risk-score-guide` is never swallowed by `/risk-score/:score`). |
| `src/services/report/reportService.js` | **Edited.** The full test report (`GET /api/reports/tests/:testId`) now also includes a `riskScoreReport` field generated from `test.riskResult.score`, guarded so a test with no score yet returns `null` instead of throwing. |

### Frontend (`somatic-frontend`)

| File | What it does |
|---|---|
| `src/api/reportService.js` | **Edited.** Added `getRiskScoreReport(score)` / `getRiskScoreGuide()`, and removed a stale comment that incorrectly said `/api/reports` wasn't mounted (it is, in `src/app.js`). |
| `src/components/VoiceAssistant.jsx` | **New.** A button that reads any given text aloud using the browser's built-in Speech Synthesis API. Defaults to an **Indian-English accent** (`lang: "en-IN"`) and picks an Indian-sounding voice when one is installed, falling back gracefully otherwise. It also speaks Hindi/Bengali/Assamese with their Indian locale codes when that's the active app language. |
| `src/utils/riskScoreReport.js` | **New.** Swaps the backend's English report text for the translated version matching the farmer's selected app language (via i18next), and builds the single string the voice assistant reads aloud. |
| `src/components/RiskScoreReportPanel.jsx` | **New.** Renders the Risk Level, summary, recommendation checklist, and clinical note for the cow's score, with the Voice Assistant button next to the heading. |
| `src/pages/TestResult.jsx` | **Edited.** Fetches the risk-score report once the test result's score is known, and renders `RiskScoreReportPanel` right under the risk summary. |
| `src/i18n/i18n.js` | **Edited.** Added a `riskScoreReport` translation block (per band: risk level, summary, recommendation title, actions, clinical note) plus voice-assistant strings, for English and Hindi. Bengali/Assamese automatically fall back to the English text via i18next's `fallbackLng`, so nothing breaks if those aren't translated yet. |
| `src/styles/global.css` | **Edited.** Small styles for the new panel (colour-coded left border per risk band) and the voice-assistant button. |

## How a report is generated

1. A test completes → `riskEngine.js` computes `test.riskResult.score` (0–100), as before — untouched.
2. `TestResult.jsx` reads that score from `GET /tests/:testId/result` (existing endpoint, untouched).
3. It calls the **new** `GET /reports/risk-score/:score`, which runs the score through `riskScoreReportService.js` and returns the Risk Level + Recommendation for that exact score — never a hard-coded example.
4. `RiskScoreReportPanel` renders it, localized into the farmer's selected language.
5. Tapping "Read report aloud" (`VoiceAssistant.jsx`) speaks that localized text using an Indian-accented voice.

## Verified

- `node --check` passed on every new/edited backend file.
- Boundary-tested the score bands (`-10, 0, 20, 21, 40, 41, 60, 61, 80, 81, 100, 137, "55", "abc", null, undefined`) — no gaps, no overlaps, no crashes; out-of-range scores are clamped instead of throwing.
- `esbuild` syntax-checked every new/edited frontend file.
- A full `vite build` of `somatic-frontend` completed with 0 errors after these changes.
