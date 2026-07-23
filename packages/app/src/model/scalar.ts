// Scalar now lives in core (shared with the kb catalog). This shim keeps the
// `@/model/scalar` default import working; call sites get repointed in a follow-up.
export type { Scalar as default } from "@brewdocs.beer/core";
