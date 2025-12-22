# MQTT Explorer Styling Conventions

This document outlines the styling conventions and design patterns used in MQTT Explorer to ensure visual consistency and maintainable code.

## UI Framework

MQTT Explorer uses **Material-UI (MUI)** as its primary UI component library:
- **@mui/material** (v7.3.6) - Core components and theming
- **@mui/icons-material** (v7.3.6) - Icon components
- **@mui/styles** (v6.4.8) - Legacy styling API with `withStyles`
- **@emotion/react** and **@emotion/styled** - CSS-in-JS foundation

## Theming System

### Theme Configuration

The theme is defined in `app/src/theme.ts` and provides both light and dark modes:

```typescript
import { createTheme } from '@mui/material/styles'
import { amber } from '@mui/material/colors'

const baseTheme = {
  typography: {
    allVariants: {
      userSelect: 'none',
    },
    body1: {
      fontSize: '0.9rem',
    },
  },
}

const darkTheme = createTheme({
  ...baseTheme,
  palette: {
    mode: 'dark',
  },
})

const lightTheme = createTheme({
  ...baseTheme,
  palette: {
    mode: 'light',
    background: {
      default: '#fafafa',
    },
    primary: {
      main: '#335C67', // Primary brand color
    },
    secondary: amber,
    action: {
      disabledBackground: '#fafafa',
    },
  },
})
```

### Theme Application

Themes are applied using both modern and legacy theme providers for compatibility:

```typescript
<ThemeProvider theme={theme}>
  <LegacyThemeProvider theme={theme}>
    <App />
  </LegacyThemeProvider>
</ThemeProvider>
```

## Color Usage

### Primary Colors

- **Primary**: `#335C67` - Used for primary actions, app bar, and key UI elements
- **Secondary**: Material-UI `amber` palette - Used for accents and secondary actions

### Accessing Theme Colors

Always use theme palette colors instead of hardcoded values:

```typescript
// ✅ CORRECT - Use theme colors
backgroundColor: theme.palette.background.default
color: theme.palette.text.primary
borderColor: theme.palette.divider

// ❌ AVOID - Hardcoded colors (only when necessary)
backgroundColor: '#fafafa'
```

### Material-UI Color Palettes

Import from `@mui/material/colors` for consistent color choices:

```typescript
import { blueGrey, amber, green, red, orange } from '@mui/material/colors'

// Use with shade levels
backgroundColor: blueGrey[100]  // Light
backgroundColor: blueGrey[300]  // Medium
backgroundColor: blueGrey[700]  // Dark
```

**Common palette imports in the codebase:**
- `blueGrey` - Tree node selections and hover states
- `amber` - Secondary color palette
- `green` - Success states and connection indicators
- `red` - Error states and alerts
- `orange` - Warning states

### Theme-Aware Colors

Use conditional colors based on theme mode:

```typescript
const color = theme.palette.mode === 'light' ? blueGrey[300] : theme.palette.primary.main
```

### Code Editor Color Schemes

Defined in `app/src/components/Sidebar/CodeBlockColors.ts`:

**Light Theme (CodeBlockColors):**
```typescript
{
  text: '#080808',
  background: '#F9F9F9',
  numeric: '#811F24',
  boolean: '#811F24',
  string: '#0B6125',
  variable: '#234A97',
  gutters: '#ebebeb',
}
```

**Dark Theme (CodeBlockColorsBraceMonokai):**
```typescript
{
  text: '#F8F8F2',
  background: '#272822',
  numeric: '#AE81FF',
  boolean: '#AE81FF',
  string: '#E6DB74',
  variable: '#A6E22E',
  gutters: '#2F3129',
}
```

### Chart Colors

Chart colors are defined in `app/src/components/ChartPanel/ChartSettings/colors.ts` using Material-UI color palettes with shades 200, 500, and 700 for variety.

## Typography

### Base Typography

- **Default font size**: `0.9rem` for body text
- **User selection**: Disabled by default (`userSelect: 'none'`) to prevent text selection in UI elements

### Typography Variants

Use Material-UI Typography component with semantic variants:

```typescript
<Typography variant="h6">Heading</Typography>
<Typography variant="body1">Body text</Typography>
<Typography variant="caption">Caption text</Typography>
```

**Common variants in the codebase:**
- `h6` - Section headers, dialog titles
- `h2` - Empty states
- `body1` - Default body text
- `caption` - Small labels and metadata
- `inherit` - Inherit from parent

### Font Size Utilities

Use theme typography utilities for consistent sizing:

```typescript
fontSize: theme.typography.pxToRem(15)  // Converts px to rem
```

### Monospace Fonts

For code blocks, use the following font stack:

```css
font: "12px/normal 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'source-code-pro', monospace"
```

## Spacing and Layout

### Spacing Scale

Use `theme.spacing()` for consistent spacing based on 8px grid:

```typescript
margin: theme.spacing(1)      // 8px
padding: theme.spacing(2)     // 16px
marginLeft: theme.spacing(1.5) // 12px
```

**Common spacing values:**
- `0.25` - 2px (micro spacing)
- `1` - 8px (compact spacing)
- `1.5` - 12px (tree node indentation)
- `2` - 16px (standard padding)
- `3` - 24px (section spacing)

### Layout Patterns

**Full viewport width:**
```typescript
width: '100vw'
```

**Calculated heights (accounting for AppBar):**
```typescript
height: 'calc(100vh - 64px)'  // Full height minus AppBar
```

**Flex layouts:**
```typescript
display: 'flex'
flexGrow: 1
overflow: 'hidden'
```

### Border Radius

Use theme shape for consistent border radius:

```typescript
borderRadius: theme.shape.borderRadius       // Default 4px
borderRadius: `${theme.shape.borderRadius}px`
```

**Custom border radius values:**
- `4px` - Standard for buttons and inputs
- `50%` - Circular elements (indicators, badges)
- `10%` - Key display elements
- `16px` - Demo UI elements

## Component Styling Patterns

### Styling Approach

MQTT Explorer uses **JSS (JavaScript Style Sheets)** via `withStyles` HOC:

```typescript
import { withStyles } from '@mui/styles'
import { Theme } from '@mui/material/styles'

const styles = (theme: Theme) => ({
  root: {
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing(2),
  },
  title: {
    color: theme.palette.text.primary,
    fontSize: theme.typography.pxToRem(15),
  },
})

export default withStyles(styles)(MyComponent)
```

### Inline Styles

Use inline styles sparingly for one-off adjustments:

```typescript
// ✅ ACCEPTABLE - Simple layout adjustments
<div style={{ display: 'flex', padding: '8px' }}>

// ❌ AVOID - Complex or repeated styles
<div style={{ backgroundColor: '#335C67', padding: '16px', ... }}>
```

### Type Assertions for CSS Properties

TypeScript requires explicit type assertions for CSS property values:

```typescript
display: 'block' as 'block'
whiteSpace: 'nowrap' as 'nowrap'
overflow: 'hidden' as 'hidden'
textOverflow: 'ellipsis' as 'ellipsis'
```

### Responsive Breakpoints

Use theme breakpoints for responsive design:

```typescript
[theme.breakpoints.up(750)]: {
  display: 'block',
}
[theme.breakpoints.down('xs')]: {
  display: 'none',
}
```

### Material-UI `sx` Prop

For simple theme-aware styling, use the `sx` prop:

```typescript
<Button sx={{ color: 'primary.contrastText' }}>
  Disconnect
</Button>
```

## Animation and Transitions

### CSS Animations

Define keyframe animations for visual feedback:

```typescript
animationLight: {
  willChange: 'auto',
  translateZ: 0,
  animation: 'updateLight 0.5s',
}
```

### Material-UI Transitions

Use theme transitions for consistent animation timing:

```typescript
transition: theme.transitions.create('transform', {
  easing: theme.transitions.easing.sharp,
  duration: theme.transitions.duration.leavingScreen,
})
```

**Common transition properties:**
- `easing.sharp` - Quick transitions out
- `easing.easeOut` - Smooth transitions in
- `duration.leavingScreen` - Exit animations
- `duration.enteringScreen` - Enter animations

## Hover and Interactive States

### Hover Effects

Use nested selectors for hover states:

```typescript
title: {
  '&:hover': {
    backgroundColor: theme.palette.mode === 'light' 
      ? blueGrey[100] 
      : theme.palette.primary.light,
  },
}
```

### Selection States

Apply distinct background colors for selected items:

```typescript
selected: {
  backgroundColor: (theme.palette.mode === 'light' 
    ? blueGrey[300] 
    : theme.palette.primary.main) + ' !important',
}
```

### Opacity for Interaction Feedback

Use opacity for subtle interactive hints:

```typescript
topicSelect: {
  opacity: 0,  // Hidden until parent hover
  '&:hover': {
    opacity: 1,
  },
}
```

## Layout Components

### Modal Dialogs

Center modals with calculated positioning:

```typescript
root: {
  margin: `calc((100vh - ${height}) / 2) auto 0 auto`,
  minWidth: '800px',
  maxWidth: '850px',
  height: height,
  outline: 'none',
  display: 'flex',
}
```

### Drawers

Use consistent drawer widths and transitions:

```typescript
const drawerWidth = 300

contentShift: {
  transform: `translateX(${drawerWidth}px)`,
  transition: theme.transitions.create('transform', {
    easing: theme.transitions.easing.easeOut,
    duration: theme.transitions.duration.enteringScreen,
  }),
}
```

### Panels and Accordions

Use Material-UI Accordion components with minimal custom styling:

```typescript
<Accordion defaultExpanded={true}>
  <AccordionSummary expandIcon={<ExpandMore />}>
    <Typography>Section Title</Typography>
  </AccordionSummary>
  <AccordionDetails>
    {/* Content */}
  </AccordionDetails>
</Accordion>
```

## Text Styling

### Text Overflow

Handle overflow with ellipsis:

```typescript
overflow: 'hidden' as 'hidden',
textOverflow: 'ellipsis' as 'ellipsis',
whiteSpace: 'nowrap' as 'nowrap',
```

### Text Alignment

```typescript
textAlign: 'center'
whiteSpace: 'nowrap' as 'nowrap'
```

## Common Patterns

### Tree Nodes

```typescript
node: {
  display: 'block',
  width: '100%',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  padding: '1px 0px 0px 0px',
}

subnodes: {
  marginLeft: theme.spacing(1.5),  // 12px indentation
}
```

### Buttons

```typescript
// Primary action
<Button variant="contained" color="primary">
  Submit
</Button>

// Secondary action
<Button variant="outlined" color="primary">
  Cancel
</Button>

// Text button
<Button>
  Learn More
</Button>
```

### Icon Sizing

```typescript
// Inherit from parent
<Icon fontSize="inherit" />

// Inline size
<Icon style={{ fontSize: '16px' }} />
<Icon style={{ fontSize: '20px' }} />
```

## Best Practices

### DO

✅ Use theme variables for colors, spacing, and typography
✅ Use `withStyles` HOC for component-specific styles
✅ Use Material-UI components and their built-in props
✅ Use `theme.palette.mode` for theme-conditional styling
✅ Use `theme.spacing()` for consistent spacing
✅ Import Material-UI color palettes for extended colors
✅ Use TypeScript type assertions for CSS property values
✅ Use theme transitions for animations
✅ Keep styles co-located with components

### DON'T

❌ Don't hardcode colors (use theme palette)
❌ Don't use arbitrary spacing values (use theme.spacing)
❌ Don't create global CSS files
❌ Don't use pixel values without theme utilities
❌ Don't bypass theme for responsive breakpoints
❌ Don't duplicate style definitions across components
❌ Don't use inline styles for complex or repeated patterns

## Tools and Resources

### MUI Documentation

- [Material-UI Components](https://mui.com/material-ui/getting-started/)
- [Material-UI Styling](https://mui.com/system/styles/basics/)
- [Color System](https://mui.com/material-ui/customization/color/)
- [Theming](https://mui.com/material-ui/customization/theming/)

### Testing Styles

When modifying styles:
1. Test in both light and dark themes
2. Check responsive behavior at different screen sizes
3. Verify hover and interactive states
4. Ensure accessibility (color contrast, focus states)

## Related Documentation

- [README.md](./Readme.md) - Project overview and setup
- [BROWSER_MODE.md](./BROWSER_MODE.md) - Browser mode specific information
- [.github/agents/copilot-instructions.md](./.github/agents/copilot-instructions.md) - GitHub Copilot instructions
