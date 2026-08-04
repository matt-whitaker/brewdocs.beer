# claude-team

A portable definition of a Claude/GitHub role team — the prompts each role runs on, and the
scripted hooks that do the bookkeeping around them. A repo **consumes** it by pointing a
workflow at these files, and **extends** it with its own per-role overlay.

BrewDocs is the first consumer. Nothing here names BrewDocs, its gate or its packages; if it
does, it belongs in the consumer's overlay.

## Entry points

- [`prompts/`](prompts/) — [`_shared.md`](prompts/_shared.md) for every role, plus one file
  per role. A role's prompt is the shared file, then its own, then the consumer's equivalents.
- [`hooks/`](hooks/) — the scripted steps that run around each model step, in Python. Each
  explains itself in its own docstring; [`team.py`](hooks/team.py) holds what they share.
- [`schemas/handoff.json`](schemas/handoff.json) — the contract one author passes to the next.

## The model

Work is **epic → story → task**. An epic is a grouping and has no branch. A story owns a
branch and a PR against the default branch. A task owns a branch cut off the story's and a PR
back into it — merging that closes the task, and the story's PR accumulates the lot.

Six roles. One runs per trigger, chosen from the issue's state by a script rather than a model:

| role | picked up from | writes |
|---|---|---|
| Architect | an epic, or an unshaped story | the issue, a story's branch, and its tasks |
| Implementor | a task stamped `Role: implementor` | code, outside the design system |
| Designer | a task stamped `Role: designer` | code, inside the design system |
| Tester | a task stamped `Role: tester` | tests |
| Writer | a task stamped `Role: writer` | documentation |
| Security | every merge, and on request | issues it files |

Nothing chains: no role starts another, and a person triggers every run.

## Consuming it

Per role, a workflow needs to compose the prompt from this package plus your overlay, run the
hooks around the model step, and pass the role its issue and story numbers as environment
variables.

See [`CLAUDE.md`](CLAUDE.md) for the design decisions, the platform constraints they work
around, and the failures that shaped them.
