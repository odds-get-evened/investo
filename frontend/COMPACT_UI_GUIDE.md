# Compact UI/UX Guide

This guide explains how to use the new compact styling features added to Investo.

## What's Included

1. **Compact CSS** (`src/styles/compact.css`) - Condensed spacing, smaller typography, and compact component styles
2. **Compact Theme** (`src/theme/compactTheme.js`) - Theme configuration for Material-UI or standalone use
3. **CompactCard Component** (`src/components/CompactCard.jsx`) - A reusable compact card component

## How to Enable Compact Mode

### Option 1: Global Compact Mode (Opt-In)

To enable compact mode globally, add the `compact-root` class to your root element in `index.html`:

```html
<div id="root" class="compact-root"></div>
```

This applies compact styling to all elements within the root.

### Option 2: Individual Component Classes

Use specific compact classes on individual elements:

```jsx
<button className="compact-button">Click Me</button>
<input className="compact-input" type="text" />
<table className="compact-table">...</table>
```

### Option 3: Use the CompactCard Component

```jsx
import CompactCard from './components/CompactCard';

function MyComponent() {
  return (
    <CompactCard 
      title="Portfolio Summary" 
      actions={
        <>
          <button className="compact-button-small">Edit</button>
          <button className="compact-button-small">Delete</button>
        </>
      }
    >
      <p>Total Value: $10,000</p>
      <p>Daily Change: +2.5%</p>
    </CompactCard>
  );
}
```

## Available Compact CSS Classes

### Cards
- `.compact-card` - Compact card container
- `.card-header` - Card header with title and actions
- `.card-title` - Card title
- `.card-actions` - Action buttons container
- `.card-content` - Card content area

### Buttons
- `.compact-button` - Standard compact button
- `.compact-button-small` - Extra small compact button
- `.compact-icon-button` - Compact icon button

### Inputs
- `.compact-input` - Compact input field (applied automatically in `.compact-root`)

### Tables
- `.compact-table` - Compact table with reduced padding

### Spacing Utilities
- `.compact-mt-xs` / `.compact-mt-sm` / `.compact-mt-md` / `.compact-mt-lg` - Margin top
- `.compact-mb-xs` / `.compact-mb-sm` / `.compact-mb-md` / `.compact-mb-lg` - Margin bottom
- `.compact-p-xs` / `.compact-p-sm` / `.compact-p-md` / `.compact-p-lg` - Padding
- `.compact-gap-xs` / `.compact-gap-sm` / `.compact-gap-md` - Gap (for flexbox/grid)

## Using the Compact Theme with Material-UI

If you decide to add Material-UI to the project, you can use the compact theme:

```jsx
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { compactThemeOptions } from './theme/compactTheme';

const theme = createTheme(compactThemeOptions);

function App() {
  return (
    <ThemeProvider theme={theme}>
      <YourApp />
    </ThemeProvider>
  );
}
```

## Using the Compact Theme Without Material-UI

The theme constants are also available for standalone use:

```jsx
import { compactThemeConstants } from './theme/compactTheme';

const buttonStyle = {
  fontSize: compactThemeConstants.typography.button.fontSize,
  padding: `${compactThemeConstants.spacing.xs}px ${compactThemeConstants.spacing.md}px`,
  height: compactThemeConstants.components.button.medium.height,
};
```

## Dark Mode Support

All compact styles respect the existing dark mode implementation using `data-theme="dark"` attribute.

## Responsive Behavior

Compact styles automatically adjust for different screen sizes:
- **Mobile (<768px)**: Even more condensed spacing
- **Desktop (>1440px)**: Slightly more breathing room

## Examples

### Basic Card
```jsx
<CompactCard title="Holdings">
  <ul>
    <li>AAPL - 10 shares</li>
    <li>GOOGL - 5 shares</li>
  </ul>
</CompactCard>
```

### Card with Actions
```jsx
<CompactCard 
  title="Portfolio Details" 
  actions={
    <>
      <button className="compact-icon-button">⚙️</button>
      <button className="compact-icon-button">📊</button>
    </>
  }
>
  <p>View your portfolio statistics here</p>
</CompactCard>
```

### Card with Custom Classes
```jsx
<CompactCard title="Custom Card" className="my-custom-styles">
  <p>Additional custom styling applied</p>
</CompactCard>
```

## Notes

- The compact CSS is imported in `main.jsx` but does NOT automatically apply to the entire app
- You must opt-in by using the classes or adding `compact-root` to the root element
- All compact features are designed to be safe, non-breaking additions
- The existing UI remains unchanged unless you explicitly opt-in
