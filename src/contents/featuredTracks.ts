import { ContentsProvider } from ".";
import { ansi } from "../utils/ansi";

const featuredTracks = [
  {
    title: "ghost (feat.裏命 & Guiano)",
    composer: "Guiano",
    link: "https://youtu.be/upUv8iWVs-I",
  },
  {
    title: "UNIVERCE (feat.初音ミク & 音街ウナ)",
    composer: "あたたかい水族館",
    link: "https://youtu.be/Q2n-G_SMAEw",
  },
  {
    title: "クロノシスター (feat.初音ミク)",
    composer: "ぽんず",
    link: "https://youtu.be/yduc1fLK2us",
  },
  {
    title: "One Small Leap (feat.星界)",
    composer: "rukaku",
    link: "https://youtu.be/ATBCJbb1RT0",
  },
  {
    title: "異形ヲ啖ふ (feat.初音ミク)",
    composer: "詩屑塵芥",
    link: "https://youtu.be/ocHivJOVQcs",
  },
  {
    title: "Leap (feat.IA)",
    composer: "wolFer",
    link: "https://youtu.be/yy3clMmk9u8",
  },
  {
    title: "Relight",
    composer: "Riela",
    link: "https://youtu.be/fXDhx1GtD1g",
  },
  {
    title: "明日へ (feat.可不)",
    composer: "Tamaco",
    link: "https://youtu.be/IUOkiMMn1S4",
  },
  {
    title: "ポテトチップ (feat.重音テト)",
    composer: "傘村トータ",
    link: "https://youtu.be/cx8cSaUKINk",
  },
];

export const featuredTracksProvider: ContentsProvider = async ({ raw }) => {
  if (raw) {
    return JSON.stringify(featuredTracks);
  }

  return featuredTracks
    .map((t) => {
      const title = ansi.bold(t.title);
      const composer = ansi.blue(t.composer);
      const link = ansi.gray(t.link);
      return `${title} by ${composer}\n${ansi.gray("->")} ${link}`;
    })
    .join("\n");
};
