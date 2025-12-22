# MQTT Explorer Style Guide

Coding standards and patterns for the MQTT Explorer project, optimized for coding agents.

## Code Formatting

**Prettier config:** No semicolons, single quotes, 2 spaces, 120 char max, ES5 trailing commas
**TSLint:** Airbnb base, generic arrays `Array<T>`, explicit access modifiers (`public`/`private`/`protected`)

```typescript
// Format example
const name = 'MQTT Explorer'
const items: Array<string> = []

class Example {
  private client: MqttClient
  public connect(options: MqttOptions) {}
}
```

**Commands:** `yarn lint`, `yarn lint:fix`

## TypeScript

- Strict mode enabled (`noImplicitAny`, `strictNullChecks`)
- Explicit function types: `function name(param: Type): ReturnType {}`
- Avoid `any`, use interfaces for objects, enums for constants
- Type imports: `import type { Type } from './module'`

```typescript
enum ActionTypes {
  CONNECTION_SET_CONNECTING = 'CONNECTION_SET_CONNECTING',
}

interface ConnectionState {
  connected: boolean
  error?: string
}
```

## React Components

**Class components:** Use `React.PureComponent`, type props/state, mark methods `public`/`private`

```typescript
interface Props {
  connectionId: string
  actions: typeof globalActions
}

class App extends React.PureComponent<Props, {}> {
  public render() {
    return <div />
  }
}
```

**Functional components:** Destructure props, use custom hooks, keep under 200 lines

```typescript
function Sidebar(props: Props) {
  const { tree, nodePath } = props
  const node = usePollingToFetchTreeNode(tree, nodePath)
  return <div />
}
```

**Hooks:** Prefix with `use`, place in `hooks/` or `helper/`, always specify `useEffect` dependencies

**Lazy loading:** `const Component = React.lazy(() => import('./Component'))`

**Material-UI:** Use both `ThemeProvider` and `LegacyThemeProvider`, `withStyles` for class components

## State Management (Redux)

**Reducers:** Define state interface, use enums for action types, use `createReducer` helper, return new objects

```typescript
export const reducer = createReducer<State>(initialState, {
  [ActionTypes.ACTION]: (state, action) => ({ ...state, field: value }),
})
```

**Actions:** Use thunk for async, export action creators

```typescript
export const connect = (options: MqttOptions, id: string) =>
  (dispatch: Dispatch<any>, getState: () => AppState) => {
    dispatch(connecting(id))
  }
```

**Connect:** `mapStateToProps`, `mapDispatchToProps` with `bindActionCreators`

## File Organization

```
app/src/
  actions/         # Redux actions
  components/      # React components (PascalCase folders)
  reducers/        # Redux reducers
  hooks/           # Custom hooks
  model/           # Frontend models
  utils/           # Utilities

backend/src/
  Model/           # Core data models
  DataSource/      # MQTT sources

src/
  electron.ts      # Electron main
  server.ts        # Express server
```

**Component structure:**
```
ComponentName/
  index.ts         # Re-exports
  ComponentName.tsx
  SubComponent.tsx
```

**File naming:** Components = PascalCase, utilities = camelCase, tests = `*.spec.ts`, hooks = `useHookName.tsx`

## Naming Conventions

- Variables/functions: `camelCase`
- Classes/interfaces: `PascalCase`
- Constants: `SCREAMING_SNAKE_CASE`
- Booleans: `isX`, `hasX`, `shouldX`, `canX`
- Props/State interfaces: `Props`, `State`

## Testing

**Framework:** Mocha + Chai
**Location:** `app/test/`, `backend/src/spec/`, `src/spec/`, co-located `*.spec.tsx`

```typescript
describe('Component', () => {
  it('does something', () => {
    expect(result).to.eq(expected)
  })
})
```

**Commands:** `yarn test` (all), `yarn test:app`, `yarn test:backend`, `yarn test:ui` (needs build)

## Security

- Never hardcode credentials, use `process.env`
- Validate/sanitize all user input
- Use helmet.js, rate limiting, bcrypt, HTTPS in production
- See [SECURITY.md](SECURITY.md)

## Documentation

- JSDoc for public APIs
- Comments only for complex logic, workarounds, TODOs
- No obvious/redundant comments

## Development

**Workflow:**
- `yarn dev` - Electron dev mode
- `yarn dev:server` - Browser mode with hot reload (port 8080)
- `yarn build` / `yarn build:server`
- `yarn lint` / `yarn lint:fix`

**Git:** Feature branches from `master`, conventional commits (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`)

**Performance:** Use `PureComponent`, throttle/debounce, `React.lazy`, `useCallback`/`useMemo`, avoid inline functions in render

## Architecture

**Event system:** `rendererEvents.emit()`, `rendererEvents.subscribe()`, `rendererEvents.unsubscribe()`

**Data flow:** User Action → Redux → Event System → Backend → MQTT → State Update → Re-render

**MVVM:** Model (`backend/src/Model/`), View (components), ViewModel (`app/src/model/`)

---

**Key principle:** Prioritize clarity and maintainability. When in doubt, follow existing code patterns.
