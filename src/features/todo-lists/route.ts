import { Hono } from "hono";
import { db } from "../../db/client.js";
import { todoLists } from "../../db/schema.js";
import { eq } from "drizzle-orm";

const todoListRoute = new Hono();

const toTodoListResponse = (todoList: {
  id: number;
  title: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}) => ({
  id: todoList.id,
  title: todoList.title,
  description: todoList.description ?? "",
  created_at: todoList.createdAt,
  updated_at: todoList.updatedAt,
});

const toPositiveInt = (value: string | undefined) => {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1) {
    return undefined;
  }

  return parsed;
};

todoListRoute.get("/lists/:listId", async (c) => {
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

type TodoListRow = {
  id: number;
  title: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
};

todoListRoute.get("/lists", async (c) => {
  const page = toPositiveInt(c.req.query("page"));
  const pageSize = toPositiveInt(c.req.query("page_size"));
  let todoLists: TodoListRow[];

  if (page === undefined || pageSize === undefined) {
    todoLists = await db.query.todoLists.findMany({
      orderBy: (todoLists, { asc }) => [asc(todoLists.id)],
    });
  } else {
    todoLists = await db.query.todoLists.findMany({
      orderBy: (todoLists, { asc }) => [asc(todoLists.id)],
      limit: pageSize,
      offset: (page - 1) * pageSize,
    });
  }

  return c.json(todoLists.map(toTodoListResponse));
});

type NewTodoList = {
  title: string;
  description: string;
};

todoListRoute.post("/lists", async (c) => {
  const { title, description } = await c.req.json<NewTodoList>();
  const insertedRows = await db
    .insert(todoLists)
    .values({
      title,
      description,
    })
    .returning();

  if (insertedRows.length !== 1) {
    return c.json({ error: "Failed to create todo list" }, 500);
  }

  const inserted = insertedRows[0];

  return c.json(
    {
      id: inserted.id,
      title: inserted.title,
      description: inserted.description ?? "",
      created_at: inserted.createdAt,
      updated_at: inserted.updatedAt,
    },
    200,
  );
});

type UpdateTodoList = {
  title?: string;
  description?: string;
};

todoListRoute.patch("/lists/:listId", async (c) => {
  const listId = Number(c.req.param("listId"));
  const { title, description } = await c.req.json<UpdateTodoList>();
  const updatedRows = await db
    .update(todoLists)
    .set({
      title,
      description,
    })
    .where(eq(todoLists.id, listId))
    .returning();
  if (updatedRows.length === 0) {
    return c.json({ error: "Todo list not found" }, 404);
  }

  if (updatedRows.length !== 1) {
    return c.json({ error: "Failed to update todo list" }, 500);
  }

  const updated = updatedRows[0];
  return c.json({
    id: updated.id,
    title: updated.title,
    description: updated.description ?? "",
    created_at: updated.createdAt,
    updated_at: updated.updatedAt,
  });
});

todoListRoute.delete("/lists/:listId", async (c) => {
  const listId = Number(c.req.param("listId"));
  const deletedRows = await db
    .delete(todoLists)
    .where(eq(todoLists.id, listId))
    .returning();

  if (deletedRows.length === 0) {
    return c.json({ error: "Todo list not found" }, 404);
  }

  if (deletedRows.length !== 1) {
    return c.json({ error: "Failed to delete todo list" }, 500);
  }

  return c.json({}, 200);
});

export default todoListRoute;
