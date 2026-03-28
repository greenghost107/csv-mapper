import { generateConvertedCsv, downloadCsv } from '../utils/csvExporter';
import type { CsvData, MappingConfig } from '../types';
import styles from './ExportButton.module.css';

interface ExportButtonProps {
  sourceData: CsvData;
  mappings: MappingConfig;
}

export function ExportButton({ sourceData, mappings }: ExportButtonProps) {
  const handleExport = () => {
    const csv = generateConvertedCsv(sourceData, mappings);
    downloadCsv(csv);
  };

  return (
    <button className={styles.button} onClick={handleExport} type="button">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.icon} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
      </svg>
      Download converted.csv
    </button>
  );
}
