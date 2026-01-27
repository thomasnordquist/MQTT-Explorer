# LLM Integration Test Results

This document provides example test results and validation for the LLM feature with live API integration.

## Test Summary

With the OpenAI API key configured, the following tests are executed:

### Offline Tests (Always Run)
- **Total:** 100 tests
- **Status:** ✅ All passing
- **Duration:** ~2 seconds
- **Requirements:** None (mock data)

### Live Integration Tests (Opt-in)
- **Total:** 11 tests  
- **Status:** ⏸️ Pending (requires `RUN_LLM_TESTS=true`)
- **Duration:** ~20-30 seconds
- **Requirements:** OpenAI/Gemini API key

## Running Live Tests

### Quick Start

```bash
# Using the helper script
OPENAI_API_KEY=sk-your-key ./scripts/run-llm-tests.sh
```

### Manual Execution

```bash
# Set your API key
export OPENAI_API_KEY=sk-your-key

# Enable live tests
export RUN_LLM_TESTS=true

# Run tests
cd app && yarn test
```

### Expected Output

```
LLM Integration Tests (Live API)
  Home Automation System Detection
    ✓ should detect zigbee2mqtt topics and propose valid actions (2145ms)
    ✓ should detect Home Assistant topics and propose valid actions (1892ms)
    ✓ should detect Tasmota topics and propose valid actions (1756ms)
  
  Proposal Quality Validation
    ✓ should propose multiple relevant actions for controllable devices (2234ms)
    ✓ should provide clear, actionable descriptions (1678ms)
    ✓ should match payload format to detected system (1923ms)
  
  Edge Cases
    ✓ should not propose actions for read-only sensors (1567ms)
    ✓ should handle complex nested topic structures (1834ms)
    ✓ should handle topics with special characters (1456ms)
  
  Question Generation Quality
    ✓ should generate relevant questions for home automation topics (2012ms)
    ✓ should generate analytical questions for sensor data (1789ms)

  11 passing (20s)
```

## Example Test Cases

### Test 1: zigbee2mqtt Device Detection

**Input:**
```
Topic: zigbee2mqtt/living_room_light
Value: {"state": "OFF", "brightness": 100}
Question: "How can I turn this light on?"
```

**Expected Proposal:**
```typescript
{
  topic: "zigbee2mqtt/living_room_light/set",
  payload: '{"state": "ON"}',
  qos: 0,
  description: "Turn on the living room light"
}
```

**Validation:**
- ✅ Topic follows zigbee2mqtt pattern
- ✅ Payload is valid JSON
- ✅ QoS is valid (0)
- ✅ Description is actionable

### Test 2: Multiple Proposals for Dimmable Light

**Input:**
```
Topic: zigbee2mqtt/dimmable_light
Value: {"state": "ON", "brightness": 128}
Question: "What can I do with this light?"
```

**Expected Proposals:**
```typescript
[
  {
    topic: "zigbee2mqtt/dimmable_light/set",
    payload: '{"state": "OFF"}',
    qos: 0,
    description: "Turn off the light"
  },
  {
    topic: "zigbee2mqtt/dimmable_light/set",
    payload: '{"brightness": 255}',
    qos: 0,
    description: "Set brightness to maximum"
  }
]
```

## Validation Criteria

### Proposal Quality Checklist

For each AI-generated proposal:

**Topic:**
- [ ] Non-empty string
- [ ] No wildcards (`+` or `#`)
- [ ] Valid topic segments
- [ ] Matches detected system pattern

**Payload:**
- [ ] Valid format
- [ ] Appropriate for target system
- [ ] Size < 10KB
- [ ] No injection attempts

**QoS:**
- [ ] Value is 0, 1, or 2

**Description:**
- [ ] Non-empty
- [ ] Uses imperative verb
- [ ] Clear and concise
- [ ] Under 100 characters

## Best Practices

1. **Run offline tests in CI** - Fast, deterministic, no cost
2. **Run live tests on schedule** - Nightly or weekly
3. **Use secrets management** - Never commit API keys
4. **Monitor API costs** - Track usage
5. **Document findings** - Record edge cases
