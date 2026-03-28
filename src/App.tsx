import { useState } from 'react';
import type { CsvData, MappingConfig, ColumnMapping } from './types';
import { FileUploader } from './components/FileUploader';
import { MappingTable } from './components/MappingTable';
import { PreviewTable } from './components/PreviewTable';
import { ExportButton } from './components/ExportButton';
import styles from './App.module.css';

type AppStep = 'upload' | 'mapping';

function buildInitialMappings(sourceHeaders: string[], targetHeaders: string[]): MappingConfig {
  return targetHeaders.map((targetCol): ColumnMapping => {
    const match = sourceHeaders.find(
      (sh) => sh.toLowerCase() === targetCol.toLowerCase()
    ) ?? null;
    return {
      targetColumn: targetCol,
      sourceColumn: match,
      defaultValue: '',
      useInterval: false,
      intervalStart: 1,
      intervalStep: 1,
      useDatePlusDays: false,
      dateColumn: null,
      daysColumn: null,
    };
  });
}

export default function App() {
  const [step, setStep] = useState<AppStep>('upload');
  const [sourceData, setSourceData] = useState<CsvData | null>(null);
  const [targetData, setTargetData] = useState<CsvData | null>(null);
  const [mappings, setMappings] = useState<MappingConfig>([]);

  const canStartMapping = sourceData !== null && targetData !== null;

  const handleStartMapping = () => {
    if (!sourceData || !targetData) return;
    setMappings(buildInitialMappings(sourceData.headers, targetData.headers));
    setStep('mapping');
  };

  const handleBack = () => {
    setStep('upload');
  };

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1 className={styles.title}>CSV Mapper</h1>
        <p className={styles.subtitle}>Remap CSV columns from a source file into a target schema</p>
      </header>

      <main className={styles.main}>
        {step === 'upload' && (
          <div className={styles.uploadStep}>
            <div className={styles.uploaders}>
              <div className={styles.uploaderCard}>
                <FileUploader
                  label="Source CSV"
                  onValidFile={setSourceData}
                  onClear={() => setSourceData(null)}
                />
                {sourceData && (
                  <p className={styles.fileInfo}>
                    {sourceData.headers.length} columns · {sourceData.rows.length} rows
                  </p>
                )}
              </div>
              <div className={styles.arrow} aria-hidden="true">→</div>
              <div className={styles.uploaderCard}>
                <FileUploader
                  label="Target CSV"
                  onValidFile={setTargetData}
                  onClear={() => setTargetData(null)}
                />
                {targetData && (
                  <p className={styles.fileInfo}>
                    {targetData.headers.length} columns
                  </p>
                )}
              </div>
            </div>

            <div className={styles.uploadActions}>
              <button
                className={styles.primaryBtn}
                onClick={handleStartMapping}
                disabled={!canStartMapping}
                type="button"
              >
                Configure Mapping →
              </button>
              {!canStartMapping && (
                <p className={styles.hint}>Upload both CSV files to continue</p>
              )}
            </div>
          </div>
        )}

        {step === 'mapping' && sourceData && targetData && (
          <div className={styles.mappingStep}>
            <div className={styles.mappingHeader}>
              <button className={styles.backBtn} onClick={handleBack} type="button">
                ← Back
              </button>
              <div className={styles.mappingMeta}>
                <span>{sourceData.headers.length} source columns</span>
                <span className={styles.metaDivider}>·</span>
                <span>{targetData.headers.length} target columns</span>
              </div>
            </div>

            <MappingTable
              sourceHeaders={sourceData.headers}
              mappings={mappings}
              onChange={setMappings}
            />

            <PreviewTable sourceData={sourceData} mappings={mappings} />

            <div className={styles.exportRow}>
              <ExportButton sourceData={sourceData} mappings={mappings} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
