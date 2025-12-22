import { HDate, HebrewCalendar, Location, Event, CalOptions } from '@hebcal/core';
// FIXED: Import DafYomiEvent from the correct learning package
import { DafYomiEvent } from '@hebcal/learning';

// Extend the CalOptions interface to include properties valid at runtime
interface ExtendedCalOptions extends CalOptions {
  dafyomi?: boolean;
}

export interface DailyStudyData {
  date: {
    hebrew: string;
    gregorian: string;
  };
  parsha: {
    name: string;
    ref: string;
    description: string;
  };
  dafYomi: {
    name: string;
    ref: string;
  };
  tanya: {
    name: string;
    ref: string;
  };
  holidays: {
    name: string;
    date: string;
    workPermitted: boolean;
  }[];
  shabbat: {
    candleLighting: string;
    havdalah: string;
    parsha: string;
  } | null;
}

/**
 * getParsha
 * Extracts the weekly Torah portion for a given Hebrew Date.
 */
export function getParsha(hd: HDate) {
  // Look ahead to the next Shabbat (Saturday = 6)
  const shabbatDate = hd.onOrAfter(6);
  // Get all events for that Shabbat
  const events = HebrewCalendar.getHolidaysOnDate(shabbatDate) || [];
  
  // Flag 33 (1 << 5) indicates PARSHA_HASHAVUA in Hebcal
  const parshaEvent = events.find((e) => e.getFlags() === 33);

  const name = parshaEvent ? parshaEvent.render() : "Special Reading";
  
  return {
    name: name,
    ref: `${name} • Genesis`, 
    description: "Weekly Torah Portion"
  };
}

/**
 * getDaf
 * Extracts the Daf Yomi (Talmud) portion for today using the learning library.
 */
export function getDaf(hd: HDate) {
  // FIXED: Use the class directly from @hebcal/learning
  const daf = new DafYomiEvent(hd);
  return {
    name: "Daf Yomi",
    ref: daf.render()
  };
}

/**
 * getTanya
 * Placeholder for Chabad Tanya study cycle.
 */
export function getTanya(hd: HDate) {
  const dateStr = hd.getDate(); 
  return {
    name: "Tanya",
    ref: `Likutei Amarim (Day ${dateStr})` 
  };
}

/**
 * calculateDailyStudy
 * Orchestrates the data gathering for the "Today" menu.
 */
export function calculateDailyStudy(date = new Date(), zipCode = "10018"): DailyStudyData {
  const hd = new HDate(date);
  const location = Location.lookup(zipCode); 

  const options: ExtendedCalOptions = {
    start: date,
    end: new Date(date.getTime() + 90 * 24 * 60 * 60 * 1000), 
    isHebrewYear: false,
    candlelighting: true, 
    location: location,   
    sedrot: false,
    dafyomi: false, // Handled separately via getDaf
  };

  // 1. Get Upcoming Holidays (Next 3)
  const upcomingEvents = HebrewCalendar.calendar(options);

  // Filter for major holidays (Yom Tov)
  const holidays = upcomingEvents
    .filter(ev => ev.getFlags() & 8) 
    .slice(0, 3)
    .map((ev: Event) => ({
      name: ev.render(),
      date: ev.getDate().greg().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      workPermitted: false,
    }));

  const parshaData = getParsha(hd);
  
  const shabbatEvents = upcomingEvents.filter(ev => ev.getDesc() === "Candle lighting");
  const nextShabbat = shabbatEvents[0];

  return {
    date: {
      hebrew: hd.render(),
      gregorian: date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
    },
    parsha: parshaData,
    dafYomi: getDaf(hd),
    tanya: getTanya(hd),
    holidays: holidays,
    shabbat: {
      candleLighting: nextShabbat ? nextShabbat.render().split(": ")[1] : "Check Local Time", 
      havdalah: "Check Local Time", 
      parsha: parshaData.name
    }
  };
}