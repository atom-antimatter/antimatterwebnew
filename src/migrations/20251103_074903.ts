import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`
   CREATE TYPE "public"."enum_payload_users_role" AS ENUM('admin', 'editor');
  CREATE TYPE "public"."enum_payload_pages_category" AS ENUM('main', 'services', 'solutions', 'case-study', 'demo');
  CREATE TYPE "public"."enum_payload_pages_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__payload_pages_v_version_category" AS ENUM('main', 'services', 'solutions', 'case-study', 'demo');
  CREATE TYPE "public"."enum__payload_pages_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_payload_blog_posts_category" AS ENUM('ai-ml', 'product-dev', 'case-studies', 'company-news');
  CREATE TYPE "public"."enum_payload_blog_posts_external_sources_type" AS ENUM('article', 'video', 'documentation', 'research');
  CREATE TYPE "public"."enum_payload_blog_posts_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__payload_blog_posts_v_version_category" AS ENUM('ai-ml', 'product-dev', 'case-studies', 'company-news');
  CREATE TYPE "public"."enum__payload_blog_posts_v_version_external_sources_type" AS ENUM('article', 'video', 'documentation', 'research');
  CREATE TYPE "public"."enum__payload_blog_posts_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE IF NOT EXISTS "payload_users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"role" "enum_payload_users_role" DEFAULT 'editor' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE IF NOT EXISTS "payload_pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"content" jsonb,
  	"category" "enum_payload_pages_category",
  	"parent_page_id" integer,
  	"seo_meta_description" varchar,
  	"seo_meta_keywords" varchar,
  	"seo_canonical_url" varchar,
  	"seo_og_title" varchar,
  	"seo_og_description" varchar,
  	"seo_og_image_id" integer,
  	"seo_twitter_title" varchar,
  	"seo_twitter_description" varchar,
  	"seo_twitter_image_id" integer,
  	"seo_no_index" boolean DEFAULT false,
  	"is_homepage" boolean DEFAULT false,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_payload_pages_status" DEFAULT 'draft'
  );
  
  CREATE TABLE IF NOT EXISTS "payload_pages_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"payload_pages_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "_payload_pages_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_content" jsonb,
  	"version_category" "enum__payload_pages_v_version_category",
  	"version_parent_page_id" integer,
  	"version_seo_meta_description" varchar,
  	"version_seo_meta_keywords" varchar,
  	"version_seo_canonical_url" varchar,
  	"version_seo_og_title" varchar,
  	"version_seo_og_description" varchar,
  	"version_seo_og_image_id" integer,
  	"version_seo_twitter_title" varchar,
  	"version_seo_twitter_description" varchar,
  	"version_seo_twitter_image_id" integer,
  	"version_seo_no_index" boolean DEFAULT false,
  	"version_is_homepage" boolean DEFAULT false,
  	"version_meta_title" varchar,
  	"version_meta_description" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__payload_pages_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE IF NOT EXISTS "_payload_pages_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"payload_pages_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "payload_blog_posts_seo_keywords" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"keyword" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "payload_blog_posts_external_sources" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"url" varchar,
  	"type" "enum_payload_blog_posts_external_sources_type"
  );
  
  CREATE TABLE IF NOT EXISTS "payload_blog_posts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"excerpt" varchar,
  	"content" jsonb,
  	"featured_image_id" integer,
  	"featured_image_alt" varchar,
  	"author" varchar DEFAULT 'Antimatter AI',
  	"category" "enum_payload_blog_posts_category",
  	"reading_time" numeric,
  	"chapters" jsonb,
  	"published_at" timestamp(3) with time zone,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_payload_blog_posts_status" DEFAULT 'draft'
  );
  
  CREATE TABLE IF NOT EXISTS "payload_blog_posts_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"payload_pages_id" integer,
  	"payload_blog_posts_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "_payload_blog_posts_v_version_seo_keywords" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"keyword" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_payload_blog_posts_v_version_external_sources" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"url" varchar,
  	"type" "enum__payload_blog_posts_v_version_external_sources_type",
  	"_uuid" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_payload_blog_posts_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_excerpt" varchar,
  	"version_content" jsonb,
  	"version_featured_image_id" integer,
  	"version_featured_image_alt" varchar,
  	"version_author" varchar DEFAULT 'Antimatter AI',
  	"version_category" "enum__payload_blog_posts_v_version_category",
  	"version_reading_time" numeric,
  	"version_chapters" jsonb,
  	"version_published_at" timestamp(3) with time zone,
  	"version_meta_title" varchar,
  	"version_meta_description" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__payload_blog_posts_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE IF NOT EXISTS "_payload_blog_posts_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"payload_pages_id" integer,
  	"payload_blog_posts_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "payload_media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar NOT NULL,
  	"caption" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumbnail_url" varchar,
  	"sizes_thumbnail_width" numeric,
  	"sizes_thumbnail_height" numeric,
  	"sizes_thumbnail_mime_type" varchar,
  	"sizes_thumbnail_filesize" numeric,
  	"sizes_thumbnail_filename" varchar,
  	"sizes_card_url" varchar,
  	"sizes_card_width" numeric,
  	"sizes_card_height" numeric,
  	"sizes_card_mime_type" varchar,
  	"sizes_card_filesize" numeric,
  	"sizes_card_filename" varchar,
  	"sizes_hero_url" varchar,
  	"sizes_hero_width" numeric,
  	"sizes_hero_height" numeric,
  	"sizes_hero_mime_type" varchar,
  	"sizes_hero_filesize" numeric,
  	"sizes_hero_filename" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "payload_services_tagline" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"line" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "payload_services_items_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "payload_services_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "payload_services_tools" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"tool" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "payload_services_tool_icons" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "payload_services" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"link" varchar NOT NULL,
  	"icon" varchar,
  	"page_title" jsonb,
  	"description" varchar NOT NULL,
  	"hidden" boolean DEFAULT false,
  	"custom_c_t_a_text" varchar,
  	"custom_c_t_a_href" varchar,
  	"custom_c_t_a_secondary_text" varchar,
  	"custom_c_t_a_secondary_href" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"payload_users_id" integer,
  	"payload_pages_id" integer,
  	"payload_blog_posts_id" integer,
  	"payload_media_id" integer,
  	"payload_services_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"payload_users_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  DO $$ BEGIN
   ALTER TABLE "payload_pages" ADD CONSTRAINT "payload_pages_parent_page_id_payload_pages_id_fk" FOREIGN KEY ("parent_page_id") REFERENCES "public"."payload_pages"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_pages" ADD CONSTRAINT "payload_pages_seo_og_image_id_payload_media_id_fk" FOREIGN KEY ("seo_og_image_id") REFERENCES "public"."payload_media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_pages" ADD CONSTRAINT "payload_pages_seo_twitter_image_id_payload_media_id_fk" FOREIGN KEY ("seo_twitter_image_id") REFERENCES "public"."payload_media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_pages_rels" ADD CONSTRAINT "payload_pages_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_pages"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_pages_rels" ADD CONSTRAINT "payload_pages_rels_payload_pages_fk" FOREIGN KEY ("payload_pages_id") REFERENCES "public"."payload_pages"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_payload_pages_v" ADD CONSTRAINT "_payload_pages_v_parent_id_payload_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_pages"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_payload_pages_v" ADD CONSTRAINT "_payload_pages_v_version_parent_page_id_payload_pages_id_fk" FOREIGN KEY ("version_parent_page_id") REFERENCES "public"."payload_pages"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_payload_pages_v" ADD CONSTRAINT "_payload_pages_v_version_seo_og_image_id_payload_media_id_fk" FOREIGN KEY ("version_seo_og_image_id") REFERENCES "public"."payload_media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_payload_pages_v" ADD CONSTRAINT "_payload_pages_v_version_seo_twitter_image_id_payload_media_id_fk" FOREIGN KEY ("version_seo_twitter_image_id") REFERENCES "public"."payload_media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_payload_pages_v_rels" ADD CONSTRAINT "_payload_pages_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_payload_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_payload_pages_v_rels" ADD CONSTRAINT "_payload_pages_v_rels_payload_pages_fk" FOREIGN KEY ("payload_pages_id") REFERENCES "public"."payload_pages"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_blog_posts_seo_keywords" ADD CONSTRAINT "payload_blog_posts_seo_keywords_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."payload_blog_posts"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_blog_posts_external_sources" ADD CONSTRAINT "payload_blog_posts_external_sources_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."payload_blog_posts"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_blog_posts" ADD CONSTRAINT "payload_blog_posts_featured_image_id_payload_media_id_fk" FOREIGN KEY ("featured_image_id") REFERENCES "public"."payload_media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_blog_posts_rels" ADD CONSTRAINT "payload_blog_posts_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_blog_posts"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_blog_posts_rels" ADD CONSTRAINT "payload_blog_posts_rels_payload_pages_fk" FOREIGN KEY ("payload_pages_id") REFERENCES "public"."payload_pages"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_blog_posts_rels" ADD CONSTRAINT "payload_blog_posts_rels_payload_blog_posts_fk" FOREIGN KEY ("payload_blog_posts_id") REFERENCES "public"."payload_blog_posts"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_payload_blog_posts_v_version_seo_keywords" ADD CONSTRAINT "_payload_blog_posts_v_version_seo_keywords_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_payload_blog_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_payload_blog_posts_v_version_external_sources" ADD CONSTRAINT "_payload_blog_posts_v_version_external_sources_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_payload_blog_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_payload_blog_posts_v" ADD CONSTRAINT "_payload_blog_posts_v_parent_id_payload_blog_posts_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_blog_posts"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_payload_blog_posts_v" ADD CONSTRAINT "_payload_blog_posts_v_version_featured_image_id_payload_media_id_fk" FOREIGN KEY ("version_featured_image_id") REFERENCES "public"."payload_media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_payload_blog_posts_v_rels" ADD CONSTRAINT "_payload_blog_posts_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_payload_blog_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_payload_blog_posts_v_rels" ADD CONSTRAINT "_payload_blog_posts_v_rels_payload_pages_fk" FOREIGN KEY ("payload_pages_id") REFERENCES "public"."payload_pages"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_payload_blog_posts_v_rels" ADD CONSTRAINT "_payload_blog_posts_v_rels_payload_blog_posts_fk" FOREIGN KEY ("payload_blog_posts_id") REFERENCES "public"."payload_blog_posts"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_services_tagline" ADD CONSTRAINT "payload_services_tagline_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."payload_services"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_services_items_images" ADD CONSTRAINT "payload_services_items_images_image_id_payload_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."payload_media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_services_items_images" ADD CONSTRAINT "payload_services_items_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."payload_services_items"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_services_items" ADD CONSTRAINT "payload_services_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."payload_services"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_services_tools" ADD CONSTRAINT "payload_services_tools_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."payload_services"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_services_tool_icons" ADD CONSTRAINT "payload_services_tool_icons_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."payload_services"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_payload_users_fk" FOREIGN KEY ("payload_users_id") REFERENCES "public"."payload_users"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_payload_pages_fk" FOREIGN KEY ("payload_pages_id") REFERENCES "public"."payload_pages"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_payload_blog_posts_fk" FOREIGN KEY ("payload_blog_posts_id") REFERENCES "public"."payload_blog_posts"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_payload_media_fk" FOREIGN KEY ("payload_media_id") REFERENCES "public"."payload_media"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_payload_services_fk" FOREIGN KEY ("payload_services_id") REFERENCES "public"."payload_services"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_payload_users_fk" FOREIGN KEY ("payload_users_id") REFERENCES "public"."payload_users"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "payload_users_updated_at_idx" ON "payload_users" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "payload_users_created_at_idx" ON "payload_users" USING btree ("created_at");
  CREATE UNIQUE INDEX IF NOT EXISTS "payload_users_email_idx" ON "payload_users" USING btree ("email");
  CREATE UNIQUE INDEX IF NOT EXISTS "payload_pages_slug_idx" ON "payload_pages" USING btree ("slug");
  CREATE INDEX IF NOT EXISTS "payload_pages_parent_page_idx" ON "payload_pages" USING btree ("parent_page_id");
  CREATE INDEX IF NOT EXISTS "payload_pages_seo_seo_og_image_idx" ON "payload_pages" USING btree ("seo_og_image_id");
  CREATE INDEX IF NOT EXISTS "payload_pages_seo_seo_twitter_image_idx" ON "payload_pages" USING btree ("seo_twitter_image_id");
  CREATE INDEX IF NOT EXISTS "payload_pages_updated_at_idx" ON "payload_pages" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "payload_pages_created_at_idx" ON "payload_pages" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "payload_pages__status_idx" ON "payload_pages" USING btree ("_status");
  CREATE INDEX IF NOT EXISTS "payload_pages_rels_order_idx" ON "payload_pages_rels" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "payload_pages_rels_parent_idx" ON "payload_pages_rels" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "payload_pages_rels_path_idx" ON "payload_pages_rels" USING btree ("path");
  CREATE INDEX IF NOT EXISTS "payload_pages_rels_payload_pages_id_idx" ON "payload_pages_rels" USING btree ("payload_pages_id");
  CREATE INDEX IF NOT EXISTS "_payload_pages_v_parent_idx" ON "_payload_pages_v" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "_payload_pages_v_version_version_slug_idx" ON "_payload_pages_v" USING btree ("version_slug");
  CREATE INDEX IF NOT EXISTS "_payload_pages_v_version_version_parent_page_idx" ON "_payload_pages_v" USING btree ("version_parent_page_id");
  CREATE INDEX IF NOT EXISTS "_payload_pages_v_version_seo_version_seo_og_image_idx" ON "_payload_pages_v" USING btree ("version_seo_og_image_id");
  CREATE INDEX IF NOT EXISTS "_payload_pages_v_version_seo_version_seo_twitter_image_idx" ON "_payload_pages_v" USING btree ("version_seo_twitter_image_id");
  CREATE INDEX IF NOT EXISTS "_payload_pages_v_version_version_updated_at_idx" ON "_payload_pages_v" USING btree ("version_updated_at");
  CREATE INDEX IF NOT EXISTS "_payload_pages_v_version_version_created_at_idx" ON "_payload_pages_v" USING btree ("version_created_at");
  CREATE INDEX IF NOT EXISTS "_payload_pages_v_version_version__status_idx" ON "_payload_pages_v" USING btree ("version__status");
  CREATE INDEX IF NOT EXISTS "_payload_pages_v_created_at_idx" ON "_payload_pages_v" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "_payload_pages_v_updated_at_idx" ON "_payload_pages_v" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "_payload_pages_v_latest_idx" ON "_payload_pages_v" USING btree ("latest");
  CREATE INDEX IF NOT EXISTS "_payload_pages_v_rels_order_idx" ON "_payload_pages_v_rels" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "_payload_pages_v_rels_parent_idx" ON "_payload_pages_v_rels" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "_payload_pages_v_rels_path_idx" ON "_payload_pages_v_rels" USING btree ("path");
  CREATE INDEX IF NOT EXISTS "_payload_pages_v_rels_payload_pages_id_idx" ON "_payload_pages_v_rels" USING btree ("payload_pages_id");
  CREATE INDEX IF NOT EXISTS "payload_blog_posts_seo_keywords_order_idx" ON "payload_blog_posts_seo_keywords" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "payload_blog_posts_seo_keywords_parent_id_idx" ON "payload_blog_posts_seo_keywords" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "payload_blog_posts_external_sources_order_idx" ON "payload_blog_posts_external_sources" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "payload_blog_posts_external_sources_parent_id_idx" ON "payload_blog_posts_external_sources" USING btree ("_parent_id");
  CREATE UNIQUE INDEX IF NOT EXISTS "payload_blog_posts_slug_idx" ON "payload_blog_posts" USING btree ("slug");
  CREATE INDEX IF NOT EXISTS "payload_blog_posts_featured_image_idx" ON "payload_blog_posts" USING btree ("featured_image_id");
  CREATE INDEX IF NOT EXISTS "payload_blog_posts_updated_at_idx" ON "payload_blog_posts" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "payload_blog_posts_created_at_idx" ON "payload_blog_posts" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "payload_blog_posts__status_idx" ON "payload_blog_posts" USING btree ("_status");
  CREATE INDEX IF NOT EXISTS "payload_blog_posts_rels_order_idx" ON "payload_blog_posts_rels" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "payload_blog_posts_rels_parent_idx" ON "payload_blog_posts_rels" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "payload_blog_posts_rels_path_idx" ON "payload_blog_posts_rels" USING btree ("path");
  CREATE INDEX IF NOT EXISTS "payload_blog_posts_rels_payload_pages_id_idx" ON "payload_blog_posts_rels" USING btree ("payload_pages_id");
  CREATE INDEX IF NOT EXISTS "payload_blog_posts_rels_payload_blog_posts_id_idx" ON "payload_blog_posts_rels" USING btree ("payload_blog_posts_id");
  CREATE INDEX IF NOT EXISTS "_payload_blog_posts_v_version_seo_keywords_order_idx" ON "_payload_blog_posts_v_version_seo_keywords" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_payload_blog_posts_v_version_seo_keywords_parent_id_idx" ON "_payload_blog_posts_v_version_seo_keywords" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_payload_blog_posts_v_version_external_sources_order_idx" ON "_payload_blog_posts_v_version_external_sources" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_payload_blog_posts_v_version_external_sources_parent_id_idx" ON "_payload_blog_posts_v_version_external_sources" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_payload_blog_posts_v_parent_idx" ON "_payload_blog_posts_v" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "_payload_blog_posts_v_version_version_slug_idx" ON "_payload_blog_posts_v" USING btree ("version_slug");
  CREATE INDEX IF NOT EXISTS "_payload_blog_posts_v_version_version_featured_image_idx" ON "_payload_blog_posts_v" USING btree ("version_featured_image_id");
  CREATE INDEX IF NOT EXISTS "_payload_blog_posts_v_version_version_updated_at_idx" ON "_payload_blog_posts_v" USING btree ("version_updated_at");
  CREATE INDEX IF NOT EXISTS "_payload_blog_posts_v_version_version_created_at_idx" ON "_payload_blog_posts_v" USING btree ("version_created_at");
  CREATE INDEX IF NOT EXISTS "_payload_blog_posts_v_version_version__status_idx" ON "_payload_blog_posts_v" USING btree ("version__status");
  CREATE INDEX IF NOT EXISTS "_payload_blog_posts_v_created_at_idx" ON "_payload_blog_posts_v" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "_payload_blog_posts_v_updated_at_idx" ON "_payload_blog_posts_v" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "_payload_blog_posts_v_latest_idx" ON "_payload_blog_posts_v" USING btree ("latest");
  CREATE INDEX IF NOT EXISTS "_payload_blog_posts_v_rels_order_idx" ON "_payload_blog_posts_v_rels" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "_payload_blog_posts_v_rels_parent_idx" ON "_payload_blog_posts_v_rels" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "_payload_blog_posts_v_rels_path_idx" ON "_payload_blog_posts_v_rels" USING btree ("path");
  CREATE INDEX IF NOT EXISTS "_payload_blog_posts_v_rels_payload_pages_id_idx" ON "_payload_blog_posts_v_rels" USING btree ("payload_pages_id");
  CREATE INDEX IF NOT EXISTS "_payload_blog_posts_v_rels_payload_blog_posts_id_idx" ON "_payload_blog_posts_v_rels" USING btree ("payload_blog_posts_id");
  CREATE INDEX IF NOT EXISTS "payload_media_updated_at_idx" ON "payload_media" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "payload_media_created_at_idx" ON "payload_media" USING btree ("created_at");
  CREATE UNIQUE INDEX IF NOT EXISTS "payload_media_filename_idx" ON "payload_media" USING btree ("filename");
  CREATE INDEX IF NOT EXISTS "payload_media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "payload_media" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX IF NOT EXISTS "payload_media_sizes_card_sizes_card_filename_idx" ON "payload_media" USING btree ("sizes_card_filename");
  CREATE INDEX IF NOT EXISTS "payload_media_sizes_hero_sizes_hero_filename_idx" ON "payload_media" USING btree ("sizes_hero_filename");
  CREATE INDEX IF NOT EXISTS "payload_services_tagline_order_idx" ON "payload_services_tagline" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "payload_services_tagline_parent_id_idx" ON "payload_services_tagline" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "payload_services_items_images_order_idx" ON "payload_services_items_images" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "payload_services_items_images_parent_id_idx" ON "payload_services_items_images" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "payload_services_items_images_image_idx" ON "payload_services_items_images" USING btree ("image_id");
  CREATE INDEX IF NOT EXISTS "payload_services_items_order_idx" ON "payload_services_items" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "payload_services_items_parent_id_idx" ON "payload_services_items" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "payload_services_tools_order_idx" ON "payload_services_tools" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "payload_services_tools_parent_id_idx" ON "payload_services_tools" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "payload_services_tool_icons_order_idx" ON "payload_services_tool_icons" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "payload_services_tool_icons_parent_id_idx" ON "payload_services_tool_icons" USING btree ("_parent_id");
  CREATE UNIQUE INDEX IF NOT EXISTS "payload_services_link_idx" ON "payload_services" USING btree ("link");
  CREATE INDEX IF NOT EXISTS "payload_services_updated_at_idx" ON "payload_services" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "payload_services_created_at_idx" ON "payload_services" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_payload_users_id_idx" ON "payload_locked_documents_rels" USING btree ("payload_users_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_payload_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("payload_pages_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_payload_blog_posts_id_idx" ON "payload_locked_documents_rels" USING btree ("payload_blog_posts_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_payload_media_id_idx" ON "payload_locked_documents_rels" USING btree ("payload_media_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_payload_services_id_idx" ON "payload_locked_documents_rels" USING btree ("payload_services_id");
  CREATE INDEX IF NOT EXISTS "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX IF NOT EXISTS "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX IF NOT EXISTS "payload_preferences_rels_payload_users_id_idx" ON "payload_preferences_rels" USING btree ("payload_users_id");
  CREATE INDEX IF NOT EXISTS "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");`)
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`
   DROP TABLE "payload_users" CASCADE;
  DROP TABLE "payload_pages" CASCADE;
  DROP TABLE "payload_pages_rels" CASCADE;
  DROP TABLE "_payload_pages_v" CASCADE;
  DROP TABLE "_payload_pages_v_rels" CASCADE;
  DROP TABLE "payload_blog_posts_seo_keywords" CASCADE;
  DROP TABLE "payload_blog_posts_external_sources" CASCADE;
  DROP TABLE "payload_blog_posts" CASCADE;
  DROP TABLE "payload_blog_posts_rels" CASCADE;
  DROP TABLE "_payload_blog_posts_v_version_seo_keywords" CASCADE;
  DROP TABLE "_payload_blog_posts_v_version_external_sources" CASCADE;
  DROP TABLE "_payload_blog_posts_v" CASCADE;
  DROP TABLE "_payload_blog_posts_v_rels" CASCADE;
  DROP TABLE "payload_media" CASCADE;
  DROP TABLE "payload_services_tagline" CASCADE;
  DROP TABLE "payload_services_items_images" CASCADE;
  DROP TABLE "payload_services_items" CASCADE;
  DROP TABLE "payload_services_tools" CASCADE;
  DROP TABLE "payload_services_tool_icons" CASCADE;
  DROP TABLE "payload_services" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TYPE "public"."enum_payload_users_role";
  DROP TYPE "public"."enum_payload_pages_category";
  DROP TYPE "public"."enum_payload_pages_status";
  DROP TYPE "public"."enum__payload_pages_v_version_category";
  DROP TYPE "public"."enum__payload_pages_v_version_status";
  DROP TYPE "public"."enum_payload_blog_posts_category";
  DROP TYPE "public"."enum_payload_blog_posts_external_sources_type";
  DROP TYPE "public"."enum_payload_blog_posts_status";
  DROP TYPE "public"."enum__payload_blog_posts_v_version_category";
  DROP TYPE "public"."enum__payload_blog_posts_v_version_external_sources_type";
  DROP TYPE "public"."enum__payload_blog_posts_v_version_status";`)
}
