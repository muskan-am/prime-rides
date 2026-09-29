import Razorpay from "razorpay";

/**
 * Sanitizes environment variable values by trimming whitespace
 * and stripping surrounding single or double quotes.
 */
export function sanitizeEnv(val?: string | null): string {
  if (!val) return "";
  let clean = val.trim();
  if (
    (clean.startsWith('"') && clean.endsWith('"')) ||
    (clean.startsWith("'") && clean.endsWith("'"))
  ) {
    clean = clean.slice(1, -1).trim();
  }
  return clean;
}

/**
 * Resolves Razorpay credentials from environment variables.
 * Supports primary names and common aliases safely.
 */
export function getRazorpayConfig() {
  const keyId =
    sanitizeEnv(process.env.RAZORPAY_KEY_ID) ||
    sanitizeEnv(process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID);

  const keySecret =
    sanitizeEnv(process.env.RAZORPAY_KEY_SECRET) ||
    sanitizeEnv(process.env.RAZORPAY_SECRET) ||
    sanitizeEnv(process.env.RAZORPAY_API_SECRET);

  const hasKeyId = Boolean(keyId);
  const hasKeySecret = Boolean(keySecret);
  const isConfigured = hasKeyId && hasKeySecret;

  // Safe masked key for logging / diagnostics (never leaks secrets)
  const maskedKeyId = keyId
    ? `${keyId.slice(0, 8)}...${keyId.slice(-4)}`
    : "NOT_SET";

  return {
    keyId,
    keySecret,
    hasKeyId,
    hasKeySecret,
    isConfigured,
    maskedKeyId,
  };
}

/**
 * Creates and returns a configured server-side Razorpay client instance.
 * Throws a descriptive error if credentials are missing on the server.
 */
export function getRazorpayInstance(): Razorpay {
  const { keyId, keySecret, isConfigured } = getRazorpayConfig();

  if (!isConfigured) {
    throw new Error(
      "Razorpay API credentials missing. Please ensure RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are set in the server environment."
    );
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
}
