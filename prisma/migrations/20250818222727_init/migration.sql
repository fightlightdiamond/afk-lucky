/*
  Warnings:

  - The `is_active` column on the `contacts` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `abouts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `access_logs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `accounts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `admins` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `albums` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `api_keys` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `applications` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `banners` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `brands` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `buys` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `categories` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `coin_logs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `configs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `contracts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `countries` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `crazies` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `crazy_courses` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `crazy_details` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `crazy_histories` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `crazy_read_histories` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `crazy_speak_histories` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `crazy_write_histories` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `error_logs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `faqs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `lesson_feed_backs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `lesson_results` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `lesson_sub_comments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `section_results` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `section_tests` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `titles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tutorial_results` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_devices` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_sessions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `withdraws` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."accounts" DROP CONSTRAINT "accounts_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."buys" DROP CONSTRAINT "buys_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."coin_logs" DROP CONSTRAINT "coin_logs_created_by_fkey";

-- DropForeignKey
ALTER TABLE "public"."contacts" DROP CONSTRAINT "contacts_created_by_fkey";

-- DropForeignKey
ALTER TABLE "public"."crazies" DROP CONSTRAINT "crazies_crazy_course_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."crazy_details" DROP CONSTRAINT "crazy_details_crazy_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."crazy_histories" DROP CONSTRAINT "crazy_histories_crazy_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."crazy_histories" DROP CONSTRAINT "crazy_histories_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."crazy_read_histories" DROP CONSTRAINT "crazy_read_histories_crazy_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."crazy_read_histories" DROP CONSTRAINT "crazy_read_histories_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."crazy_speak_histories" DROP CONSTRAINT "crazy_speak_histories_crazy_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."crazy_speak_histories" DROP CONSTRAINT "crazy_speak_histories_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."crazy_write_histories" DROP CONSTRAINT "crazy_write_histories_crazy_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."crazy_write_histories" DROP CONSTRAINT "crazy_write_histories_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."withdraws" DROP CONSTRAINT "withdraws_user_id_fkey";

-- DropIndex
DROP INDEX "public"."contacts_created_by_idx";

-- AlterTable
ALTER TABLE "public"."contacts" ALTER COLUMN "title" SET DATA TYPE TEXT,
DROP COLUMN "is_active",
ADD COLUMN     "is_active" INTEGER NOT NULL DEFAULT 1,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "deleted_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "name" SET DATA TYPE TEXT,
ALTER COLUMN "email" SET DATA TYPE TEXT,
ALTER COLUMN "phone_number" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "public"."users" ALTER COLUMN "first_name" SET DATA TYPE TEXT,
ALTER COLUMN "last_name" SET DATA TYPE TEXT,
ALTER COLUMN "code" SET DATA TYPE TEXT,
ALTER COLUMN "email" SET DATA TYPE TEXT,
ALTER COLUMN "phone_number" SET DATA TYPE TEXT,
ALTER COLUMN "password" SET DATA TYPE TEXT,
ALTER COLUMN "birthday" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "remember_token" SET DATA TYPE TEXT,
ALTER COLUMN "last_login" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "last_logout" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "slack_webhook_url" SET DATA TYPE TEXT,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "deleted_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "locale" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "public"."word_types" ALTER COLUMN "name" SET DATA TYPE TEXT,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMP(3);

-- DropTable
DROP TABLE "public"."abouts";

-- DropTable
DROP TABLE "public"."access_logs";

-- DropTable
DROP TABLE "public"."accounts";

-- DropTable
DROP TABLE "public"."admins";

-- DropTable
DROP TABLE "public"."albums";

-- DropTable
DROP TABLE "public"."api_keys";

-- DropTable
DROP TABLE "public"."applications";

-- DropTable
DROP TABLE "public"."banners";

-- DropTable
DROP TABLE "public"."brands";

-- DropTable
DROP TABLE "public"."buys";

-- DropTable
DROP TABLE "public"."categories";

-- DropTable
DROP TABLE "public"."coin_logs";

-- DropTable
DROP TABLE "public"."configs";

-- DropTable
DROP TABLE "public"."contracts";

-- DropTable
DROP TABLE "public"."countries";

-- DropTable
DROP TABLE "public"."crazies";

-- DropTable
DROP TABLE "public"."crazy_courses";

-- DropTable
DROP TABLE "public"."crazy_details";

-- DropTable
DROP TABLE "public"."crazy_histories";

-- DropTable
DROP TABLE "public"."crazy_read_histories";

-- DropTable
DROP TABLE "public"."crazy_speak_histories";

-- DropTable
DROP TABLE "public"."crazy_write_histories";

-- DropTable
DROP TABLE "public"."error_logs";

-- DropTable
DROP TABLE "public"."faqs";

-- DropTable
DROP TABLE "public"."lesson_feed_backs";

-- DropTable
DROP TABLE "public"."lesson_results";

-- DropTable
DROP TABLE "public"."lesson_sub_comments";

-- DropTable
DROP TABLE "public"."section_results";

-- DropTable
DROP TABLE "public"."section_tests";

-- DropTable
DROP TABLE "public"."titles";

-- DropTable
DROP TABLE "public"."tutorial_results";

-- DropTable
DROP TABLE "public"."user_devices";

-- DropTable
DROP TABLE "public"."user_sessions";

-- DropTable
DROP TABLE "public"."withdraws";

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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Story_pkey" PRIMARY KEY ("id")
);
