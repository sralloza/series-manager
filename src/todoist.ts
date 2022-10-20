import bunyan from "bunyan";
import { DateTime } from "luxon";
import fetch from "node-fetch";
import config from "./config";
import { incrementTasksCreated, incrementTasksEdited } from "./counters";
import { Episode } from "./models/episode";
import { Task } from "./models/task";
import { genTaskDescription, genTaskTitle } from "./utils";

const logger = bunyan.createLogger({ name: "todoist" });

const isTask = (task: any) => {
  const parts = task.content.split(" ");
  const lastPart = parts[parts.length - 1];
  return /\d+x\d+/.test(lastPart);
};

export const getEpisodeTasks = async (): Promise<Task[]> => {
  const headers = { Authorization: "Bearer " + process.env.TODOIST_API_TOKEN };
  let url ="https://api.todoist.com/rest/v2/tasks?project_id=" + config.todoist.projectId;
  if (config.todoist.sectionId !== undefined) {
    url += "&section_id=" + config.todoist.sectionId;
  }
  const response = await fetch(
    url,
    { headers }
  );
  if (!response.ok) {
    const reason = await response.text();
    logger.fatal(
      { response, reason },
      "Could not fetch episode tasks from todoist"
    );
    throw new Error(
      "Could not fetch episodes: " + response.status + ", reason: " + reason
    );
  }
  return JSON.parse(await response.text())
    .filter(isTask)
    .map((task: any) => {
      const parts = task.content.split(" ");
      const lastPart = parts[parts.length - 1]
        .split("x")
        .map((e: string) => parseInt(e));

      return {
        id: task.id,
        season: lastPart[0],
        episode: lastPart[1],
        serieName: task.content.replace(parts[parts.length - 1], "").trim(),
        description: task.description,
        date: DateTime.fromSQL(task.due.date),
        dateStr: task.due.date,
      };
    });
};

export const updateEpisodeTask = async (task: Task, episode: Episode) => {
  logger.info({ task }, "Updating task");

  const payload = {
    content: genTaskTitle(episode),
    description: genTaskDescription(episode),
    due_date: episode.dateStr,
  };
  const response = await fetch(
    "https://api.todoist.com/rest/v2/tasks/" + task.id,
    {
      method: "post",
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + process.env.TODOIST_API_TOKEN,
      },
    }
  );

  if (!response.ok) {
    const reason = await response.text();
    logger.fatal(
      { response, reason },
      "Could not update episode task in todoist"
    );
    throw new Error(
      "Could not update task: " + response.status + ", reason: " + reason
    );
  }

  incrementTasksEdited();
};

export const addEpisodeTask = async (episode: Episode) => {
  logger.info({ episode }, "Creating task for episode");

  const payload: any = {
    content: genTaskTitle(episode),
    description: genTaskDescription(episode),
    project_id: config.todoist.projectId,
    due_date: episode.dateStr,
  };
  if (config.todoist.sectionId !== undefined) {
    payload.section_id = config.todoist.sectionId;
  }

  const response = await fetch(
    "https://api.todoist.com/rest/v2/tasks",
    {
      method: "post",
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + process.env.TODOIST_API_TOKEN,
      },
    }
  );

  if (!response.ok) {
    const reason = await response.text();
    logger.fatal(
      { response, reason },
      "Could not create episode task in todoist"
    );
    throw new Error(
      "Could not create task: " + response.status + ", reason: " + reason
    );
  }

  incrementTasksCreated();
};
