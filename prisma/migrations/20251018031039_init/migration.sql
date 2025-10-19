-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('ADMIN', 'USER', 'AUTHOR', 'EDITOR', 'MODERATOR');

-- CreateTable
CREATE TABLE "public"."contacts" (
    "id" SERIAL NOT NULL,
    "created_by" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    "name" TEXT,
    "email" TEXT,
    "phone_number" TEXT,
    "is_active" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."roles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" "public"."UserRole" NOT NULL,
    "description" TEXT,
    "permissions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "sex" BOOLEAN NOT NULL DEFAULT true,
    "birthday" TIMESTAMP(3),
    "address" TEXT,
    "avatar" TEXT,
    "remember_token" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "role_id" UUID,
    "last_logout" TIMESTAMP(3),
    "slack_webhook_url" TEXT,
    "deleted_at" TIMESTAMP(3),
    "coin" BIGINT NOT NULL DEFAULT 1000,
    "locale" TEXT DEFAULT 'en',
    "group_id" INTEGER DEFAULT 1,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."word_types" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "word_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."password_resets" (
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "created_at" TIMESTAMP(3),

    CONSTRAINT "password_resets_pkey" PRIMARY KEY ("email","token")
);

-- CreateTable
CREATE TABLE "public"."subjects" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "is_active" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "subjects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_profiles" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "height" INTEGER,
    "weight" INTEGER,
    "round_one" INTEGER,
    "round_two" INTEGER,
    "round_three" INTEGER,
    "image_one" TEXT,
    "image_two" TEXT,
    "image_three" TEXT,
    "website" TEXT,
    "hobby" TEXT,
    "slogan" TEXT,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."questions" (
    "id" SERIAL NOT NULL,
    "question" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."tags" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "is_active" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Story" (
    "id" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "title" TEXT,
    "config" JSONB,
    "preferences" JSONB,
    "template_id" TEXT,
    "sections" JSONB,
    "metadata" JSONB,
    "word_count" INTEGER,
    "language_ratio" JSONB,
    "readability_score" DOUBLE PRECISION,
    "generation_time" INTEGER,
    "user_id" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Story_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."StoryTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "config" JSONB NOT NULL,
    "popular" BOOLEAN NOT NULL DEFAULT false,
    "usage_count" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StoryTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_preferences" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "session_id" TEXT,
    "preferences" JSONB NOT NULL,
    "last_used_template_id" TEXT,
    "favorite_templates" TEXT[],
    "usage_count" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."story_usage_analytics" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "session_id" TEXT,
    "story_id" TEXT NOT NULL,
    "template_id" TEXT,
    "version_type" TEXT NOT NULL,
    "language_ratio" JSONB NOT NULL,
    "story_length" TEXT NOT NULL,
    "readability_level" TEXT NOT NULL,
    "tone" TEXT NOT NULL,
    "generation_time" INTEGER NOT NULL,
    "word_count" INTEGER NOT NULL,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "story_usage_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."story_versions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "color_scheme" TEXT NOT NULL,
    "features" JSONB NOT NULL,
    "limitations" JSONB NOT NULL,
    "is_free" BOOLEAN NOT NULL DEFAULT true,
    "price_monthly" DOUBLE PRECISION,
    "price_yearly" DOUBLE PRECISION,
    "max_stories_per_day" INTEGER,
    "max_word_count" INTEGER,
    "available_templates" TEXT[],
    "available_languages" TEXT[],
    "advanced_features" JSONB NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_beta" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "story_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_subscriptions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "version_slug" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL,
    "expires_at" TIMESTAMP(3),
    "stories_used_today" INTEGER NOT NULL DEFAULT 0,
    "stories_used_this_month" INTEGER NOT NULL DEFAULT 0,
    "last_reset_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."conversations" (
    "id" TEXT NOT NULL,
    "isGroup" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."groups" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."group_members" (
    "id" TEXT NOT NULL,
    "groupId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "group_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."messages" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "conversationId" TEXT,
    "groupId" INTEGER,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "public"."roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE INDEX "users_role_id_idx" ON "public"."users"("role_id");

-- CreateIndex
CREATE INDEX "users_is_active_idx" ON "public"."users"("is_active");

-- CreateIndex
CREATE INDEX "users_created_at_idx" ON "public"."users"("created_at");

-- CreateIndex
CREATE INDEX "users_last_login_idx" ON "public"."users"("last_login");

-- CreateIndex
CREATE INDEX "users_locale_idx" ON "public"."users"("locale");

-- CreateIndex
CREATE INDEX "users_group_id_idx" ON "public"."users"("group_id");

-- CreateIndex
CREATE INDEX "users_first_name_last_name_idx" ON "public"."users"("first_name", "last_name");

-- CreateIndex
CREATE INDEX "users_is_active_role_id_idx" ON "public"."users"("is_active", "role_id");

-- CreateIndex
CREATE INDEX "users_created_at_is_active_idx" ON "public"."users"("created_at", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "user_preferences_user_id_key" ON "public"."user_preferences"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_preferences_session_id_key" ON "public"."user_preferences"("session_id");

-- CreateIndex
CREATE UNIQUE INDEX "story_versions_slug_key" ON "public"."story_versions"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "user_subscriptions_user_id_key" ON "public"."user_subscriptions"("user_id");

-- CreateIndex
CREATE INDEX "groups_ownerId_idx" ON "public"."groups"("ownerId");

-- CreateIndex
CREATE INDEX "group_members_groupId_idx" ON "public"."group_members"("groupId");

-- CreateIndex
CREATE INDEX "group_members_userId_idx" ON "public"."group_members"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "group_members_groupId_userId_key" ON "public"."group_members"("groupId", "userId");

-- CreateIndex
CREATE INDEX "messages_senderId_idx" ON "public"."messages"("senderId");

-- CreateIndex
CREATE INDEX "messages_conversationId_createdAt_idx" ON "public"."messages"("conversationId", "createdAt");

-- CreateIndex
CREATE INDEX "messages_groupId_createdAt_idx" ON "public"."messages"("groupId", "createdAt");

-- AddForeignKey
ALTER TABLE "public"."users" ADD CONSTRAINT "users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."users" ADD CONSTRAINT "users_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."groups" ADD CONSTRAINT "groups_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."group_members" ADD CONSTRAINT "group_members_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "public"."groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."group_members" ADD CONSTRAINT "group_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."messages" ADD CONSTRAINT "messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."messages" ADD CONSTRAINT "messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "public"."conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."messages" ADD CONSTRAINT "messages_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "public"."groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;
