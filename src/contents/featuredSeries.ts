import { ContentsProvider } from ".";
import { ansi } from "../utils/ansi";

const featuredSeries = [
  {
    title: "放課後帰宅びより",
    author: "松田舞",
    link: "https://comic-action.com/episode/4856001361584756651",
  },
  {
    title: "やめろ好きになってしまう",
    author: "もりぐちあきら",
    link: "https://ynjn.jp/title/21346",
  },
  {
    title: "妹は知っている",
    author: "雁木万里",
    link: "https://yanmaga.jp/comics/妹は知っている",
  },
  {
    title: "没落令嬢の悪党賛歌",
    author: "柳ゆうと (原作：もちもち物質 キャラクター原案：ペペロン)",
    link: "https://manga.nicovideo.jp/comic/73554",
  },
  {
    title: "寿司ガキ",
    author: "ichika",
    link: "https://comic-walker.com/detail/KC_000933_S",
  },
  {
    title: "ざこのみなさんお大事に",
    author: "薗田かんきつ",
    link: "https://manga.nicovideo.jp/comic/74042",
  },
];

export const FeaturedSeriesProvider: ContentsProvider = async ({ raw }) => {
  if (raw) {
    return JSON.stringify(featuredSeries);
  }

  return featuredSeries
    .map((s) => {
      const title = ansi.bold(s.title);
      const author = ansi.blue(s.author);
      const link = ansi.gray(s.link);
      return `${title} by ${author}\n${ansi.gray("->")} ${link}`;
    })
    .join("\n");
};
