# Select Components - Accessibility Quick Reference

Quick reference guide for developers implementing or using the Select components.

## ✅ Accessibility Features

### Keyboard Navigation

All Select components support full keyboard navigation:

| Key                | Action                                            |
| ------------------ | ------------------------------------------------- |
| `Tab`              | Focus the select field                            |
| `Enter` or `Space` | Open dropdown menu                                |
| `↓` `↑`            | Navigate through options                          |
| `→` `←`            | Expand/collapse tree nodes (TreeSelectField only) |
| `Enter`            | Select focused option                             |
| `Space`            | Toggle checkbox (Multi/Tree select)               |
| `Escape`           | Close dropdown without selection                  |

### Focus Indicators

- **Focus Ring**: 2px solid ring with color `#F1F3F8`
- **Contrast**: Meets WCAG 2.1 Level AA requirements
- **Transition**: Smooth 0.2s ease animation

### Screen Reader Support

- **ARIA Roles**: Proper `role="combobox"` and `role="listbox"` attributes
- **Labels**: All fields support accessible labels
- **Error Messages**: Announced with proper ARIA attributes
- **Selected Values**: Changes announced to screen readers

## 🎨 Visual States

### Border Colors

```css
Default:  #D1D5DE
Hover:    #B3B8C5
Focus:    #D1D5DE (with 2px #F1F3F8 ring)
Error:    #D05C4E
Disabled: #D1D5DE (with #F1F3F8 background)
```

### Text Colors

```css
Label:       #282C3B (13px)
Value:       #282C3B (12px)
Placeholder: #787E95 (12px)
Help Text:   #787E95 (13px)
Error Text:  #D05C4E (13px)
Required:    #D05C4E (12px)
```

## 📝 Usage Examples

### Basic Accessible Select

```tsx
<SelectField
  label="Country"
  required
  data={countries}
  helpMessage="Select your country"
/>
```

### With Error State

```tsx
<SelectField
  label="Email Type"
  required
  error
  helpMessage="This field is required"
  data={emailTypes}
/>
```

### Disabled State

```tsx
<SelectField
  label="Locked Option"
  disabled
  value={selectedValue}
  data={options}
/>
```

## ✅ Accessibility Checklist

When implementing Select components, ensure:

- [ ] Label is provided (or aria-label for custom cases)
- [ ] Required fields show asterisk indicator
- [ ] Error states display error message
- [ ] Help messages provide context
- [ ] Disabled state is visually clear
- [ ] Focus ring is visible on keyboard focus
- [ ] All interactions work with keyboard only
- [ ] Color contrast meets WCAG AA standards
- [ ] Component works at 200% zoom
- [ ] Screen reader announces all state changes

## 🔍 Testing

### Manual Testing

1. **Keyboard Only**: Navigate entire form using only keyboard
2. **Screen Reader**: Test with NVDA, JAWS, or VoiceOver
3. **Zoom**: Test at 200% browser zoom
4. **High Contrast**: Test in Windows High Contrast Mode

### Automated Testing

- Use Storybook's built-in a11y addon
- Run axe-core accessibility tests
- Check ARIA attributes in DevTools

## 📚 Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Combobox Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/)
- [RSuite Accessibility](https://rsuitejs.com/guide/accessibility/)
- Full verification: `ACCESSIBILITY_VERIFICATION.md`

## 🐛 Common Issues

### Issue: Focus ring not visible

**Solution**: Check CSS for `box-shadow: 0 0 0 2px #f1f3f8`

### Issue: Keyboard navigation not working

**Solution**: Ensure RSuite picker is not disabled and has proper ref forwarding

### Issue: Screen reader not announcing selection

**Solution**: RSuite handles this automatically - check if picker has proper ARIA attributes

### Issue: Tab skips over select

**Solution**: Check if `disabled` prop is set or if element has `tabindex="-1"`

## 💡 Best Practices

1. **Always provide labels**: Even if visually hidden, labels help screen readers
2. **Use help messages**: Provide context for complex selections
3. **Show required indicators**: Use the `required` prop for required fields
4. **Handle errors gracefully**: Show clear error messages with the `error` prop
5. **Test with real users**: Accessibility is best validated by users with disabilities

## 🎯 Requirements Met

- ✅ **Requirement 10.1**: Full keyboard navigation support
- ✅ **Requirement 10.2**: Proper ARIA labels and screen reader support
- ✅ **Requirement 10.3**: WCAG-compliant focus indicators
- ✅ **Requirement 10.4**: Disabled state with proper cursor and visual feedback
- ✅ **Requirement 10.5**: All interactive elements keyboard accessible

---

**Last Updated**: Task 9 - Accessibility Compliance Verification
**Status**: ✅ All requirements met
