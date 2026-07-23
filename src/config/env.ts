/**
 * Centralized environment configuration for the Quantum Language Website.
 *
 * All frontend environment variables are read here with sensible development
 * defaults. Import `env` from this module instead of scattering
 * `import.meta.env.VITE_*` calls across components.
 *
 * Variables follow Vite conventions — only VITE_-prefixed values are exposed
 * to the browser. Backend-only secrets (GEMINI_API_KEY, GROQ_API_KEY, etc.)
 * must NOT be placed here.
 */

// ---------------------------------------------------------------------------
// Helper: read an env var with an optional fallback
// ---------------------------------------------------------------------------
function getEnv(key: string, fallback: string): string {
  const value = import.meta.env[key] as string | undefined;
  return value ?? fallback;
}

// ---------------------------------------------------------------------------
// Warn in development if critical variables are missing
// ---------------------------------------------------------------------------
function warnIfMissing(key: string, value: string, fallback: string): void {
  if (import.meta.env.DEV && value === fallback) {
    console.warn(
      `[env] "${key}" is not set — using default: "${fallback}". ` +
      `Add it to your .env file for production builds.`
    );
  }
}

// ---------------------------------------------------------------------------
// Backend / API
// ---------------------------------------------------------------------------

/** Base URL for the backend REST API (ChatAssistant, etc.) */
const API_URL = getEnv('VITE_API_URL', 'http://localhost:5000');
warnIfMissing('VITE_API_URL', API_URL, 'http://localhost:5000');

/** WebSocket URL for the live code execution terminal */
const WS_URL = getEnv('VITE_WS_URL', 'ws://localhost:5000');
warnIfMissing('VITE_WS_URL', WS_URL, 'ws://localhost:5000');

// ---------------------------------------------------------------------------
// GitHub Links
// ---------------------------------------------------------------------------

/** Main language repository (personal account) */
const GITHUB_REPO_URL = getEnv(
  'VITE_GITHUB_REPO_URL',
  'https://github.com/SENODROOM/Quantum-Language',
);

/** Organisation-level repository */
const GITHUB_ORG_URL = getEnv(
  'VITE_GITHUB_ORG_URL',
  'https://github.com/QuantumLogicsLabs/QuantumLanguage.git',
);

/** GitHub Releases page (Linux / macOS downloads) */
const GITHUB_RELEASES_URL = getEnv(
  'VITE_GITHUB_RELEASES_URL',
  'https://github.com/SENODROOM/Quantum-Language/releases',
);

/** Code Explanation ecosystem repo */
const GITHUB_CODE_EXPLANATION_URL = getEnv(
  'VITE_GITHUB_CODE_EXPLANATION_URL',
  'https://github.com/SENODROOM/QuantumLangCodeExplaination',
);

/** Docs Syncer ecosystem repo */
const GITHUB_DOCS_SYNCER_URL = getEnv(
  'VITE_GITHUB_DOCS_SYNCER_URL',
  'https://github.com/SENODROOM/Quantum-Docs-Syncer',
);

/** Author's GitHub profile */
const GITHUB_AUTHOR_URL = getEnv(
  'VITE_GITHUB_AUTHOR_URL',
  'https://github.com/SENODROOM',
);

// ---------------------------------------------------------------------------
// Community
// ---------------------------------------------------------------------------

/** Discord invite URL */
const DISCORD_URL = getEnv('VITE_DISCORD_URL', 'https://discord.gg/HvgzP4pBJ');

// ---------------------------------------------------------------------------
// Application Metadata
// ---------------------------------------------------------------------------

/** Application display name */
const APP_NAME = getEnv('VITE_APP_NAME', 'Quantum');

/** Current application / language version */
const APP_VERSION = getEnv('VITE_APP_VERSION', 'v2.0.4');

// ---------------------------------------------------------------------------
// Debug flag — available via `import.meta.env.VITE_DEBUG`
// ---------------------------------------------------------------------------

/** Whether debug mode is active (dev server OR explicit VITE_DEBUG=true) */
const IS_DEBUG = import.meta.env.DEV || import.meta.env.VITE_DEBUG === 'true';

// ---------------------------------------------------------------------------
// Exported config object
// ---------------------------------------------------------------------------

export const env = {
  API_URL,
  WS_URL,

  GITHUB_REPO_URL,
  GITHUB_ORG_URL,
  GITHUB_RELEASES_URL,
  GITHUB_CODE_EXPLANATION_URL,
  GITHUB_DOCS_SYNCER_URL,
  GITHUB_AUTHOR_URL,

  DISCORD_URL,

  APP_NAME,
  APP_VERSION,

  IS_DEBUG,
} as const;
