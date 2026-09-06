/**
 * Shared display formatters. No currency default -- every school has its
 * own real currency (JOD, JPY, KWD, ...), each with its own ISO-4217 minor
 * unit (0, 2, or 3 decimal places), so a hardcoded fallback here would
 * silently mis-format money for every school that isn't that one currency.
 * Callers must pass the tenant's real currency, e.g. useSchoolStore().currency.
 */
export function formatMoney(value, currency) {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(
    Number(value ?? 0)
  );
}

// --- Timezone-aware date helpers -------------------------------------------
// Every event instant is stored in UTC. These are the only two places that
// should ever convert between a UTC instant and a school's local wall clock —
// call these, don't hand-roll getFullYear()/getHours() on a raw Date.

const DAY_INDEX = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

function pad2(n) {
  return String(n).padStart(2, '0');
}

/** Wall-clock {year,month,day,hour,minute,second} for a UTC instant, as seen in `tz`. */
function zonedParts(ms, tz) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(new Date(ms));
  const map = {};
  for (const p of parts) map[p.type] = p.value;
  let hour = parseInt(map.hour, 10);
  if (hour === 24) hour = 0; // some engines emit "24" for midnight with hour12:false
  return {
    year: parseInt(map.year, 10),
    month: parseInt(map.month, 10),
    day: parseInt(map.day, 10),
    hour,
    minute: parseInt(map.minute, 10),
    second: parseInt(map.second, 10),
  };
}

function partsToUTCms(parts) {
  return Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second || 0);
}

/** A UTC ISO instant -> the "YYYY-MM-DDTHH:mm" string a datetime-local input expects, in `tz`. */
export function toDateTimeLocal(iso, tz) {
  if (!iso) return '';
  const p = zonedParts(new Date(iso).getTime(), tz);
  return `${p.year}-${pad2(p.month)}-${pad2(p.day)}T${pad2(p.hour)}:${pad2(p.minute)}`;
}

/**
 * The inverse of toDateTimeLocal: a "YYYY-MM-DDTHH:mm" wall-clock string,
 * meant as a moment in `tz`, -> the correct UTC ISO instant.
 *
 * A datetime-local string has no offset, so the actual UTC instant it
 * denotes depends on `tz`'s offset *at that moment* — which briefly changes
 * on a DST transition. This converges to the right instant with one
 * re-check: treat the wall clock as a first-guess UTC instant, see what
 * wall clock that guess actually shows in `tz`, and correct by the
 * difference — twice, since the offset used to format the corrected guess
 * can itself flip right at a DST boundary.
 */
export function fromDateTimeLocal(str, tz) {
  if (!str) return '';
  const [datePart, timePart] = str.split('T');
  const [y, mo, d] = datePart.split('-').map(Number);
  const [h, mi] = (timePart || '00:00').split(':').map(Number);
  const target = Date.UTC(y, mo - 1, d, h, mi, 0);

  let guess = target;
  for (let i = 0; i < 2; i++) {
    const shownAsUTC = partsToUTCms(zonedParts(guess, tz));
    guess -= shownAsUTC - target;
  }
  return new Date(guess).toISOString();
}

/** Locale-aware date/time display for a UTC ISO instant, in a given zone. */
export function formatDate(iso, opts = {}) {
  if (!iso) return '';
  return new Intl.DateTimeFormat(undefined, opts).format(new Date(iso));
}

/**
 * JS day-of-week index (0=Sunday..6=Saturday) of the first day of the week,
 * i.e. the day right after the weekend's last day. Defaults to Sunday when
 * no weekend is configured.
 */
export function firstDayOfWeek(weekendDays = []) {
  const set = new Set((weekendDays || []).map((d) => DAY_INDEX[d]).filter((i) => i !== undefined));
  if (set.size === 0) return 0;
  for (let i = 0; i < 7; i++) {
    if (set.has(i) && !set.has((i + 1) % 7)) {
      return (i + 1) % 7;
    }
  }
  return 0;
}
