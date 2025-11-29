import type { PromptSection } from '../lib/types-global';


export function toLongTime(ts?: string | null) {
  if (!ts) return '';
  return new Date(ts).toLocaleString();
}

export function toShortTime(ts?: string | null) {
  if (!ts) return '';
  return new Date(ts).toLocaleTimeString();
}

export function formatIso(date: Date) {
  return date.toISOString().split('T')[0];
}

export function cutTime(time?: string | null) {
  if (!time) return '';
  return time.slice(0, 5);
}

export function addMinutes(time: string, minute: number) {
  const [h, m] = time.split(':').map(Number);
  const total = h * 60 + m + minute;
  const hh = String(Math.floor(total / 60)).padStart(2, '0');
  const mm = String(total % 60).padStart(2, '0');
  return `${hh}:${mm}:00`;
}


export function formatDate(date: Date) {
  return date.toISOString().split('T')[0];
}

export function formatPretty(dateStr: string) {
  const date = new Date(dateStr + 'T00:00:00');
  if (Number.isNaN(date.getTime())) return dateStr;
  return date.toDateString();
}

export function makeSlotList(open: string, close: string, step: number) {
  const result: string[] = [];
  let current = parseTime(open);
  const end = parseTime(close);
  while (current < end) {
    const hour = String(Math.floor(current / 60)).padStart(2, '0');
    const minute = String(current % 60).padStart(2, '0');
    result.push(`${hour}:${minute}`);
    current += step;
  }
  return result;
}

export function parseTime(time: string) {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

export function buildAllowedSet(
  info: { isDayOff: boolean; start?: string; end?: string } | undefined,
  slots: string[]
) {
  if (!info) return new Set(slots);
  if (info.isDayOff) return new Set<string>();
  const set = new Set<string>();
  slots.forEach((slot: string) => {
    if (
      !info.start ||
      !info.end ||
      (slot >= (info.start || '00:00') && slot <= (info.end || '23:59'))
    ) {
      set.add(slot);
    }
  });
  return set;
}

export const slotConfig = { open: '09:00', close: '18:30', step: 30 };
export const slotList = makeSlotList(slotConfig.open, slotConfig.close, slotConfig.step);


export function simpleSerialize(list: PromptSection[]) {
  const obj: Record<string, string> = {};
  list.forEach((item) => {
    const key = item.title.trim();
    if (key) obj[key] = item.content;
  });
  return obj;
}