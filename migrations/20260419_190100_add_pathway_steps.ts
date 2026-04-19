import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "pathway_steps" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"pathway_id" integer NOT NULL,
  	"media_item_id" integer NOT NULL,
  	"position" numeric NOT NULL,
  	"step_title" varchar,
  	"step_editorial" varchar NOT NULL,
  	"step_context" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "pathway_steps_id" integer;
  ALTER TABLE "pathway_steps" ADD CONSTRAINT "pathway_steps_pathway_id_pathways_id_fk" FOREIGN KEY ("pathway_id") REFERENCES "public"."pathways"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pathway_steps" ADD CONSTRAINT "pathway_steps_media_item_id_media_items_id_fk" FOREIGN KEY ("media_item_id") REFERENCES "public"."media_items"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "pathway_steps_pathway_idx" ON "pathway_steps" USING btree ("pathway_id");
  CREATE INDEX "pathway_steps_media_item_idx" ON "pathway_steps" USING btree ("media_item_id");
  CREATE UNIQUE INDEX "pathway_position_idx" ON "pathway_steps" USING btree ("pathway_id","position");
  CREATE UNIQUE INDEX "pathway_media_item_idx" ON "pathway_steps" USING btree ("pathway_id","media_item_id");
  CREATE INDEX "pathway_steps_updated_at_idx" ON "pathway_steps" USING btree ("updated_at");
  CREATE INDEX "pathway_steps_created_at_idx" ON "pathway_steps" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pathway_steps_fk" FOREIGN KEY ("pathway_steps_id") REFERENCES "public"."pathway_steps"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_pathway_steps_id_idx" ON "payload_locked_documents_rels" USING btree ("pathway_steps_id");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pathway_steps" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pathway_steps" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_pathway_steps_fk";
  DROP INDEX "payload_locked_documents_rels_pathway_steps_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "pathway_steps_id";`)
}
