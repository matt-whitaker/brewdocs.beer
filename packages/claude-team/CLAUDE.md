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
| **Spike** | none | — | the maintainer, once they have decided |
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
- ⚠️ **A `spike` is a question, and it is the one unshaped issue the Architect must not take.**
  Its answer is not known yet, so there is nothing to decompose — handed one, the Architect cuts
  implementation tasks for a solution nobody has chosen, which reads like progress and is worse
  than nothing because the tasks then get worked. `delegate.py` rule 3 routes it to the
  **Researcher** instead. Like an epic it has no branch, no PR and ships no code; unlike an epic
  it is not a container, so it has no children either. `team.kind()` detects it from a `Spike:`
  title or the `spike` label, and **epic still wins** when an issue carries both.
- ⚠️ **A `bug` is a story in shape but not in handling.** One branch, one PR, usually one task
  — but its body is the deliverable of an investigation that already happened, so the Architect
  **appends and never rewrites**. A report's reproduction, its measurements and especially its
  "what I could not determine" section are the only grounding the fixer has; a story-shaped
  rewrite replaces evidence with an opinion. `team.kind()` returns `epic | bug | story`, and
  **epic wins** when an issue carries both markers, so it resolves the same way every time.

⚠️ **Two kinds of label, and only one is the maintainer's.** "Create issues unlabeled" reads as
covering both, and it does not:

| kind | labels | who applies | what it means |
|---|---|---|---|
| **routing** | the front-door label, `@claude/<role>` | the maintainer; hooks stamp the trail | what should *happen* to this issue, and what has already run |
| **classification** | `epic`, `spike`, `bug`, `story` | anyone filing; a hook applies it after the Architect runs | what this issue *is* |

A classification label is durable and derivable, so it survives a run and nothing has to
re-derive it. ⚠️ **Every kind gets one, `story` included.** An earlier version left a story
unlabelled and treated the absence as the signal — which reads fine inside a hook and badly on
a board, where you cannot filter for "the ones with nothing". `team.kind()` still *derives*
story from the absence of the other markers; the label is what makes that visible.

⚠️ **`sync-kind-label.py` asks `kind()`, not the title.** Keying on the title worked only while
every kind announced itself — a story has no prefix to match and would never have been labelled.
⚠️ And it refuses to write when it cannot read the issue: `kind()` falls back to `story` on a
failed API call exactly as it does for a plain issue, so a rate-limited minute would otherwise
relabel an epic. It only ever adds, never removes.
- A story owns one branch and one PR against the default branch, and it accumulates.
- A task is a slice of a story with its own branch and its own PR **into the story branch**.

⚠️ **The Branch line always names the STORY's branch** — on the story and on every one of
its tasks. It is what an author bases on and merges back into, never a branch for the task
itself. Anything deriving a story from a branch name reads that prefix.

⚠️ **A story's Branch line carries a compare link**, appended by `ensure-story-branch.py` after
the closing backtick, so opening its PR is one click instead of a walk through the UI. One link
serves the branch's whole life — GitHub redirects a compare URL to the existing PR once one is
open. ⚠️ The link sits **outside** the backticks because `branch_line` is anchored and captures
only what is between them; that is deliberate, not luck, and trailing text must stay outside.

## Sequencing

⚠️ **Stories are independent; a story's tasks are ordered.** Two different defaults, and each
must be stated where it can be seen:

- **Between stories** — independent unless the **epic's own body** says otherwise. A dependency
  written only in the dependent story is not enough: #603's body opened with "Depends on #602
  landing first", the epic said nothing, #603's tasks were started while #602's PR was open, and
  its Tester found no feature to test.
- **Within a story** — its tasks run in order, and the story says so. A hook already derives the
  order from `(phase, issue number)`; the sentence is for the human deciding what to trigger.

⚠️ **"Depends on" means MERGED.** A story whose tasks are all closed but whose PR is open has
delivered nothing to any other branch — which is why the epic's work log carries a **landed**
column beside the task count. `2/2 tasks` and `PR #629 open` are different facts, and only
showing the first is what allowed this to happen.

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
| Researcher | a spike | findings and a recommendation, appended to the issue by a hook — it holds no shell |
| Implementor | a task stamped `Role: implementor` | code, outside the design system |
| Designer | a task stamped `Role: designer` | code, inside the design system |
| Tester | a task stamped `Role: tester`, one per story | tests |
| Writer | a task stamped `Role: writer`, one per story, run **first** | the product specification, then documentation |
| Security | every merge, plus its handle on a PR | issues it files |

⚠️ **The Researcher answers; it does not shape.** It appends findings to the spike and stops —
it creates no story, cuts no branch and starts no author. The maintainer decides, and only then
is there something for the Architect to shape. A research run that quietly starts building has
committed to an answer nobody approved.

⚠️ **It appends to the issue and never rewrites the question**, for the same reason the Architect
must not rewrite a bug report, inverted: there the body is an investigation that already
happened, here it is the question itself. The maintainer's framing carries which options they
already weighed and which constraint they called non-negotiable, and replacing it destroys the
thing that was asked.

⚠️ **It is the only role that reads the open web, and the only one whose input the maintainer did
not write** — which is exactly why **it holds no shell**. No `Bash` of any kind, no `Write`, no
`npm ci`, no build. It reads (`Read`/`Glob`/`Grep`), it fetches, and it returns JSON.

⚠️ **Taking the secret away instead is not available, and that was the first fix attempted.**
`claude-code-action` re-injects it whatever the workflow step declares —
`src/entrypoints/run.ts` sets `process.env.GITHUB_TOKEN` and `GH_TOKEN`, and
`base-action/src/parse-sdk-options.ts` hands the agent `{...process.env}` — so `GH_TOKEN` **and
`CLAUDE_CODE_OAUTH_TOKEN`**, an account credential rather than a repo-scoped one, are readable by
anything the agent can execute. The credential cannot be removed; the ability to read it can.
⚠️ Narrowing rather than removing would not have held either: `Write` plus any runner is
agent-authored code, so a probe spec *is* arbitrary execution. That is why probing was dropped
from this role and a measurement it needs becomes someone else's task (#665).

⚠️ **A credential can reach the agent through a FILE, not only through the environment**, and
removing the shell does nothing about that. `actions/checkout` defaults to
`persist-credentials: true`, which writes the token into `.git/config` as an
`http.<host>.extraheader` — so a role holding nothing but `Read` can recover it and post it
anywhere it can fetch. A web-reading role's checkout therefore needs `persist-credentials: false`.
⚠️ Only the reading role's: an authoring job pushes, and disabling it there breaks the push.

⚠️ **`WebFetch` is itself an egress channel**, so a narrower `Bash` grant was never the fix —
exfiltration needs no shell if the agent can be induced to fetch a URL. Only the absence of a way
to *read* the environment closes it.

⚠️ **It carries no `id-token` and passes its own `github_token`, and those two are one change.**
Removing the permission alone broke the role outright — `setupGitHubToken()` mints an OIDC token
and exchanges it for a GitHub App token, so with no OIDC and no supplied token the action cannot
authenticate at all (#668). Passing `github_token` short-circuits that path before OIDC is
reached.

⚠️ **And it is what makes a `permissions:` block mean anything to the agent.** That block scopes
`secrets.GITHUB_TOKEN`. It does **not** scope the App token the exchange mints — those grants come
from the service — and `run.ts` puts whichever token it obtained into `process.env.GH_TOKEN`. So
without the input, a job's `permissions:` bounds its *hooks* and not its *model*, which is exactly
backwards: the hooks are the trusted half. ⚠️ **Every other role still takes the App-token path**,
so their blocks do not bound their agents either. Smaller problem — their input is maintainer-
shaped issues — but not zero, and not what those blocks look like they say.

⚠️ **The residual, written down rather than claimed away:** the action's base allowlist unions in
`Bash(git add|commit|rm:*)` and `git-push.sh`, and a role cannot remove them. Two things neuter
them, and the order matters: there is no `Write`, so the agent cannot author a file worth
committing; and `contents: read` bounds the token — **but only because `github_token` is passed**.
That second half was stated without its caveat once, and it was wrong about which token it
described.

⚠️ **A spike that reports only what it settled is not finished.** What it could *not* determine is
the section under the most pressure to skip and the most valuable to keep — without it the next
person re-derives the gap without knowing it was one.

⚠️ **Implementor and Designer split on the package a change touches, not on judgement**, so
the boundary can be checked rather than negotiated.

⚠️ **But the Designer repairs the consumers its own change breaks**, and that is not a hole in the
boundary — it is what makes the boundary survivable. A primitive is an API, so changing one can
stop its consumers compiling, and the same role is told to hand over a green gate. Those were
contradictory instructions and a run had to disobey one of them silently. The licence is bounded
by a checkable line: **repair what your change broke, never what was already broken**, and keep it
mechanical. A consumer needing a *different value* rather than the same value spelled differently
is a behavioural decision, still the Implementor's, and still a stop-and-report.

⚠️ **A task spanning both is two tasks only when the consumer half is behavioural.** Splitting a
change whose consumer side is purely keeping the build green makes every primitive rename two
tasks and a stall.

⚠️ **The Tester and Writer are tasks the Architect cuts** — the Writer ahead of the authoring
tasks, the Tester after them. No role chains off another; nothing runs that a maintainer did
not trigger.

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

⚠️ **The Writer owns the product specification, and that is why it runs FIRST.** A
specification is only worth anything if it says what the code *should* do, and it cannot say
that if it was written by reading the code that already exists — a consumer deriving from such
a document is deriving from the implementation at one remove, with the rule against it looking
satisfied. Ordering the Writer ahead of the authors makes "from intent, not from the diff" true
by construction rather than by instruction, and hands the authors a sharper brief besides.

⚠️ **Its task is cut on EVERY story, unconditionally; the Tester's is judged.** Every story
changes what the product does, so there is always something to specify. Before the spec existed
the argument was weaker — the Architect could not predict `docsCandidates`, and asked to guess
it answered "no" every time: across every story before that rule, not one Writer task was ever
cut.

⚠️ **Running first strands `docsCandidates`, and that must be handled rather than left.** The
authors emit them after the Writer has finished, so nothing consumes them in the same story — a
channel with no reader, which is the shape that shipped dead twice here. They stay on the
story's issue, and the maintainer re-triggers `@claude/writer` on the same task once the authors
land. The Writer's own prompt tells it to say whether it expects to be needed again, because it
is the only party positioned to know.

⚠️ **Per story, not per epic** — for the Writer too. An epic-wide documentation pass sounds
cheaper, and its usual justification is that one branch touching the docs avoids conflicts.
That only holds if stories land in parallel; where they merge one at a time, a later story
already carries the previous one's docs, and deferring only moves the explanation further
from the change it explains.

⚠️ **Trigger order is derived, never stamped.** Tasks sort by `(phase, issue number)`: phase
from the `Role:` stamp — the writer, then the authors, then the tester — and number within a
phase, because
the Architect creates them in the order it intends. A task is ready once everything before it
is closed, so the first open task is the one to trigger. Both inputs are things the Architect
must produce for other reasons; a third stamp naming an order would be a third line it could
skip.

## The handoff between authors

An author's step carries `--json-schema`, so its final message is a contract: `remaining` for
whether the task is finished at all, `decisions` for the record, `testingNotes` for the Tester, `docsCandidates` for the Writer. A hook posts it to
the **story's issue** as one comment per task, where the Tester reads it on its own trigger. ⚠️ The Writer reads it only
on a **re-trigger** — it runs before the authors, so on its first pass the comments do not exist
yet.

- ⚠️ **Both keys are required and `[]` is a real answer** — "I looked, there is nothing",
  which a consumer can act on. A missing key says nothing at all. That distinction is the
  entire reason this is a schema and not a prose section.
- ⚠️ **The story's issue, not its PR.** The PR does not exist until the first task merges,
  so a handoff written during the first task would have nowhere to go.
- ⚠️ **A PR follow-up must reach the story too, and for a long time it did not.** The workflow
  blanks `ISSUE` on a PR trigger and the hook returned on that alone — before ever reading
  `STORY`, which `delegate.py` rule 2 had already resolved from the head branch. So the one run
  that carries **review feedback** produced a schema-forced handoff and dropped it. A `PR` env
  var is the other half of the same trigger; without it `decisions` has no path on the only
  trigger it exists for.
- ⚠️ **`remaining` is the only way an author can say it did not finish, and leaving the closing
  keyword out of the PR body was never one.** `finish-pr.py` put it back — it asked whether the
  keyword was present, never why it was absent — so the omission an author meant as a signal was
  overwritten and the task closed as **completed**. Measured: #617's wiring was never written, it
  closed anyway, and the Tester that ran next found no feature to test. The keyword is now
  withheld when `remaining` is non-empty, the PR carries a warning block saying so, and the task
  gets a comment listing what is left.
- ⚠️ **The schema beats the prose, deliberately.** A body is something a model can write anything
  into, including a closing keyword contradicting its own report — so a non-empty `remaining`
  **strips** the keyword rather than warning about the contradiction and letting the task close.
  The forced channel wins over the skippable one; that is the whole reason there is a schema.
- ⚠️ **The withheld keyword becomes a bare `#N` reference, not nothing.** That keeps the PR
  discoverable from the task while leaving `closingIssuesReferences` empty, so
  `close-merged-work.py` finds nothing to close by either of its two routes. ⚠️ Its fallback is a
  regex over the body, so the warning block's own wording must never read as a closing keyword —
  asserted, because "does not close #N" in the wrong phrasing would silently re-close the task the
  block exists to keep open.
- ⚠️ **`remaining` is upserted on the task; `decisions` is appended to the story.** Not an
  inconsistency: what is left is a snapshot that a later run supersedes, while a decision is a
  record that a later run must not erase.
- ⚠️ **`decisions` is the antidote to a review that dies in its own thread.** A maintainer
  changes course on a PR; the issue still describes what they rejected, and nothing rewrites it.
  The next agent reads the old plan and rebuilds the rejected thing — measured: a resolver
  deleted on review (#626) was reinstated two PRs later (#651) by an agent reading a story that
  still asked for it, and its author had done everything right, including leaving two 🔔
  Maintainer heads-ups that nobody picked up. **A PR comment is not a durable artifact.** The
  issue, the spec and the code are, and a decision reached in review lands in none of them
  unless something puts it there.
- ⚠️ **The decisions log APPENDS; every other hook comment upserts.** That difference is
  deliberate, not an inconsistency. A status board or a handoff is *derived* — regenerated whole
  each run, so replacing it loses nothing. A decision is a **record**: a PR draws several rounds
  of review, and round two replacing round one destroys the fact the comment exists to keep. It
  is still one comment; rounds stack inside it.
- ⚠️ **Reporting a decision does not discharge it.** `decisions` records what changed; it does
  not correct the specification, the acceptance criteria or the sibling task that now read the
  old way. `supersedes` names them precisely so a human can go and fix them — a role reporting
  a decision should also raise it where the maintainer will act on it.
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
| `set-issue-status.py` | pre, authors + post, Architect | puts an issue **on** the board and sets its Status; column and flags are inputs |
| `ensure-story-branch.py` | post, Architect + Researcher; **pre, authors** | creates the story's branch if it is missing; an epic and a spike have none, and it says so rather than warning |
| `sync-kind-label.py` | post, Architect + Researcher | applies the `epic`/`spike`/`bug`/`story` label `kind()` derives |
| `file-sub-issues.py` | post, Architect | parents stories to their epic, tasks to their story |
| `finish-pr.py` | post, authors | labels the PR, and ensures it closes its issue — or, when the author reported work `remaining`, that it does not |
| `post-findings.py` | post, Researcher | renders its schema-forced findings onto the spike — the role has no shell, so this is the only way they reach anyone |
| `post-handoff.py` | post, authors | posts the JSON handoff to the story's issue, and appends its `decisions` to one running log there |
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
- ⚠️ **`ensure-story-branch.py` runs on the AUTHORS path too, and that is not redundancy.**
  `delegate.py` rule 4 routes straight to the stamped role whenever a `Branch:` line is present, so
  an issue filed with both routing lines already written — **which is what a good agent-filed bug
  looks like** — never reaches the Architect, and so never reached the hook that creates its branch.
  `setupBranch` resolves the base branch before anything else, so the authoring job then 404s and
  dies in ~3s, before the model is called (#744, #777).
  ⚠️ The deeper fault was treating the `Branch:` **line** as proof of the **branch** — a
  model-written block standing in for state, which is the anti-pattern this file already names.
  Running the idempotent hook once more is the cheap fix; it only ever handles the absent case.
- ⚠️ **A role labels only what it opens.** The stamp hook marks the triggering issue or PR;
  `finish-pr.py` labels the PR that run created. Nothing labels someone else's work.
- ⚠️ **`Closes #<issue>` is both a prompt instruction and a hook.** The model writing it puts
  the link where a human reads it; the hook is the net, because a missing keyword loses the
  close with nothing to signal it. ⚠️ **Unless the author reported `remaining`** — then the hook
  withholds the keyword rather than adding it. A forgotten keyword and a deliberately omitted one
  were indistinguishable, and the deliberate one lost.
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
