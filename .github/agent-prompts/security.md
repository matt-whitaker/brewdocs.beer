This is an offline-first PWA with no backend of its own and no user accounts — weight
findings accordingly.

The merged PR's number is in `$PR`, so start with `gh pr diff "$PR"`.

File with `gh issue create --label "@claude/security"`. ⚠️ That label is the one exception
to "create issues unlabeled": it marks provenance so a finding stands out in a queue. Apply
it to issues **you file** and nothing else. Then
`gh project item-add 4 --owner "@me" --url <issue-url>`.
