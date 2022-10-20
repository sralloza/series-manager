import { Task as TodoistTask, TodoistApi } from "@doist/todoist-api-typescript";
import bunyan from "bunyan";
import { DateTime } from "luxon";
import config from "./config";
import { incrementTasksCreated, incrementTasksEdited } from "./counters";
import { Episode } from "./models/episode";
import { Task } from "./models/task";
import { genTaskDescription, genTaskTitle } from "./utils";

const logger = bunyan.createLogger({ name: "todoist" });
const api = new TodoistApi(config.todoist.token);

const processTask = (task: TodoistTask): Task => {
  const parts = task.content.split(" ");
  const lastPart = parts[parts.length - 1]
    .split("x")
    .map((e: string) => parseInt(e));

  const date = task.due?.date;
  if (!date) {
    logger.fatal({ task }, "Task has no due date");
    throw new Error("Task without due date: " + task);
  }

  return {
    id: +task.id,
    season: lastPart[0],
    episode: lastPart[1],
    serieName: task.content.replace(parts[parts.length - 1], "").trim(),
    description: task.description,
    date: DateTime.fromSQL(date),
    dateStr: date,
  };
};

const isTask = (task: any) => {
  const parts = task.content.split(" ");
  const lastPart = parts[parts.length - 1];
  return /\d+x\d+/.test(lastPart);
};

export const getEpisodeTasks = async (): Promise<Task[]> => {
  return (
    await api.getTasks({
      projectId: config.todoist.projectId.toString(),
      sectionId: config.todoist.sectionId?.toString(),
    })
  )
    .filter(isTask)
    .map(processTask);
};

export const updateEpisodeTask = async (task: Task, episode: Episode) => {
  logger.info({ task }, "Updating task");

  const todoistTask = await api.updateTask(task.id.toString(), {
    content: genTaskTitle(episode),
    description: genTaskDescription(episode),
    dueDate: episode.dateStr,
  });
  incrementTasksEdited();
  return processTask(todoistTask);
};

export const addEpisodeTask = async (episode: Episode) => {
  logger.info({ episode }, "Creating task for episode");

  const todoistTask = await api.addTask({
    content: genTaskTitle(episode),
    description: genTaskDescription(episode),
    projectId: config.todoist.projectId.toString(),
    sectionId: config.todoist.sectionId?.toString(),
    dueDate: episode.dateStr,
  });

  incrementTasksCreated();
  return processTask(todoistTask);
};
