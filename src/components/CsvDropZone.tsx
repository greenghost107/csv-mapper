import { useRef, useState } from 'react';
import styles from './CsvDropZone.module.css';

interface CsvDropZoneProps {
  label: string;
  onFile: (file: File) => void;
  fileName?: string;
}

export function CsvDropZone({ label, onFile, fileName }: CsvDropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) onFile(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFile(file);
    e.target.value = '';
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      inputRef.current?.click();
    }
  };

  return (
    <div
      className={`${styles.zone} ${isDragOver ? styles.dragOver : ''}`}
      onDrop={handleDrop}
      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
      onDragLeave={() => setIsDragOver(false)}
      onClick={() => inputRef.current?.click()}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`Upload ${label}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".csv"
        onChange={handleChange}
        className={styles.hiddenInput}
        tabIndex={-1}
        aria-hidden="true"
      />
      <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
      </svg>
      {fileName ? (
        <span className={styles.fileName}>{fileName}</span>
      ) : (
        <span className={styles.placeholder}>Drop CSV here or <strong>click to browse</strong></span>
      )}
    </div>
  );
}
