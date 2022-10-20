import {DateTime} from "luxon";

export interface EpisodeRaw {
  serie: string;
  season: number | null;
  episode: number | null;
  title: string;
  date: DateTime;
  dateStr: string;
  platform: string;
};
