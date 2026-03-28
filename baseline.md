# CSV Mapper — Baseline Plan

## Overview

A React web app that takes two CSV files (source and target), validates them, lets the user map source columns to target columns, set default values for unmapped columns, and exports a converted CSV that reshapes the source data into the target's column structure.

Deployed on GitHub Pages.

---

## Tech Stack

- **React 18** + **TypeScript**
- **Vite** (build tooling, fast dev server, easy GitHub Pages deploy)
- **Papa Parse** — CSV parsing and generation
- **No component library** — plain CSS / CSS modules, keep it minimal
- **gh-pages** npm package for deployment

---

## App Flow

```
Upload Source CSV ──┐
                    ├──► Validate ──► Column Mapping Screen ──► Export Converted CSV
Upload Target CSV ──┘
```

### Step 1 — File Upload

- Two file inputs: "Source CSV" and "Target CSV"
- Accept `.csv` files only
- On upload, parse immediately with Papa Parse

### Step 2 — Validation

Both files must pass:

1. File is non-empty
2. Papa Parse parses without errors
3. First row is treated as headers
4. Every row has the same number of columns as the header row
5. No duplicate column names

Display clear error messages per file if validation fails. Block progression until both are valid.

### Step 3 — Column Mapping Screen

This is the core of the app. The goal: for every **target** column, assign either a **source column** or a **default value**.

#### Layout

A single table/list with one row per **target column**:

```
| Target Column | Mapped Source Column     | Default Value         |
|---------------|-------------------------|-----------------------|
| id            | [dropdown: source cols] | [text input, disabled] |
| name          | [dropdown: source cols] | [text input, disabled] |
| region        | [-- None --]            | [text input, enabled]  |
```

#### Behavior

- Each target column row has:
  - A **dropdown** listing all source columns + a "None" option
  - A **default value text input**
- When a source column is selected, the default value input is **disabled** (source data wins)
- When "None" is selected, the default value input is **enabled** — user types a literal value or leaves blank
- **Default value types:**
  - **Literal** — a fixed string applied to every row (e.g., `"US"`, `"0"`, `"unknown"`)
  - **Interval** — a pattern like `1, 2, 3, ...` auto-incrementing per row. UI: a checkbox or toggle next to the default input labeled "Auto-increment", with a start value input (default `1`) and step input (default `1`)
- Auto-suggest: on load, if a source column name **exactly matches** (case-insensitive) a target column name, pre-select it. User can override.
- A source column can be mapped to **multiple** target columns (allowed)
- Visual indicator (highlight/badge) showing:
  - Green: mapped to a source column
  - Yellow: using a default value
  - Red: unmapped and no default (will produce empty cells)

### Step 4 — Export

- A "Download Converted CSV" button
- Generates a new CSV where:
  - Columns match the **target** CSV headers (same order)
  - Row count matches the **source** CSV row count
  - Each cell is filled by: mapped source column value > default value > empty string
  - For interval defaults: row 0 gets `start`, row 1 gets `start + step`, etc.
- Output uses Papa Parse `unparse()`
- Triggers a browser file download (`converted.csv`)

---

## Component Structure

```
App
├── FileUploader          — handles both file inputs + validation status
│   ├── CsvDropZone       — single file input with drag-and-drop
│   └── ValidationStatus  — shows errors or "valid" per file
├── MappingTable          — the core mapping UI (Step 3)
│   └── MappingRow        — one row per target column
│       ├── SourceDropdown
│       └── DefaultValueInput
├── ExportButton          — generates and downloads the converted CSV
└── PreviewTable          — (optional) shows first 5 rows of the output
```

---

## File Structure

```
csv-mapper/
├── public/
├── src/
│   ├── components/
│   │   ├── FileUploader.tsx
│   │   ├── CsvDropZone.tsx
│   │   ├── ValidationStatus.tsx
│   │   ├── MappingTable.tsx
│   │   ├── MappingRow.tsx
│   │   ├── ExportButton.tsx
│   │   └── PreviewTable.tsx
│   ├── utils/
│   │   ├── csvParser.ts        — parse + validate CSV
│   │   └── csvExporter.ts      — build + download converted CSV
│   ├── types.ts                — shared TypeScript types
│   ├── App.tsx
│   ├── App.css
│   └── main.tsx
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## Key Types

```typescript
interface CsvData {
  headers: string[];
  rows: string[][];
}

interface ColumnMapping {
  targetColumn: string;
  sourceColumn: string | null;       // null = no mapping
  defaultValue: string;
  useInterval: boolean;
  intervalStart: number;
  intervalStep: number;
}

type MappingConfig = ColumnMapping[];
```

---

## Validation Rules (csvParser.ts)

```typescript
function validateCsv(file: File): Promise<{ valid: boolean; errors: string[]; data?: CsvData }>
```

1. Parse with Papa Parse (`header: false`, `skipEmptyLines: true`)
2. Check parse errors array
3. Check row count > 1 (header + at least concept of data, but 0 data rows is also acceptable — just headers is fine for target)
4. Check all rows have same length as first row
5. Check no duplicate headers (case-insensitive)

---

## Export Logic (csvExporter.ts)

```typescript
function generateConvertedCsv(
  sourceData: CsvData,
  mappings: MappingConfig
): string
```

For each source row index `i`, for each mapping entry:
- If `sourceColumn` is set → use `sourceRow[sourceColumnIndex]`
- Else if `useInterval` → use `intervalStart + (i * intervalStep)`
- Else → use `defaultValue`

Return Papa Parse `unparse()` result.

---

## GitHub Pages Deployment

In `package.json`:
```json
{
  "scripts": {
    "deploy": "vite build && gh-pages -d dist"
  }
}
```

In `vite.config.ts`:
```typescript
export default defineConfig({
  base: '/csv-mapper/',  // repo name
  plugins: [react()]
})
```

---

## Out of Scope

- No backend / server
- No login / auth
- No saving/loading mappings
- No data transformation (formulas, string manipulation)
- No large file handling optimizations
- No drag-and-drop column reordering

---

## Implementation Order

1. Scaffold Vite + React + TypeScript project
2. Implement `csvParser.ts` (parse + validate)
3. Build `FileUploader` + `CsvDropZone` + `ValidationStatus`
4. Build `MappingTable` + `MappingRow` with auto-suggest
5. Implement `csvExporter.ts`
6. Build `ExportButton`
7. Add `PreviewTable` (optional, if time allows)
8. Style the app (clean, functional layout)
9. Configure and deploy to GitHub Pages
