export const stats = { updated: 0, created: 0 };

export const incrementTasksEdited = () => {
  stats.updated += 1;
};
export const incrementTasksCreated = () => {
  stats.created += 1;
};
