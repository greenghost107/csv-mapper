import { useState } from 'react';
import { validateCsv } from '../utils/csvParser';
import type { CsvData } from '../types';
import { CsvDropZone } from './CsvDropZone';
import { ValidationStatus, type ValidationState } from './ValidationStatus';
import styles from './FileUploader.module.css';

interface FileUploaderProps {
  label: string;
  onValidFile: (data: CsvData) => void;
  onClear: () => void;
}

export function FileUploader({ label, onValidFile, onClear }: FileUploaderProps) {
  const [status, setStatus] = useState<ValidationState>('idle');
  const [errors, setErrors] = useState<string[]>([]);
  const [fileName, setFileName] = useState<string>('');

  const handleFile = async (file: File) => {
    setFileName(file.name);
    setStatus('validating');
    setErrors([]);
    onClear();

    const result = await validateCsv(file);
    if (result.valid && result.data) {
      setStatus('valid');
      onValidFile(result.data);
    } else {
      setStatus('invalid');
      setErrors(result.errors);
    }
  };

  return (
    <div className={styles.uploader}>
      <h3 className={styles.label}>{label}</h3>
      <CsvDropZone label={label} onFile={handleFile} fileName={fileName || undefined} />
      <ValidationStatus status={status} errors={errors} />
    </div>
  );
}
