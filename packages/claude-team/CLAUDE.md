# packages/claude-team

Package-specific guidance. See [`README.md`](README.md) for what this package is and how a
repo consumes it, and the repo-root `CLAUDE.md` for this repo's own application of it.

**Purpose.** A portable Claude/GitHub role team: the prompts each role runs on, the scripted
hooks around them, and the handoff contract between them. Consumed by pointing a workflow at
these files; extended by a per-role overlay in the consuming repo.
**Where.** `prompts/_shared.md` + `prompts/<role>.md`, `hooks/*.py`, `schemas/handoff.json`.
**Invariants.** Nothing here names a consuming repo, its branches, its gate or its packages.
Routing is a script, never a model. Every hook is deterministic and derives its input from
state, not from something a model was asked to leave behind.

## The issue hierarchy

| level | branch | its PR targets | closed by |
|---|---|---|---|
| **Epic** | none | — | its stories closing |
| **Story** | `<story#>-<summary>`, cut by the Architect | the **default** branch | its PR merging |
| **Task** | `<task#>-<summary>`, cut by its author off the story branch | the **story** branch | its own PR merging |

- An epic never has a branch and never has a PR. If something needs a PR, it is a story.
- ⚠️ **An unprocessed issue is a STORY.** An epic has to say so — by an `epic` label or a
  title beginning "Epic" — and the Architect leaves both markers behind so nothing re-derives
  it next run. Deliberately NOT inferred from having sub-issues: a story has those too, they
  are its tasks. The old inference only held because a shaped story also had a branch, so an
  unshaped story with tasks read as an epic.
- ⚠️ **A maintainer's comment is the only override**, and it is judged by the model rather
  than matched by the script. A regex for the word misfires on an ordinary sentence — "a
  story under the Claude Team epic" — and a false positive decomposes a story into stories.
- ⚠️ **Epics are the maintainer's to create.** No role files one on its own initiative and
  none promotes an issue into one. A role may *propose* an epic and stop; the decision is
  not delegated. Ambiguity resolves to a story, always.
- A story owns one branch and one PR against the default branch, and it accumulates.
- A task is a slice of a story with its own branch and its own PR **into the story branch**.

⚠️ **The Branch line always names the STORY's branch** — on the story and on every one of
its tasks. It is what an author bases on and merges back into, never a branch for the task
itself. Anything deriving a story from a branch name reads that prefix.

⚠️ **Branch creation is scripted, not prompted** — the last load-bearing thing a model owned,
and it failed about half the time. The host action mints its own branch for an issue trigger
and injects *"You are already on the correct branch. Do not create a new branch"*, which
contradicts any prompt telling a model to cut one. Which instruction wins is the model's call,
and it went both ways. Three pieces replace it:

- **The story branch** — a **post**-hook reads the `Branch:` line the Architect had to write
  anyway and creates that ref at the default branch's head. The Architect names it and
  nothing else.
- **A task's branch** — the action's own `base_branch` input, set to the story's branch. The
  branch it creates is then the right one, so its injected instruction becomes true instead of
  something to argue with. Configure the action rather than fight it.
- **A task PR's base** — `finish-pr.py` retargets it onto the story branch. The model still
  writes `--base` for the human-readable reason; the hook is the net.

⚠️ **The story-branch hook must run POST, and this inverts the obvious implementation.**
`setupBranch` checks whether the name it is about to generate already exists remotely and, if
so, discards the configured template and falls back to `claude/<entity>-<n>-<timestamp>`. A
pre-hook pushing the story branch would collide with the very name the action mints from
`{{entityNumber}}-{{description}}`, stranding the run on a branch nobody looks at. Orphaned
`claude/*` branches in a consuming repo are this fallback firing on a re-run.

⚠️ **The hook never touches a branch that exists.** Absent is the only case it handles: an
existing branch may carry an author's commits, and resetting it to the default branch would
destroy exactly the work the hook exists to protect.

⚠️ **Tasks must not share one branch.** They did once, and it was a race: if a consumer keys
its concurrency group on issue number, two tasks are in *different* groups and can commit to
the same branch at the same time. Sub-branching removes the possibility rather than relying
on runs being triggered one at a time.

## How a story moves

1. **Architect** shapes the story, **names** its branch on a `Branch:` line, and creates its
   tasks — each stamped with the role that should pick it up. A hook creates the branch.
2. Each **task** is triggered on its own. Its author starts on a branch already cut off the
   story branch, works there, and opens a PR into the story branch.
3. Merging that task PR closes the task and lands its work on the story.
4. The **story's** PR accumulates all of it. The maintainer reviews and merges the story as
   a whole.

⚠️ **The story's PR opens on the first task merge, from the merge hook — not from an
authoring run.** The story branch is cut empty, and GitHub will not open a PR with no
commits between base and head, so the first task landing is the earliest moment it can
exist.

⚠️ **A task PR's closing keyword links but does not close.** Two behaviours, easy to
conflate — and they were, wrongly, until measured:

- **Linking works at any base.** A keyword in the body populates `closingIssuesReferences`
  whatever the PR targets: #536 → [521], #542 → [522], #443 → [441], all into story branches.
- **Auto-closing needs the default branch.** A task PR targets its story's branch, so GitHub
  never closes it. The merge hook does.

An author writes the line for both reasons, and the hook's body-parse is a net for a keyword
GitHub did not link — not the mechanism. ⚠️ There is also **no public GraphQL mutation** for
linking a PR to an issue: introspection shows only `createLinkedBranch` and `addSubIssue`,
and the UI's "link an issue" control edits the PR body. The keyword *is* the API.

⚠️ **A task still open when its story merges is a signal, not a gap.** Nothing closes it
implicitly: it was abandoned, or its PR never landed. An earlier version closed a merged
issue's open children, which hid exactly the case worth seeing.

⚠️ **`pull_request` events run the workflow from the PR's base branch**, so a workflow fix
does not reach an in-flight story until the default branch is merged into it.

## Routing

**A label on an issue is the front door.** Applying it starts a run, and `delegate.py` reads
the issue's state to pick the role. The same label named in a comment does the same. A
`@claude/<role>` handle in a comment names the role outright and skips the inspection — the
way to override a bad guess.

⚠️ **A handle skips the role decision, not the context.** It still resolves the story — from
the PR's head branch on a PR, from the issue's **Branch** line on an issue. It did neither on
an issue once, so a handled role started with no story and paid turns rediscovering what the
router already had. Resolve it inside the handle branch; do **not** fall through to the
state-based rules, which would re-judge the role and could pick a different one.

⚠️ **Routing is a shell script, never a model.** It is all readable state; the one call that
needs judgement — which author owns a task — is answered once by the Architect and written
into the task as a `Role:` line.

⚠️ **The role stamp is a record, not a route.** Roles stamp `@claude/<role>` as they start,
so the labels read as "these agents have been here". Nothing routes off them.

⚠️ **Guard the loop.** Every stamp is another `labeled` event. Gate the trigger on the label
name being *exactly* the front-door label, and exclude bot actors. Both hold independently.
(A third guard comes free: a stamp applied with `GITHUB_TOKEN` does not start a workflow run
at all.)

## Roles

| role | picked up from | writes |
|---|---|---|
| Architect | an epic or an unshaped story | the issue, a story's branch, and its tasks |
| Implementor | a task stamped `Role: implementor` | code, outside the design system |
| Designer | a task stamped `Role: designer` | code, inside the design system |
| Tester | a task stamped `Role: tester`, one per story | tests |
| Writer | a task stamped `Role: writer`, one per story | documentation |
| Security | every merge, plus its handle on a PR | issues it files |

⚠️ **Implementor and Designer split on the package a change touches, not on judgement**, so
the boundary can be checked rather than negotiated. A task spanning both is two tasks, and
only the Architect can cut it in two.

⚠️ **The Tester and Writer are tasks the Architect cuts**, ordered after the authoring ones.
No role chains off another — nothing runs that a maintainer did not trigger.

⚠️ **A test derived from the implementation is worthless, and looks exactly like coverage.**
It asserts what the code does, so it passes by construction and cannot fail for the only
reason worth catching. The Tester derives from *expected* behaviour — the **product
specification** first, then the story's outcome, the `testingNotes`, the acceptance criteria —
and may read a component for one thing only: how to **address** an element. Knowing how to
click a thing is not knowing what it should do.

⚠️ **The specification is the only one of those that outlives its story.** The other three
describe a single change and are gone once it merges, which is precisely when a regression
suite needs to know what the product promises — so without a specification the derive-from-
behaviour rule silently inverted for everything except the story in front of you. The Tester
cites behaviour ids in its plan, which is what makes coverage a question a reviewer can ask
rather than a claim they have to accept.

⚠️ **A failing test is a finding, not a chore.** It is filed on the authoring task, carried in
the Tester's own report, and left failing. Weakening or deleting it to get green converts a
finding into nothing, and a green suite that got there by deletion is worse than a red one.

⚠️ **The Writer's task is cut on EVERY story, unconditionally; the Tester's is judged.** The
asymmetry is about when the evidence exists. Tests have a trigger the Architect can see while
shaping — new behaviour. Documentation's trigger is `docsCandidates` in the authors'
handoffs, which do not exist yet, so asking the Architect to predict it produces "no" every
time: across every story before this rule, not one Writer task was ever cut. Cutting it
always moves the judgement to the Writer, which reads the handoffs and is allowed to
conclude nothing needs writing.

⚠️ **Per story, not per epic** — for the Writer too. An epic-wide documentation pass sounds
cheaper, and its usual justification is that one branch touching the docs avoids conflicts.
That only holds if stories land in parallel; where they merge one at a time, a later story
already carries the previous one's docs, and deferring only moves the explanation further
from the change it explains.

⚠️ **Trigger order is derived, never stamped.** Tasks sort by `(phase, issue number)`: phase
from the `Role:` stamp — authors, then tests, then docs — and number within a phase, because
the Architect creates them in the order it intends. A task is ready once everything before it
is closed, so the first open task is the one to trigger. Both inputs are things the Architect
must produce for other reasons; a third stamp naming an order would be a third line it could
skip.

## The handoff between authors

An author's step carries `--json-schema`, so its final message is a contract: `testingNotes`
for the Tester, `docsCandidates` for the Writer. A hook posts it to the **story's issue** as
one comment per task; the Tester and Writer read it there.

- ⚠️ **Both keys are required and `[]` is a real answer** — "I looked, there is nothing",
  which a consumer can act on. A missing key says nothing at all. That distinction is the
  entire reason this is a schema and not a prose section.
- ⚠️ **The story's issue, not its PR.** The PR does not exist until the first task merges,
  so a handoff written during the first task would have nowhere to go.
- ⚠️ **Deterministic at both ends:** the schema forces the author to produce it, the hook
  forces delivery. Neither is a model instruction. Asking a model to leave a
  machine-readable block for a later role is the version that fails.
- A candidate is a proposal, never an order. Rejecting all of them is a correct outcome.
- ⚠️ **Three states, not two.** Entries mean the author found something; `[]` means it looked
  and found nothing; **no handoff comment at all** means no author ran, or its run failed
  before posting. A consumer that collapses the last two will treat a failed run as a clean
  one.
- `docsCandidates[].file` is a **free string**, never an enum of a repo's paths — these roles
  are portable and must not encode one repository's layout.

⚠️ **The transport is the half that breaks, not the schema.** It was first appended to the
consuming roles' prompts from the same job — which only works if those roles run in that job.
They do not, so nothing ever received it and the feature shipped dead. A comment outlives its
run; a step output does not.

⚠️ **`--json-schema` takes inline JSON, not a path.** The schema is a file in this package, so
a workflow step has to compact it to one line and inject it. Two hazards worth asserting
rather than discovering: the value is wrapped in single quotes, so the file must contain none,
and the argument list is parsed line by line, so it must stay on one line.

## Prompt composition

A role's prompt is `prompts/_shared.md` then `prompts/<role>.md` from this package, followed
by the consumer's overlay in the same order. The base says how the role behaves and how the
hierarchy works; the overlay says what the repo's gate is, where its code lives, and any
house rules.

⚠️ **Shared first, and that ordering is load-bearing.** `_shared.md` opens by overriding the
host action's own prompt, which for comment events states repeatedly that the model's
instructions are the triggering comment. Ours arrives after all of that, so the override has
to be the first thing in it.

⚠️ **Keep the split honest.** A rule that would be true in any repo belongs in the base; a
rule that names a command, a path or a package belongs in the overlay.

⚠️ **`trigger_phrase` must be the role's exact handle.** It gates nothing when a prompt is
supplied, but the action extracts everything *after* it as "the user request" and yields
that as the final content block, which the CLI scans for a slash command. Set to a bare
front-door label, `@claude/<role> do X` extracts as `/<role> do X` and is swallowed as an
unknown slash command — the run reports success having never called the model.

## Hooks

Deterministic steps that run around each model step, so backlog bookkeeping cannot be
forgotten by a model that ran out of turns or simply skipped it.

| hook | when | does |
|---|---|---|
| `acknowledge.py` | the router job, first | reacts 👀 so the trigger is visibly received |
| `delegate.py` | the router job | picks the role from issue state — routing is scripted, not judged |
| `stamp-role-label.py` | pre, every role | stamps `@claude/<role>` on the triggering issue or PR |
| `set-issue-status.py` | pre, authors | sets the issue's board Status; the column is an input |
| `ensure-story-branch.py` | post, Architect | creates the story's branch if it is missing |
| `sync-epic-label.py` | post, Architect | applies the `epic` label to an issue titled as one |
| `file-sub-issues.py` | post, Architect | parents stories to their epic, tasks to their story |
| `finish-pr.py` | post, authors | labels the PR and ensures it closes its issue |
| `post-handoff.py` | post, authors | posts the JSON handoff to the story's issue |
| `log-to-story.py` | post, Architect + authors + on merge | rewrites one comment on the story listing its tasks in trigger order |
| `log-to-epic.py` | post, authors | rewrites one rolling work-log comment on the epic |
| `open-story-pr.py` | **on merge** | opens the story's PR once a task has landed on its branch |
| `close-merged-work.py` | on merge | closes the PR's issues and files them on the board |

⚠️ These were prompt instructions until a model skipped them. A scripted step costs no
turns and cannot be forgotten.

### Traps each hook was written around

- ⚠️ **`acknowledge.py` reacts via `issues/comments/<id>`**, so hand it a comment id only for
  an issue comment. A *review* comment's id belongs to the **pulls** collection and would
  react to an unrelated comment. Empty falls back to the issue or PR itself.
- ⚠️ **`delegate.py` defaults a missing `Role:` stamp and says so.** Wrong is recoverable,
  silent is not — a run that quietly does nothing is indistinguishable from a broken workflow.
- ⚠️ **The log hooks rewrite ONE comment each, never one per run.** An epic with ten tasks
  across three roles would otherwise bury itself in thirty comments. They are also derived
  entirely from GitHub state — no model writes any part of them, which is the only reason
  they can be trusted as a status board.
- ⚠️ **`file-sub-issues.py` cannot key on prose alone.** Its first version matched a branch
  line plus an `epic #N` reference, and adopted a meta-issue that quoted the convention as an
  example. Checking the author is a bot is what makes it sound — with the accepted cost that a
  hand-written sub-issue is never auto-parented.
- ⚠️ **A role labels only what it opens.** The stamp hook marks the triggering issue or PR;
  `finish-pr.py` labels the PR that run created. Nothing labels someone else's work.
- ⚠️ **`Closes #<issue>` is both a prompt instruction and a hook.** The model writing it puts
  the link where a human reads it; the hook is the net, because a missing keyword loses the
  close with nothing to signal it.
- ⚠️ **Keep long-lived credentials out of any job a model step shares** unless the workflow
  puts them in *step* env. Step env is per-step, so a scripted step can hold a token the
  model step beside it cannot read. Secret masking covers logs only — not an API payload a
  model could write.

⚠️ **A scripted hook fed by model-written input is still model-driven.** Derive a hook's
input from something the model must produce for another reason, or from state it cannot
avoid creating — never from a block it was merely asked to leave behind.

⚠️ **`gh api` prints its error body to STDOUT**, so a 404 is indistinguishable from data to
anything that only checks whether output arrived. The parent endpoint 404s for anything
unparented, which is most issues, and `compare` 404s for a deleted branch. `team.gh()`
returns `None` on a non-zero exit and `gh_json()` parses only what succeeded, so an error
body can no longer reach a caller. ⚠️ Do not add a hook that runs `gh` any other way — this
trap survived being documented and was written again anyway, twice.
