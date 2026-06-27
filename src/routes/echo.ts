import { Hono } from "hono";

const echoRoute = new Hono();

echoRoute.get("/echo", (c) => {
  // クエリパラメータの取得
  const name = c.req.query("name");
  const message = c.req.query("message");

  return c.json({ Message: `${message} ${name}!!!` });
});

export default echoRoute;
