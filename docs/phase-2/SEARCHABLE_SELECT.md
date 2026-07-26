# SearchableSelect Component

**Story**: US-13.1 — Create Searchable Dropdown Component
**Location**: `src/components/ui/searchable-select.tsx`

A dropdown with a filter field at the top. Replaces `Select` wherever the option list is
long enough that scrolling is painful (platforms, publishers, genres, statuses).

Built on Radix Popover + [cmdk](https://cmdk.paco.me/) — the same stack shadcn/ui uses for
its Combobox — with two supporting primitives added in this story:

- `src/components/ui/popover.tsx`
- `src/components/ui/command.tsx`

---

## Usage

### Single select

```tsx
import { SearchableSelect } from '@/components/ui/searchable-select'

const formats = [
  { value: 'CD', label: 'CD' },
  { value: 'Vinyl', label: 'Vinyl' },
  { value: 'Cassette', label: 'Cassette' },
]

;<SearchableSelect
  options={formats}
  value={format}
  onValueChange={setFormat}
  placeholder="Select format"
  searchPlaceholder="Search formats..."
/>
```

`onValueChange` receives a `string`. Selecting an option closes the dropdown.

### Multi select

```tsx
<SearchableSelect
  multiple
  options={genreOptions}
  value={genres} // string[]
  onValueChange={setGenres} // (value: string[]) => void
  placeholder="Select genres"
  maxDisplayed={3}
  allowClear
/>
```

`onValueChange` receives a `string[]`. Selecting toggles the option and keeps the dropdown
open so several values can be picked in a row. The trigger shows badges for the first
`maxDisplayed` (default `3`) selections and a `+N more` badge for the rest.

### With React Hook Form

```tsx
<FormField
  control={form.control}
  name="platform"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Platform *</FormLabel>
      <FormControl>
        <SearchableSelect
          options={platformOptions}
          value={field.value}
          onValueChange={field.onChange}
          onBlur={field.onBlur}
          placeholder="Select platform"
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

`FormControl` forwards `id`, `aria-describedby` and `aria-invalid` automatically — the
component accepts all three (see [Accessibility](#accessibility) for how `aria-invalid` is
handled).

---

## Props

| Prop                | Type                                        | Default               | Notes                                                             |
| ------------------- | ------------------------------------------- | --------------------- | ----------------------------------------------------------------- |
| `options`           | `SearchableSelectOption[]`                  | —                     | `{ value, label, keywords?, disabled? }`. `value` must be unique. |
| `value`             | `string \| null` / `string[] \| null`       | —                     | Array form when `multiple`.                                       |
| `onValueChange`     | `(value: string) => void` / `(v: string[])` | —                     | Array form when `multiple`.                                       |
| `multiple`          | `boolean`                                   | `false`               | Switches the value/handler types.                                 |
| `maxDisplayed`      | `number`                                    | `3`                   | Multi-select only: badges before `+N more`.                       |
| `placeholder`       | `string`                                    | `'Select an option'`  | Trigger text when empty.                                          |
| `searchPlaceholder` | `string`                                    | `'Search...'`         | Filter field placeholder.                                         |
| `emptyMessage`      | `string`                                    | `'No results found.'` | Shown when nothing matches.                                       |
| `allowClear`        | `boolean`                                   | `false`               | Adds a "Clear selection" entry at the top of the list.            |
| `disabled`          | `boolean`                                   | `false`               |                                                                   |
| `className`         | `string`                                    | —                     | Trigger classes.                                                  |
| `contentClassName`  | `string`                                    | —                     | Dropdown panel classes.                                           |
| `id` / `name`       | `string`                                    | —                     | `name` also renders a hidden input for native form submission.    |
| `onBlur`            | `() => void`                                | —                     | For React Hook Form's `field.onBlur`.                             |

The `SearchableSelectOption.keywords` array adds extra search terms for an option — useful
for aliases (e.g. `{ value: 'PS5', label: 'PlayStation 5', keywords: ['sony'] }`).

---

## Filtering

Matching is a **case-insensitive substring** test over the option value, its label and its
keywords. cmdk's default fuzzy scoring is deliberately replaced (`filterOption`) so results
stay predictable: typing `nin` matches `Nintendo Switch` but not `Xbox One`.

The filter resets every time the dropdown closes.

---

## Keyboard

| Key             | Behaviour                                              |
| --------------- | ------------------------------------------------------ |
| `Enter`/`Space` | Opens the dropdown (focus moves into the filter field) |
| Type            | Filters in real time                                   |
| `↑` / `↓`       | Moves the highlight (wraps around — `loop` is enabled) |
| `Enter`         | Selects the highlighted option                         |
| `Esc`           | Closes and returns focus to the trigger                |
| `Tab`           | Closes and moves on                                    |

---

## Accessibility

- Trigger is a `<button>` with `aria-haspopup="listbox"`, `aria-expanded`, and
  `aria-controls` (pointing at the panel while it is open). It accepts `aria-label` /
  `aria-labelledby` for its accessible name.
- cmdk renders the filter field as a `role="combobox"` input driving a `role="listbox"`
  with `aria-activedescendant`, so the highlighted option is announced as you arrow through.
- Because cmdk uses `aria-selected` for the **highlighted** row, the **chosen** state is
  announced with visually hidden `, selected` text on each selected option (plus the check
  icon for sighted users).
- `aria-invalid` is not a supported attribute on `role=button`, so it is mapped to a
  `data-invalid` attribute used for the red border. The validation message itself is still
  announced through `aria-describedby`, which `<FormControl>` wires to `<FormMessage>`.
- Dark mode comes from the shared `popover` / `accent` / `secondary` tokens — no
  hardcoded colors.

---

## Known limitations

- The option list is not virtualized. Lists in the low thousands are fine; if a dropdown
  ever needs tens of thousands of options, add `@tanstack/react-virtual` (already a
  dependency) inside `CommandList`.
- No async/remote option loading — pass a fully materialized `options` array.
