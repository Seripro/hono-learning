import { Hono } from "hono";
import helloRoute from "./routes/hello.js";
import echoRoute from "./routes/echo.js";

const app = new Hono();

app.route("/", helloRoute);
app.route("/", echoRoute);

export default app;
