import { describe, it, expect } from 'vitest';
import { validateCsv } from './csvParser';

function makeFile(content: string, name = 'test.csv'): File {
  return new File([content], name, { type: 'text/csv' });
}

describe('validateCsv', () => {
  it('parses a valid CSV with headers and data rows', async () => {
    const file = makeFile('id,name,email\n1,Alice,alice@example.com\n2,Bob,bob@example.com');
    const result = await validateCsv(file);
    expect(result.valid).toBe(true);
    expect(result.data?.headers).toEqual(['id', 'name', 'email']);
    expect(result.data?.rows).toHaveLength(2);
    expect(result.data?.rows[0]).toEqual(['1', 'Alice', 'alice@example.com']);
  });

  it('accepts a CSV with only headers and no data rows', async () => {
    const file = makeFile('id,name,email');
    const result = await validateCsv(file);
    expect(result.valid).toBe(true);
    expect(result.data?.headers).toEqual(['id', 'name', 'email']);
    expect(result.data?.rows).toHaveLength(0);
  });

  it('rejects an empty file', async () => {
    const file = makeFile('');
    const result = await validateCsv(file);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('rejects duplicate column names (case-insensitive)', async () => {
    const file = makeFile('id,ID,name\n1,2,Alice');
    const result = await validateCsv(file);
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toMatch(/duplicate/i);
  });

  it('rejects rows with inconsistent column count', async () => {
    const file = makeFile('id,name\n1,Alice,extra\n2,Bob');
    const result = await validateCsv(file);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.toLowerCase().includes('column'))).toBe(true);
  });

  it('returns errors array for invalid file', async () => {
    const file = makeFile('a,a\n1,2');
    const result = await validateCsv(file);
    expect(result.valid).toBe(false);
    expect(Array.isArray(result.errors)).toBe(true);
    expect(result.data).toBeUndefined();
  });

  it('handles single-column CSV', async () => {
    const file = makeFile('name\nAlice\nBob');
    const result = await validateCsv(file);
    expect(result.valid).toBe(true);
    expect(result.data?.headers).toEqual(['name']);
    expect(result.data?.rows).toHaveLength(2);
  });
});
