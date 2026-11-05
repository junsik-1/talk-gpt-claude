declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    BUCKET?: R2Bucket;
		OPENAI_API_KEY?: string;
		ANTHROPIC_API_KEY?: string;
		OPENAI_MODEL?: string;
		ANTHROPIC_MODEL?: string;
  }
}
