import { Hono } from "hono";
import healthRoute from "./features/health/route.js";
import todoListRoute from "./features/todo-lists/route.js";
import todoItemRoute from "./features/todo-items/route.js";
import helloRoute from "./features/hello/route.js";

const app = new Hono();

app.route("/", helloRoute);
app.route("/", healthRoute);
app.route("/", todoListRoute);
app.route("/", todoItemRoute);

export default app;
