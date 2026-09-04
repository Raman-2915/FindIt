-- CreateIndex
CREATE INDEX "Claim_foundItemId_createdAt_idx" ON "Claim"("foundItemId", "createdAt");

-- CreateIndex
CREATE INDEX "FoundItem_categoryId_status_idx" ON "FoundItem"("categoryId", "status");

-- CreateIndex
CREATE INDEX "Notification_userId_createdAt_idx" ON "Notification"("userId", "createdAt");
