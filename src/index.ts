import { Hono } from "hono";
import { registerProviders } from "./contents";

const app = new Hono<{ Bindings: CloudflareBindings }>();

registerProviders(app);

app.notFound((c) => {
  const assets = c.env.ASSETS;
  if (assets) {
    return assets.fetch(c.req.raw);
  }
  return c.text("Not Found", 404);
});

export default app;
