import { DateTime } from "luxon";

export interface Task {
  id: number
  season: number;
  episode: number;
  serieName: string;
  description: string;
  date: DateTime;
  dateStr: string;
}
