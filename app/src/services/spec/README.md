# LLM Testing Strategy

This directory contains comprehensive tests for the LLM (Large Language Model) integration in MQTT Explorer.

## Quick Start

**Run offline tests (default):**
```bash
cd app && yarn test
```

**Run live tests with API key:**
```bash
# Using the helper script (recommended)
OPENAI_API_KEY=sk-your-key ./scripts/run-llm-tests.sh

# Or manually
export OPENAI_API_KEY=sk-your-key
export RUN_LLM_TESTS=true
cd app && yarn test
```

For detailed test results and examples, see [docs/LLM_TEST_RESULTS.md](../../../docs/LLM_TEST_RESULTS.md).

## Test Structure

### 1. Unit Tests (`llmService.spec.ts`)
Tests for individual LLM service methods:
- `parseResponse()` - Extracting proposals from LLM responses
- `getQuickSuggestions()` - Generating default question suggestions
- `hasApiKey()` - API key availability checking

**Run with:**
```bash
cd app && yarn test
```

### 2. Proposal Validation Tests (`llmProposals.spec.ts`)
Qualitative tests that validate proposal structure and content:
- Topic format validation (no wildcards, valid segments)
- Payload validation (JSON parsing, system-specific formats)
- QoS validation (0, 1, or 2)
- Description quality (actionable, clear)
- System-specific patterns (zigbee2mqtt, Home Assistant, Tasmota, homie)
- Security validation (no injection attempts, size limits)

**Run with:**
```bash
cd app && yarn test
```

### 3. Live LLM Integration Tests (`llmIntegration.spec.ts`)
Optional tests that make real API calls to validate LLM behavior:
- Home automation system detection
- Proposal quality with real LLM responses
- Question generation quality
- Edge cases and complex scenarios

**Requirements:**
- OpenAI API key (or Gemini API key)
- Opt-in via environment variable

**Run with:**
```bash
# Set your API key
export OPENAI_API_KEY=sk-your-key-here
# Or use Gemini
export GEMINI_API_KEY=your-key-here

# Opt-in to live tests
export RUN_LLM_TESTS=true

# Run tests
cd app && yarn test
```

## Testing Framework

**Framework:** Mocha + Chai

**Why Mocha:**
- Already established in the project
- Excellent async/await support
- Flexible test organization
- Good assertion library (Chai)
- No additional dependencies needed

**Alternatives Considered:**
- Jest: Would require migration of existing tests
- Vitest: Modern but adds new dependency
- AVA: Less common, smaller ecosystem

**Decision:** Stick with existing Mocha framework for consistency.

## Test Categories

### Offline Tests (Default)
- No API key required
- Fast execution
- Deterministic results
- Suitable for CI/CD pipelines

### Online Tests (Opt-in)
- Requires API key
- Tests real LLM behavior
- Variable execution time
- API costs apply
- Best for manual validation

## Validation Criteria

### Topic Validation
✅ Non-empty string  
✅ No wildcards (`+` or `#`)  
✅ Valid segments (no empty segments)  
✅ Matches system patterns (zigbee2mqtt, homeassistant, etc.)  

### Payload Validation
✅ Valid JSON (if JSON format)  
✅ Appropriate for target system  
✅ Reasonable size (< 10KB)  
✅ No security risks  

### QoS Validation
✅ Must be 0, 1, or 2  
✅ Typically 0 for home automation  

### Description Validation
✅ Non-empty  
✅ Actionable (uses imperative verbs)  
✅ Clear and concise  
✅ Under 100 characters  

## Home Automation System Patterns

### zigbee2mqtt
- **Topics:** `zigbee2mqtt/device_name/set`
- **Payloads:** JSON objects, e.g., `{"state": "ON"}`
- **Actions:** state, brightness, color, etc.

### Home Assistant
- **Topics:** `homeassistant/light/device/set`
- **Payloads:** JSON or simple values
- **Actions:** ON/OFF, brightness, color_temp

### Tasmota
- **Topics:** `cmnd/device/POWER`
- **Payloads:** Simple strings, e.g., `ON`, `OFF`, `TOGGLE`
- **Actions:** Power control, configuration

### Homie
- **Topics:** `homie/device-id/node/property/set`
- **Payloads:** Property-specific
- **Actions:** Property updates

## Environment Variables

### Required for Live Tests
```bash
# At least one API key
OPENAI_API_KEY=sk-...
# Or
GEMINI_API_KEY=AIza...
# Or generic
LLM_API_KEY=...

# Opt-in flag
RUN_LLM_TESTS=true
```

### Optional
```bash
# Provider selection (default: openai)
LLM_PROVIDER=openai  # or 'gemini'

# Token limits (increased default for better device detection)
LLM_NEIGHBORING_TOPICS_TOKEN_LIMIT=500
```

## Running Tests

### All Tests (Offline only)
```bash
yarn test
```

### Specific Test File
```bash
cd app && yarn mocha src/services/spec/llmService.spec.ts
```

### With Live LLM Tests
```bash
RUN_LLM_TESTS=true OPENAI_API_KEY=sk-... yarn test
```

### Watch Mode (Development)
```bash
cd app && yarn mocha --watch src/services/spec/*.spec.ts
```

## CI/CD Integration

In CI/CD pipelines:
1. Run offline tests by default (no API key needed)
2. Optionally run live tests on schedule (e.g., nightly)
3. Use secrets management for API keys
4. Monitor API costs

Example GitHub Actions:
```yaml
# Regular CI - offline tests only
- name: Run Tests
  run: yarn test

# Nightly - with live LLM tests
- name: Run LLM Integration Tests
  env:
    RUN_LLM_TESTS: true
    OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
  run: yarn test
```

## Adding New Tests

### For New Proposal Types
1. Add validation rules to `llmProposals.spec.ts`
2. Add system-specific patterns
3. Add payload format validation

### For New LLM Features
1. Add unit tests to `llmService.spec.ts`
2. Add integration scenarios to `llmIntegration.spec.ts`
3. Update this README

## Best Practices

1. **Keep offline tests fast** - Mock LLM responses
2. **Make live tests optional** - Don't break CI without API key
3. **Validate structure first** - Before testing content quality
4. **Test edge cases** - Empty values, special characters, large payloads
5. **Document expectations** - Clear criteria for pass/fail

## Troubleshooting

### Tests Skip Automatically
- Check that `RUN_LLM_TESTS=true` is set
- Verify API key is in environment
- Check console output for skip messages

### API Rate Limits
- Add delays between tests
- Use smaller test dataset
- Run tests less frequently

### Flaky Tests
- LLM responses vary - use fuzzy matching
- Set appropriate timeouts (30s+)
- Retry on network failures

## Future Improvements

- [ ] Add response time benchmarks
- [ ] Add cost tracking for API calls
- [ ] Add snapshot testing for common scenarios
- [ ] Add performance regression tests
- [ ] Add multi-provider comparison tests
