# MQTT Explorer Styling Conventions

This document outlines the styling conventions used in MQTT Explorer for visual consistency and maintainable code.

## UI Framework

Material-UI (MUI) with JSS styling via `withStyles` HOC.

**Stack:**
- `@mui/material` - Core components and theming
- `@mui/icons-material` - Icons
- `@mui/styles` - JSS styling with `withStyles`
- `@emotion/react` & `@emotion/styled` - CSS-in-JS foundation

## Theming

**Location:** `app/src/theme.ts`

**Configuration:**
- Light and dark modes supported
- Primary color: `#335C67` (teal/blue-green)
- Secondary: Material-UI `amber` palette
- Base typography: `0.9rem`, `userSelect: 'none'`

**Application:**
```typescript
<ThemeProvider theme={theme}>
  <LegacyThemeProvider theme={theme}>
    <App />
  </LegacyThemeProvider>
</ThemeProvider>
```

## Colors

**Access theme colors:**
```typescript
backgroundColor: theme.palette.background.default
color: theme.palette.text.primary
borderColor: theme.palette.divider
```

**Material-UI palettes:**
```typescript
import { blueGrey, amber, green, red, orange } from '@mui/material/colors'
backgroundColor: blueGrey[100]  // Light shade
backgroundColor: blueGrey[700]  // Dark shade
```

**Theme-conditional:**
```typescript
const color = theme.palette.mode === 'light' ? blueGrey[300] : theme.palette.primary.main
```

**Code editor colors:** Defined in `app/src/components/Sidebar/CodeBlockColors.ts`

## Typography

**Variants:**
```typescript
<Typography variant="h6">Heading</Typography>
<Typography variant="body1">Body text</Typography>
<Typography variant="caption">Caption</Typography>
```

**Font sizes:**
```typescript
fontSize: theme.typography.pxToRem(15)
```

**Monospace:** `"12px/normal 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'source-code-pro', monospace"`

## Spacing

**8px grid system:**
```typescript
margin: theme.spacing(1)      // 8px
padding: theme.spacing(2)     // 16px
marginLeft: theme.spacing(1.5) // 12px (tree indentation)
```

**Border radius:**
```typescript
borderRadius: theme.shape.borderRadius  // 4px default
```

## Component Styling

**Primary approach - withStyles HOC:**
```typescript
import { withStyles } from '@mui/styles'
import { Theme } from '@mui/material/styles'

const styles = (theme: Theme) => ({
  root: {
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing(2),
  },
})

export default withStyles(styles)(MyComponent)
```

**Type assertions:**
```typescript
display: 'block' as 'block'
whiteSpace: 'nowrap' as 'nowrap'
overflow: 'hidden' as 'hidden'
```

**Responsive:**
```typescript
[theme.breakpoints.up(750)]: {
  display: 'block',
}
```

**sx prop (simple cases):**
```typescript
<Button sx={{ color: 'primary.contrastText' }}>Text</Button>
```

## Animations

**CSS animations:**
```typescript
animation: 'updateLight 0.5s'
```

**Theme transitions:**
```typescript
transition: theme.transitions.create('transform', {
  easing: theme.transitions.easing.sharp,
  duration: theme.transitions.duration.leavingScreen,
})
```

## Interactive States

**Hover:**
```typescript
'&:hover': {
  backgroundColor: theme.palette.mode === 'light' 
    ? blueGrey[100] 
    : theme.palette.primary.light,
}
```

**Selection:**
```typescript
selected: {
  backgroundColor: (theme.palette.mode === 'light' 
    ? blueGrey[300] 
    : theme.palette.primary.main) + ' !important',
}
```

## Common Patterns

**Tree nodes:**
```typescript
node: {
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
}
subnodes: {
  marginLeft: theme.spacing(1.5),
}
```

**Buttons:**
```typescript
<Button variant="contained" color="primary">Submit</Button>
<Button variant="outlined" color="primary">Cancel</Button>
<Button>Learn More</Button>
```

**Icons:**
```typescript
<Icon fontSize="inherit" />
<Icon style={{ fontSize: '16px' }} />
```

## Best Practices

**DO:**
✅ Use theme variables (`theme.palette.*`, `theme.spacing()`, `theme.typography.*`)
✅ Use `withStyles` HOC for component styles
✅ Use `theme.palette.mode` for light/dark conditional styling
✅ Import Material-UI color palettes for extended colors
✅ Keep styles co-located with components

**DON'T:**
❌ Hardcode colors or spacing values
❌ Create global CSS files
❌ Duplicate style definitions
❌ Use inline styles for complex patterns

## Resources

- [Material-UI Documentation](https://mui.com/material-ui/getting-started/)
- [Color System](https://mui.com/material-ui/customization/color/)
- [Theming Guide](https://mui.com/material-ui/customization/theming/)

**Testing:** Verify in both light/dark themes, check responsive behavior, ensure accessibility.

## Related

- [README.md](./Readme.md) - Project overview
- [BROWSER_MODE.md](./BROWSER_MODE.md) - Browser mode
- [.github/copilot-instructions.md](./.github/copilot-instructions.md) - Copilot instructions
