declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    BUCKET?: R2Bucket;
    ADMIN_MASTER_KEY?: string;
    RESEND_API_KEY?: string;
    CONTACT_TO_EMAIL?: string;
    CONTACT_FROM_EMAIL?: string;
  }
}
