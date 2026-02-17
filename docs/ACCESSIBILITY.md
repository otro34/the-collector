# Accessibility (A11Y) Guide - The Collector

**Last Updated**: 2026-02-16
**WCAG Compliance**: AA Level

---

## Overview

The Collector is designed to be accessible to all users, including those using assistive technologies like screen readers, keyboard-only navigation, and users with visual impairments. This document outlines our accessibility features and compliance with WCAG 2.1 AA standards.

---

## Accessibility Features

### 1. Keyboard Navigation

All interactive elements are fully accessible via keyboard:

- **Skip to Content**: Press `Tab` on page load to reveal "Skip to content" link
- **Search Focus**: Press `/` from anywhere to focus the global search
- **Modal Close**: Press `Esc` to close modals and dialogs
- **Arrow Navigation**: Use `↑` and `↓` to navigate search results
- **Tab Navigation**: Navigate through all interactive elements with `Tab` and `Shift+Tab`

### 2. Screen Reader Support

All components include proper ARIA labels and semantic HTML:

- All images have descriptive `alt` text
- Buttons without visible text have `aria-label` attributes
- Interactive regions have appropriate ARIA roles
- Focus states are clearly visible
- Screen reader-only text provides context where needed

### 3. Visual Accessibility

#### Focus Indicators

- All interactive elements show a visible 2px outline when focused
- Focus indicators use high-contrast colors meeting WCAG AA requirements
- Outline offset of 2px ensures visibility around elements

#### Color Contrast

- Text meets WCAG AA contrast ratios (4.5:1 for normal text, 3:1 for large text)
- Dark mode maintains proper contrast ratios
- Color is never used as the only means of conveying information

#### Typography

- Base font size: 16px (1rem)
- Line height: 1.5 for body text
- Heading hierarchy follows proper structure (h1 → h2 → h3)
- Sans-serif font (Inter) for improved readability

### 4. Touch Target Sizes

All interactive elements meet minimum touch target requirements:

- Buttons: Minimum 44x44 pixels (iOS/Android guidelines)
- Links: Adequate padding for easy tapping
- Mobile menu toggle: 44x44 pixels

### 5. Responsive Design

- Fully responsive from 320px to 4K displays
- Mobile-first approach ensures accessibility on all devices
- Text reflows without horizontal scrolling
- Zoom support up to 200% without loss of functionality

---

## WCAG 2.1 AA Compliance Checklist

### Perceivable

- [x] **1.1.1** Text Alternatives: All images have alt text
- [x] **1.3.1** Info and Relationships: Proper semantic HTML and ARIA labels
- [x] **1.3.2** Meaningful Sequence: Logical content order
- [x] **1.4.3** Contrast (Minimum): 4.5:1 for text, 3:1 for large text
- [x] **1.4.4** Resize Text: Text can be resized up to 200%
- [x] **1.4.10** Reflow: Content reflows without horizontal scrolling
- [x] **1.4.11** Non-text Contrast: UI components have 3:1 contrast

### Operable

- [x] **2.1.1** Keyboard: All functionality available via keyboard
- [x] **2.1.2** No Keyboard Trap: Focus can be moved away from components
- [x] **2.4.1** Bypass Blocks: Skip to content link provided
- [x] **2.4.2** Page Titled: All pages have descriptive titles
- [x] **2.4.3** Focus Order: Logical focus order throughout
- [x] **2.4.4** Link Purpose (In Context): Link text describes destination
- [x] **2.4.7** Focus Visible: Clear focus indicators on all elements
- [x] **2.5.5** Target Size: Touch targets minimum 44x44 pixels

### Understandable

- [x] **3.1.1** Language of Page: HTML lang attribute set
- [x] **3.2.1** On Focus: No context changes on focus
- [x] **3.2.2** On Input: No unexpected context changes
- [x] **3.3.1** Error Identification: Errors clearly identified
- [x] **3.3.2** Labels or Instructions: Form fields have labels
- [x] **3.3.3** Error Suggestion: Error messages provide guidance

### Robust

- [x] **4.1.1** Parsing: Valid HTML markup
- [x] **4.1.2** Name, Role, Value: ARIA attributes for custom components
- [x] **4.1.3** Status Messages: Appropriate ARIA live regions

---

## Component-Specific Accessibility

### Navigation

- **Header**: Semantic `<header>` element with skip link
- **Main Navigation**: Proper `<nav>` element with ARIA labels
- **Mobile Menu**: Sheet component with proper focus management
- **Theme Toggle**: Icon button with sr-only label "Toggle theme"

### Search

- **Global Search**:
  - `role="combobox"` on input
  - `aria-expanded` indicates dropdown state
  - `aria-autocomplete="list"` for suggestions
  - Results list has `role="listbox"`
  - Each result has `role="option"` and `aria-selected`
  - Keyboard navigation with arrow keys

- **Collection Search**:
  - Proper label association
  - Clear button with sr-only text
  - Debounced input for better performance

### Forms

- All form inputs have associated labels
- Error states use ARIA attributes
- Required fields indicated visually and programmatically
- Form validation provides clear error messages

### Modals & Dialogs

- Proper focus trapping within modals
- `Esc` key closes modals
- Focus returns to trigger element on close
- Background content inert while modal open

### Images

- All images have descriptive alt text
- Decorative images have empty alt=""
- Next.js Image component used for optimization
- Cover images show item title as alt text

### Cards & Lists

- Proper heading hierarchy within cards
- Links have descriptive text
- Interactive cards fully keyboard accessible
- Hover and focus states clearly visible

---

## Testing for Accessibility

### Automated Testing

```bash
# Run Lighthouse accessibility audit
npm run build
npx lighthouse http://localhost:3000 --only-categories=accessibility
```

### Manual Testing

1. **Keyboard Navigation**:
   - Unplug mouse and navigate entire site with keyboard
   - Ensure all interactive elements are reachable
   - Verify focus indicators are visible

2. **Screen Reader Testing**:
   - macOS: VoiceOver (Cmd + F5)
   - Windows: NVDA or JAWS
   - Test all major user flows

3. **Color Contrast**:
   - Use browser DevTools Color Contrast checker
   - Test both light and dark modes

4. **Zoom Testing**:
   - Test at 200% zoom level
   - Ensure no horizontal scrolling
   - Verify all content remains accessible

5. **Mobile Testing**:
   - Test on actual devices when possible
   - Verify touch target sizes
   - Test screen orientation changes

### Browser Extensions for Testing

- **axe DevTools**: Comprehensive accessibility testing
- **WAVE**: Web accessibility evaluation tool
- **Lighthouse**: Built into Chrome DevTools
- **Color Contrast Analyzer**: Check contrast ratios

---

## Known Limitations

- Video content (future feature) will require captions
- Complex data visualizations may need alternative text representations
- Some third-party APIs (ISBN lookup, Discogs, RAWG) may have accessibility limitations

---

## Reporting Accessibility Issues

If you encounter accessibility barriers while using The Collector:

1. Open an issue on GitHub
2. Include:
   - Description of the barrier
   - Steps to reproduce
   - Your setup (OS, browser, assistive technology)
   - Screenshots if applicable

We are committed to addressing accessibility issues promptly.

---

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Resources](https://webaim.org/resources/)
- [a11y Project](https://www.a11yproject.com/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)

---

## Future Enhancements

- [ ] Add configurable font size settings
- [ ] Implement reduced motion preference
- [ ] Add high contrast mode option
- [ ] Improve error recovery mechanisms
- [ ] Add more comprehensive keyboard shortcuts
- [ ] Implement advanced screen reader announcements

---

**Commitment**: We are committed to ensuring digital accessibility for all users and continuously improving the user experience. If you have suggestions for improving accessibility, please let us know!
