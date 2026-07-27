import * as React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { SearchableSelect, type SearchableSelectOption } from '@/components/ui/searchable-select'

/**
 * Sample interaction test — and the backfill for US-13.1, whose open/filter/keyboard
 * behaviour could not be verified in a browser when the component was written.
 */

const OPTIONS: SearchableSelectOption[] = [
  { value: 'nintendo-switch', label: 'Nintendo Switch', keywords: ['ns'] },
  { value: 'playstation-5', label: 'PlayStation 5', keywords: ['ps5', 'sony'] },
  { value: 'xbox-series-x', label: 'Xbox Series X' },
  { value: 'dreamcast', label: 'Dreamcast', disabled: true },
]

/**
 * Wraps the controlled component so selections actually stick during a test.
 * The extra props are listed explicitly — spreading a `Partial<…>` of the props
 * would collapse the single/multiple discriminated union.
 */
type SingleHarnessProps = {
  onValueChange?: (value: string) => void
  disabled?: boolean
  allowClear?: boolean
  emptyMessage?: string
  name?: string
  'aria-invalid'?: boolean
}

function SingleHarness({ onValueChange, ...props }: SingleHarnessProps) {
  const [value, setValue] = React.useState('')
  return (
    <SearchableSelect
      options={OPTIONS}
      placeholder="Select a platform"
      aria-label="Platform"
      value={value}
      onValueChange={(next: string) => {
        setValue(next)
        onValueChange?.(next)
      }}
      {...props}
    />
  )
}

function MultiHarness({ onValueChange }: { onValueChange?: (value: string[]) => void }) {
  const [value, setValue] = React.useState<string[]>([])
  return (
    <SearchableSelect
      multiple
      options={OPTIONS}
      placeholder="Select platforms"
      aria-label="Platforms"
      maxDisplayed={2}
      value={value}
      onValueChange={(next) => {
        setValue(next)
        onValueChange?.(next)
      }}
    />
  )
}

/**
 * Queried by `aria-label` rather than by visible text: the trigger's text changes
 * as soon as something is selected, so a text-based query stops matching mid-test.
 */
const trigger = () => screen.getByRole('button', { name: /^platforms?$/i })

describe('SearchableSelect', () => {
  describe('trigger', () => {
    it('shows the placeholder and stays collapsed until opened', () => {
      render(<SingleHarness />)

      expect(trigger()).toHaveTextContent('Select a platform')
      expect(trigger()).toHaveAttribute('aria-expanded', 'false')
      expect(trigger()).toHaveAttribute('aria-haspopup', 'listbox')
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    })

    it('does not open when disabled', async () => {
      const user = userEvent.setup()
      render(<SingleHarness disabled />)

      expect(trigger()).toBeDisabled()
      await user.click(trigger())

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    })

    it('exposes the error state for styling without an invalid aria-invalid on role=button', () => {
      render(<SingleHarness aria-invalid />)

      expect(trigger()).toHaveAttribute('data-invalid', 'true')
      expect(trigger()).not.toHaveAttribute('aria-invalid')
    })
  })

  describe('filtering', () => {
    it('narrows the list as the user types, case-insensitively', async () => {
      const user = userEvent.setup()
      render(<SingleHarness />)
      await user.click(trigger())

      await user.type(screen.getByRole('combobox'), 'PLAYSTATION')

      expect(screen.getByRole('option', { name: /PlayStation 5/ })).toBeInTheDocument()
      expect(screen.queryByRole('option', { name: /Nintendo Switch/ })).not.toBeInTheDocument()
    })

    it('matches on keywords as well as the label', async () => {
      const user = userEvent.setup()
      render(<SingleHarness />)
      await user.click(trigger())

      await user.type(screen.getByRole('combobox'), 'sony')

      expect(screen.getByRole('option', { name: /PlayStation 5/ })).toBeInTheDocument()
      expect(screen.queryByRole('option', { name: /Xbox/ })).not.toBeInTheDocument()
    })

    it('shows the empty message when nothing matches', async () => {
      const user = userEvent.setup()
      render(<SingleHarness emptyMessage="No platforms found." />)
      await user.click(trigger())

      await user.type(screen.getByRole('combobox'), 'gamecube')

      expect(screen.getByText('No platforms found.')).toBeInTheDocument()
      expect(screen.queryAllByRole('option')).toHaveLength(0)
    })

    it('resets the filter when the dropdown is reopened', async () => {
      const user = userEvent.setup()
      render(<SingleHarness />)

      await user.click(trigger())
      await user.type(screen.getByRole('combobox'), 'xbox')
      await user.keyboard('{Escape}')

      await user.click(trigger())

      expect(screen.getByRole('combobox')).toHaveValue('')
      expect(screen.getByRole('option', { name: /Nintendo Switch/ })).toBeInTheDocument()
    })
  })

  describe('single select', () => {
    it('reports the chosen value and closes the dropdown', async () => {
      const user = userEvent.setup()
      const onValueChange = vi.fn()
      render(<SingleHarness onValueChange={onValueChange} />)

      await user.click(trigger())
      await user.click(screen.getByRole('option', { name: /Nintendo Switch/ }))

      expect(onValueChange).toHaveBeenCalledExactlyOnceWith('nintendo-switch')
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
      expect(trigger()).toHaveTextContent('Nintendo Switch')
    })

    it('marks the chosen option for screen readers', async () => {
      const user = userEvent.setup()
      render(<SingleHarness />)

      await user.click(trigger())
      await user.click(screen.getByRole('option', { name: /Xbox Series X/ }))
      await user.click(trigger())

      const chosen = screen.getByRole('option', { name: /Xbox Series X/ })
      expect(within(chosen).getByText(', selected')).toBeInTheDocument()
    })

    it('clears the selection through the clear entry when allowClear is set', async () => {
      const user = userEvent.setup()
      const onValueChange = vi.fn()
      render(<SingleHarness allowClear onValueChange={onValueChange} />)

      await user.click(trigger())
      await user.click(screen.getByRole('option', { name: /PlayStation 5/ }))

      await user.click(trigger())
      await user.click(screen.getByRole('option', { name: /Clear selection/ }))

      expect(onValueChange).toHaveBeenLastCalledWith('')
      expect(trigger()).toHaveTextContent('Select a platform')
    })

    it('hides the clear entry while nothing is selected', async () => {
      const user = userEvent.setup()
      render(<SingleHarness allowClear />)

      await user.click(trigger())

      expect(screen.queryByRole('option', { name: /Clear selection/ })).not.toBeInTheDocument()
    })
  })

  describe('keyboard navigation', () => {
    it('selects the highlighted option with Enter', async () => {
      const user = userEvent.setup()
      const onValueChange = vi.fn()
      render(<SingleHarness onValueChange={onValueChange} />)

      await user.click(trigger())
      await user.keyboard('{ArrowDown}{Enter}')

      expect(onValueChange).toHaveBeenCalledExactlyOnceWith('playstation-5')
    })

    it('wraps around the end of the list', async () => {
      const user = userEvent.setup()
      const onValueChange = vi.fn()
      render(<SingleHarness onValueChange={onValueChange} />)

      await user.click(trigger())
      // The disabled Dreamcast row is skipped, so Up from the first row wraps to Xbox.
      await user.keyboard('{ArrowUp}{Enter}')

      expect(onValueChange).toHaveBeenCalledExactlyOnceWith('xbox-series-x')
    })

    it('closes on Escape without selecting anything', async () => {
      const user = userEvent.setup()
      const onValueChange = vi.fn()
      render(<SingleHarness onValueChange={onValueChange} />)

      await user.click(trigger())
      await user.keyboard('{Escape}')

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
      expect(onValueChange).not.toHaveBeenCalled()
    })

    it('never highlights a disabled option', async () => {
      const user = userEvent.setup()
      render(<SingleHarness />)
      await user.click(trigger())

      expect(screen.getByRole('option', { name: /Dreamcast/ })).toHaveAttribute(
        'data-disabled',
        'true'
      )
    })
  })

  describe('multi select', () => {
    it('accumulates values and stays open between picks', async () => {
      const user = userEvent.setup()
      const onValueChange = vi.fn()
      render(<MultiHarness onValueChange={onValueChange} />)

      await user.click(trigger())
      await user.click(screen.getByRole('option', { name: /Nintendo Switch/ }))
      await user.click(screen.getByRole('option', { name: /PlayStation 5/ }))

      expect(onValueChange).toHaveBeenLastCalledWith(['nintendo-switch', 'playstation-5'])
      expect(screen.getByRole('listbox')).toBeInTheDocument()
    })

    it('toggles an already-selected value off', async () => {
      const user = userEvent.setup()
      const onValueChange = vi.fn()
      render(<MultiHarness onValueChange={onValueChange} />)

      await user.click(trigger())
      await user.click(screen.getByRole('option', { name: /Nintendo Switch/ }))
      await user.click(screen.getByRole('option', { name: /Nintendo Switch/ }))

      expect(onValueChange).toHaveBeenLastCalledWith([])
    })

    it('collapses badges past maxDisplayed into a +N more summary', async () => {
      const user = userEvent.setup()
      render(<MultiHarness />)

      await user.click(trigger())
      await user.click(screen.getByRole('option', { name: /Nintendo Switch/ }))
      await user.click(screen.getByRole('option', { name: /PlayStation 5/ }))
      await user.click(screen.getByRole('option', { name: /Xbox Series X/ }))
      await user.keyboard('{Escape}')

      expect(trigger()).toHaveTextContent('Nintendo Switch')
      expect(trigger()).toHaveTextContent('PlayStation 5')
      expect(trigger()).not.toHaveTextContent('Xbox Series X')
      expect(trigger()).toHaveTextContent('+1 more')
    })
  })

  describe('form integration', () => {
    it('mirrors the selection into a hidden input for native form submission', async () => {
      const user = userEvent.setup()
      const { container } = render(<SingleHarness name="platform" />)

      await user.click(trigger())
      await user.click(screen.getByRole('option', { name: /PlayStation 5/ }))

      expect(container.querySelector('input[name="platform"]')).toHaveValue('playstation-5')
    })
  })
})
