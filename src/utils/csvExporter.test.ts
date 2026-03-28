import { describe, it, expect } from 'vitest';
import Papa from 'papaparse';
import { generateConvertedCsv } from './csvExporter';
import type { CsvData, MappingConfig } from '../types';

const sourceData: CsvData = {
  headers: ['first_name', 'last_name', 'country'],
  rows: [
    ['Alice', 'Smith', 'US'],
    ['Bob', 'Jones', 'UK'],
    ['Carol', 'White', 'CA'],
  ],
};

function parseLines(csv: string): string[][] {
  return csv.trim().split(/\r?\n/).map((line) =>
    // Simple split for test purposes (no embedded commas in test data)
    line.split(',').map((cell) => cell.replace(/^"|"$/g, ''))
  );
}

describe('generateConvertedCsv', () => {
  it('maps source columns to target columns', () => {
    const mappings: MappingConfig = [
      { targetColumn: 'name', sourceColumn: 'first_name', defaultValue: '', useInterval: false, intervalStart: 1, intervalStep: 1, useDatePlusDays: false, dateColumn: null, daysColumn: null },
      { targetColumn: 'region', sourceColumn: 'country', defaultValue: '', useInterval: false, intervalStart: 1, intervalStep: 1, useDatePlusDays: false, dateColumn: null, daysColumn: null },
    ];
    const lines = parseLines(generateConvertedCsv(sourceData, mappings));
    expect(lines[0]).toEqual(['name', 'region']);
    expect(lines[1]).toEqual(['Alice', 'US']);
    expect(lines[2]).toEqual(['Bob', 'UK']);
  });

  it('uses literal default value for unmapped columns', () => {
    const mappings: MappingConfig = [
      { targetColumn: 'name', sourceColumn: 'first_name', defaultValue: '', useInterval: false, intervalStart: 1, intervalStep: 1, useDatePlusDays: false, dateColumn: null, daysColumn: null },
      { targetColumn: 'status', sourceColumn: null, defaultValue: 'active', useInterval: false, intervalStart: 1, intervalStep: 1, useDatePlusDays: false, dateColumn: null, daysColumn: null },
    ];
    const lines = parseLines(generateConvertedCsv(sourceData, mappings));
    expect(lines[1]).toEqual(['Alice', 'active']);
    expect(lines[2]).toEqual(['Bob', 'active']);
    expect(lines[3]).toEqual(['Carol', 'active']);
  });

  it('generates interval values starting at custom start with custom step', () => {
    const mappings: MappingConfig = [
      { targetColumn: 'id', sourceColumn: null, defaultValue: '', useInterval: true, intervalStart: 10, intervalStep: 5, useDatePlusDays: false, dateColumn: null, daysColumn: null },
      { targetColumn: 'name', sourceColumn: 'first_name', defaultValue: '', useInterval: false, intervalStart: 1, intervalStep: 1, useDatePlusDays: false, dateColumn: null, daysColumn: null },
    ];
    const lines = parseLines(generateConvertedCsv(sourceData, mappings));
    expect(lines[1]).toEqual(['10', 'Alice']);
    expect(lines[2]).toEqual(['15', 'Bob']);
    expect(lines[3]).toEqual(['20', 'Carol']);
  });

  it('outputs empty string for unmapped columns with no default', () => {
    const mappings: MappingConfig = [
      { targetColumn: 'unknown', sourceColumn: null, defaultValue: '', useInterval: false, intervalStart: 1, intervalStep: 1, useDatePlusDays: false, dateColumn: null, daysColumn: null },
    ];
    const csv = generateConvertedCsv(sourceData, mappings);
    // Use Papa.parse to reliably count rows (empty-cell rows can look like blank lines)
    const parsed = Papa.parse<string[]>(csv, { header: false, skipEmptyLines: false });
    const rows = parsed.data.filter((r) => r.length > 0);
    expect(rows).toHaveLength(4); // header + 3 data rows
    expect(rows[0]).toEqual(['unknown']);
  });

  it('preserves target column order', () => {
    const mappings: MappingConfig = [
      { targetColumn: 'z_col', sourceColumn: 'last_name', defaultValue: '', useInterval: false, intervalStart: 1, intervalStep: 1, useDatePlusDays: false, dateColumn: null, daysColumn: null },
      { targetColumn: 'a_col', sourceColumn: 'first_name', defaultValue: '', useInterval: false, intervalStart: 1, intervalStep: 1, useDatePlusDays: false, dateColumn: null, daysColumn: null },
    ];
    const lines = parseLines(generateConvertedCsv(sourceData, mappings));
    expect(lines[0]).toEqual(['z_col', 'a_col']);
    expect(lines[1]).toEqual(['Smith', 'Alice']);
  });

  it('computes date+days for mapped columns with M/D/YYYY dates', () => {
    const dateSource: CsvData = {
      headers: ['Date', 'Hold', 'Symbol'],
      rows: [
        ['3/27/2026', '2 DAYS', 'VIK'],
        ['3/6/2026', '11 DAYS', 'VICR'],
        ['2/27/2026', '20 HRS', 'WBI'],
        ['3/25/2026', '', 'BKV'],
      ],
    };
    const mappings: MappingConfig = [
      { targetColumn: 'symbol', sourceColumn: 'Symbol', defaultValue: '', useInterval: false, intervalStart: 1, intervalStep: 1, useDatePlusDays: false, dateColumn: null, daysColumn: null },
      { targetColumn: 'exit_date', sourceColumn: null, defaultValue: '', useInterval: false, intervalStart: 1, intervalStep: 1, useDatePlusDays: true, dateColumn: 'Date', daysColumn: 'Hold' },
    ];
    const lines = parseLines(generateConvertedCsv(dateSource, mappings));
    expect(lines[0]).toEqual(['symbol', 'exit_date']);
    expect(lines[1]).toEqual(['VIK', '2026-03-29']);
    expect(lines[2]).toEqual(['VICR', '2026-03-17']);
    expect(lines[3]).toEqual(['WBI', '2026-02-28']);
    expect(lines[4]).toEqual(['BKV', '']);
  });

  it('handles source with no data rows', () => {
    const emptySource: CsvData = { headers: ['a', 'b'], rows: [] };
    const mappings: MappingConfig = [
      { targetColumn: 'x', sourceColumn: 'a', defaultValue: '', useInterval: false, intervalStart: 1, intervalStep: 1, useDatePlusDays: false, dateColumn: null, daysColumn: null },
    ];
    const lines = generateConvertedCsv(emptySource, mappings).trim().split(/\r?\n/);
    expect(lines).toHaveLength(1);
    expect(lines[0]).toBe('x');
  });
});
