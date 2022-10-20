import bunyan from "bunyan";
import { load } from "cheerio";
import { DateTime } from "luxon";
import fetch from "node-fetch";
import { Episode } from "./models/episode";

const logger = bunyan.createLogger({ name: "episodes" });
const getEpisodes = async (
  serieName: string,
  normalizedName: string
): Promise<Episode[]> => {
  const response = await fetch(
    "https://thetvdb.com/series/" + normalizedName + "/allseasons/official"
  );
  const body = await response.text();

  if (!response.ok) {
    logger.fatal(
      { response, body },
      "Could not fetch episodes from thetvdb.com"
    );
    throw new Error("Could not fetch episodes: " + response.status);
  }

  const $ = load(body);

  return $("li.list-group-item")
    .toArray()
    .map((el, _) => {
      const htmlTitle = $(el).find("h4");
      const title = htmlTitle.find("a").text().trim();
      const rawEpisode = htmlTitle.find("span").text().replace("S", "");
      if (rawEpisode.length === 0) {
        return null;
      }
      let r = rawEpisode.split("E").map((el) => parseInt(el));
      const season = r[0];
      const episode = r[1];

      const infos = $(el).find("ul > li");
      const date = DateTime.fromFormat($(infos[0]).text(), "LLLL d, yyyy");
      const platform = infos.length > 1 ? $(infos[1]).text() : null;
      return {
        serie: serieName,
        season,
        episode,
        title,
        date,
        dateStr: date.toISODate(),
        platform,
      } as Episode;
    })
    .filter((ep) => ep !== null) as Episode[];
};

export default getEpisodes;
