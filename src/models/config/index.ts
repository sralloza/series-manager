import { SeriesConfig } from "./seriesConfig";
import { TodoistConfig } from "./todoistConfig";

export interface Config {
  todoist: TodoistConfig;
  series: SeriesConfig[];
}
