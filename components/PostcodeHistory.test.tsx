import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import PostcodeHistory from '@/components/PostcodeHistory';
import { renderWithProviders } from '@/test/render';

describe('PostcodeHistory', () => {
  it('shows an empty state when nothing has been searched', () => {
    renderWithProviders(
      <PostcodeHistory entries={[]} onSelect={vi.fn()} onRemove={vi.fn()} />
    );

    expect(screen.getByText('Searched postcodes')).toBeInTheDocument();
    expect(screen.getByText('Postcodes you search will appear here.')).toBeInTheDocument();
  });

  it('lists searched postcode chips', () => {
    renderWithProviders(
      <PostcodeHistory
        entries={[{ postcode: 'SW1A 1AA', lastSearchedAt: '2026-07-01T00:00:00.000Z' }]}
        onSelect={vi.fn()}
        onRemove={vi.fn()}
      />
    );

    expect(screen.getByRole('list')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'SW1A 1AA' })).toBeInTheDocument();
  });

  it('selects a postcode when its chip is clicked', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    renderWithProviders(
      <PostcodeHistory
        entries={[{ postcode: 'SW1A 1AA', lastSearchedAt: '2026-07-01T00:00:00.000Z' }]}
        onSelect={onSelect}
        onRemove={vi.fn()}
      />
    );

    await user.click(screen.getByRole('button', { name: 'SW1A 1AA' }));
    expect(onSelect).toHaveBeenCalledWith('SW1A 1AA');
  });

  it('removes a postcode from history', async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    renderWithProviders(
      <PostcodeHistory
        entries={[{ postcode: 'SW1A 1AA', lastSearchedAt: '2026-07-01T00:00:00.000Z' }]}
        onSelect={vi.fn()}
        onRemove={onRemove}
      />
    );

    await user.click(screen.getByTestId('CancelIcon'));
    expect(onRemove).toHaveBeenCalledWith('SW1A 1AA');
  });
});
