export function formatDate(
  date: Date | string,
  timezone: string,
  options?: Intl.DateTimeFormatOptions
): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };
  return new Intl.DateTimeFormat('en-US', {
    ...defaultOptions,
    ...options,
    timeZone: timezone,
  }).format(new Date(date));
}
