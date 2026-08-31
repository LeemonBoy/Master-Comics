-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'MODERATOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "ComicStatus" AS ENUM ('DRAFT', 'PENDING', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'REVIEWED', 'RESOLVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "AdminActionType" AS ENUM ('SUSPEND_USER', 'REACTIVATE_USER', 'DELETE_USER', 'HIDE_COMIC', 'DELETE_COMIC', 'APPROVE_COMIC', 'REJECT_COMIC');

-- CreateEnum
CREATE TYPE "AdPlacement" AS ENUM ('HOME', 'READER', 'SIDEBAR');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "displayName" TEXT,
    "avatar" TEXT,
    "bio" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comics" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "coverImage" TEXT,
    "authorId" TEXT NOT NULL,
    "artistId" TEXT,
    "status" "ComicStatus" NOT NULL DEFAULT 'DRAFT',
    "ageRating" TEXT,
    "language" TEXT NOT NULL DEFAULT 'es',
    "views" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "comics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "genres" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "genres_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comic_genres" (
    "id" TEXT NOT NULL,
    "comicId" TEXT NOT NULL,
    "genreId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comic_genres_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comic_tags" (
    "id" TEXT NOT NULL,
    "comicId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comic_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chapters" (
    "id" TEXT NOT NULL,
    "comicId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "chapterNumber" INTEGER NOT NULL,
    "coverImage" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chapters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pages" (
    "id" TEXT NOT NULL,
    "chapterId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "pageNumber" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_favorites" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "comicId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_favorites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reading_history" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "comicId" TEXT NOT NULL,
    "chapterId" TEXT NOT NULL,
    "lastPageNumber" INTEGER NOT NULL,
    "progress" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lastReadAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reading_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reports" (
    "id" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "comicId" TEXT,
    "chapterId" TEXT,
    "reason" TEXT NOT NULL,
    "description" TEXT,
    "status" "ReportStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_actions" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "targetUserId" TEXT,
    "targetComicId" TEXT,
    "action" "AdminActionType" NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "advertisements" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "placement" "AdPlacement" NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "linkUrl" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "advertisements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "genres_name_key" ON "genres"("name");

-- CreateIndex
CREATE UNIQUE INDEX "genres_slug_key" ON "genres"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "comic_genres_comicId_genreId_key" ON "comic_genres"("comicId", "genreId");

-- CreateIndex
CREATE UNIQUE INDEX "tags_name_key" ON "tags"("name");

-- CreateIndex
CREATE UNIQUE INDEX "tags_slug_key" ON "tags"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "comic_tags_comicId_tagId_key" ON "comic_tags"("comicId", "tagId");

-- CreateIndex
CREATE UNIQUE INDEX "chapters_comicId_chapterNumber_key" ON "chapters"("comicId", "chapterNumber");

-- CreateIndex
CREATE UNIQUE INDEX "pages_chapterId_pageNumber_key" ON "pages"("chapterId", "pageNumber");

-- CreateIndex
CREATE UNIQUE INDEX "user_favorites_userId_comicId_key" ON "user_favorites"("userId", "comicId");

-- CreateIndex
CREATE UNIQUE INDEX "reading_history_userId_comicId_chapterId_key" ON "reading_history"("userId", "comicId", "chapterId");

-- AddForeignKey
ALTER TABLE "comics" ADD CONSTRAINT "comics_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comics" ADD CONSTRAINT "comics_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comic_genres" ADD CONSTRAINT "comic_genres_comicId_fkey" FOREIGN KEY ("comicId") REFERENCES "comics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comic_genres" ADD CONSTRAINT "comic_genres_genreId_fkey" FOREIGN KEY ("genreId") REFERENCES "genres"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comic_tags" ADD CONSTRAINT "comic_tags_comicId_fkey" FOREIGN KEY ("comicId") REFERENCES "comics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comic_tags" ADD CONSTRAINT "comic_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chapters" ADD CONSTRAINT "chapters_comicId_fkey" FOREIGN KEY ("comicId") REFERENCES "comics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pages" ADD CONSTRAINT "pages_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "chapters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_favorites" ADD CONSTRAINT "user_favorites_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_favorites" ADD CONSTRAINT "user_favorites_comicId_fkey" FOREIGN KEY ("comicId") REFERENCES "comics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reading_history" ADD CONSTRAINT "reading_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reading_history" ADD CONSTRAINT "reading_history_comicId_fkey" FOREIGN KEY ("comicId") REFERENCES "comics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_comicId_fkey" FOREIGN KEY ("comicId") REFERENCES "comics"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_actions" ADD CONSTRAINT "admin_actions_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_actions" ADD CONSTRAINT "admin_actions_targetUserId_fkey" FOREIGN KEY ("targetUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
