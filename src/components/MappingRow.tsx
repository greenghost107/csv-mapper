import type { ColumnMapping } from '../types';
import styles from './MappingRow.module.css';

interface MappingRowProps {
  mapping: ColumnMapping;
  sourceHeaders: string[];
  onChange: (mapping: ColumnMapping) => void;
}

function getRowStatus(mapping: ColumnMapping): 'mapped' | 'default' | 'empty' {
  if (mapping.sourceColumn !== null) return 'mapped';
  if (mapping.useDatePlusDays && mapping.dateColumn && mapping.daysColumn) return 'default';
  if (mapping.useInterval || mapping.defaultValue.trim() !== '') return 'default';
  return 'empty';
}

export function MappingRow({ mapping, sourceHeaders, onChange }: MappingRowProps) {
  const status = getRowStatus(mapping);
  const isSourceSelected = mapping.sourceColumn !== null;

  const handleSourceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    onChange({ ...mapping, sourceColumn: val === '' ? null : val });
  };

  const handleDefaultChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...mapping, defaultValue: e.target.value });
  };

  const handleIntervalToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...mapping,
      useInterval: e.target.checked,
      useDatePlusDays: e.target.checked ? false : mapping.useDatePlusDays,
    });
  };

  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    onChange({ ...mapping, intervalStart: isNaN(val) ? 1 : val });
  };

  const handleStepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    onChange({ ...mapping, intervalStep: isNaN(val) ? 1 : val });
  };

  const handleDatePlusDaysToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...mapping,
      useDatePlusDays: e.target.checked,
      useInterval: e.target.checked ? false : mapping.useInterval,
    });
  };

  const handleDateColumnChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...mapping, dateColumn: e.target.value || null });
  };

  const handleDaysColumnChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...mapping, daysColumn: e.target.value || null });
  };

  return (
    <tr className={`${styles.row} ${styles[status]}`}>
      <td className={styles.statusCell}>
        <span
          className={`${styles.dot} ${styles[`dot_${status}`]}`}
          aria-label={status === 'mapped' ? 'Mapped' : status === 'default' ? 'Has default' : 'No value'}
        />
      </td>

      <td className={styles.targetCell}>
        <span className={styles.columnName}>{mapping.targetColumn}</span>
      </td>

      <td className={styles.sourceCell}>
        <select
          value={mapping.sourceColumn ?? ''}
          onChange={handleSourceChange}
          className={styles.select}
          aria-label={`Source column for ${mapping.targetColumn}`}
        >
          <option value="">— None —</option>
          {sourceHeaders.map((h) => (
            <option key={h} value={h}>{h}</option>
          ))}
        </select>
      </td>

      <td className={styles.defaultCell}>
        <div className={styles.defaultControls}>
          <input
            type="text"
            value={mapping.defaultValue}
            onChange={handleDefaultChange}
            disabled={isSourceSelected || mapping.useInterval || mapping.useDatePlusDays}
            placeholder="Default value"
            className={styles.defaultInput}
            aria-label={`Default value for ${mapping.targetColumn}`}
          />

          <label className={`${styles.intervalLabel} ${isSourceSelected || mapping.useDatePlusDays ? styles.disabledLabel : ''}`}>
            <input
              type="checkbox"
              checked={mapping.useInterval}
              onChange={handleIntervalToggle}
              disabled={isSourceSelected || mapping.useDatePlusDays}
              aria-label={`Auto-increment for ${mapping.targetColumn}`}
            />
            Auto-increment
          </label>

          {mapping.useInterval && !isSourceSelected && (
            <div className={styles.intervalInputs}>
              <label className={styles.smallLabel}>
                Start
                <input
                  type="number"
                  value={mapping.intervalStart}
                  onChange={handleStartChange}
                  className={styles.numberInput}
                  aria-label={`Interval start for ${mapping.targetColumn}`}
                />
              </label>
              <label className={styles.smallLabel}>
                Step
                <input
                  type="number"
                  value={mapping.intervalStep}
                  onChange={handleStepChange}
                  className={styles.numberInput}
                  aria-label={`Interval step for ${mapping.targetColumn}`}
                />
              </label>
            </div>
          )}

          <label className={`${styles.intervalLabel} ${isSourceSelected || mapping.useInterval ? styles.disabledLabel : ''}`}>
            <input
              type="checkbox"
              checked={mapping.useDatePlusDays}
              onChange={handleDatePlusDaysToggle}
              disabled={isSourceSelected || mapping.useInterval}
              aria-label={`Date + Days for ${mapping.targetColumn}`}
            />
            Date + Days
          </label>

          {mapping.useDatePlusDays && !isSourceSelected && (
            <div className={styles.datePlusDaysInputs}>
              <label className={styles.smallLabel}>
                Date col
                <select
                  value={mapping.dateColumn ?? ''}
                  onChange={handleDateColumnChange}
                  className={styles.smallSelect}
                  aria-label={`Date column for ${mapping.targetColumn}`}
                >
                  <option value="">—</option>
                  {sourceHeaders.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </label>
              <label className={styles.smallLabel}>
                Days col
                <select
                  value={mapping.daysColumn ?? ''}
                  onChange={handleDaysColumnChange}
                  className={styles.smallSelect}
                  aria-label={`Days column for ${mapping.targetColumn}`}
                >
                  <option value="">—</option>
                  {sourceHeaders.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </label>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}
