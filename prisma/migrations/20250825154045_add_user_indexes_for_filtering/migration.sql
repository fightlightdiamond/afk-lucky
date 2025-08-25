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
