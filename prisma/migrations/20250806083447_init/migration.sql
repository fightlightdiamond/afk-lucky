-- CreateTable
CREATE TABLE "public"."users" (
    "id" SERIAL NOT NULL,
    "first_name" VARCHAR(255),
    "last_name" VARCHAR(255),
    "code" VARCHAR(20),
    "email" VARCHAR(50) NOT NULL,
    "phone_number" VARCHAR(15),
    "sex" BOOLEAN NOT NULL DEFAULT true,
    "password" VARCHAR(255) NOT NULL,
    "birthday" TIMESTAMP(6),
    "address" TEXT,
    "avatar" TEXT,
    "remember_token" VARCHAR(100),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login" TIMESTAMP(6),
    "last_logout" TIMESTAMP(6),
    "slack_webhook_url" VARCHAR(255),
    "created_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6),
    "deleted_at" TIMESTAMP(6),
    "coin" BIGINT NOT NULL DEFAULT 1000,
    "locale" VARCHAR(8) DEFAULT 'en',
    "group_id" INTEGER DEFAULT 1,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."admins" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(191) NOT NULL,
    "email" VARCHAR(191) NOT NULL,
    "password" VARCHAR(191) NOT NULL,
    "remember_token" VARCHAR(100),
    "created_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6),
    "deleted_at" TIMESTAMP(6),
    "is_active" INTEGER DEFAULT 0,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."accounts" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "address" VARCHAR(191) NOT NULL,
    "password" VARCHAR(191) NOT NULL,
    "mnemonic" VARCHAR(191) NOT NULL,
    "private_key" VARCHAR(191) NOT NULL,
    "keystore" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "remember_token" VARCHAR(191) NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6),
    "deleted_at" TIMESTAMP(6),

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."buys" (
    "id" BIGSERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6),
    "deleted_at" TIMESTAMP(6),

    CONSTRAINT "buys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."withdraws" (
    "id" BIGSERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6),
    "deleted_at" TIMESTAMP(6),

    CONSTRAINT "withdraws_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."coin_logs" (
    "id" SERIAL NOT NULL,
    "coin" BIGINT NOT NULL,
    "deal" BIGINT NOT NULL,
    "created_by" INTEGER NOT NULL,
    "type" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6),

    CONSTRAINT "coin_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."contacts" (
    "id" SERIAL NOT NULL,
    "created_by" INTEGER NOT NULL,
    "title" VARCHAR(191) NOT NULL,
    "message" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6),
    "deleted_at" TIMESTAMP(6),
    "name" VARCHAR(191),
    "email" VARCHAR(191),
    "phone_number" VARCHAR(15),

    CONSTRAINT "contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."contracts" (
    "id" SERIAL NOT NULL,
    "lender" INTEGER NOT NULL,
    "borrower" INTEGER NOT NULL,
    "money" BIGINT NOT NULL DEFAULT 0,
    "interest" INTEGER NOT NULL,
    "period" TIMESTAMP(6) NOT NULL,
    "is_transaction" BOOLEAN NOT NULL,
    "auto_pay" BIGINT NOT NULL,
    "is_auto_pay" BOOLEAN NOT NULL,
    "lender_confirm" BOOLEAN NOT NULL DEFAULT false,
    "borrower_confirm" BOOLEAN NOT NULL DEFAULT false,
    "active_time" TIMESTAMP(6) NOT NULL,
    "deleted_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6),

    CONSTRAINT "contracts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."crazy_courses" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(128) NOT NULL,
    "img" VARCHAR(191),
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "created_by" INTEGER,
    "updated_by" INTEGER,
    "created_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6),
    "deleted_at" TIMESTAMP(6),

    CONSTRAINT "crazy_courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."crazies" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(191) NOT NULL,
    "audio" VARCHAR(191) NOT NULL,
    "created_by" INTEGER,
    "updated_by" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6),
    "crazy_course_id" INTEGER,
    "img" VARCHAR(191),
    "description" TEXT,

    CONSTRAINT "crazies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."crazy_details" (
    "id" SERIAL NOT NULL,
    "crazy_id" INTEGER NOT NULL,
    "no" INTEGER NOT NULL DEFAULT 0,
    "sentence" VARCHAR(191) NOT NULL,
    "meaning" VARCHAR(191) NOT NULL,
    "created_by" INTEGER,
    "updated_by" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6),
    "time" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "crazy_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."crazy_histories" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "crazy_id" INTEGER NOT NULL,
    "score" SMALLINT NOT NULL,
    "type" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6),

    CONSTRAINT "crazy_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."crazy_read_histories" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "crazy_id" INTEGER NOT NULL,
    "score" SMALLINT NOT NULL,
    "type" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6),

    CONSTRAINT "crazy_read_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."crazy_speak_histories" (
    "id" BIGSERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "crazy_id" INTEGER NOT NULL,
    "score" SMALLINT NOT NULL DEFAULT 0,
    "audio" VARCHAR(191),
    "created_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6),

    CONSTRAINT "crazy_speak_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."crazy_write_histories" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "crazy_id" INTEGER NOT NULL,
    "score" SMALLINT NOT NULL DEFAULT 0,
    "type" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6),

    CONSTRAINT "crazy_write_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."abouts" (
    "id" SERIAL NOT NULL,
    "phone_number" VARCHAR(15) NOT NULL,
    "address" VARCHAR(191) NOT NULL,
    "email" VARCHAR(191) NOT NULL,
    "map" TEXT NOT NULL,
    "info" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6),
    "deleted_at" TIMESTAMP(6),
    "locale" VARCHAR(8),
    "updated_by" INTEGER,
    "created_by" INTEGER,

    CONSTRAINT "abouts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."albums" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(191) NOT NULL,
    "image" VARCHAR(191),
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6),
    "deleted_at" TIMESTAMP(6),

    CONSTRAINT "albums_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."applications" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(191) NOT NULL,
    "content" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "no" INTEGER,
    "locale" VARCHAR(191) NOT NULL DEFAULT 'en',
    "created_by" INTEGER,
    "updated_by" INTEGER,
    "created_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6),
    "deleted_at" TIMESTAMP(6),

    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."brands" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(191) NOT NULL,
    "image" VARCHAR(191),
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6),
    "deleted_at" TIMESTAMP(6),

    CONSTRAINT "brands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."categories" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(191) NOT NULL,
    "image" VARCHAR(191),
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6),
    "deleted_at" TIMESTAMP(6),

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."configs" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(191) NOT NULL,
    "icon" VARCHAR(191) NOT NULL DEFAULT '',
    "title_meta" VARCHAR(191) NOT NULL DEFAULT '',
    "keywords" VARCHAR(191) NOT NULL DEFAULT '',
    "description_meta" TEXT NOT NULL,
    "image_meta" VARCHAR(191),
    "logo" VARCHAR(191),
    "face_script" TEXT,
    "google_script" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "locale" VARCHAR(191) NOT NULL DEFAULT 'en',
    "created_by" INTEGER,
    "updated_by" INTEGER,
    "created_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6),
    "deleted_at" TIMESTAMP(6),

    CONSTRAINT "configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."countries" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(191) NOT NULL,
    "short_name" VARCHAR(191) NOT NULL,
    "locale" VARCHAR(191),
    "timezone" VARCHAR(191),
    "created_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6),

    CONSTRAINT "countries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."word_types" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(191) NOT NULL,
    "created_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6),

    CONSTRAINT "word_types_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_code_key" ON "public"."users"("code");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_number_key" ON "public"."users"("phone_number");

-- CreateIndex
CREATE UNIQUE INDEX "admins_email_key" ON "public"."admins"("email");

-- CreateIndex
CREATE INDEX "accounts_user_id_idx" ON "public"."accounts"("user_id");

-- CreateIndex
CREATE INDEX "buys_user_id_idx" ON "public"."buys"("user_id");

-- CreateIndex
CREATE INDEX "withdraws_user_id_idx" ON "public"."withdraws"("user_id");

-- CreateIndex
CREATE INDEX "coin_logs_created_by_idx" ON "public"."coin_logs"("created_by");

-- CreateIndex
CREATE INDEX "contacts_created_by_idx" ON "public"."contacts"("created_by");

-- CreateIndex
CREATE INDEX "crazies_crazy_course_id_idx" ON "public"."crazies"("crazy_course_id");

-- CreateIndex
CREATE INDEX "crazy_details_crazy_id_idx" ON "public"."crazy_details"("crazy_id");

-- CreateIndex
CREATE INDEX "crazy_histories_user_id_idx" ON "public"."crazy_histories"("user_id");

-- CreateIndex
CREATE INDEX "crazy_histories_crazy_id_idx" ON "public"."crazy_histories"("crazy_id");

-- CreateIndex
CREATE INDEX "crazy_read_histories_user_id_idx" ON "public"."crazy_read_histories"("user_id");

-- CreateIndex
CREATE INDEX "crazy_read_histories_crazy_id_idx" ON "public"."crazy_read_histories"("crazy_id");

-- CreateIndex
CREATE INDEX "crazy_speak_histories_user_id_idx" ON "public"."crazy_speak_histories"("user_id");

-- CreateIndex
CREATE INDEX "crazy_speak_histories_crazy_id_idx" ON "public"."crazy_speak_histories"("crazy_id");

-- CreateIndex
CREATE INDEX "crazy_write_histories_user_id_idx" ON "public"."crazy_write_histories"("user_id");

-- CreateIndex
CREATE INDEX "crazy_write_histories_crazy_id_idx" ON "public"."crazy_write_histories"("crazy_id");

-- AddForeignKey
ALTER TABLE "public"."accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."buys" ADD CONSTRAINT "buys_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."withdraws" ADD CONSTRAINT "withdraws_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."coin_logs" ADD CONSTRAINT "coin_logs_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."contacts" ADD CONSTRAINT "contacts_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."crazies" ADD CONSTRAINT "crazies_crazy_course_id_fkey" FOREIGN KEY ("crazy_course_id") REFERENCES "public"."crazy_courses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."crazy_details" ADD CONSTRAINT "crazy_details_crazy_id_fkey" FOREIGN KEY ("crazy_id") REFERENCES "public"."crazies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."crazy_histories" ADD CONSTRAINT "crazy_histories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."crazy_histories" ADD CONSTRAINT "crazy_histories_crazy_id_fkey" FOREIGN KEY ("crazy_id") REFERENCES "public"."crazies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."crazy_read_histories" ADD CONSTRAINT "crazy_read_histories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."crazy_read_histories" ADD CONSTRAINT "crazy_read_histories_crazy_id_fkey" FOREIGN KEY ("crazy_id") REFERENCES "public"."crazies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."crazy_speak_histories" ADD CONSTRAINT "crazy_speak_histories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."crazy_speak_histories" ADD CONSTRAINT "crazy_speak_histories_crazy_id_fkey" FOREIGN KEY ("crazy_id") REFERENCES "public"."crazies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."crazy_write_histories" ADD CONSTRAINT "crazy_write_histories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."crazy_write_histories" ADD CONSTRAINT "crazy_write_histories_crazy_id_fkey" FOREIGN KEY ("crazy_id") REFERENCES "public"."crazies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
