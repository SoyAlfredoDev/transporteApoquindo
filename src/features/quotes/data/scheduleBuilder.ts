import type { DaySchedule, DayType, TariffBlock, TimeBlock } from "./tagTariffs";

export interface TariffWindow {
  start: string;
  end: string;
  tariff: TariffBlock;
}

const TARIFF_PRIORITY: Record<TariffBlock, number> = {
  TS: 3,
  TA: 2,
  TB: 1,
};

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return (hours ?? 0) * 60 + (minutes ?? 0);
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Normaliza horarios del PDF (ej. "07:00 - 10:00" → "07:00") */
export function normalizeTime(time: string): string {
  return time.trim().replace(/\s+/g, "");
}

/**
 * Parsea ventanas del tarifario MOP separadas por "/".
 * Ej: "06:30-07:00 / 08:00-09:30" con tarifa TA
 */
export function parseTariffWindows(
  raw: string,
  tariff: TariffBlock,
): TariffWindow[] {
  return raw.split("/").flatMap((segment) => {
    const cleaned = segment.trim();
    if (!cleaned) return [];

    const [startRaw, endRaw] = cleaned.split("-");
    if (!startRaw || !endRaw) return [];

    return [
      {
        start: normalizeTime(startRaw),
        end: normalizeTime(endRaw),
        tariff,
      },
    ];
  });
}

function mergeAdjacentBlocks(blocks: TimeBlock[]): TimeBlock[] {
  if (blocks.length === 0) return blocks;

  const merged: TimeBlock[] = [blocks[0]!];

  for (let i = 1; i < blocks.length; i++) {
    const current = blocks[i]!;
    const last = merged[merged.length - 1]!;

    if (last.tariff === current.tariff && last.end === current.start) {
      last.end = current.end;
    } else {
      merged.push(current);
    }
  }

  return merged;
}

/**
 * Construye un horario de 24 h no solapado. Fuera de ventanas TA/TS aplica TB.
 * Ante solapamiento gana TS > TA > TB.
 */
export function buildDaySchedule(
  dayType: DayType,
  peakWindows: TariffWindow[],
): DaySchedule {
  const boundaries = new Set<number>([0, 24 * 60]);

  for (const window of peakWindows) {
    boundaries.add(timeToMinutes(window.start));
    boundaries.add(timeToMinutes(window.end));
  }

  const points = Array.from(boundaries).sort((a, b) => a - b);
  const blocks: TimeBlock[] = [];

  for (let i = 0; i < points.length - 1; i++) {
    const start = points[i]!;
    const end = points[i + 1]!;
    const midpoint = (start + end) / 2;

    let tariff: TariffBlock = "TB";
    let bestPriority = 0;

    for (const window of peakWindows) {
      const windowStart = timeToMinutes(window.start);
      const windowEnd = timeToMinutes(window.end);

      if (midpoint >= windowStart && midpoint < windowEnd) {
        const priority = TARIFF_PRIORITY[window.tariff];
        if (priority > bestPriority) {
          bestPriority = priority;
          tariff = window.tariff;
        }
      }
    }

    blocks.push({
      start: minutesToTime(start),
      end: minutesToTime(end),
      tariff,
    });
  }

  return { dayType, blocks: mergeAdjacentBlocks(blocks) };
}

export function buildPorticoSchedules(config: {
  weekday: TariffWindow[];
  saturday: TariffWindow[];
  sunday?: TariffWindow[];
}): DaySchedule[] {
  return [
    buildDaySchedule("weekday", config.weekday),
    buildDaySchedule("saturday", config.saturday),
    buildDaySchedule("sunday_holiday", config.sunday ?? []),
  ];
}

/** Horario plano TB todo el día (tramos sin punta en el tarifario) */
export const ALL_DAY_TB: DaySchedule[] = [
  {
    dayType: "weekday",
    blocks: [{ start: "00:00", end: "24:00", tariff: "TB" }],
  },
  {
    dayType: "saturday",
    blocks: [{ start: "00:00", end: "24:00", tariff: "TB" }],
  },
  {
    dayType: "sunday_holiday",
    blocks: [{ start: "00:00", end: "24:00", tariff: "TB" }],
  },
];
