import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MappingRow } from './MappingRow';
import type { ColumnMapping } from '../types';

const sourceHeaders = ['first_name', 'last_name', 'email'];

function makeMapping(overrides: Partial<ColumnMapping> = {}): ColumnMapping {
  return {
    targetColumn: 'name',
    sourceColumn: null,
    defaultValue: '',
    useInterval: false,
    intervalStart: 1,
    intervalStep: 1,
    useDatePlusDays: false,
    dateColumn: null,
    daysColumn: null,
    ...overrides,
  };
}

function renderRow(mapping: ColumnMapping, onChange = vi.fn()) {
  return render(
    <table>
      <tbody>
        <MappingRow mapping={mapping} sourceHeaders={sourceHeaders} onChange={onChange} />
      </tbody>
    </table>
  );
}

describe('MappingRow', () => {
  it('renders the target column name', () => {
    renderRow(makeMapping());
    expect(screen.getByText('name')).toBeInTheDocument();
  });

  it('renders source column dropdown with all source headers', () => {
    renderRow(makeMapping());
    const select = screen.getByRole('combobox', { name: /source column for name/i });
    expect(select).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'first_name' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'last_name' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'email' })).toBeInTheDocument();
  });

  it('enables default value input when no source column is selected', () => {
    renderRow(makeMapping({ sourceColumn: null }));
    expect(screen.getByRole('textbox', { name: /default value for name/i })).not.toBeDisabled();
  });

  it('disables default value input when a source column is selected', () => {
    renderRow(makeMapping({ sourceColumn: 'first_name' }));
    expect(screen.getByRole('textbox', { name: /default value for name/i })).toBeDisabled();
  });

  it('calls onChange with new sourceColumn when dropdown changes', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderRow(makeMapping(), onChange);
    await user.selectOptions(
      screen.getByRole('combobox', { name: /source column for name/i }),
      'last_name'
    );
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ sourceColumn: 'last_name' })
    );
  });

  it('calls onChange with sourceColumn null when "None" is selected', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderRow(makeMapping({ sourceColumn: 'first_name' }), onChange);
    await user.selectOptions(
      screen.getByRole('combobox', { name: /source column for name/i }),
      ''
    );
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ sourceColumn: null })
    );
  });

  it('calls onChange with updated defaultValue when text input changes', () => {
    const onChange = vi.fn();
    renderRow(makeMapping(), onChange);
    const input = screen.getByRole('textbox', { name: /default value for name/i });
    fireEvent.change(input, { target: { value: 'US' } });
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ defaultValue: 'US' })
    );
  });

  it('calls onChange with useInterval true when auto-increment is checked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderRow(makeMapping(), onChange);
    await user.click(screen.getByRole('checkbox', { name: /auto-increment for name/i }));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ useInterval: true })
    );
  });

  it('shows interval start/step inputs when useInterval is true and no source column', () => {
    renderRow(makeMapping({ useInterval: true }));
    expect(screen.getByRole('spinbutton', { name: /interval start for name/i })).toBeInTheDocument();
    expect(screen.getByRole('spinbutton', { name: /interval step for name/i })).toBeInTheDocument();
  });

  it('hides interval inputs when useInterval is false', () => {
    renderRow(makeMapping({ useInterval: false }));
    expect(screen.queryByRole('spinbutton', { name: /interval start/i })).not.toBeInTheDocument();
  });

  it('disables auto-increment checkbox when source column is selected', () => {
    renderRow(makeMapping({ sourceColumn: 'email' }));
    expect(screen.getByRole('checkbox', { name: /auto-increment for name/i })).toBeDisabled();
  });

  describe('Date + Days', () => {
    it('shows Date + Days checkbox', () => {
      renderRow(makeMapping());
      expect(screen.getByRole('checkbox', { name: /date \+ days for name/i })).toBeInTheDocument();
    });

    it('shows date/days dropdowns when Date + Days is checked', () => {
      renderRow(makeMapping({ useDatePlusDays: true }));
      expect(screen.getByRole('combobox', { name: /date column for name/i })).toBeInTheDocument();
      expect(screen.getByRole('combobox', { name: /days column for name/i })).toBeInTheDocument();
    });

    it('hides date/days dropdowns when Date + Days is unchecked', () => {
      renderRow(makeMapping({ useDatePlusDays: false }));
      expect(screen.queryByRole('combobox', { name: /date column for name/i })).not.toBeInTheDocument();
    });

    it('disables Date + Days checkbox when source column is selected', () => {
      renderRow(makeMapping({ sourceColumn: 'email' }));
      expect(screen.getByRole('checkbox', { name: /date \+ days for name/i })).toBeDisabled();
    });

    it('disables Date + Days checkbox when auto-increment is active', () => {
      renderRow(makeMapping({ useInterval: true }));
      expect(screen.getByRole('checkbox', { name: /date \+ days for name/i })).toBeDisabled();
    });

    it('calls onChange and clears useInterval when Date + Days is toggled on', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      renderRow(makeMapping(), onChange);
      await user.click(screen.getByRole('checkbox', { name: /date \+ days for name/i }));
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({ useDatePlusDays: true, useInterval: false })
      );
    });

    it('disables default input when Date + Days is active', () => {
      renderRow(makeMapping({ useDatePlusDays: true }));
      expect(screen.getByRole('textbox', { name: /default value for name/i })).toBeDisabled();
    });
  });
});
