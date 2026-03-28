import Papa from 'papaparse';
import type { ValidationResult } from '../types';

export function validateCsv(file: File): Promise<ValidationResult> {
  return new Promise((resolve) => {
    Papa.parse<string[]>(file, {
      header: false,
      skipEmptyLines: true,
      delimiter: ',',
      complete(results) {
        const errors: string[] = [];
        const rows = results.data;

        if (rows.length === 0) {
          resolve({ valid: false, errors: ['File is empty.'] });
          return;
        }

        const headers = rows[0];
        const dataRows = rows.slice(1);

        // Check for duplicate headers (case-insensitive)
        const seen = new Set<string>();
        const dupes: string[] = [];
        for (const h of headers) {
          const lower = h.toLowerCase();
          if (seen.has(lower)) dupes.push(h);
          seen.add(lower);
        }
        if (dupes.length > 0) {
          errors.push(`Duplicate column names: ${dupes.join(', ')}`);
        }

        // Check consistent column count across all data rows
        const expectedLen = headers.length;
        dataRows.forEach((row, i) => {
          if (row.length !== expectedLen) {
            errors.push(
              `Row ${i + 2} has ${row.length} column(s), expected ${expectedLen}.`
            );
          }
        });

        if (errors.length > 0) {
          resolve({ valid: false, errors });
          return;
        }

        resolve({
          valid: true,
          errors: [],
          data: { headers, rows: dataRows },
        });
      },
      error(error) {
        resolve({ valid: false, errors: [error.message] });
      },
    });
  });
}
