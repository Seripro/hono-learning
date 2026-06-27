import { Hono } from "hono";

const helloRoute = new Hono();

helloRoute.get("/hello", (c) => {
  return c.json({ Message: "Hello Hono!" });
});

export default helloRoute;
