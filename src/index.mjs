import bunyan from "bunyan";
import dotenv from "dotenv";
import { DateTime } from "luxon";
import config from "./config.mjs";
import { stats } from "./counters.mjs";
import getEpisodes from "./episodes.mjs";
import {
  addEpisodeTask,
  getEpisodeTasks,
  updateEpisodeTask,
} from "./todoist.mjs";
import { genTaskDescription } from "./utils.mjs";

const logger = bunyan.createLogger({ name: "main" });
dotenv.config();

const getAllEpisodes = async () => {
  const today = DateTime.now().startOf("day");
  const realEpisodes = [];

  for (const serie of config.series) {
    const episodes = (await getEpisodes(serie.name, serie.encodedName)).filter(
      (ep) => {
        if (serie?.ignoreDates === true) {
          return true;
        } else {
          return ep.date >= today;
        }
      }
    );
    realEpisodes.push(...episodes);
  }

  return realEpisodes;
};

const main = async () => {
  const episodeTasks = await getEpisodeTasks();
  logger.info("Got %d episode tasks", episodeTasks.length);

  const realEpisodes = await getAllEpisodes();
  logger.info("Got %d real episodes", realEpisodes.length);

  for (const episode of realEpisodes) {
    const task = episodeTasks.find(
      (task) =>
        task.serieName === episode.serie &&
        task.season === episode.season &&
        task.episode === episode.episode
    );
    if (task) {
      if (
        episode.dateStr !== task.dateStr ||
        task.description !== genTaskDescription(episode)
      )
        await updateEpisodeTask(task, episode);
    } else {
      await addEpisodeTask(episode);
    }
  }

  logger.info({ stats }, "Done");
};

await main();