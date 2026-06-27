import { Hono } from "hono";

const helloRoute = new Hono();

helloRoute.get("/hello", (c) => {
  return c.json({ Message: "Hello Hono!" });
});

helloRoute.get("/echo", (c) => {
  // クエリパラメータの取得
  const name = c.req.query("name");
  const message = c.req.query("message");

  return c.json({ Message: `${message} ${name}!!!` });
});

export default helloRoute;
