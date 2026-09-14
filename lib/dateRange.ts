import dayjs from 'dayjs';

export function currentMonth(): string {
  return dayjs().format('YYYY-MM');
}

// Inclusive list of 'YYYY-MM' strings between from and to (swapped if given in
// reverse order). Falls back to just the current month if either is invalid.
export function monthsBetween(from: string, to: string): string[] {
  let start = dayjs(`${from}-01`);
  let end = dayjs(`${to}-01`);
  if (!start.isValid() || !end.isValid()) return [currentMonth()];
  if (end.isBefore(start)) {
    const tmp = start;
    start = end;
    end = tmp;
  }
  const months: string[] = [];
  let cursor = start;
  let guard = 0;
  while ((cursor.isBefore(end) || cursor.isSame(end, 'month')) && guard < 240) {
    months.push(cursor.format('YYYY-MM'));
    cursor = cursor.add(1, 'month');
    guard += 1;
  }
  return months;
}
