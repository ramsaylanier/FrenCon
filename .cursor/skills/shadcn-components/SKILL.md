---
name: shadcn-components
description: Use ShadCN UI when creating new components. Always add ShadCN primitives via the npm CLI before building. Use when creating UI components, forms, dialogs, buttons, inputs, or any React component that needs styling.
---

# ShadCN Component Workflow

When creating new UI components, use ShadCN UI as the component library. **Never manually copy ShadCN component code**—always install via the CLI.

## Workflow

1. **Identify needed ShadCN primitives** from [ui.shadcn.com/docs/components](https://ui.shadcn.com/docs/components)
2. **Install via CLI** before writing component code:

```bash
npx shadcn@latest add <component-name>
```

Add multiple components in one command:

```bash
npx shadcn@latest add button input label
```

3. **Import from the project alias** (configured in `components.json`):

```tsx
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
```

4. **Build your component** using the installed primitives. Use the `cn()` utility for merging class names:

```tsx
import { cn } from "~/lib/utils";
```

## Common Component Mappings

| Need | ShadCN component |
|------|-------------------|
| Button, link-as-button | `button` |
| Text input, form field | `input`, `label` |
| Card layout | `card` |
| Modal/dialog | `dialog` |
| Dropdown menu | `dropdown-menu` |
| Form with validation | `form` (includes react-hook-form) |
| Tabs | `tabs` |
| Toast notifications | `sonner` or `toast` |
| Select/picker | `select` |
| Checkbox, switch | `checkbox`, `switch` |

## Rules

- **Always run `npx shadcn@latest add <component>`** before using a ShadCN component in code
- Use `~/components/ui/<component>` import path (React Router / project alias)
- Use `cn()` from `~/lib/utils` for conditional class merging
- Check `components.json` for project-specific aliases if imports fail
