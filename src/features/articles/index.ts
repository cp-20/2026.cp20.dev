import { fetchNoteArticles } from "./providers/note";
import { fetchQiitaArticles } from "./providers/qiita";
import { fetchSizumeArticles } from "./providers/sizume";
import { fetchTrapArticles } from "./providers/trap";
import { fetchZennArticles } from "./providers/zenn";
import { otherArticles } from "./providers/others";
import { Env } from "../../env";

export type Article = {
  source:
    | "qiita.com"
    | "zenn.dev"
    | "trap.jp"
    | "note.com"
    | "sizu.me"
    | "other";
  url: string;
  title: string;
  postedAt: Date;
  ogImageUrl: string | undefined;
};

type Params = {
  qiitaAccessToken: string;
  ghostApiKey: string;
};

const getArticlesMain = async ({ qiitaAccessToken, ghostApiKey }: Params) => {
  const articles = await Promise.all([
    fetchQiitaArticles(qiitaAccessToken),
    fetchZennArticles(),
    fetchNoteArticles(),
    fetchSizumeArticles(),
    fetchTrapArticles(ghostApiKey),
    otherArticles,
  ]).then((articles) => articles.flat());

  articles.sort((a, b) => b.postedAt.getTime() - a.postedAt.getTime());

  return articles;
};

export const fetchArticles = async (e: Env) => {
  const params: Params = {
    qiitaAccessToken: e.QIITA_ACCESS_TOKEN,
    ghostApiKey: e.GHOST_API_KEY,
  };

  return await getArticlesMain(params);
};
