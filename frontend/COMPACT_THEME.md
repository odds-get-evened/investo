# Compact UI Theme

This document describes the compact UI theme implementation for Investo.

## Overview

The compact theme reduces UI density by decreasing spacing, typography sizes, and component padding throughout the application. This creates a denser interface that displays more information in less space.

## Files Added

### 1. `src/styles/compact.css`
Global CSS file with condensed spacing variables and compact styling rules.

**Key Features:**
- Reduced spacing variables (4px base instead of typical 8px)
- Smaller typography scale (14px base font size)
- Compact button and input padding
- Tighter table cells
- Reduced card padding
- Responsive adjustments for mobile

**Usage:**
The compact.css file is automatically imported in `src/main.jsx` and applies globally.

### 2. `src/theme/compactTheme.js`
Theme configuration object with compact design tokens.

**Key Features:**
- Typography scale with reduced sizes
- Spacing scale (4px base unit)
- Component-specific compact defaults (MUI-style configuration)
- Helper functions for spacing and typography

**Usage:**
```javascript
import compactTheme, { getSpacing, getTypography } from './theme/compactTheme';

// Use spacing helper
const padding = getSpacing(2); // Returns "8px"

// Use typography helper
const bodyStyle = getTypography('body1'); // Returns typography config
```

### 3. `src/components/CompactCard.jsx`
Reusable card component with compact styling.

**Props:**
- `title` (React.ReactNode, optional): Card title displayed in header
- `actions` (React.ReactNode, optional): Action buttons/elements in header
- `children` (React.ReactNode): Main card content
- `className` (string, optional): Additional CSS classes

**Usage Example:**
```jsx
import CompactCard from './components/CompactCard';

function MyComponent() {
  return (
    <CompactCard 
      title="Portfolio Summary" 
      actions={
        <>
          <button className="btn-small">Refresh</button>
          <button className="btn-small">Export</button>
        </>
      }
    >
      <div>
        <p>Total Value: $10,000</p>
        <p>Daily Change: +2.5%</p>
      </div>
    </CompactCard>
  );
}
```

## Visual Changes

The compact theme applies the following visual changes:

1. **Sidebar**: Reduced from 220px to 180px width
2. **Typography**: Base font size reduced to 14px (from 16px)
3. **Buttons**: Padding reduced by ~30% (5px 10px instead of 7px 12px)
4. **Tables**: Cell padding reduced by ~25% (6px 8px instead of 8px 10px)
5. **Cards**: Padding reduced by ~30% (8-10px instead of 12-16px)
6. **Forms**: Input padding and spacing reduced
7. **Spacing**: Overall margin/padding reduced by 30-40%

## Customization

To adjust the compact theme:

1. **Modify spacing variables** in `src/styles/compact.css`:
   ```css
   :root {
     --compact-spacing-xs: 4px;
     --compact-spacing-sm: 6px;
     /* ... */
   }
   ```

2. **Adjust typography** in `src/theme/compactTheme.js`:
   ```javascript
   typography: {
     fontSize: 14, // Change base font size
     /* ... */
   }
   ```

3. **Override specific components** by adding rules to `compact.css`:
   ```css
   .my-component {
     padding: var(--compact-spacing-md);
     font-size: var(--compact-font-base);
   }
   ```

## Browser Support

The compact theme works in all modern browsers that support:
- CSS custom properties (CSS variables)
- CSS Grid and Flexbox
- Modern CSS selectors

## Performance

The compact theme has minimal performance impact:
- Adds ~6KB to the CSS bundle (uncompressed)
- No JavaScript runtime overhead
- Applied via CSS cascade (no re-renders)

## Future Enhancements

Potential improvements for the compact theme:

1. **Toggle functionality**: Add a UI control to switch between normal and compact modes
2. **User preference storage**: Save compact mode preference in localStorage
3. **Multiple density levels**: Add "comfortable" and "ultra-compact" options
4. **Per-component density**: Allow individual components to override density
5. **Material-UI integration**: If MUI is added, integrate with MUI density system
