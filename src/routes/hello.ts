import { Hono } from "hono";
import { db } from "../db/client.js";

const helloRoute = new Hono();

helloRoute.get("/hello", (c) => {
  return c.json({ Message: "Hello Hono!" });
});

helloRoute.get("/health", (c) => {
  return c.json({ status: "ok" });
});

helloRoute.get("/lists/:listId", async (c) => {
  const listId = Number(c.req.param("listId"));
  const todoList = await db.query.todoLists.findFirst({
    where: (todoLists, { eq }) => eq(todoLists.id, listId),
  });

  if (!todoList) {
    return c.json({ error: "Todo list not found" }, 404);
  }

  return c.json({
    id: todoList.id,
    title: todoList.title,
    description: todoList.description ?? "",
    created_at: todoList.createdAt,
    updated_at: todoList.updatedAt,
  });
});

export default helloRoute;
