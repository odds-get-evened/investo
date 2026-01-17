/**
 * Compact Theme Configuration for Investo
 * 
 * This file defines a compact theme with smaller typography, reduced spacing,
 * and condensed component sizes. It's designed to work with Material-UI v5
 * or as a standalone theme configuration object.
 * 
 * HOW TO USE WITH MUI:
 * ```javascript
 * import { createTheme, ThemeProvider } from '@mui/material/styles';
 * import { compactThemeOptions } from './theme/compactTheme';
 * 
 * const theme = createTheme(compactThemeOptions);
 * 
 * function App() {
 *   return (
 *     <ThemeProvider theme={theme}>
 *       <YourApp />
 *     </ThemeProvider>
 *   );
 * }
 * ```
 * 
 * HOW TO USE WITHOUT MUI:
 * ```javascript
 * import { compactThemeConstants } from './theme/compactTheme';
 * 
 * // Use the constants in your styles
 * const buttonStyle = {
 *   fontSize: compactThemeConstants.typography.button.fontSize,
 *   padding: compactThemeConstants.spacing.sm
 * };
 * ```
 */

/**
 * Compact spacing scale (in pixels)
 * Provides smaller spacing values for a more condensed UI
 */
export const compactSpacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

/**
 * Compact typography scale
 * Smaller font sizes optimized for information density
 */
export const compactTypography = {
  // Base font size
  fontSize: 13,
  
  // Font sizes for different elements
  h1: { fontSize: 18, fontWeight: 600, lineHeight: 1.3 },
  h2: { fontSize: 16, fontWeight: 600, lineHeight: 1.35 },
  h3: { fontSize: 14, fontWeight: 600, lineHeight: 1.4 },
  h4: { fontSize: 13, fontWeight: 600, lineHeight: 1.4 },
  h5: { fontSize: 12, fontWeight: 600, lineHeight: 1.45 },
  h6: { fontSize: 11, fontWeight: 600, lineHeight: 1.5 },
  
  body1: { fontSize: 13, lineHeight: 1.4 },
  body2: { fontSize: 12, lineHeight: 1.4 },
  
  button: { fontSize: 12, fontWeight: 500, lineHeight: 1.25, textTransform: 'none' },
  caption: { fontSize: 11, lineHeight: 1.4 },
  overline: { fontSize: 10, lineHeight: 1.5, textTransform: 'uppercase' },
};

/**
 * Compact component size configurations
 * Defines smaller dimensions for various UI components
 */
export const compactComponents = {
  // Button sizes
  button: {
    small: { height: 28, padding: '4px 8px', fontSize: 11 },
    medium: { height: 32, padding: '4px 12px', fontSize: 12 },
    large: { height: 36, padding: '6px 16px', fontSize: 13 },
  },
  
  // Input/TextField sizes
  textField: {
    small: { height: 28, padding: '4px 8px', fontSize: 11 },
    medium: { height: 32, padding: '4px 8px', fontSize: 12 },
    large: { height: 36, padding: '6px 12px', fontSize: 13 },
  },
  
  // Card padding
  card: {
    padding: 12,
    headerPadding: 8,
  },
  
  // Table cell padding
  tableCell: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    fontSize: 12,
  },
  
  // List item padding
  listItem: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    fontSize: 12,
  },
  
  // Icon button
  iconButton: {
    small: { size: 28, iconSize: 16 },
    medium: { size: 32, iconSize: 18 },
    large: { size: 36, iconSize: 20 },
  },
};

/**
 * Combined compact theme constants
 * Convenient access to all theme values
 */
export const compactThemeConstants = {
  spacing: compactSpacing,
  typography: compactTypography,
  components: compactComponents,
};

/**
 * Material-UI v5 Theme Configuration
 * Use this with createTheme() from @mui/material/styles
 * 
 * This configuration provides MUI-specific overrides for compact styling
 */
export const compactThemeOptions = {
  // Spacing function override (MUI uses 8px base by default, we use smaller values)
  spacing: (factor) => `${factor * 4}px`,
  
  // Typography overrides
  typography: {
    fontSize: 13,
    htmlFontSize: 13,
    
    h1: compactTypography.h1,
    h2: compactTypography.h2,
    h3: compactTypography.h3,
    h4: compactTypography.h4,
    h5: compactTypography.h5,
    h6: compactTypography.h6,
    
    body1: compactTypography.body1,
    body2: compactTypography.body2,
    
    button: compactTypography.button,
    caption: compactTypography.caption,
    overline: compactTypography.overline,
  },
  
  // Component-specific overrides
  components: {
    // Button component
    MuiButton: {
      styleOverrides: {
        root: {
          minHeight: compactComponents.button.medium.height,
          padding: compactComponents.button.medium.padding,
          fontSize: compactComponents.button.medium.fontSize,
        },
        sizeSmall: {
          minHeight: compactComponents.button.small.height,
          padding: compactComponents.button.small.padding,
          fontSize: compactComponents.button.small.fontSize,
        },
        sizeLarge: {
          minHeight: compactComponents.button.large.height,
          padding: compactComponents.button.large.padding,
          fontSize: compactComponents.button.large.fontSize,
        },
      },
    },
    
    // TextField component
    MuiTextField: {
      defaultProps: {
        size: 'small',
      },
      styleOverrides: {
        root: {
          '& .MuiInputBase-root': {
            fontSize: compactComponents.textField.medium.fontSize,
          },
          '& .MuiInputBase-input': {
            padding: compactComponents.textField.medium.padding,
            minHeight: compactComponents.textField.medium.height,
          },
        },
      },
    },
    
    // Card component
    MuiCard: {
      styleOverrides: {
        root: {
          padding: compactComponents.card.padding,
        },
      },
    },
    
    // CardHeader component
    MuiCardHeader: {
      styleOverrides: {
        root: {
          padding: compactComponents.card.headerPadding,
        },
        title: {
          fontSize: compactTypography.h3.fontSize,
          fontWeight: compactTypography.h3.fontWeight,
        },
        subheader: {
          fontSize: compactTypography.body2.fontSize,
        },
      },
    },
    
    // CardContent component
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: compactComponents.card.padding,
          '&:last-child': {
            paddingBottom: compactComponents.card.padding,
          },
        },
      },
    },
    
    // Table components
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: `${compactComponents.tableCell.paddingVertical}px ${compactComponents.tableCell.paddingHorizontal}px`,
          fontSize: compactComponents.tableCell.fontSize,
        },
        head: {
          fontWeight: 600,
        },
      },
    },
    
    // List item component
    MuiListItem: {
      styleOverrides: {
        root: {
          paddingTop: compactComponents.listItem.paddingVertical,
          paddingBottom: compactComponents.listItem.paddingVertical,
          paddingLeft: compactComponents.listItem.paddingHorizontal,
          paddingRight: compactComponents.listItem.paddingHorizontal,
        },
      },
    },
    
    MuiListItemText: {
      styleOverrides: {
        primary: {
          fontSize: compactComponents.listItem.fontSize,
        },
        secondary: {
          fontSize: compactTypography.caption.fontSize,
        },
      },
    },
    
    // IconButton component
    MuiIconButton: {
      styleOverrides: {
        root: {
          padding: compactSpacing.xs,
        },
        sizeSmall: {
          padding: Math.floor(compactSpacing.xs / 2),
          '& svg': {
            fontSize: compactComponents.iconButton.small.iconSize,
          },
        },
        sizeMedium: {
          padding: compactSpacing.xs,
          '& svg': {
            fontSize: compactComponents.iconButton.medium.iconSize,
          },
        },
        sizeLarge: {
          padding: compactSpacing.sm,
          '& svg': {
            fontSize: compactComponents.iconButton.large.iconSize,
          },
        },
      },
    },
    
    // Chip component
    MuiChip: {
      styleOverrides: {
        root: {
          height: 24,
          fontSize: compactTypography.caption.fontSize,
        },
      },
    },
    
    // Input base
    MuiInputBase: {
      styleOverrides: {
        root: {
          fontSize: compactTypography.body1.fontSize,
        },
        input: {
          padding: compactComponents.textField.medium.padding,
        },
      },
    },
  },
};

/**
 * Default export for convenience
 * Can be used as: import compactTheme from './theme/compactTheme'
 */
export default {
  constants: compactThemeConstants,
  muiThemeOptions: compactThemeOptions,
  spacing: compactSpacing,
  typography: compactTypography,
  components: compactComponents,
};
