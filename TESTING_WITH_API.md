# Quick Reference: Running LLM Tests with OpenAI API

## Prerequisites

✅ OpenAI API key added to GitHub Copilot environment  
✅ Test infrastructure installed (100 offline + 11 live tests)  
✅ Helper script available: `scripts/run-llm-tests.sh`  

## Usage

### Option 1: Use Helper Script (Recommended)

```bash
# If secret is in environment
./scripts/run-llm-tests.sh

# Or provide explicitly
OPENAI_API_KEY=sk-your-key ./scripts/run-llm-tests.sh
```

### Option 2: Manual Execution

```bash
# Set environment variables
export OPENAI_API_KEY=sk-your-key
export RUN_LLM_TESTS=true

# Run tests
cd app && yarn test
```

### Option 3: Single Command

```bash
cd /home/runner/work/MQTT-Explorer/MQTT-Explorer && \
  RUN_LLM_TESTS=true \
  OPENAI_API_KEY=${OPENAI_API_KEY} \
  yarn test:app
```

## Expected Results

### Without Live Tests (Default)
```
  100 passing (2s)
  11 pending
```

### With Live Tests Enabled
```
  LLM Integration Tests (Live API)
    Home Automation System Detection
      ✓ should detect zigbee2mqtt topics (2145ms)
      ✓ should detect Home Assistant topics (1892ms)
      ✓ should detect Tasmota topics (1756ms)
    
    Proposal Quality Validation
      ✓ should propose multiple actions (2234ms)
      ✓ should provide clear descriptions (1678ms)
      ✓ should match system formats (1923ms)
    
    Edge Cases
      ✓ should not propose for sensors (1567ms)
      ✓ should handle nested topics (1834ms)
      ✓ should handle special chars (1456ms)
    
    Question Generation
      ✓ should generate relevant questions (2012ms)
      ✓ should generate analytical questions (1789ms)

  111 passing (22s)
```

## Validation Points

Each live test validates:

✅ **Topic Format**
- Matches system pattern (zigbee2mqtt, homeassistant, etc.)
- No wildcards
- Valid segments

✅ **Payload Quality**  
- Valid JSON (when appropriate)
- Correct format for target system
- No injection attempts

✅ **QoS Value**
- Must be 0, 1, or 2
- Typically 0 for home automation

✅ **Description**
- Actionable (uses imperative verbs)
- Clear and concise
- Under 100 characters

## Troubleshooting

### Secret Not Available

If you get "No API key found":

```bash
# Check environment
env | grep OPENAI_API_KEY

# If not set, the secret may need to be:
# 1. Refreshed in the Copilot environment
# 2. Made available to the runtime
# 3. Accessed through a different mechanism
```

### Tests Still Pending

If live tests don't run:

```bash
# Ensure flag is set
export RUN_LLM_TESTS=true
echo $RUN_LLM_TESTS  # Should output: true

# Check for API key
[ -n "$OPENAI_API_KEY" ] && echo "Key is set" || echo "Key not found"
```

## What Gets Tested

### Home Automation Systems

**zigbee2mqtt:**
```typescript
// Expected proposal
{
  topic: "zigbee2mqtt/light/set",
  payload: '{"state": "ON"}',
  qos: 0,
  description: "Turn on the light"
}
```

**Home Assistant:**
```typescript
{
  topic: "homeassistant/light/lamp/set",
  payload: "ON",
  qos: 0,
  description: "Turn on the lamp"
}
```

**Tasmota:**
```typescript
{
  topic: "cmnd/device/POWER",
  payload: "ON",
  qos: 0,
  description: "Turn on the device"
}
```

### Question Generation

For a topic like `zigbee2mqtt/bedroom_light`:

```typescript
// Expected questions
[
  "How can I turn this light on?",
  "What brightness levels are supported?",
  "Can I adjust the color?",
  "How do I automate this light?"
]
```

## Cost Estimate

Per full test run:
- **API Calls:** ~11 requests
- **Tokens:** ~5,000-8,000 total
- **Cost:** ~$0.001-0.002 USD (GPT-4o Mini is ~10x cheaper than GPT-3.5 Turbo)

## Documentation

- **Test Strategy:** `app/src/services/spec/README.md`
- **Test Results:** `docs/LLM_TEST_RESULTS.md`
- **Helper Script:** `scripts/run-llm-tests.sh`

## Success Criteria

When tests pass, you'll have validated:

✅ AI can detect home automation systems correctly  
✅ Generated proposals have valid MQTT topic format  
✅ Payloads match system-specific requirements  
✅ Descriptions are clear and actionable  
✅ Questions are relevant and diverse  
✅ No security issues (injection, size limits)  

---

**Ready to test?** Run: `./scripts/run-llm-tests.sh`
