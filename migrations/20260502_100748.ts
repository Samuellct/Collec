import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'

// Note: pseudo, disabled (customers) et slug (media_items) sont déjà appliqués
// par les migrations 20260426_* et 20260428_*. Ce fichier ne crée que les tables
// de gamification et les colonnes de relation manquantes.

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TYPE "public"."enum_badges_condition_type" AS ENUM(
      'first_collection', 'first_pathway',
      'milestone_10', 'milestone_50', 'milestone_100', 'milestone_250', 'milestone_500'
    );

    CREATE TABLE "badges" (
      "id" serial PRIMARY KEY NOT NULL,
      "slug" varchar NOT NULL,
      "title" varchar NOT NULL,
      "description" varchar,
      "icon_url" varchar,
      "condition_type" "enum_badges_condition_type" NOT NULL,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    CREATE TABLE "user_badges" (
      "id" serial PRIMARY KEY NOT NULL,
      "user_id" integer NOT NULL,
      "badge_id" integer NOT NULL,
      "earned_at" timestamp(3) with time zone NOT NULL,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "badges_id" integer;
    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "user_badges_id" integer;

    ALTER TABLE "user_badges"
      ADD CONSTRAINT "user_badges_user_id_customers_id_fk"
      FOREIGN KEY ("user_id") REFERENCES "public"."customers"("id")
      ON DELETE set null ON UPDATE no action;

    ALTER TABLE "user_badges"
      ADD CONSTRAINT "user_badges_badge_id_badges_id_fk"
      FOREIGN KEY ("badge_id") REFERENCES "public"."badges"("id")
      ON DELETE set null ON UPDATE no action;

    ALTER TABLE "payload_locked_documents_rels"
      ADD CONSTRAINT "payload_locked_documents_rels_badges_fk"
      FOREIGN KEY ("badges_id") REFERENCES "public"."badges"("id")
      ON DELETE cascade ON UPDATE no action;

    ALTER TABLE "payload_locked_documents_rels"
      ADD CONSTRAINT "payload_locked_documents_rels_user_badges_fk"
      FOREIGN KEY ("user_badges_id") REFERENCES "public"."user_badges"("id")
      ON DELETE cascade ON UPDATE no action;

    CREATE UNIQUE INDEX "badges_slug_idx"      ON "badges" USING btree ("slug");
    CREATE INDEX "badges_updated_at_idx"       ON "badges" USING btree ("updated_at");
    CREATE INDEX "badges_created_at_idx"       ON "badges" USING btree ("created_at");

    CREATE INDEX "user_badges_user_idx"        ON "user_badges" USING btree ("user_id");
    CREATE INDEX "user_badges_badge_idx"       ON "user_badges" USING btree ("badge_id");
    CREATE INDEX "user_badges_updated_at_idx"  ON "user_badges" USING btree ("updated_at");
    CREATE INDEX "user_badges_created_at_idx"  ON "user_badges" USING btree ("created_at");
    CREATE UNIQUE INDEX "user_badge_idx"       ON "user_badges" USING btree ("user_id","badge_id");

    CREATE INDEX "payload_locked_documents_rels_badges_id_idx"
      ON "payload_locked_documents_rels" USING btree ("badges_id");
    CREATE INDEX "payload_locked_documents_rels_user_badges_id_idx"
      ON "payload_locked_documents_rels" USING btree ("user_badges_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels"
      DROP CONSTRAINT "payload_locked_documents_rels_badges_fk";
    ALTER TABLE "payload_locked_documents_rels"
      DROP CONSTRAINT "payload_locked_documents_rels_user_badges_fk";

    DROP INDEX "payload_locked_documents_rels_badges_id_idx";
    DROP INDEX "payload_locked_documents_rels_user_badges_id_idx";

    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "badges_id";
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "user_badges_id";

    DROP TABLE "user_badges" CASCADE;
    DROP TABLE "badges" CASCADE;

    DROP TYPE "public"."enum_badges_condition_type";
  `)
}
