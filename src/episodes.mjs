import { load } from "cheerio";
import { DateTime } from "luxon";
import fetch from "node-fetch";
import bunyan from "bunyan";

const logger = bunyan.createLogger({ name: "episodes" });

const getEpisodes = async (serieName, normalizedName) => {
  const response = await fetch(
    "https://thetvdb.com/series/" + normalizedName + "/allseasons/official"
  );
  const body = await response.text();

  if (!response.ok) {
    logger.fatal({response, body} , "Could not fetch episodes from thetvdb.com");
    throw new Error("Could not fetch episodes: " + response.status);
  }

  const $ = load(body);

  return $("li.list-group-item")
    .toArray()
    .map((el, _) => {
      const htmlTitle = $(el).find("h4");
      const title = htmlTitle.find("a").text().trim();
      const rawEpisode = htmlTitle.find("span").text().replace("S", "");
      var season = null;
      var episode = null;
      if (rawEpisode.length > 0) {
        let r = rawEpisode.split("E").map((el) => parseInt(el));
        season = r[0];
        episode = r[1];
      }

      const infos = $(el).find("ul > li");
      const date = DateTime.fromFormat(
        $(infos[0]).text(),
        "LLLL d, yyyy"
      );
      const platform = infos.length > 1 ? $(infos[1]).text() : null;
      return {
        serie: serieName,
        season,
        episode,
        title,
        date,
        dateStr: date.toISODate(),
        platform,
      };
    })
    .filter((ep) => ep.season !== null && ep.episode !== null);
};

export default getEpisodes;
