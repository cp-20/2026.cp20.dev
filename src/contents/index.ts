import { Hono } from "hono";
import { Env, parseEnv } from "../env";
import { ArticlesProvider } from "./articles";
import { env } from "hono/adapter";
import { WhoamiProvider } from "./whoami";
import { featuredTracksProvider } from "./featuredTracks";
import { FeaturedSeriesProvider } from "./featuredSeries";
import { workProvider, worksProvider } from "./works";

interface Deps {
  env: Env;
  raw: boolean;
  noImage: boolean;
  params: Record<string, string>;
  assets?: Fetcher;
  requestUrl: string;
}

const articlesCachePath = "/articles";
const articlesCacheControl =
  "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400";

/**
 * ContentsProvider returns a ANSI string to be displayed in the terminal.
 */
export type ContentsProvider = (
  deps: Deps,
) => Promise<string>;

const isBrowserNavigation = (request: Request): boolean => {
  const accept = request.headers.get("accept") ?? "";
  const fetchDest = request.headers.get("sec-fetch-dest") ?? "";
  return fetchDest === "document" || accept.split(",").includes("text/html");
};

const contentsProviders: Record<string, ContentsProvider> = {
  "/": WhoamiProvider,
  "/articles": ArticlesProvider,
  "/featured-series": FeaturedSeriesProvider,
  "/featured-tracks": featuredTracksProvider,
  "/works": worksProvider,
  "/works/:id": workProvider,
};

export const registerProviders = (
  app: Hono<{ Bindings: CloudflareBindings }>,
) => {
  for (const [path, provider] of Object.entries(contentsProviders)) {
    app.get(path, async (c) => {
      if (isBrowserNavigation(c.req.raw)) {
        const assets = c.env.ASSETS;

        if (assets) {
          const indexUrl = new URL("/", c.req.url);
          return assets.fetch(new Request(indexUrl, c.req.raw));
        }
      }

      if (path === articlesCachePath) {
        const cache = await caches.open("articles-cache");
        const cacheKey = new Request(c.req.url, c.req.raw);
        const cached = await cache.match(cacheKey);
        if (cached) {
          return cached;
        }
      }

      const e = parseEnv(env(c));
      const raw = c.req.query("raw") === "true";
      const noImage = c.req.query("no-image") === "true";
      const content = await provider({
        env: e,
        raw,
        noImage,
        params: c.req.param(),
        assets: c.env.ASSETS,
        requestUrl: c.req.url,
      });
      const response = c.text(content);

      if (path === articlesCachePath && response.ok) {
        const cache = await caches.open("articles-cache");
        response.headers.set("Cache-Control", articlesCacheControl);
        const cacheKey = new Request(c.req.url, c.req.raw);
        c.executionCtx.waitUntil(cache.put(cacheKey, response.clone()));
      }

      return response;
    });
  }
};
