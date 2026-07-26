'use client'

import * as React from 'react'
import { Check, ChevronsUpDown, X } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'

export interface SearchableSelectOption {
  /** Value stored in form state. Must be unique within `options`. */
  value: string
  /** Text shown in the list and in the trigger. */
  label: string
  /** Extra terms that should also match the search query. */
  keywords?: string[]
  disabled?: boolean
}

interface SearchableSelectBaseProps {
  options: SearchableSelectOption[]
  /** Text shown in the trigger when nothing is selected. */
  placeholder?: string
  /** Placeholder of the filter field inside the dropdown. */
  searchPlaceholder?: string
  /** Message shown when no option matches the search. */
  emptyMessage?: string
  /** Adds a "Clear selection" entry at the top of the list. */
  allowClear?: boolean
  disabled?: boolean
  className?: string
  /** Extra classes for the dropdown panel. */
  contentClassName?: string
  id?: string
  name?: string
  onBlur?: () => void
  'aria-label'?: string
  'aria-labelledby'?: string
  'aria-describedby'?: string
  'aria-invalid'?: boolean
}

interface SearchableSelectSingleProps extends SearchableSelectBaseProps {
  multiple?: false
  value?: string | null
  onValueChange: (value: string) => void
}

interface SearchableSelectMultipleProps extends SearchableSelectBaseProps {
  multiple: true
  value?: string[] | null
  onValueChange: (value: string[]) => void
  /** How many badges to render before collapsing into "+N more". */
  maxDisplayed?: number
}

export type SearchableSelectProps = SearchableSelectSingleProps | SearchableSelectMultipleProps

/**
 * Badge look for the multi-select trigger. Uses spans instead of the `Badge`
 * component because the trigger is a `<button>`, which only accepts phrasing content.
 */
const badgeClassName =
  'inline-flex items-center rounded-md border border-transparent bg-secondary px-2 py-0.5 text-xs font-semibold text-secondary-foreground'

/**
 * Case-insensitive substring match over the option value plus its keywords
 * (the label is always injected as a keyword by the component).
 */
function filterOption(value: string, search: string, keywords?: string[]): number {
  if (!search) return 1
  const haystack = [value, ...(keywords ?? [])].join(' ').toLowerCase()
  return haystack.includes(search.toLowerCase()) ? 1 : 0
}

const SearchableSelect = React.forwardRef<HTMLButtonElement, SearchableSelectProps>(
  (props, ref) => {
    const {
      options,
      placeholder = 'Select an option',
      searchPlaceholder = 'Search...',
      emptyMessage = 'No results found.',
      allowClear = false,
      disabled = false,
      className,
      contentClassName,
      id,
      name,
      onBlur,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
      'aria-describedby': ariaDescribedBy,
      'aria-invalid': ariaInvalid,
    } = props

    const [open, setOpen] = React.useState(false)
    const [search, setSearch] = React.useState('')
    const panelId = React.useId()

    const isMultiple = props.multiple === true
    const selectedValues = React.useMemo<string[]>(() => {
      if (isMultiple) return props.value ?? []
      return props.value ? [props.value] : []
    }, [isMultiple, props.value])

    const selectedOptions = React.useMemo(
      () => options.filter((option) => selectedValues.includes(option.value)),
      [options, selectedValues]
    )

    // Reset the filter whenever the dropdown closes so it reopens clean.
    React.useEffect(() => {
      if (!open) setSearch('')
    }, [open])

    const handleSelect = (optionValue: string) => {
      if (props.multiple) {
        const current = props.value ?? []
        const next = current.includes(optionValue)
          ? current.filter((value) => value !== optionValue)
          : [...current, optionValue]
        props.onValueChange(next)
        // Multi-select stays open so several values can be picked in a row.
        return
      }

      props.onValueChange(optionValue)
      setOpen(false)
    }

    const handleClear = () => {
      if (props.multiple) {
        props.onValueChange([])
        return
      }
      props.onValueChange('')
      setOpen(false)
    }

    const maxDisplayed = props.multiple ? (props.maxDisplayed ?? 3) : 0
    const hasSelection = selectedValues.length > 0

    const renderTriggerContent = () => {
      if (!hasSelection) {
        return <span className="truncate text-muted-foreground">{placeholder}</span>
      }

      if (!isMultiple) {
        // Fall back to the raw value when the option list has not loaded yet.
        return <span className="truncate">{selectedOptions[0]?.label ?? selectedValues[0]}</span>
      }

      const visible = selectedOptions.slice(0, maxDisplayed)
      const hiddenCount = selectedValues.length - visible.length

      return (
        <span className="flex flex-wrap items-center gap-1 overflow-hidden">
          {visible.map((option) => (
            <span key={option.value} className={cn(badgeClassName, 'max-w-[12rem] truncate')}>
              {option.label}
            </span>
          ))}
          {hiddenCount > 0 && (
            <span className={badgeClassName}>
              +{hiddenCount} more
              <span className="sr-only"> options selected</span>
            </span>
          )}
        </span>
      )
    }

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            ref={ref}
            id={id}
            type="button"
            aria-expanded={open}
            aria-haspopup="listbox"
            aria-controls={open ? panelId : undefined}
            aria-label={ariaLabel}
            aria-labelledby={ariaLabelledBy}
            aria-describedby={ariaDescribedBy}
            // `aria-invalid` is not supported on role=button, so the error state is
            // exposed for styling only; the message itself is announced through
            // `aria-describedby` (wired up automatically by shadcn's <FormControl>).
            data-invalid={ariaInvalid ? 'true' : undefined}
            disabled={disabled}
            onBlur={onBlur}
            className={cn(
              'flex min-h-9 w-full items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 py-1.5 text-left text-sm shadow-sm ring-offset-background transition-colors hover:bg-accent/50 focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[invalid=true]:border-destructive',
              className
            )}
          >
            {renderTriggerContent()}
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" aria-hidden="true" />
          </button>
        </PopoverTrigger>

        {/* Keeps the value in native form submissions / FormData. */}
        {name && <input type="hidden" name={name} value={selectedValues.join(',')} />}

        <PopoverContent
          id={panelId}
          align="start"
          className={cn('w-[var(--radix-popover-trigger-width)] p-0', contentClassName)}
        >
          <Command filter={filterOption} loop>
            <CommandInput
              value={search}
              onValueChange={setSearch}
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
            />
            <CommandList>
              <CommandEmpty>{emptyMessage}</CommandEmpty>

              {allowClear && hasSelection && (
                <>
                  <CommandGroup>
                    <CommandItem
                      value="__clear__"
                      keywords={['clear', 'none', 'reset']}
                      onSelect={handleClear}
                      className="text-muted-foreground"
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                      Clear selection
                    </CommandItem>
                  </CommandGroup>
                  <CommandSeparator />
                </>
              )}

              <CommandGroup>
                {options.map((option) => {
                  const isSelected = selectedValues.includes(option.value)
                  return (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      keywords={[option.label, ...(option.keywords ?? [])]}
                      disabled={option.disabled}
                      onSelect={() => handleSelect(option.value)}
                    >
                      <Check
                        className={cn('h-4 w-4 shrink-0', isSelected ? 'opacity-100' : 'opacity-0')}
                        aria-hidden="true"
                      />
                      <span className="truncate">{option.label}</span>
                      {/* cmdk uses aria-selected for the highlighted row, so the
                          chosen state is announced with text instead. */}
                      {isSelected && <span className="sr-only">, selected</span>}
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    )
  }
)
SearchableSelect.displayName = 'SearchableSelect'

export { SearchableSelect }
