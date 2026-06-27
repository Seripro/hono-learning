import "dotenv/config";
import { sql } from "drizzle-orm";
import { db, client } from "./client.js";
import { todoItems, todoLists } from "./schema.js";

async function main() {
  // 毎回同じIDにする（id=1,2,...）
  await db.execute(
    sql`TRUNCATE TABLE "todo_items", "todo_lists" RESTART IDENTITY CASCADE;`,
  );

  // listを2件作る（戻り値でID確定）
  const [firstlist] = await db
    .insert(todoLists)
    .values({ title: "最初のTodoリスト", description: "最初のTodoリストです" })
    .returning({ id: todoLists.id });

  const [work] = await db
    .insert(todoLists)
    .values({
      title: "仕事用Todoリスト",
      description: "仕事用のTodoアイテムを管理するTodoリストです",
    })
    .returning({ id: todoLists.id });

  // itemを数件作る（listIdに紐付け）
  await db.insert(todoItems).values([
    {
      todoListId: firstlist.id,
      title: "未完了のTodoアイテム",
      description: "最初のTodoリストに紐づく、未完了のTodoアイテムです",
      statusCode: 1,
    },
    {
      todoListId: firstlist.id,
      title: "期限ありのTodoアイテム",
      description: "最初のTodoリストに紐づく、期限付きのTodoアイテムです",
      statusCode: 1,
      dueAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
    {
      todoListId: work.id,
      title: "完了済みのTodoアイテム",
      description: "仕事用のTodoリストに紐づく、完了済みのTodoアイテムです",
      statusCode: 2,
    },
  ]);

  // 使う人がすぐ分かるように出力
  console.log("Seeded fixtures:");
  console.log(`- First listId: ${firstlist.id}`);
  console.log(`- Work  listId: ${work.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await client.end();
  });
