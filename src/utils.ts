import { Episode } from "./models/episode";

export const genTaskTitle = (episode: Episode) => {
  return `${episode.serie} ${episode.season}x${episode.episode.toString().padStart(2, "0")}`;
}

export const genTaskDescription = (episode: Episode) => {
  return `Released: ${episode.dateStr} on ${episode.platform}`
}
