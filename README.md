# CSV Mapper

A browser-based tool for remapping CSV columns from a source file into a target schema. Upload two CSVs, visually map columns, set defaults, compute derived values, and download the converted result.

Built for traders who need to reformat broker exports into trading journal import formats (e.g., WaveGod AI), but works for any CSV-to-CSV transformation.

**No backend. No login. Runs entirely in your browser.**

---

## Features

- **Drag-and-drop upload** with real-time CSV validation
- **Auto-suggest mappings** by matching column names (case-insensitive)
- **Default values** — literal strings applied to every row
- **Auto-increment** — sequential numbering with configurable start and step
- **Date + Days computation** — combine a date column with a duration column (e.g., `"2 DAYS"`, `"20 HRS"`) to compute exit dates
- **Live preview** — see the first 5 rows of output update as you change mappings
- **Timestamped export** — download the converted CSV with a descriptive filename
- **Status indicators** — green (mapped), yellow (has default), red (unmapped) per column
- Supports `YYYY-MM-DD` and `M/D/YYYY` date formats
- Standalone `-` values in source data are treated as empty cells

---

## Quick Start

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

Open `http://localhost:5173/csv-mapper/` in your browser.

---

## Usage

### 1. Upload

Upload a **Source CSV** (your data) and a **Target CSV** (the schema you want to convert to). The target only needs headers — data rows are optional.

Both files are validated for:
- Non-empty content
- Consistent column counts across all rows
- No duplicate column names

### 2. Map Columns

Click **"Configure Mapping"** to open the mapping table. For each target column, choose one of:

| Mode | Description |
|------|-------------|
| **Source column** | Pull values directly from a source column |
| **Default value** | Apply a fixed string to every row |
| **Auto-increment** | Generate sequential numbers (start + step) |
| **Date + Days** | Compute a date by adding a duration column to a date column |

Columns with matching names are auto-mapped on load.

### 3. Export

Review the live preview, then click **"Download"**. The output CSV matches the target schema with source data remapped according to your configuration.

---

## Example: Trading Journal Import

**Source** (broker export):
```csv
Date,Symbol,Side,Entry,Exit,Hold
3/27/2026,VIK,LONG,$74.80,$69.00,2 DAYS
3/25/2026,BKV,LONG,$30.10,-,
```

**Target** (WaveGod AI schema):
```csv
symbol,side,entry_price,exit_price,entry_date,exit_date
```

**Mapping configuration:**
- `symbol` ← Source: `Symbol`
- `side` ← Source: `Side`
- `entry_price` ← Source: `Entry`
- `exit_price` ← Source: `Exit` (standalone `-` becomes empty)
- `entry_date` ← Source: `Date`
- `exit_date` ← Date + Days: `Date` + `Hold` (blank hold = empty cell)

**Output:**
```csv
symbol,side,entry_price,exit_price,entry_date,exit_date
VIK,LONG,$74.80,$69.00,3/27/2026,2026-03-29
BKV,LONG,$30.10,,3/25/2026,
```

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | TypeScript compile + Vite production build |
| `npm run preview` | Preview the production build locally |
| `npm run test` | Run Vitest in watch mode |
| `npm run test:run` | Run all tests once (CI) |
| `npm run typecheck` | Type-check without emitting files |
| `npm run deploy` | Build and deploy to GitHub Pages |

---

## Tech Stack

- **React 18** + **TypeScript**
- **Vite** — build tooling and dev server
- **Papa Parse** — CSV parsing and generation
- **CSS Modules** — scoped component styling, no UI library
- **Vitest** + **React Testing Library** — 52 tests covering utils and components
- **gh-pages** — GitHub Pages deployment

---

## Project Structure

```
src/
├── components/
│   ├── CsvDropZone.tsx          Drag-and-drop file input
│   ├── ValidationStatus.tsx     Error/success display per file
│   ├── FileUploader.tsx         Upload widget (drop zone + validation)
│   ├── MappingTable.tsx         Target column mapping table
│   ├── MappingRow.tsx           Single mapping row with all controls
│   ├── PreviewTable.tsx         Live output preview (first 5 rows)
│   └── ExportButton.tsx         Generate and download converted CSV
├── utils/
│   ├── csvParser.ts             Parse + validate CSV files
│   ├── csvExporter.ts           Build converted CSV + trigger download
│   └── datePlusDays.ts          Date + duration computation
├── types.ts                     Shared TypeScript types
├── App.tsx                      App shell and state management
├── index.css                    Global styles and CSS variables
└── main.tsx                     Entry point
```

---

## Deployment

The app deploys to GitHub Pages at `https://<username>.github.io/csv-mapper/`.

```bash
# One-command deploy
npm run deploy
```

To change the base path (e.g., for a different repo name), update `base` in `vite.config.ts`:

```typescript
export default defineConfig({
  base: '/your-repo-name/',
  // ...
});
```

---

## Architecture Notes

**State management** — All state lives in `App.tsx` (`useState`). No external state library. The two-step flow (upload → mapping) is a simple discriminated union.

**Cell resolution priority** — When generating output, each cell is resolved in order:
1. Mapped source column value (standalone `-` → empty)
2. Date + Days computation
3. Auto-increment interval
4. Literal default value

This priority is identical in both `csvExporter.ts` and `PreviewTable.tsx`, ensuring the preview always matches the export.

**Date parsing** — Handles both `YYYY-MM-DD` and `M/D/YYYY` formats. All date math uses `Date.UTC` to avoid timezone drift. Duration strings support `DAYS`, `DAY`, `HRS`, `HR`, and bare numbers.
