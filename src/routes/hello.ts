import { Hono } from "hono";

const helloRoute = new Hono();

helloRoute.get("/hello", (c) => {
  return c.json({ Message: "Hello Hono!" });
});

helloRoute.get("/health", (c) => {
  return c.json({ status: "ok" });
});

export default helloRoute;
