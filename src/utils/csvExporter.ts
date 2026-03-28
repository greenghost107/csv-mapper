import Papa from 'papaparse';
import type { CsvData, MappingConfig } from '../types';
import { computeDatePlusDays } from './datePlusDays';

export function generateConvertedCsv(
  sourceData: CsvData,
  mappings: MappingConfig
): string {
  const outputHeaders = mappings.map((m) => m.targetColumn);

  const outputRows = sourceData.rows.map((sourceRow, rowIndex) =>
    mappings.map((mapping) => {
      if (mapping.sourceColumn !== null) {
        const colIndex = sourceData.headers.indexOf(mapping.sourceColumn);
        if (colIndex === -1) return '';
        const val = sourceRow[colIndex];
        return val.trim() === '-' ? '' : val;
      }
      if (mapping.useDatePlusDays && mapping.dateColumn && mapping.daysColumn) {
        const dateIdx = sourceData.headers.indexOf(mapping.dateColumn);
        const daysIdx = sourceData.headers.indexOf(mapping.daysColumn);
        const dateStr = dateIdx !== -1 ? sourceRow[dateIdx] : '';
        const daysStr = daysIdx !== -1 ? sourceRow[daysIdx] : '';
        return computeDatePlusDays(dateStr, daysStr);
      }
      if (mapping.useInterval) {
        return String(mapping.intervalStart + rowIndex * mapping.intervalStep);
      }
      return mapping.defaultValue;
    })
  );

  return Papa.unparse([outputHeaders, ...outputRows]);
}

function buildFilename(): string {
  const now = new Date();
  const ts = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
  return `csv-mapper-export-${ts}.csv`;
}

export function downloadCsv(csvString: string, filename?: string): void {
  const name = filename ?? buildFilename();
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
