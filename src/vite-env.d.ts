/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Web3Forms access key; empty means the contact form falls back to mailto:. */
  readonly VITE_WEB3FORMS_KEY?: string;
}
