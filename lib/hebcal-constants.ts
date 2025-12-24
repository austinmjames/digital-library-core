/**
 * lib/hebcal-constants.ts
 * Shared interfaces and enrichment data for Jewish calendar logic.
 */

export interface StudyItem {
  name: string;
  ref: string;
  url?: string;
}

export interface DailySchedule {
  date: string;
  dafyomi?: StudyItem;
  mishnayomi?: StudyItem;
  nachyomi?: StudyItem;
  parasha?: StudyItem;
  haftarah?: StudyItem;
  tanya?: StudyItem;
  rambam?: StudyItem;
}

export interface CalendarEvent {
  title: string;
  date: string;
  category:
    | "candles"
    | "havdalah"
    | "holiday"
    | "roshchodesh"
    | "fast"
    | "zmanim"
    | "other";
  yomtov?: boolean;
  description?: string;
  status?: string;
}

export interface UpcomingInfo {
  shabbat: {
    start?: string;
    end?: string;
    parasha?: string;
    haftarah?: string;
  };
  events: CalendarEvent[];
}

export interface HebcalApiItem {
  category: string;
  title: string;
  date: string;
  memo?: string;
  yomtov?: boolean;
  subcat?: string;
}

/**
 * HOLIDAY_ENRICHMENT
 * Comprehensive dictionary to provide educational context and halachic status.
 */
export const HOLIDAY_ENRICHMENT: Record<
  string,
  { desc: string; status: string }
> = {
  "Rosh Hashana": {
    desc: "The Jewish New Year. A time for prayer, reflection, and hearing the Shofar.",
    status: "Yom Tov",
  },
  "Yom Kippur": {
    desc: "The Day of Atonement. The holiest day, spent in fasting and teshuvah (repentance).",
    status: "Full Fast",
  },
  Sukkot: {
    desc: "Feast of Tabernacles. Celebrating the harvest and God's protection in the desert.",
    status: "Yom Tov",
  },
  "Shemini Atzeret": {
    desc: "A separate festival following Sukkot, focused on the intimacy of the Jewish people with God.",
    status: "Yom Tov",
  },
  "Simchat Torah": {
    desc: "Celebrating the completion and restart of the annual Torah reading cycle.",
    status: "Yom Tov",
  },
  Chanukah: {
    desc: "The Festival of Lights. Commemorating the miracle of the oil and the Maccabean victory.",
    status: "Minor Holiday",
  },
  Purim: {
    desc: "Celebrating the salvation of the Jews in Persia from Haman's plot as told in Esther.",
    status: "Minor Holiday",
  },
  Pesach: {
    desc: "Passover. Commemorating the Exodus from Egypt and the birth of the Jewish nation.",
    status: "Yom Tov",
  },
  Shavuot: {
    desc: "The Festival of Weeks. Celebrating the harvest and the giving of the Torah at Sinai.",
    status: "Yom Tov",
  },
  "Tish'a B'Av": {
    desc: "The major day of mourning for the destruction of the First and Second Temples.",
    status: "Full Fast",
  },
  "Rosh Chodesh": {
    desc: "The celebration of the New Moon, marking the start of a new Hebrew month.",
    status: "Minor Holiday",
  },
  "Tu BiShvat": {
    desc: "The New Year for Trees, celebrating nature and the fruits of the Land of Israel.",
    status: "Minor Holiday",
  },
  "Lag BaOmer": {
    desc: "Celebrating the lives of Rabbi Shimon bar Yochai and the students of Rabbi Akiva.",
    status: "Minor Holiday",
  },
  "Fast of Gedalia": {
    desc: "Mourning the assassination of Gedaliah, the governor of Judah.",
    status: "Minor Fast",
  },
  "Fast of Tevet": {
    desc: "Mourning the start of the siege of Jerusalem by Nebuchadnezzar.",
    status: "Minor Fast",
  },
  "Fast of Esther": {
    desc: "Commemorating the fast of Esther and the Jews before their battle with Haman.",
    status: "Minor Fast",
  },
  "Fast of Tammuz": {
    desc: "Mourning the breach of Jerusalem's walls before the Temple's destruction.",
    status: "Minor Fast",
  },
};
