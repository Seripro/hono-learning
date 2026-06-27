import { relations } from "drizzle-orm";
import {
  pgTable,
  serial,
  integer,
  varchar,
  timestamp,
  index,
} from "drizzle-orm/pg-core";

export const todoLists = pgTable("todo_lists", {
  id: serial("id").primaryKey(),

  title: varchar("title", { length: 50 }).notNull(),
  description: varchar("description", { length: 200 }),

  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .notNull()
    .defaultNow()
    .$onUpdateFn(() => new Date()),
});

export const todoItems = pgTable(
  "todo_items",
  {
    id: serial("id").primaryKey(),

    todoListId: integer("todo_list_id")
      .notNull()
      .references(() => todoLists.id, {
        onDelete: "cascade",
        onUpdate: "restrict",
      }),

    title: varchar("title", { length: 50 }).notNull(),
    description: varchar("description", { length: 200 }),
    statusCode: integer("status_code").notNull().default(1), // 1. NOT_COMPLETED, 2. COMPLETED
    dueAt: timestamp("due_at", { mode: "date" }),

    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" })
      .notNull()
      .defaultNow()
      .$onUpdateFn(() => new Date()),
  },
  (t) => [
    index("todo_items_todo_list_id_idx").on(t.todoListId),
    index("todo_items_todo_list_id_id_idx").on(t.todoListId, t.id),
  ],
);

export const todoListsRelations = relations(todoLists, ({ many }) => ({
  items: many(todoItems),
}));

export const todoItemsRelations = relations(todoItems, ({ one }) => ({
  todoList: one(todoLists, {
    fields: [todoItems.todoListId],
    references: [todoLists.id],
  }),
}));
