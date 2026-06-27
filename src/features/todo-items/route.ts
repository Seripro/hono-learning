import { Hono } from "hono";
import { db } from "../../db/client.js";
import { todoItems } from "../../db/schema.js";
import { and, eq } from "drizzle-orm";

const todoItemRoute = new Hono();

todoItemRoute.get("/lists/:listId/items/:itemId", async (c) => {
  const listId = Number(c.req.param("listId"));
  const itemId = Number(c.req.param("itemId"));
  const todoItem = await db.query.todoItems.findFirst({
    where: (todoItems, { and, eq }) =>
      and(eq(todoItems.todoListId, listId), eq(todoItems.id, itemId)),
  });

  if (!todoItem) {
    return c.json({ error: "Todo item not found" }, 404);
  }
  return c.json({
    id: todoItem.id,
    todo_list_id: todoItem.todoListId,
    title: todoItem.title,
    description: todoItem.description ?? "",
    status_code: todoItem.statusCode,
    due_at: todoItem.dueAt,
    created_at: todoItem.createdAt,
    updated_at: todoItem.updatedAt,
  });
});

type NewTodoItem = {
  title: string;
  description: string;
  due_at: string; // ISO 8601形式の日時文字列
};

todoItemRoute.post("lists/:listId/items", async (c) => {
  const listId = Number(c.req.param("listId"));
  const { title, description, due_at } = await c.req.json<NewTodoItem>();
  const insertedRows = await db
    .insert(todoItems)
    .values({
      todoListId: listId,
      title,
      description,
      dueAt: new Date(due_at),
    })
    .returning();

  if (insertedRows.length !== 1) {
    return c.json({ error: "Failed to create todo item" }, 500);
  }

  const inserted = insertedRows[0];

  return c.json(
    {
      id: inserted.id,
      todo_list_id: inserted.todoListId,
      title: inserted.title,
      description: inserted.description ?? "",
      created_at: inserted.createdAt,
      updated_at: inserted.updatedAt,
      status_code: inserted.statusCode,
      dueAt: inserted.dueAt,
    },
    200,
  );
});

type UpdateTodoItem = {
  title?: string;
  description?: string;
  due_at?: string; // ISO 8601形式の日時文字列
  complete?: boolean; // 完了状態(true: 完了, false: 未完了)
};

todoItemRoute.patch("/lists/:listId/items/:itemId", async (c) => {
  const listId = Number(c.req.param("listId"));
  const itemId = Number(c.req.param("itemId"));
  const { title, description, due_at, complete } =
    await c.req.json<UpdateTodoItem>();
  const updatedRows = await db
    .update(todoItems)
    .set({
      title,
      description,
      dueAt: due_at ? new Date(due_at) : undefined,
      statusCode: complete ? 2 : 1,
    })
    .where(and(eq(todoItems.todoListId, listId), eq(todoItems.id, itemId)))
    .returning();
  if (updatedRows.length === 0) {
    return c.json({ error: "Todo item not found" }, 404);
  }

  if (updatedRows.length !== 1) {
    return c.json({ error: "Failed to update todo item" }, 500);
  }

  const updated = updatedRows[0];
  return c.json({
    id: updated.id,
    todo_list_id: updated.todoListId,
    title: updated.title,
    description: updated.description ?? "",
    status_code: updated.statusCode,
    due_at: updated.dueAt,
    created_at: updated.createdAt,
    updated_at: updated.updatedAt,
  });
});

todoItemRoute.delete("/lists/:listId/items/:itemId", async (c) => {
  const listId = Number(c.req.param("listId"));
  const itemId = Number(c.req.param("itemId"));
  const deletedRows = await db
    .delete(todoItems)
    .where(and(eq(todoItems.todoListId, listId), eq(todoItems.id, itemId)))
    .returning();

  if (deletedRows.length === 0) {
    return c.json({ error: "Todo item not found" }, 404);
  }

  if (deletedRows.length !== 1) {
    return c.json({ error: "Failed to delete todo item" }, 500);
  }

  return c.json({}, 200);
});

export default todoItemRoute;
