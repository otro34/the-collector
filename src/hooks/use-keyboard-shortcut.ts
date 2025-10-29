import { useEffect, useCallback } from 'react'

type KeyboardShortcutHandler = (event: KeyboardEvent) => void

interface KeyboardShortcutOptions {
  /**
   * Whether the shortcut should be enabled
   * @default true
   */
  enabled?: boolean
  /**
   * Whether to prevent default behavior
   * @default true
   */
  preventDefault?: boolean
  /**
   * Whether to allow the shortcut when input elements are focused
   * @default false
   */
  enableOnFormElements?: boolean
}

/**
 * Hook to register keyboard shortcuts
 * @param key - The key to listen for (e.g., '/', 'Escape', 'k')
 * @param handler - The function to call when the key is pressed
 * @param options - Additional options for the shortcut
 */
export function useKeyboardShortcut(
  key: string,
  handler: KeyboardShortcutHandler,
  options: KeyboardShortcutOptions = {}
) {
  const { enabled = true, preventDefault = true, enableOnFormElements = false } = options

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Check if shortcut is enabled
      if (!enabled) return

      // Check if target is an input element
      const target = event.target as HTMLElement
      const isFormElement =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable

      // Skip if form element and not explicitly enabled
      if (isFormElement && !enableOnFormElements) return

      // Check if the key matches
      if (event.key === key) {
        if (preventDefault) {
          event.preventDefault()
        }
        handler(event)
      }
    },
    [key, handler, enabled, preventDefault, enableOnFormElements]
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}

/**
 * Hook to register keyboard shortcuts with modifiers (Ctrl/Cmd + key)
 * @param key - The key to listen for
 * @param handler - The function to call when the shortcut is pressed
 * @param options - Additional options for the shortcut
 */
export function useKeyboardShortcutWithModifier(
  key: string,
  handler: KeyboardShortcutHandler,
  options: KeyboardShortcutOptions = {}
) {
  const { enabled = true, preventDefault = true, enableOnFormElements = false } = options

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Check if shortcut is enabled
      if (!enabled) return

      // Check if target is an input element
      const target = event.target as HTMLElement
      const isFormElement =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable

      // Skip if form element and not explicitly enabled
      if (isFormElement && !enableOnFormElements) return

      // Check for Cmd (Mac) or Ctrl (Windows/Linux)
      const isModifierPressed = event.metaKey || event.ctrlKey

      // Check if the key matches with modifier
      if (isModifierPressed && event.key.toLowerCase() === key.toLowerCase()) {
        if (preventDefault) {
          event.preventDefault()
        }
        handler(event)
      }
    },
    [key, handler, enabled, preventDefault, enableOnFormElements]
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}
