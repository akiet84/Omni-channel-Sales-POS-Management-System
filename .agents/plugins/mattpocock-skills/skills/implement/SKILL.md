---
name: implement
description: "Implement a piece of work based on a spec or set of tickets."
disable-model-invocation: true
---

Implement the work described by the user in the spec or tickets.

If the user passes a ticket reference, fetch it from the issue tracker and state its title before starting. If the reference is ambiguous, ask.

Call the Skill tool with "tdd" where possible, at pre-agreed seams.

Run typechecking regularly, single test files regularly, and the full test suite once at the end.

When bootstrapping dependencies with pnpm (v11+), if native packages report `[ERR_PNPM_IGNORED_BUILDS]`, run `pnpm approve-builds --all` to allow build scripts without interactive prompts.

Once done, call the Skill tool with "code-review" to review the work.

Commit your work to the current branch.
