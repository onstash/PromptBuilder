# Interactive Elements Cursor Rule

## Rule

Whenever you are asked to create or update an interactive element, you MUST ensure that the cursor is set to `pointer`.

## Interactive Elements Include:

- Buttons (`<button>`, `Button` components)
- Links (`<a>`, `Link` components)
- Toggles / Switches
- Checkboxes
- Radio Buttons
- Clickable Icons (e.g., `lucide-react` icons with `onClick`)
- Any clickable `div` or `span` (e.g., `role="button"`)

## Implementation Details

- **Tailwind CSS**: Add `cursor-pointer` class.
- **CSS**: Add `cursor: pointer;` to the style.
- **Components**: ensure the underlying element has the style applied.

## Examples

### Good (Tailwind)

```tsx
<div onClick={handleClick} className="cursor-pointer hover:bg-gray-100">
  Click me
</div>
```

### Good (CSS)

```css
.custom-button {
  cursor: pointer;
}
```

### Bad

```tsx
<div onClick={handleClick}>Click me (missing cursor-pointer)</div>
```
