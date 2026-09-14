import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState, type FormEvent } from 'react';
import { describe, expect, it, vi } from 'vitest';
import SearchBar from '@/components/SearchBar';
import { currentMonth } from '@/lib/dateRange';
import { renderWithProviders } from '@/test/render';

vi.mock('@/lib/postcodeSuggestions', () => ({
  suggestPostcodes: vi.fn().mockResolvedValue([]),
}));

function SearchBarHarness({
  initialPostcodes = [],
  initialFrom = '2024-03',
  initialTo = '2024-06',
  loading = false,
  notice,
  onSubmit = vi.fn(),
  onReset = vi.fn(),
}: {
  initialPostcodes?: string[];
  initialFrom?: string;
  initialTo?: string;
  loading?: boolean;
  notice?: string;
  onSubmit?: (e: FormEvent) => void;
  onReset?: () => void;
}) {
  const [postcodes, setPostcodes] = useState(initialPostcodes);
  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState(initialTo);

  return (
    <SearchBar
      postcodes={postcodes}
      onPostcodesChange={setPostcodes}
      postcodeOptions={[]}
      from={from}
      onFromChange={setFrom}
      to={to}
      onToChange={setTo}
      onSubmit={onSubmit}
      onReset={onReset}
      loading={loading}
      notice={notice}
    />
  );
}

function openPickerButton(selectedDate: string) {
  return screen.getByRole('button', {
    name: new RegExp(`choose date, selected date is ${selectedDate}`, 'i'),
  });
}

function monthButton(name: string) {
  return (
    screen.queryByRole('radio', { name }) ??
    screen.queryByRole('gridcell', { name }) ??
    screen.getByRole('button', { name })
  );
}

describe('SearchBar', () => {
  it('keeps Search disabled until a valid UK postcode is entered', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((e: FormEvent) => e.preventDefault());
    renderWithProviders(<SearchBarHarness onSubmit={onSubmit} />);

    expect(screen.getByRole('button', { name: 'Search' })).toBeDisabled();

    await user.type(screen.getByRole('combobox', { name: /postcodes/i }), 'hello');
    const search = screen.getByRole('button', { name: 'Search' });
    expect(search).toBeDisabled();
    fireEvent.submit(search.closest('form')!);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('enables Search once a valid postcode is typed', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SearchBarHarness />);

    await user.type(screen.getByRole('combobox', { name: /postcodes/i }), 'SW1A 1AA');
    expect(screen.getByRole('button', { name: 'Search' })).toBeEnabled();
  });

  it('submits when Search is clicked with a valid postcode', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((e: FormEvent) => e.preventDefault());
    renderWithProviders(<SearchBarHarness initialPostcodes={['SW1A 1AA']} onSubmit={onSubmit} />);

    await user.click(screen.getByRole('button', { name: 'Search' }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('does not submit while loading', () => {
    const onSubmit = vi.fn((e: FormEvent) => e.preventDefault());
    renderWithProviders(
      <SearchBarHarness initialPostcodes={['SW1A 1AA']} loading onSubmit={onSubmit} />
    );

    const search = screen.getByRole('button', { name: 'Search' });
    expect(search).toBeDisabled();
    fireEvent.submit(search.closest('form')!);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('clears the typed postcode and calls onReset', async () => {
    const user = userEvent.setup();
    const onReset = vi.fn();
    renderWithProviders(<SearchBarHarness initialPostcodes={['SW1A 1AA']} onReset={onReset} />);

    expect(screen.getByRole('button', { name: 'SW1A 1AA' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Reset' }));
    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it('shows a validation notice', () => {
    renderWithProviders(<SearchBarHarness notice="Enter at least one valid UK postcode to search." />);
    expect(screen.getByText('Enter at least one valid UK postcode to search.')).toBeInTheDocument();
  });

  it('greys out To months before From', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SearchBarHarness initialFrom="2024-03" initialTo="2024-06" />);

    await user.click(openPickerButton('Jun 1, 2024'));

    expect(monthButton('January')).toBeDisabled();
    expect(monthButton('February')).toBeDisabled();
    expect(monthButton('March')).toBeEnabled();
  });

  it('moves To forward when From is later than To', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SearchBarHarness initialFrom="2024-01" initialTo="2024-03" />);

    await user.click(openPickerButton('Jan 1, 2024'));
    await user.click(monthButton('May'));
    await user.click(screen.getByRole('button', { name: 'OK' }));

    await waitFor(() => {
      expect(
        screen.getAllByRole('button', { name: /choose date, selected date is May 1, 2024/i })
      ).toHaveLength(2);
    });
  });

  it('greys out future months in From and To', async () => {
    const user = userEvent.setup();
    const today = currentMonth();
    const [year, month] = today.split('-').map(Number);
    renderWithProviders(<SearchBarHarness initialFrom={today} initialTo={today} />);

    const selected = new Date(year, month - 1, 1).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const pickerButtons = () =>
      screen.getAllByRole('button', {
        name: new RegExp(`choose date, selected date is ${selected}`, 'i'),
      });

    await user.click(pickerButtons()[0]);
    if (month < 12) {
      const nextMonthName = new Date(year, month, 1).toLocaleString('en-US', { month: 'long' });
      expect(monthButton(nextMonthName)).toBeDisabled();
    }

    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await user.click(pickerButtons()[1]);
    if (month < 12) {
      const nextMonthName = new Date(year, month, 1).toLocaleString('en-US', { month: 'long' });
      expect(monthButton(nextMonthName)).toBeDisabled();
    }
  });
});
