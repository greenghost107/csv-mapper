import type { MappingConfig, ColumnMapping } from '../types';
import { MappingRow } from './MappingRow';
import styles from './MappingTable.module.css';

interface MappingTableProps {
  sourceHeaders: string[];
  mappings: MappingConfig;
  onChange: (mappings: MappingConfig) => void;
}

export function MappingTable({ sourceHeaders, mappings, onChange }: MappingTableProps) {
  const handleRowChange = (index: number, updated: ColumnMapping) => {
    const next = mappings.map((m, i) => (i === index ? updated : m));
    onChange(next);
  };

  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.thStatus} aria-label="Status" />
            <th className={styles.th}>Target Column</th>
            <th className={styles.th}>Source Column</th>
            <th className={styles.th}>Default Value</th>
          </tr>
        </thead>
        <tbody>
          {mappings.map((mapping, i) => (
            <MappingRow
              key={mapping.targetColumn}
              mapping={mapping}
              sourceHeaders={sourceHeaders}
              onChange={(updated) => handleRowChange(i, updated)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
