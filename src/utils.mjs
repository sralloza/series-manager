export const genTaskTitle = (episode) => {
  return `${episode.serie} ${episode.season}x${episode.episode.toString().padStart(2, "0")}`;
}

export const genTaskDescription = (episode) => {
  return `Released: ${episode.dateStr} on ${episode.platform}`
}
