-- Email link to continue a chat on another device, and verified-email flag.
ALTER TABLE "ChatConversation" ADD COLUMN "emailVerifiedAt" TIMESTAMP(3);
ALTER TABLE "ChatConversation" ADD COLUMN "linkTokenHash" TEXT;
ALTER TABLE "ChatConversation" ADD COLUMN "linkExpiresAt" TIMESTAMP(3);
ALTER TABLE "ChatConversation" ADD COLUMN "linkSentAt" TIMESTAMP(3);

CREATE UNIQUE INDEX "ChatConversation_linkTokenHash_key" ON "ChatConversation"("linkTokenHash");
CREATE INDEX "ChatConversation_email_idx" ON "ChatConversation"("email");
