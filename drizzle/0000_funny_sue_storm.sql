CREATE TABLE "todo_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"todo_list_id" integer NOT NULL,
	"title" varchar(50) NOT NULL,
	"description" varchar(200),
	"status_code" integer DEFAULT 1 NOT NULL,
	"due_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "todo_lists" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(50) NOT NULL,
	"description" varchar(200),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "todo_items" ADD CONSTRAINT "todo_items_todo_list_id_todo_lists_id_fk" FOREIGN KEY ("todo_list_id") REFERENCES "public"."todo_lists"("id") ON DELETE cascade ON UPDATE restrict;--> statement-breakpoint
CREATE INDEX "todo_items_todo_list_id_idx" ON "todo_items" USING btree ("todo_list_id");--> statement-breakpoint
CREATE INDEX "todo_items_todo_list_id_id_idx" ON "todo_items" USING btree ("todo_list_id","id");