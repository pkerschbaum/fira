CREATE TABLE "public"."config" (
  "id" integer NOT NULL DEFAULT 1,
  "annotation_target_per_user" integer NOT NULL,
  "annotation_target_per_judg_pair" integer NOT NULL,
  "judgement_mode" character varying NOT NULL,
  "rotate_document_text" boolean NOT NULL,
  "annotation_target_to_require_feedback" integer NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL,
  CONSTRAINT "PK_d0ee79a681413d50b0a4f98cf7b" PRIMARY KEY ("id"),
  /* only one config instance should be present at any time: */
  CONSTRAINT "CHK_691cac5233ac17092f34e759d1" CHECK ("id" = 1)
);

CREATE TABLE "public"."user" (
  "id" character varying NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id")
);

CREATE TABLE "public"."document" (
  "id" character varying NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_e57d3357f83f3cdc0acffc3d777" PRIMARY KEY ("id")
);

CREATE TABLE "public"."document_version" (
  "document_version" integer NOT NULL DEFAULT 1,
  "text" character varying NOT NULL,
  "annotate_parts" text [] NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL,
  "document_id" character varying NOT NULL,
  CONSTRAINT "PK_a50fac903ff5f90d82f21d769eb" PRIMARY KEY ("document_version", "document_id"),
  CONSTRAINT "FK_99e07676aba693e25611b1f6c12" FOREIGN KEY ("document_id") REFERENCES "public"."document" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE UNIQUE INDEX "IDX_a50fac903ff5f90d82f21d769e" ON "public"."document_version" ("document_id", "document_version");

CREATE TABLE "public"."query" (
  "id" character varying NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_be23114e9d505264e2fdd227537" PRIMARY KEY ("id")
);

CREATE TABLE "public"."query_version" (
  "query_version" integer NOT NULL DEFAULT 1,
  "text" character varying NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL,
  "query_id" character varying NOT NULL,
  CONSTRAINT "PK_ce90264a17e7f26b5e60828c5e5" PRIMARY KEY ("query_version", "query_id"),
  CONSTRAINT "FK_bf5ccc0a1aa4efe299d4b4223aa" FOREIGN KEY ("query_id") REFERENCES "public"."query" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE UNIQUE INDEX "IDX_ce90264a17e7f26b5e60828c5e" ON "public"."query_version" ("query_id", "query_version");

CREATE TABLE "public"."judgement_pair" (
  "priority" character varying NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL,
  "document_id" character varying NOT NULL,
  "query_id" character varying NOT NULL,
  CONSTRAINT "PK_0413dd612cce83f587b8974c0f9" PRIMARY KEY ("document_id", "query_id"),
  CONSTRAINT "FK_fc9335e72b0b3d352840b4bc45e" FOREIGN KEY ("document_id") REFERENCES "public"."document" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT "FK_c5db286d4cf85dc1f1cce545ae0" FOREIGN KEY ("query_id") REFERENCES "public"."query" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE INDEX "IDX_0413dd612cce83f587b8974c0f" ON "public"."judgement_pair" ("document_id", "query_id");

CREATE INDEX "IDX_1b1d70926e58a51849289436e5" ON "public"."judgement_pair" ("priority");

CREATE INDEX "IDX_c5db286d4cf85dc1f1cce545ae" ON "public"."judgement_pair" ("query_id");

CREATE INDEX "IDX_fc9335e72b0b3d352840b4bc45" ON "public"."judgement_pair" ("document_id");

CREATE TABLE "public"."judgement" (
  "id" serial,
  "status" character varying NOT NULL,
  "relevance_level" character varying,
  "relevance_positions" numeric [],
  "rotate" boolean NOT NULL,
  "mode" character varying NOT NULL,
  "duration_used_to_judge_ms" integer,
  "judged_at" timestamp with time zone,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL,
  "document_version" integer NOT NULL,
  "document_document" character varying NOT NULL,
  "query_version" integer NOT NULL,
  "query_query" character varying NOT NULL,
  "user_id" character varying NOT NULL,
  CONSTRAINT "PK_99667adcd9b4ba11ee00b59445d" PRIMARY KEY ("id"),
  CONSTRAINT "FK_026796aa33ab940f8150fb25729" FOREIGN KEY ("user_id") REFERENCES "public"."user" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT "FK_c54b24c6f4ae078b0f289b2d6b5" FOREIGN KEY ("query_query", "query_version") REFERENCES "public"."query_version" ("query_id", "query_version") ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT "FK_c7a3c0c8dd85fc22c05fb59f2b1" FOREIGN KEY ("document_document", "document_version") REFERENCES "public"."document_version" ("document_id", "document_version") ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE INDEX "IDX_026796aa33ab940f8150fb2572" ON "public"."judgement" ("user_id");

CREATE INDEX "IDX_54fc3bbea108555284e94a552d" ON "public"."judgement" ("document_document", "query_query");

CREATE INDEX "IDX_be78d8f77da8cb5c09e156e949" ON "public"."judgement" (
  "document_document",
  "query_query",
  "user_id"
);

CREATE INDEX "IDX_c54b24c6f4ae078b0f289b2d6b" ON "public"."judgement" ("query_query", "query_version");

CREATE INDEX "IDX_c7a3c0c8dd85fc22c05fb59f2b" ON "public"."judgement" ("document_document", "document_version");

CREATE TABLE "public"."feedback" (
  "id" serial,
  "score" character varying NOT NULL,
  "text" text,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL,
  "user_id" character varying NOT NULL,
  CONSTRAINT "PK_8389f9e087a57689cd5be8b2b13" PRIMARY KEY ("id"),
  CONSTRAINT "FK_121c67d42dd543cca0809f59901" FOREIGN KEY ("user_id") REFERENCES "public"."user" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE INDEX "IDX_121c67d42dd543cca0809f5990" ON "public"."feedback" ("user_id");