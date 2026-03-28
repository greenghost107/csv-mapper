import { useMemo } from 'react';
import type { CsvData, MappingConfig } from '../types';
import { computeDatePlusDays } from '../utils/datePlusDays';
import styles from './PreviewTable.module.css';

interface PreviewTableProps {
  sourceData: CsvData;
  mappings: MappingConfig;
  maxRows?: number;
}

export function PreviewTable({ sourceData, mappings, maxRows = 5 }: PreviewTableProps) {
  const targetHeaders = mappings.map((m) => m.targetColumn);

  const previewRows = useMemo(() => {
    const rows = sourceData.rows.slice(0, maxRows);
    return rows.map((sourceRow, rowIndex) =>
      mappings.map((m) => {
        if (m.sourceColumn !== null) {
          const idx = sourceData.headers.indexOf(m.sourceColumn);
          if (idx === -1) return '';
          const val = sourceRow[idx];
          return val.trim() === '-' ? '' : val;
        }
        if (m.useDatePlusDays && m.dateColumn && m.daysColumn) {
          const dateIdx = sourceData.headers.indexOf(m.dateColumn);
          const daysIdx = sourceData.headers.indexOf(m.daysColumn);
          const dateStr = dateIdx !== -1 ? sourceRow[dateIdx] : '';
          const daysStr = daysIdx !== -1 ? sourceRow[daysIdx] : '';
          return computeDatePlusDays(dateStr, daysStr);
        }
        if (m.useInterval) {
          return String(m.intervalStart + rowIndex * m.intervalStep);
        }
        return m.defaultValue;
      })
    );
  }, [sourceData, mappings, maxRows]);

  return (
    <div className={styles.wrapper}>
      <h3 className={styles.heading}>
        Output Preview
        <span className={styles.subtitle}> — first {Math.min(maxRows, sourceData.rows.length)} of {sourceData.rows.length} rows</span>
      </h3>
      {sourceData.rows.length === 0 ? (
        <p className={styles.empty}>Source file has no data rows.</p>
      ) : (
        <div className={styles.scroll}>
          <table className={styles.table}>
            <thead>
              <tr>
                {targetHeaders.map((h) => (
                  <th key={h} className={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {previewRows.map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => (
                    <td key={j} className={styles.td}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
