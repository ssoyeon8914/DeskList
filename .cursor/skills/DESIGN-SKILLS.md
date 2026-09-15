# External design skills (vendored)

Installed for DeskList anti-slop / design review before restyling the mockups.

| Source | Local path | Cursor entry skill |
|--------|------------|--------------------|
| [Hallmark](https://www.usehallmark.com/) · [nutlope/hallmark](https://github.com/nutlope/hallmark) | `.cursor/skills/hallmark/` | `todo-hallmark` |
| [apple-design-skill](https://github.com/dickwu/apple-design-skill) | `.cursor/skills/apple-design/` | `todo-apple-design` |
| [ui-ux-agent-skill-system](https://github.com/sergekostenchuk/ui-ux-agent-skill-system) | `.cursor/vendor/ui-ux-agent-skill-system/` | `todo-uiux` |

Also present: `.agents/skills/hallmark/` (CLI install copy; prefer `.cursor/skills/hallmark`).

## Update

```bash
# Hallmark
npx skills add nutlope/hallmark -a cursor --skill hallmark
# then copy .agents/skills/hallmark → .cursor/skills/hallmark

# Apple HIG skill
git -C .cursor/skills/apple-design pull

# UI/UX system
git -C .cursor/vendor/ui-ux-agent-skill-system pull
```
