import { Hono } from "hono";
import { validator } from "hono-openapi";
import { z } from "zod";

const helloRoute = new Hono();

export const echoQuerySchema = z.object({
  message: z.string().min(1).max(100),
  name: z.string().min(1).max(100),
});

helloRoute.get("/hello", (c) => {
  return c.json({ Message: "Hello Hono!" });
});

helloRoute.get("/echo", validator("query", echoQuerySchema), (c) => {
  const { message, name } = c.req.valid("query");

  return c.json({ Message: `${message} ${name}!!!` });
});

export default helloRoute;
