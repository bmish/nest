#!/usr/bin/env node

import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { json2csv } from "json-2-csv";

type NestSummary = Record<
  string,
  {
    startTs: Date;
    endTs: Date;
    cycles: readonly {
      heat1: boolean;
      duration: string;
      caption: {
        parameters: {
          startTime: string;
          endTime: string;
        };
      };
    }[];
    events: readonly {
      eventType: string;
      duration: string;
    }[];
  }
>;

// Load environment variables.
const pathDataExport = process.env.PATH_DATA_EXPORT;
if (!pathDataExport) {
  console.error("Missing environment variable PATH_DATA_EXPORT");
  process.exit(1);
}

// Load file.
const file = readFileSync(pathDataExport, "utf8");
const json: NestSummary = JSON.parse(file);

// Basic calculation.
const dailyHeat = jsonSummaryToDailyHeat(json);
writeFileSync(join(dirname(pathDataExport), "days.csv"), json2csv(dailyHeat));

// Attempt at a corrected calculation.
const dailyHeatCorrectedForTimezone =
  jsonSummaryToDailyHeatCorrectedForTimezone(json);
writeFileSync(
  join(dirname(pathDataExport), "days-corrected-for-timezone.csv"),
  json2csv(dailyHeatCorrectedForTimezone),
);

function jsonSummaryToDailyHeat(json: NestSummary) {
  const days = [];
  for (const [day, value] of Object.entries(json)) {
    const cyclesHeating = value.cycles.filter((event) => event.heat1);
    const eventsHeating = value.events.filter(
      (event) => event.eventType === "EVENT_TYPE_HEAT",
    );
    const durationHeatingEvents = eventsHeating.reduce(
      (accumulator, event) =>
        accumulator + Number(event.duration.replace("s", "")),
      0,
    );
    const durationHeatingCycles = cyclesHeating.reduce(
      (accumulator, event) =>
        accumulator + Number(event.duration.replace("s", "")),
      0,
    );
    days.push({
      day: day.split("T")[0],
      countHeatingCycles: cyclesHeating.length,
      countHeatingEvents: eventsHeating.length,
      durationHeatingCycles,
      durationHeatingCyclesHours: durationHeatingCycles / 3600,
      durationHeatingEvents,
      durationHeatingEventsHours: durationHeatingEvents / 3600,
    });
  }

  return days;
}

function jsonSummaryToDailyHeatCorrectedForTimezone(json: NestSummary) {
  const dayToDuration: Record<string, number> = {};
  const cycles = Object.values(json).flatMap((day) => day.cycles);
  for (const cycle of cycles.filter((cycle) => cycle.heat1)) {
    const duration = Number(cycle.duration.replace("s", ""));
    const startTime = new Date(
      cycle.caption.parameters.startTime.replace("[UTC]", ""),
    );
    const day = startTime
      .toLocaleString("en-us", {
        timeZone:
          process.env.TIMEZONE ||
          Intl.DateTimeFormat().resolvedOptions().timeZone,
      })
      .split(",")[0];
    dayToDuration[day] = (dayToDuration[day] || 0) + duration;
  }

  return Object.entries(dayToDuration).map(([day, durationHeatingCycles]) => ({
    day,
    durationHeatingCycles,
    durationHeatingCyclesHours: durationHeatingCycles / 3600,
  }));
}
