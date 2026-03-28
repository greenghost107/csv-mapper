export interface CsvData {
  headers: string[];
  rows: string[][];
}

export interface ColumnMapping {
  targetColumn: string;
  sourceColumn: string | null;
  defaultValue: string;
  useInterval: boolean;
  intervalStart: number;
  intervalStep: number;
  useDatePlusDays: boolean;
  dateColumn: string | null;
  daysColumn: string | null;
}

export type MappingConfig = ColumnMapping[];

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  data?: CsvData;
}
