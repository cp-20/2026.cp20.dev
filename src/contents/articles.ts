import { ContentsProvider } from ".";
import { fetchArticles } from "../features/articles";
import { ansi } from "../utils/ansi";

const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const ArticlesProvider: ContentsProvider = async ({ env, raw }) => {
  const articles = await fetchArticles(env);
  if (raw) {
    return JSON.stringify(articles);
  }

  return articles
    .toSorted((a, b) => b.postedAt.getTime() - a.postedAt.getTime())
    .map((a) => {
      const date = ansi.cyan(`[${formatDate(a.postedAt)}]`);
      const source = ansi.blue(a.source);
      const title = ansi.bold(a.title);
      const url = ansi.gray(a.url);
      return `${date} ${title} (${source})\n${ansi.gray("->")} ${url}`;
    })
    .join("\n");
};
