# Changesets

This folder contains changeset files for managing versioning and changelogs in this project.

## What are Changesets?

Changesets are a way to manage versioning and changelogs with a focus on multi-package repositories, though they work great for single-package repos too. They help you:

- Track which changes should trigger version bumps
- Generate changelogs automatically
- Coordinate releases across multiple packages

## Workflow

### 1. Creating a Changeset

When you make changes that should be included in the next release, create a changeset:

```bash
pnpm changeset
```

This will prompt you to:

1. Select the type of change (major, minor, or patch)
2. Write a summary of your changes

The CLI will create a markdown file in `.changeset/` with your change description.

### 2. Versioning

When you're ready to release, consume all changesets and update versions:

```bash
pnpm version
```

This will:

- Update `package.json` version based on changeset types
- Update `CHANGELOG.md` with all changeset summaries
- Delete consumed changeset files

### 3. Publishing (Optional)

If you're publishing to npm:

```bash
pnpm release
```

## Changeset Types

- **Major**: Breaking changes (1.0.0 → 2.0.0)
- **Minor**: New features, backwards compatible (1.0.0 → 1.1.0)
- **Patch**: Bug fixes, backwards compatible (1.0.0 → 1.0.1)

## Examples

### Creating a Patch Changeset

```bash
$ pnpm changeset
🦋  Which packages would you like to include?
◉ builder-prompt-ai

🦋  Which type of change is this for builder-prompt-ai?
◯ major
◯ minor
◉ patch

🦋  Please enter a summary for this change:
Fixed wizard navigation bug
```

### Creating a Feature Changeset

```bash
$ pnpm changeset
🦋  Which type of change is this for builder-prompt-ai?
◯ major
◉ minor
◯ patch

🦋  Please enter a summary for this change:
Added new template selection feature
```

## Best Practices

1. **Create changesets as you work**: Don't wait until release time
2. **Be descriptive**: Write clear summaries that users will understand
3. **One changeset per logical change**: Keep changes focused
4. **Review before versioning**: Check all changesets before running `pnpm version`

## Learn More

- [Changesets Documentation](https://github.com/changesets/changesets)
- [Common Questions](https://github.com/changesets/changesets/blob/main/docs/common-questions.md)
