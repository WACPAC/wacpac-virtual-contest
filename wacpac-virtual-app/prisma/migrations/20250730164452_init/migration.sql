-- CreateTable
CREATE TABLE "public"."contests" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."problems" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "problem_url" TEXT NOT NULL,
    "submission_url" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 100,
    "order_index" INTEGER NOT NULL,
    "contest_id" TEXT NOT NULL,

    CONSTRAINT "problems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "atcoder_id" TEXT NOT NULL,
    "contest_id" TEXT NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."submissions" (
    "id" TEXT NOT NULL,
    "submission_id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "submitted_at" TIMESTAMP(3) NOT NULL,
    "user_id" TEXT NOT NULL,
    "problem_id" TEXT NOT NULL,

    CONSTRAINT "submissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "contests_name_key" ON "public"."contests"("name");

-- CreateIndex
CREATE UNIQUE INDEX "problems_contest_id_problem_url_key" ON "public"."problems"("contest_id", "problem_url");

-- CreateIndex
CREATE UNIQUE INDEX "problems_contest_id_order_index_key" ON "public"."problems"("contest_id", "order_index");

-- CreateIndex
CREATE UNIQUE INDEX "users_contest_id_atcoder_id_key" ON "public"."users"("contest_id", "atcoder_id");

-- CreateIndex
CREATE UNIQUE INDEX "submissions_submission_id_key" ON "public"."submissions"("submission_id");

-- AddForeignKey
ALTER TABLE "public"."problems" ADD CONSTRAINT "problems_contest_id_fkey" FOREIGN KEY ("contest_id") REFERENCES "public"."contests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."users" ADD CONSTRAINT "users_contest_id_fkey" FOREIGN KEY ("contest_id") REFERENCES "public"."contests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."submissions" ADD CONSTRAINT "submissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."submissions" ADD CONSTRAINT "submissions_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "public"."problems"("id") ON DELETE CASCADE ON UPDATE CASCADE;
