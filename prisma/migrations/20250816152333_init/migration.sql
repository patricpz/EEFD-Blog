-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('leitor', 'autor', 'moderador', 'admin');

-- CreateEnum
CREATE TYPE "public"."ArticleStatus" AS ENUM ('rascunho', 'pendente', 'publicado', 'rejeitado');

-- CreateEnum
CREATE TYPE "public"."NotificationType" AS ENUM ('novo_artigo', 'comentario', 'seguido');

-- CreateEnum
CREATE TYPE "public"."ReviewStatus" AS ENUM ('aprovado', 'rejeitado', 'revisar');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "public"."Role" NOT NULL,
    "bio" TEXT,
    "profile_picture_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Article" (
    "id" SERIAL NOT NULL,
    "author_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "cover_image_url" TEXT,
    "content" TEXT NOT NULL,
    "status" "public"."ArticleStatus" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "published_at" TIMESTAMP(3),

    CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Tag" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ArticleTag" (
    "article_id" INTEGER NOT NULL,
    "tag_id" INTEGER NOT NULL,

    CONSTRAINT "ArticleTag_pkey" PRIMARY KEY ("article_id","tag_id")
);

-- CreateTable
CREATE TABLE "public"."Comment" (
    "id" SERIAL NOT NULL,
    "article_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Clap" (
    "id" SERIAL NOT NULL,
    "article_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Clap_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Follower" (
    "follower_id" INTEGER NOT NULL,
    "followed_id" INTEGER NOT NULL,

    CONSTRAINT "Follower_pkey" PRIMARY KEY ("follower_id","followed_id")
);

-- CreateTable
CREATE TABLE "public"."Notification" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "type" "public"."NotificationType" NOT NULL,
    "message" TEXT NOT NULL,
    "link" TEXT,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ArticleReview" (
    "id" SERIAL NOT NULL,
    "article_id" INTEGER NOT NULL,
    "reviewer_id" INTEGER NOT NULL,
    "status" "public"."ReviewStatus" NOT NULL,
    "comments" TEXT,
    "reviewed_at" TIMESTAMP(3),

    CONSTRAINT "ArticleReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Event" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "location" TEXT,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "link" TEXT,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "public"."Tag"("name");

-- AddForeignKey
ALTER TABLE "public"."Article" ADD CONSTRAINT "Article_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ArticleTag" ADD CONSTRAINT "ArticleTag_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "public"."Article"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ArticleTag" ADD CONSTRAINT "ArticleTag_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "public"."Tag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Comment" ADD CONSTRAINT "Comment_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "public"."Article"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Comment" ADD CONSTRAINT "Comment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Clap" ADD CONSTRAINT "Clap_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "public"."Article"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Clap" ADD CONSTRAINT "Clap_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Follower" ADD CONSTRAINT "Follower_follower_id_fkey" FOREIGN KEY ("follower_id") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Follower" ADD CONSTRAINT "Follower_followed_id_fkey" FOREIGN KEY ("followed_id") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ArticleReview" ADD CONSTRAINT "ArticleReview_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "public"."Article"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ArticleReview" ADD CONSTRAINT "ArticleReview_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
