/*
  Warnings:

  - The `age_group` column on the `Module` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "public"."Module" DROP COLUMN "age_group",
ADD COLUMN     "age_group" TEXT[];
