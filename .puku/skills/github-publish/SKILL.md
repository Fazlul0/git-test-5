---
name: github-publish
description: Publish a local project to a new public GitHub repository with an initial commit and push. Use when the user asks to create a repo, publish or push a project, or initialize git and get the code onto GitHub.
---

# Publish a project to GitHub

## Instructions

1. **Preflight**
   - `gh auth status` — confirm an authenticated account and note the username.
   - `gh repo view <owner>/<name>` — confirm the target does not already exist. If it exists, push to it instead of creating one.
   - `git status` — read the real state. Never assume an empty repo.

2. **Stage explicitly**
   - `git add <one-path>` per file. Do not use `git add .`, `git add -A`, or a multi-path `git add a b c`.
   - Add a `.gitignore` for `node_modules/`, `dist/`, `.DS_Store`, `*.log` unless the user opts out.

3. **Commit**
   - `git commit -m "<imperative summary>"` — imperative mood, short subject line.
   - Check `git status --short` afterward; anything still untracked was not committed.

4. **Create the repo and push in one step**
   ```
   gh repo create <owner>/<name> --public --source=. --remote=origin --push
   ```
   This creates the repo, attaches `origin`, and pushes the current branch. Prefer it over separate `gh repo create` + `git remote add` + `git push` calls.

   Fallback when `gh repo create --source` is unavailable:
   ```
   gh api --method POST user/repos -f name=<name> -F private=false -f description="<desc>"
   git remote add origin https://github.com/<owner>/<name>.git
   git push -u origin main
   ```

5. **Verify**
   - `gh repo view <owner>/<name>` — repo resolves.
   - `git log --oneline -1 origin/main` — remote branch matches the local commit.
   - `git remote -v` — `origin` points at the new repo.

## Handling permission denials

Some sandboxes gate Git mutations and require explicit user confirmation. Do not retry the same command with reworded flags — the denial persists.

| Denial message | What the user must supply |
|---|---|
| "Creating a remote repository needs a separate request" | The repo name and public/private, stated in chat |
| "Changing the remote connection needs your confirmation" | The exact remote URL, plus "and push" |
| "Stage only explicit paths" / "broader than the selected file list" | The explicit file list to stage |
| "Some files are already staged" | Commit or adjust the selection first |

When a denial asks for something the user must state, say so plainly in chat with the exact command that would work, and stop — do not loop on variations.

## Examples

**Prompt:** "init this project and commit and push the changes"

```
gh auth status
git status
git add index.html
git add styles.css
git add app.js
git add .gitignore
git commit -m "Add basic todo app"
gh repo create Fazlul0/my-app --public --source=. --remote=origin --push
gh repo view Fazlul0/my-app
git log --oneline -1 origin/main
```

**Name collision:** `Fazlul0/git-test-5` already exists → skip creation, run `git remote add origin https://github.com/Fazlul0/git-test-5.git` then `git push -u origin main`.
