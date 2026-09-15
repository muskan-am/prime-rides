-- CreateTable
CREATE TABLE IF NOT EXISTS "NotificationPreference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bookingCreated" BOOLEAN NOT NULL DEFAULT true,
    "paymentPending" BOOLEAN NOT NULL DEFAULT true,
    "paymentSuccess" BOOLEAN NOT NULL DEFAULT true,
    "bookingConfirmed" BOOLEAN NOT NULL DEFAULT true,
    "bookingCancelled" BOOLEAN NOT NULL DEFAULT true,
    "bookingCompleted" BOOLEAN NOT NULL DEFAULT true,
    "adminNewBooking" BOOLEAN NOT NULL DEFAULT true,
    "adminPaymentReceived" BOOLEAN NOT NULL DEFAULT true,
    "adminBookingCancelled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationPreference_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "NotificationPreference_userId_key" ON "NotificationPreference"("userId");

-- AddForeignKey
ALTER TABLE "NotificationPreference" ADD CONSTRAINT "NotificationPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
