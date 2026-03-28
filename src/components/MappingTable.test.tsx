import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MappingTable } from './MappingTable';
import type { MappingConfig } from '../types';

const sourceHeaders = ['src_id', 'src_name', 'src_email'];

const mappings: MappingConfig = [
  { targetColumn: 'id', sourceColumn: 'src_id', defaultValue: '', useInterval: false, intervalStart: 1, intervalStep: 1, useDatePlusDays: false, dateColumn: null, daysColumn: null },
  { targetColumn: 'fullName', sourceColumn: null, defaultValue: 'unknown', useInterval: false, intervalStart: 1, intervalStep: 1, useDatePlusDays: false, dateColumn: null, daysColumn: null },
  { targetColumn: 'seq', sourceColumn: null, defaultValue: '', useInterval: true, intervalStart: 1, intervalStep: 1, useDatePlusDays: false, dateColumn: null, daysColumn: null },
];

describe('MappingTable', () => {
  it('renders a row for each target column', () => {
    render(<MappingTable sourceHeaders={sourceHeaders} mappings={mappings} onChange={vi.fn()} />);
    expect(screen.getByText('id')).toBeInTheDocument();
    expect(screen.getByText('fullName')).toBeInTheDocument();
    expect(screen.getByText('seq')).toBeInTheDocument();
  });

  it('renders table header labels', () => {
    render(<MappingTable sourceHeaders={sourceHeaders} mappings={mappings} onChange={vi.fn()} />);
    expect(screen.getByText('Target Column')).toBeInTheDocument();
    expect(screen.getByText('Source Column')).toBeInTheDocument();
    expect(screen.getByText('Default Value')).toBeInTheDocument();
  });

  it('calls onChange with updated mappings when a row changes', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<MappingTable sourceHeaders={sourceHeaders} mappings={mappings} onChange={onChange} />);

    await user.selectOptions(
      screen.getByRole('combobox', { name: /source column for fullName/i }),
      'src_name'
    );

    expect(onChange).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ targetColumn: 'fullName', sourceColumn: 'src_name' }),
      ])
    );
  });

  it('preserves other rows when one row changes', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<MappingTable sourceHeaders={sourceHeaders} mappings={mappings} onChange={onChange} />);

    await user.selectOptions(
      screen.getByRole('combobox', { name: /source column for fullName/i }),
      'src_name'
    );

    const updatedMappings: MappingConfig = onChange.mock.calls[0][0];
    const idRow = updatedMappings.find((m) => m.targetColumn === 'id');
    expect(idRow?.sourceColumn).toBe('src_id');
  });
});
