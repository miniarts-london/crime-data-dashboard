'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Autocomplete, Box, TextField, Button, CircularProgress, Typography } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { type Dayjs } from 'dayjs';
import { parsePostcodesInput } from '@/lib/postcodes';
import { MIN_SUGGEST_CHARS} from '@/config/config'

interface SearchBarProps {
  postcodes: string[];
  onPostcodesChange: (value: string[]) => void;
  from: string;
  onFromChange: (value: string) => void;
  to: string;
  onToChange: (value: string) => void;
  onSubmit: (e: FormEvent) => void;
  onReset: () => void;
  loading: boolean;
  notice?: string;
}

export default function SearchBar({
  postcodes,
  onPostcodesChange,
  from,
  onFromChange,
  to,
  onToChange,
  onSubmit,
  onReset,
  loading,
  notice,
}: SearchBarProps) {
  const [inputValue, setInputValue] = useState('');
  const [liveOptions, setLiveOptions] = useState<string[]>([]);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const latestMonth = dayjs().startOf('month');
  const fromDate = from ? dayjs(`${from}-01`) : null;

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (abortRef.current) abortRef.current.abort();

    const query = inputValue.trim();
    if (query.length < MIN_SUGGEST_CHARS) {
      queueMicrotask(() => {
        setLiveOptions([]);
        setSuggestLoading(false);
      });
      return;
    }

  }, [inputValue]);

  // Splits on commas and adds each non-empty piece as a chip, deduping
  // against what's already selected. Lets someone paste a whole
  // "SW1A 1AA, EC1A 1BB" string in one go, not just type one postcode at a time.
  const addFromText = (text: string) => {
    const parts = text
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean);
    if (parts.length === 0) return;
    const merged = new Set(postcodes);
    parts.forEach((p) => merged.add(p));
    onPostcodesChange(Array.from(merged));
  };

  const isUnavailableMonth = (month: Dayjs, min?: Dayjs | null) => {
    if (month.isAfter(latestMonth, 'month')) return true;
    if (min && month.isBefore(min, 'month')) return true;
    return false;
  };

  const options = liveOptions;
  const { valid } = parsePostcodesInput([...postcodes, inputValue].join(','));
  const canSearch = valid.length > 0 && !loading;
  const dateFieldSx = {
    width: { xs: '100%', sm: 'auto' },
    '& .MuiOutlinedInput-root': {
      height: 40,
      minHeight: 40,
      boxSizing: 'border-box' as const,
    },
  };
  const datePickerSx = {
    width: { xs: '100%', sm: 'auto' },
    minWidth: { xs: '100%', sm: 0 },
    flex: { xs: '1 1 100%', sm: '0 0 auto' },
    '& .MuiTextField-root': { width: { xs: '100%', sm: 'auto' } },
  };

  return (
    <Box
      component="form"
      onSubmit={(event) => {
        if (!canSearch) {
          event.preventDefault();
          return;
        }
        onSubmit(event);
      }}
      sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center', width: '100%' }}
    >
      <Autocomplete
        multiple
        freeSolo
        filterSelectedOptions
        options={options}
        loading={suggestLoading}
        value={postcodes}
        inputValue={inputValue}
        onChange={(_event, newValue) => {
          const cleaned = newValue.map((v) => v.trim()).filter(Boolean);
          onPostcodesChange(Array.from(new Set(cleaned)));
        }}
        onInputChange={(_event, newInputValue, reason) => {
          if (reason === 'input' && newInputValue.includes(',')) {
            const segments = newInputValue.split(',');
            const last = segments.pop() ?? '';
            addFromText(segments.join(','));
            setInputValue(last.replace(/^\s+/, ''));
            return;
          }
          setInputValue(newInputValue);
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            size="small"
            label="Postcodes"
            placeholder={postcodes.length ? 'Start typing a postcode' : 'SW1A 1AA'}
            onBlur={() => {
              if (inputValue.trim()) {
                addFromText(inputValue);
                setInputValue('');
              }
            }}
            slotProps={{
              ...params.slotProps,
              input: {
                ...params.slotProps.input,
                endAdornment: (
                  <>
                    {suggestLoading && <CircularProgress color="inherit" size={16} sx={{ mr: 1 }} />}
                    {params.slotProps.input.endAdornment}
                  </>
                ),
              },
            }}
          />
        )}
        sx={{
          width: { xs: '100%', sm: 'auto' },
          minWidth: { xs: '100%', sm: 260 },
          flex: { xs: '1 1 100%', sm: '1 1 260px' },
        }}
      />
      <DatePicker
        label="From"
        views={['year', 'month']}
        openTo="month"
        format="MMM YYYY"
        value={fromDate}
        maxDate={latestMonth}
        shouldDisableMonth={(month) => isUnavailableMonth(month)}
        enableAccessibleFieldDOMStructure={false}
        onChange={(newValue: Dayjs | null) => {
          if (!newValue || !newValue.isValid()) return;
          const nextFrom = newValue.format('YYYY-MM');
          onFromChange(nextFrom);
          if (to && nextFrom > to) onToChange(nextFrom);
        }}
        sx={datePickerSx}
        slotProps={{ textField: { size: 'small', sx: dateFieldSx } }}
      />
      <DatePicker
        label="To"
        views={['year', 'month']}
        openTo="month"
        format="MMM YYYY"
        value={to ? dayjs(`${to}-01`) : null}
        minDate={fromDate ?? undefined}
        maxDate={latestMonth}
        shouldDisableMonth={(month) => isUnavailableMonth(month, fromDate)}
        enableAccessibleFieldDOMStructure={false}
        onChange={(newValue: Dayjs | null) => {
          if (newValue && newValue.isValid()) onToChange(newValue.format('YYYY-MM'));
        }}
        sx={datePickerSx}
        slotProps={{ textField: { size: 'small', sx: dateFieldSx } }}
      />
      <Button type="submit" variant="contained" aria-label="Search" disabled={!canSearch} sx={{ height: 40 }}>
        {loading ? <CircularProgress size={20} color="inherit" /> : 'Search'}
      </Button>
      <Button
        type="button"
        variant="outlined"
        color="primary"
        sx={{ height: 40 }}
        onClick={() => {
          if (abortRef.current) abortRef.current.abort();
          setInputValue('');
          setLiveOptions([]);
          setSuggestLoading(false);
          onReset();
        }}
      >
        Reset
      </Button>
      {notice && (
        <Typography variant="caption" color="error" sx={{ width: '100%' }}>
          {notice}
        </Typography>
      )}
    </Box>
  );
}
