# MQTT Explorer Style Guide

This document defines the coding standards, design patterns, and best practices for the MQTT Explorer project. Following these guidelines ensures consistency, maintainability, and quality across the codebase.

## Table of Contents

1. [Code Formatting](#code-formatting)
2. [TypeScript Conventions](#typescript-conventions)
3. [React Component Patterns](#react-component-patterns)
4. [State Management](#state-management)
5. [File Organization](#file-organization)
6. [Naming Conventions](#naming-conventions)
7. [Testing](#testing)
8. [Security](#security)
9. [Documentation](#documentation)
10. [Build and Development](#build-and-development)

## Code Formatting

### Prettier Configuration

The project uses Prettier for automatic code formatting with the following configuration:

```javascript
{
  trailingComma: 'es5',
  tabWidth: 2,
  semi: false,              // No semicolons
  singleQuote: true,        // Single quotes for strings
  printWidth: 120,          // Max line length 120 characters
  arrowParens: 'avoid',     // Omit parens when possible
}
```

**Key Rules:**
- **No semicolons** at the end of statements
- **Single quotes** for strings (except in JSX where double quotes are used)
- **2 spaces** for indentation (never tabs)
- **120 characters** maximum line length
- **ES5 trailing commas** in objects and arrays
- **Arrow function parens** only when necessary

**Examples:**
```typescript
// ✅ Good
const name = 'MQTT Explorer'
const config = {
  port: 3000,
  host: 'localhost',
}

// ❌ Bad
const name = "MQTT Explorer";
const config = {
  port: 3000,
  host: 'localhost'  // Missing trailing comma
};
```

### TSLint Rules

Based on Airbnb style guide with customizations:

- **Array types:** Use generic syntax `Array<T>` instead of `T[]`
- **Member access:** Always specify access modifiers (`public`, `private`, `protected`)
- **Import organization:** Group and order imports logically
- **No implicit dependencies:** Explicitly declare all dependencies

**Examples:**
```typescript
// ✅ Good - Generic array syntax
const topics: Array<string> = []
const nodes: Array<TreeNode<ViewModel>> = []

// ❌ Bad - Array bracket syntax
const topics: string[] = []

// ✅ Good - Explicit access modifiers
class MqttSource {
  private client: MqttClient
  public connect(options: MqttOptions) {}
}

// ❌ Bad - Missing access modifiers
class MqttSource {
  client: MqttClient
  connect(options: MqttOptions) {}
}
```

### Linting Commands

```bash
# Check all linting issues
yarn lint

# Auto-fix linting issues
yarn lint:fix

# Individual linters
yarn lint:prettier        # Check formatting
yarn lint:prettier:fix    # Fix formatting
yarn lint:tslint          # Check TypeScript
yarn lint:tslint:fix      # Fix TypeScript issues
yarn lint:spellcheck      # Check spelling
```

## TypeScript Conventions

### Strict Type Checking

The project uses strict TypeScript configuration:

```json
{
  "noImplicitAny": true,
  "strictNullChecks": true,
  "strict": true,
  "target": "ES2020",
  "module": "commonjs"
}
```

**Always:**
- Explicitly type function parameters and return types
- Use strict null checks (`value: Type | undefined`)
- Avoid `any` type unless absolutely necessary
- Use interfaces for object shapes
- Use enums for action types and constants

**Examples:**
```typescript
// ✅ Good - Explicit types
interface ConnectionState {
  host?: string
  connected: boolean
  error?: string
}

function connect(options: MqttOptions): DataSourceStateMachine {
  // Implementation
}

// ❌ Bad - Implicit any
function connect(options) {
  // Implementation
}

// ✅ Good - Null checks
function processNode(node: TreeNode | undefined) {
  if (!node) return
  // Use node safely
}
```

### Type Imports

Use `import type` for type-only imports when possible to improve tree-shaking:

```typescript
// ✅ Good
import type { MqttOptions } from './DataSource'
import { connect } from './mqtt'

// Also acceptable for mixed imports
import { type MqttOptions, connect } from './mqtt'
```

### Enums for Constants

Use enums for action types, states, and other constant values:

```typescript
// ✅ Good
export enum ActionTypes {
  CONNECTION_SET_CONNECTING = 'CONNECTION_SET_CONNECTING',
  CONNECTION_SET_CONNECTED = 'CONNECTION_SET_CONNECTED',
  CONNECTION_SET_DISCONNECTED = 'CONNECTION_SET_DISCONNECTED',
}

export type ConnectionHealth = 'offline' | 'online' | 'connecting'
```

## React Component Patterns

### Component Types

#### Class Components

Use `React.PureComponent` for class components to enable shallow prop comparison:

```typescript
interface Props {
  connectionId: string
  settingsVisible: boolean
  actions: typeof globalActions
}

class App extends React.PureComponent<Props, {}> {
  constructor(props: Props) {
    super(props)
    this.state = {}
  }

  public componentDidMount() {
    // Initialization
  }

  public render() {
    return <div>{/* content */}</div>
  }
}
```

**Key Points:**
- Use `React.PureComponent` instead of `React.Component`
- Always type props interface
- Use empty object `{}` for state if no local state
- Mark lifecycle methods as `public`
- Mark helper methods as `private`

#### Functional Components

Prefer functional components with hooks for new code:

```typescript
interface Props {
  nodePath?: string
  tree?: q.Tree<TopicViewModel>
  connectionId?: string
}

function Sidebar(props: Props) {
  const { tree, nodePath } = props
  const node = usePollingToFetchTreeNode(tree, nodePath || '')
  
  return <div>{/* content */}</div>
}
```

**Key Points:**
- Destructure props early for clarity
- Use custom hooks for reusable logic
- Keep components focused and small (<200 lines)

### Hooks Patterns

#### Custom Hooks

Place custom hooks in `app/src/components/hooks/` or `app/src/components/helper/`:

```typescript
// usePollingToFetchTreeNode.tsx
export function usePollingToFetchTreeNode(
  tree?: q.Tree<TopicViewModel>,
  nodePath?: string
): q.TreeNode<TopicViewModel> | undefined {
  const [node, setNode] = useState<q.TreeNode<TopicViewModel> | undefined>()
  
  useEffect(() => {
    // Implementation
  }, [tree, nodePath])
  
  return node
}
```

**Key Points:**
- Prefix hook names with `use`
- Place hooks in separate files
- Document complex hooks with JSDoc comments
- Always specify dependencies array in `useEffect`

#### Effect Hooks

Use throttling for performance-critical updates:

```typescript
function useUpdateNodeWhenNodeReceivesUpdates(node?: q.TreeNode<any>) {
  const [, setLastUpdate] = useState(0)
  const updateNode = useCallback(
    throttle(() => {
      setLastUpdate(node ? node.lastUpdate : 0)
    }, 300),
    [node]
  )

  useEffect(() => {
    node?.onMerge.subscribe(updateNode)
    node?.onMessage.subscribe(updateNode)
    
    return () => {
      node?.onMerge.unsubscribe(updateNode)
      node?.onMessage.unsubscribe(updateNode)
    }
  }, [node])
}
```

### Lazy Loading

Use `React.lazy` for code splitting large components:

```typescript
const Settings = React.lazy(() => import('./SettingsDrawer/Settings'))
const ContentView = React.lazy(() => import('./Layout/ContentView'))

// In render:
<React.Suspense fallback={<div></div>}>
  <Settings />
</React.Suspense>
```

### Material-UI Integration

#### Theming

Use both legacy and new theme providers for compatibility:

```typescript
import { ThemeProvider } from '@mui/material/styles'
import { ThemeProvider as LegacyThemeProvider } from '@mui/styles'

<ThemeProvider theme={theme}>
  <LegacyThemeProvider theme={theme}>
    <App />
  </LegacyThemeProvider>
</ThemeProvider>
```

#### Styling

Use Material-UI `withStyles` for class-based components:

```typescript
const styles = (theme: Theme) => ({
  drawer: {
    display: 'block' as 'block',
  },
  details: {
    padding: '0px 16px 8px 8px',
    display: 'block',
  },
})

export default withStyles(styles)(Sidebar)
```

**Key Points:**
- Define styles as a function taking `theme` parameter
- Use type assertions for specific CSS values: `'block' as 'block'`
- Keep styles close to component usage

## State Management

### Redux Pattern

The project uses Redux with thunk middleware for async actions.

#### Reducer Pattern

```typescript
import { createReducer } from './lib'

export interface ConnectionState {
  connected: boolean
  connecting: boolean
  error?: string
}

export enum ActionTypes {
  CONNECTION_SET_CONNECTING = 'CONNECTION_SET_CONNECTING',
  CONNECTION_SET_CONNECTED = 'CONNECTION_SET_CONNECTED',
}

export type Action = SetConnecting | SetConnected

const initialState: ConnectionState = {
  connected: false,
  connecting: false,
}

export const connectionReducer = createReducer<ConnectionState>(initialState, {
  [ActionTypes.CONNECTION_SET_CONNECTING]: (state, action) => ({
    ...state,
    connecting: true,
  }),
  [ActionTypes.CONNECTION_SET_CONNECTED]: (state, action) => ({
    ...state,
    connected: true,
    connecting: false,
  }),
})
```

**Key Points:**
- Define state interface
- Use enums for action types
- Create union type for all actions
- Use `createReducer` helper
- Return new state objects (immutability)

#### Action Creators

```typescript
export const connect =
  (options: MqttOptions, connectionId: string) =>
  (dispatch: Dispatch<any>, getState: () => AppState) => {
    dispatch(connecting(connectionId))
    rendererEvents.emit(addMqttConnectionEvent, { options, id: connectionId })
    
    const event = makeConnectionStateEvent(connectionId)
    rendererEvents.subscribe(event, dataSourceState => {
      if (dataSourceState.connected) {
        dispatch(connected(tree, host))
      }
    })
  }
```

**Key Points:**
- Export thunk action creators for async operations
- Use `dispatch` and `getState` from thunk middleware
- Chain multiple dispatches as needed
- Handle subscriptions in action creators

#### Connecting Components

```typescript
const mapStateToProps = (state: AppState) => ({
  tree: state.connection.tree,
  nodePath: state.tree.get('selectedTopic')?.path(),
})

const mapDispatchToProps = (dispatch: any) => ({
  actions: bindActionCreators(sidebarActions, dispatch),
})

export default connect(mapStateToProps, mapDispatchToProps)(Sidebar)
```

## File Organization

### Project Structure

```
MQTT-Explorer/
├── app/                      # Frontend React application
│   ├── src/
│   │   ├── actions/          # Redux actions
│   │   ├── components/       # React components
│   │   │   ├── ComponentName/
│   │   │   │   ├── index.tsx           # Main component
│   │   │   │   ├── SubComponent.tsx    # Sub-components
│   │   │   │   └── styles.ts           # Component styles (if needed)
│   │   ├── contexts/         # React contexts
│   │   ├── decoders/         # Message decoders
│   │   ├── effects/          # Side effects
│   │   ├── hooks/            # Custom React hooks
│   │   ├── model/            # Frontend models
│   │   ├── reducers/         # Redux reducers
│   │   └── utils/            # Utility functions
│   ├── test/                 # Frontend tests
│   └── webpack.config.js
├── backend/                  # Backend data models and logic
│   ├── src/
│   │   ├── DataSource/       # MQTT data sources
│   │   ├── Model/            # Core data models
│   │   └── spec/             # Backend tests
├── events/                   # Event system (IPC, Socket.IO)
├── src/                      # Electron and server entry points
│   ├── electron.ts           # Electron main process
│   ├── server.ts             # Express server for browser mode
│   └── spec/                 # Integration tests
├── scripts/                  # Build and utility scripts
└── docs/                     # Documentation
```

### Component Organization

Group related components in folders:

```
components/
├── Sidebar/
│   ├── index.ts              # Re-exports
│   ├── Sidebar.tsx           # Main component
│   ├── Panel.tsx             # Sub-component
│   ├── TopicPanel/           # Nested component group
│   │   └── TopicPanel.tsx
│   └── ValueRenderer/
│       └── ValuePanel.tsx
```

**Key Points:**
- One component per file
- Use `index.ts` for re-exports
- Group related components in folders
- Keep component files under 200 lines
- Split large components into smaller ones

### File Naming

- **Components:** PascalCase (e.g., `Sidebar.tsx`, `ConnectionSetup.tsx`)
- **Utilities:** camelCase (e.g., `browserMode.ts`, `tracking.ts`)
- **Types/Interfaces:** PascalCase files (e.g., `ConnectionOptions.ts`)
- **Tests:** `*.spec.ts` or `*.spec.tsx` (e.g., `Tree.spec.ts`)
- **Hooks:** camelCase with `use` prefix (e.g., `usePollingToFetchTreeNode.tsx`)

## Naming Conventions

### Variables and Functions

```typescript
// ✅ Good - camelCase
const connectionId = 'abc123'
const mqttOptions = { url: 'mqtt://localhost' }

function handleNewData(msg: MqttMessage) {
  // Implementation
}

// ❌ Bad
const ConnectionId = 'abc123'
const mqtt_options = { url: 'mqtt://localhost' }
```

### Classes and Interfaces

```typescript
// ✅ Good - PascalCase
class MqttSource implements DataSource<MqttOptions> {}

interface ConnectionState {
  connected: boolean
}

// ❌ Bad
class mqttSource {}
interface connectionState {}
```

### Constants and Enums

```typescript
// ✅ Good - SCREAMING_SNAKE_CASE for constants
const MAX_FILE_SIZE = 16 * 1024 * 1024
const DEFAULT_PORT = 3000

// ✅ Good - PascalCase for enums
enum ActionTypes {
  CONNECTION_SET_CONNECTING = 'CONNECTION_SET_CONNECTING',
}
```

### React Props and State

```typescript
// ✅ Good - Interfaces named Props and State
interface Props {
  connectionId: string
  tree?: q.Tree<TopicViewModel>
}

interface State {
  isExpanded: boolean
}
```

### Boolean Variables

Prefix boolean variables with `is`, `has`, `should`, or `can`:

```typescript
// ✅ Good
const isConnected = true
const hasError = false
const shouldUpdate = true
const canPublish = false

// ❌ Bad
const connected = true
const error = false
```

## Testing

### Test Organization

- **Frontend tests:** `app/test/` or co-located `*.spec.tsx`
- **Backend tests:** `backend/src/Model/spec/` or `backend/src/spec/`
- **Integration tests:** `src/spec/`

### Testing Framework

Uses Mocha with Chai assertions:

```typescript
import 'mocha'
import { expect } from 'chai'
import { Tree } from '../'
import { makeTreeNode } from './makeTreeNode'

describe('Tree', () => {
  it('node can be merged into a tree', () => {
    const tree = new Tree()
    const leaf = makeTreeNode('foo/bar')

    tree.updateWithNode(leaf.firstNode())
    const expectedNode = tree.findNode('foo/bar')

    expect(expectedNode).to.eq(leaf)
  })
  
  it('handles empty nodes', () => {
    const tree = new Tree()
    const result = tree.findNode('nonexistent')
    
    expect(result).to.be.undefined
  })
})
```

**Key Points:**
- Use `describe` for test suites
- Use `it` for individual tests
- Write descriptive test names
- Test both success and error cases
- Use `expect` from Chai for assertions
- Keep tests focused and isolated

### Running Tests

```bash
# All tests
yarn test

# Frontend tests only
yarn test:app

# Backend tests only
yarn test:backend

# UI tests (requires build)
yarn build
yarn test:ui

# All tests including demo video
yarn build
yarn test:all
```

### Test Coverage

- Aim for high coverage of business logic
- Focus on critical paths
- Test edge cases and error handling
- Mock external dependencies (MQTT, file system, etc.)

## Security

### Authentication

**Never** hardcode credentials:

```typescript
// ✅ Good
const username = process.env.MQTT_EXPLORER_USERNAME
const password = process.env.MQTT_EXPLORER_PASSWORD

// ❌ Bad
const username = 'admin'
const password = 'password123'
```

### Input Validation

Always validate and sanitize user input:

```typescript
// ✅ Good
function sanitizeFilename(filename: string): string {
  if (!filename || typeof filename !== 'string') {
    throw new Error('Invalid filename')
  }
  
  const sanitized = filename.replace(/[/\\]/g, '').replace(/\0/g, '')
  
  if (sanitized.includes('..') || sanitized.startsWith('.')) {
    throw new Error('Invalid filename: directory traversal not allowed')
  }
  
  return sanitized
}

// ❌ Bad
function processFile(filename: string) {
  // Directly using user input without validation
  fs.readFile(filename, ...)
}
```

### Security Best Practices

1. **Use helmet.js** for HTTP security headers
2. **Implement rate limiting** for authentication endpoints
3. **Validate all file paths** against traversal attacks
4. **Use bcrypt** for password hashing
5. **Implement constant-time comparison** for credentials
6. **Set proper CORS policies**
7. **Use HTTPS in production**
8. **Keep dependencies updated** (`yarn audit`)

See [SECURITY.md](SECURITY.md) for comprehensive security guidelines.

## Documentation

### Code Comments

Use comments sparingly and only when necessary:

```typescript
// ✅ Good - Explaining complex logic
/**
 * Validates and sanitizes file paths to prevent path traversal attacks
 * @param filename The filename to validate
 * @returns Sanitized filename or throws error if invalid
 */
function sanitizeFilename(filename: string): string {
  // Implementation
}

// ❌ Bad - Stating the obvious
// Set connected to true
this.connected = true
```

**When to comment:**
- Complex algorithms or business logic
- Non-obvious workarounds or hacks
- API documentation (JSDoc)
- TODOs for future improvements

**When NOT to comment:**
- Self-explanatory code
- Redundant information
- Outdated or incorrect comments (remove them!)

### JSDoc for Public APIs

Document public APIs with JSDoc:

```typescript
/**
 * Connects to an MQTT broker with the specified options
 * @param options Connection configuration including URL, credentials, and TLS settings
 * @returns DataSourceStateMachine for tracking connection state
 * @throws Error if URL is invalid or connection fails
 */
public connect(options: MqttOptions): DataSourceStateMachine {
  // Implementation
}
```

### README and Documentation

- Keep README.md up-to-date with setup instructions
- Document new features in Changelog.md
- Add usage examples for complex features
- Link to relevant documentation files

## Build and Development

### Development Workflow

```bash
# Desktop app development
yarn dev                    # Start Electron in dev mode

# Browser mode development
yarn dev:server            # Start with hot reload (localhost:8080)

# Building
yarn build                 # Build desktop app
yarn build:server          # Build browser mode

# Testing
yarn test                  # Run unit tests
yarn lint                  # Check linting
yarn lint:fix              # Auto-fix linting issues
```

### Code Quality Checklist

Before committing:

- [ ] Run `yarn lint` - No linting errors
- [ ] Run `yarn test` - All tests pass
- [ ] Run `yarn build` - Build succeeds
- [ ] Code follows style guide
- [ ] Added tests for new features
- [ ] Updated documentation if needed
- [ ] No console.log() statements in production code
- [ ] No commented-out code
- [ ] Security considerations addressed

### Git Workflow

- Create feature branches from `master`
- Use conventional commit messages:
  - `feat:` for new features
  - `fix:` for bug fixes
  - `docs:` for documentation
  - `refactor:` for code refactoring
  - `test:` for test changes
  - `chore:` for build/tooling changes

### Performance Considerations

- Use `React.PureComponent` for class components
- Implement `shouldComponentUpdate` when necessary
- Use `React.memo` for functional components if needed
- Throttle/debounce expensive operations
- Use `React.lazy` for code splitting
- Avoid inline function definitions in render
- Use `useCallback` and `useMemo` appropriately

```typescript
// ✅ Good - Throttled updates
const updateNode = useCallback(
  throttle(() => {
    setLastUpdate(node ? node.lastUpdate : 0)
  }, 300),
  [node]
)

// ❌ Bad - Updates on every render
const updateNode = () => {
  setLastUpdate(node ? node.lastUpdate : 0)
}
```

## Architecture Patterns

### Event System

The project uses a custom event system for IPC and WebSocket communication:

```typescript
import { rendererEvents, addMqttConnectionEvent } from '../../../events'

// Emit events
rendererEvents.emit(addMqttConnectionEvent, { options, id: connectionId })

// Subscribe to events
rendererEvents.subscribe(event, callback)

// Unsubscribe
rendererEvents.unsubscribe(event, callback)
```

### Data Flow

```
User Action → Redux Action → Event System → Backend → MQTT Broker
                ↓
         Redux State Update
                ↓
         Component Re-render
```

### Model-View-ViewModel (MVVM)

- **Model:** `backend/src/Model/` - Tree data structure, nodes
- **View:** React components in `app/src/components/`
- **ViewModel:** `app/src/model/TopicViewModel.ts` - View-specific data

## Summary

This style guide ensures:

- **Consistency:** All code follows the same patterns
- **Maintainability:** Easy to understand and modify
- **Quality:** High standards for testing and security
- **Performance:** Optimized rendering and data flow
- **Developer Experience:** Clear conventions and tooling

When in doubt, look at existing code in the project for examples, and always prioritize clarity and maintainability over cleverness.

For questions or suggestions about this style guide, please open an issue on GitHub.
