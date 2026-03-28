import styles from './ValidationStatus.module.css';

export type ValidationState = 'idle' | 'validating' | 'valid' | 'invalid';

interface ValidationStatusProps {
  status: ValidationState;
  errors: string[];
}

export function ValidationStatus({ status, errors }: ValidationStatusProps) {
  if (status === 'idle') return null;

  if (status === 'validating') {
    return <p className={styles.validating}>Validating…</p>;
  }

  if (status === 'valid') {
    return <p className={styles.valid}>Valid CSV</p>;
  }

  return (
    <ul className={styles.errorList} role="alert" aria-label="Validation errors">
      {errors.map((err, i) => (
        <li key={i}>{err}</li>
      ))}
    </ul>
  );
}
