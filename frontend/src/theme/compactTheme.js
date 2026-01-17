/**
 * Compact Theme Configuration
 * 
 * This module exports a compact theme configuration that reduces UI density
 * by decreasing typography sizes, component spacing, and border radii.
 * 
 * Note: This project doesn't use Material-UI, so this is a conceptual theme object
 * that could be used if MUI were to be integrated in the future, or as a reference
 * for the compact design system.
 * 
 * Usage:
 * - The compact.css file applies these values through CSS custom properties
 * - This JS module serves as documentation and could be used for programmatic theming
 * - Import and use for any JS-based dynamic styling needs
 */

const compactTheme = {
  // Typography settings - reduced sizes for denser UI
  typography: {
    fontSize: 14, // Base font size reduced from typical 16px
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    
    h1: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h2: {
      fontSize: '1.2rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h4: {
      fontSize: '0.95rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '0.85rem',
      lineHeight: 1.4,
    },
    body2: {
      fontSize: '0.75rem',
      lineHeight: 1.4,
    },
    caption: {
      fontSize: '0.7rem',
      lineHeight: 1.3,
    },
  },
  
  // Spacing scale - reduced from typical 8px base to 4px base
  spacing: {
    unit: 4, // Base spacing unit
    xs: 4,   // Extra small
    sm: 6,   // Small
    md: 8,   // Medium
    lg: 12,  // Large
    xl: 16,  // Extra large
  },
  
  // Component-specific compact defaults (MUI-style configuration)
  components: {
    Button: {
      defaultProps: {
        size: 'small',
      },
      styleOverrides: {
        root: {
          padding: '5px 10px',
          fontSize: '0.75rem',
          borderRadius: 0,
          textTransform: 'none',
          fontWeight: 500,
        },
        small: {
          padding: '4px 8px',
          fontSize: '0.7rem',
        },
      },
    },
    
    TextField: {
      defaultProps: {
        size: 'small',
        margin: 'dense',
      },
      styleOverrides: {
        root: {
          '& input': {
            padding: '5px 8px',
            fontSize: '0.75rem',
          },
        },
      },
    },
    
    Card: {
      styleOverrides: {
        root: {
          padding: '10px',
          borderRadius: 0,
        },
      },
    },
    
    TableCell: {
      styleOverrides: {
        root: {
          padding: '6px 8px',
          fontSize: '0.75rem',
        },
        head: {
          padding: '6px 8px',
          fontSize: '0.7rem',
          fontWeight: 600,
        },
      },
    },
    
    ListItem: {
      styleOverrides: {
        root: {
          paddingTop: '6px',
          paddingBottom: '6px',
        },
      },
    },
    
    IconButton: {
      defaultProps: {
        size: 'small',
      },
      styleOverrides: {
        root: {
          padding: '4px',
        },
      },
    },
  },
  
  // Border radius - completely square for most compact appearance
  shape: {
    borderRadius: 0, // No border radius for maximum density and sharp edges
  },
  
  // Breakpoints for responsive compact mode
  breakpoints: {
    xs: 0,
    sm: 600,
    md: 900,
    lg: 1200,
    xl: 1536,
  },
};

// Helper function to apply spacing based on multiplier
export const getSpacing = (multiplier = 1) => {
  return `${compactTheme.spacing.unit * multiplier}px`;
};

// Helper function to get typography style
export const getTypography = (variant = 'body1') => {
  return compactTheme.typography[variant] || compactTheme.typography.body1;
};

// Export the theme as default
export default compactTheme;
