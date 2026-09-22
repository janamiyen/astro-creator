import { DateTime } from 'luxon';

export interface UtcConversionResult {
  utcDateTime: DateTime;
  utcIso: string;
  year: number;
  month: number;
  day: number;
  decimalHourUtc: number;
  isDst: boolean;
  offsetHours: number;
}

/**
 * Converts local date, local time and IANA timezone to exact UTC date-time
 * Handles historical DST and timezone rules using Luxon IANA database.
 */
export function convertLocalToUtc(
  dateStr: string, // YYYY-MM-DD
  timeStr: string, // HH:mm or HH:mm:ss
  timezoneIana: string
): UtcConversionResult {
  // If time is missing or empty, default to 12:00 (noon)
  const safeTime = timeStr && timeStr.trim() !== '' ? timeStr.trim() : '12:00';
  const parts = safeTime.split(':');
  const hour = parseInt(parts[0], 10) || 12;
  const minute = parseInt(parts[1], 10) || 0;
  const second = parseInt(parts[2], 10) || 0;

  const [yearStr, monthStr, dayStr] = dateStr.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);

  if (isNaN(year) || year < 1800 || year > 2399) {
    throw new Error(
      `Año de nacimiento inválido (${year}). Por favor ingresá un año entre 1900 y 2100.`
    );
  }

  const localDt = DateTime.fromObject(
    { year, month, day, hour, minute, second },
    { zone: timezoneIana }
  );

  if (!localDt.isValid) {
    throw new Error(
      `Fecha u hora inválida: ${dateStr} ${safeTime} (${timezoneIana}): ${localDt.invalidExplanation}`
    );
  }

  const utcDt = localDt.toUTC();
  const decimalHourUtc =
    utcDt.hour + utcDt.minute / 60 + (utcDt.second + utcDt.millisecond / 1000) / 3600;

  return {
    utcDateTime: utcDt,
    utcIso: utcDt.toISO() || utcDt.toString(),
    year: utcDt.year,
    month: utcDt.month,
    day: utcDt.day,
    decimalHourUtc,
    isDst: localDt.isInDST,
    offsetHours: localDt.offset / 60,
  };
}
