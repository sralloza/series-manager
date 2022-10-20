import {DateTime} from "luxon";

export interface Episode {
  serie: string;
  season: number;
  episode: number;
  title: string;
  date: DateTime;
  dateStr: string;
  platform: string | null;
};
