/*
  Warnings:

  - You are about to drop the column `synopsis` on the `Module` table. All the data in the column will be lost.
  - The primary key for the `Question` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `question_id` on the `Question` table. All the data in the column will be lost.
  - Added the required column `synopsis` to the `Module` table without a default value. This is not possible if the table is not empty.
  - The required column `question_id` was added to the `Question` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- DropForeignKey
ALTER TABLE "public"."Reply" DROP CONSTRAINT "Reply_question_id_fkey";

-- AlterTable
ALTER TABLE "public"."Module" DROP COLUMN "synopsis",
ADD COLUMN     "synopsis" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Question" DROP CONSTRAINT "Question_pkey",
DROP COLUMN "question_id",
ADD COLUMN     "question_id" TEXT NOT NULL,
ADD CONSTRAINT "Question_pkey" PRIMARY KEY ("question_id");

-- AddForeignKey
ALTER TABLE "public"."Reply" ADD CONSTRAINT "Reply_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "public"."Question"("question_id") ON DELETE RESTRICT ON UPDATE CASCADE;
