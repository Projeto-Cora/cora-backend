-- CreateTable
CREATE TABLE "public"."User" (
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "user_type" TEXT NOT NULL,
    "profile_picture" TEXT NOT NULL,
    "creation_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "public"."Child" (
    "child_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "birth_date" TIMESTAMP(3) NOT NULL,
    "age_group" TEXT NOT NULL,
    "parent_id" TEXT NOT NULL,

    CONSTRAINT "Child_pkey" PRIMARY KEY ("child_id")
);

-- CreateTable
CREATE TABLE "public"."Reply" (
    "reply_id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "is_anonymous" BOOLEAN NOT NULL DEFAULT false,
    "creation_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT NOT NULL,
    "question_id" TEXT NOT NULL,

    CONSTRAINT "Reply_pkey" PRIMARY KEY ("reply_id")
);

-- CreateTable
CREATE TABLE "public"."Question" (
    "question_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "creation_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "keywords" TEXT[],
    "is_anonymous" BOOLEAN NOT NULL DEFAULT false,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("question_id")
);

-- CreateTable
CREATE TABLE "public"."Module" (
    "module_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "synopsis" TEXT NOT NULL,
    "thumbnail" TEXT NOT NULL,
    "creation_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "views" INTEGER NOT NULL DEFAULT 0,
    "age_group" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "Module_pkey" PRIMARY KEY ("module_id")
);

-- CreateTable
CREATE TABLE "public"."Content" (
    "content_id" TEXT NOT NULL,
    "text" TEXT,
    "image" TEXT,
    "template" TEXT NOT NULL,
    "video_link" TEXT,
    "module_id" TEXT NOT NULL,

    CONSTRAINT "Content_pkey" PRIMARY KEY ("content_id")
);

-- CreateTable
CREATE TABLE "public"."SpecialistProfile" (
    "specialist_id" TEXT NOT NULL,
    "specialty" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "council_number" TEXT NOT NULL,

    CONSTRAINT "SpecialistProfile_pkey" PRIMARY KEY ("specialist_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- AddForeignKey
ALTER TABLE "public"."Child" ADD CONSTRAINT "Child_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Reply" ADD CONSTRAINT "Reply_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Reply" ADD CONSTRAINT "Reply_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "public"."Question"("question_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Question" ADD CONSTRAINT "Question_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Module" ADD CONSTRAINT "Module_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Content" ADD CONSTRAINT "Content_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "public"."Module"("module_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SpecialistProfile" ADD CONSTRAINT "SpecialistProfile_specialist_id_fkey" FOREIGN KEY ("specialist_id") REFERENCES "public"."User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
