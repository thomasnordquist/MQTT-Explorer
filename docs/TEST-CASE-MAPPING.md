# Test Case Mapping: Demo Video to UI Test Suite

This document maps the scenarios from the demo video (`demoVideo.ts`) to the independent test cases in the UI test suite (`ui-tests.spec.ts`).

## Scenarios from Demo Video

The demo video includes the following scenes (in order):

1. **connect** - Connect to MQTT broker
2. **numeric_plots** - Display numeric chart visualizations
3. **json-formatting** - Show formatted JSON messages
4. **diffs** - Display message differences
5. **publish_topic** - Publish messages to topics (disabled)
6. **clipboard** - Copy topics and values to clipboard
7. **topic_filter** - Search and filter topic hierarchy
8. **sparkplugb-decoding** - Decode SparkplugB protocol messages
9. **delete_retained_topics** - Delete retained topics (disabled)
10. **settings** - Show settings menu
11. **customize_subscriptions** - Advanced connection settings
12. **keyboard_shortcuts** - Zoom level controls

## Test Suite Mapping

The UI test suite reorganizes these scenarios into independent, categorized tests:

### Connection Management
- **Test**: `should connect to MQTT broker successfully`
- **Demo Scene**: `connect`
- **Scenario**: `scenarios/connect.ts`
- **Verifies**: Successful connection to MQTT broker, disconnect button visibility

### Topic Tree Navigation
- **Test**: `should display topic hierarchy after connection`
- **Demo Scene**: Implicit in `connect`
- **Verifies**: Topics are loaded and visible in tree

- **Test**: `should search and filter topics`
- **Demo Scene**: `topic_filter`
- **Scenario**: `scenarios/searchTree.ts`
- **Verifies**: Search functionality, filter results, clear search

### Message Visualization
- **Test**: `should display JSON formatted messages`
- **Demo Scene**: `json-formatting`
- **Scenario**: `scenarios/showJsonPreview.ts`
- **Verifies**: JSON message formatting and display

- **Test**: `should show numeric plots for topics`
- **Demo Scene**: `numeric_plots`
- **Scenario**: `scenarios/showNumericPlot.ts`
- **Verifies**: Chart creation, configuration, and display

- **Test**: `should display message diffs`
- **Demo Scene**: `diffs`
- **Scenario**: `scenarios/showOffDiffCapability.ts`
- **Verifies**: Diff visualization between message versions

### Clipboard Operations
- **Test**: `should copy topic to clipboard`
- **Demo Scene**: `clipboard` (first part)
- **Scenario**: `scenarios/copyTopicToClipboard.ts`
- **Verifies**: Topic copy functionality

- **Test**: `should copy value to clipboard`
- **Demo Scene**: `clipboard` (second part)
- **Scenario**: `scenarios/copyValueToClipboard.ts`
- **Verifies**: Value copy functionality

### SparkplugB Support
- **Test**: `should decode SparkplugB messages`
- **Demo Scene**: `sparkplugb-decoding`
- **Scenario**: `scenarios/showSparkplugDecoding.ts`
- **Verifies**: SparkplugB protocol decoding

### Settings and Configuration
- **Test**: `should open and display settings menu`
- **Demo Scene**: `settings`
- **Scenario**: `scenarios/showMenu.ts`
- **Verifies**: Settings menu accessibility

- **Test**: `should show advanced connection settings`
- **Demo Scene**: `customize_subscriptions`
- **Scenario**: `scenarios/showAdvancedConnectionSettings.ts`
- **Verifies**: Advanced connection options

## Not Included in Test Suite

The following scenarios are not included in the test suite for the reasons noted:

### Disabled Scenarios
These are commented out in the demo video itself:

- **publish_topic**: Disabled "until expandTopic is sorted out"
- **delete_retained_topics**: Disabled "until expandTopic is sorted out"

### Presentation-Only Scenarios
These scenarios are specific to the demo video presentation:

- **keyboard_shortcuts**: Primarily demonstrates zoom controls for video viewing
- **end**: "The End" title card for video

## Key Differences Between Demo Video and Test Suite

| Aspect | Demo Video | UI Test Suite |
|--------|-----------|---------------|
| **Purpose** | Marketing/documentation | Automated quality assurance |
| **Execution** | Sequential, single run | Independent tests, any order |
| **Visual Effects** | Overlay text, mouse pointer | Screenshots only |
| **Timing** | Controlled with sleeps for viewing | Minimal waits for efficiency |
| **Failure Handling** | Entire video fails | Individual test isolation |
| **Output** | GIF/video file | Test results + screenshots |
| **Assertions** | None (visual only) | Explicit chai assertions |
| **Independence** | Each scene depends on previous | Each test fully independent |

## Test Suite Advantages

1. **Independence**: Tests don't depend on execution order
2. **Determinism**: Consistent results across runs
3. **Granularity**: Individual test failures are isolated
4. **Speed**: No artificial delays for visual presentation
5. **Assertions**: Explicit verification of expected behavior
6. **Debugging**: Failed tests provide specific error messages
7. **Coverage**: Can add edge cases not in demo video

## Shared Implementation

Both the demo video and test suite share:
- Same scenario implementations in `src/spec/scenarios/`
- Same mock data setup in `mock-mqtt.ts` and `mock-sparkplugb.ts`
- Same utility functions in `src/spec/util/`

This ensures consistency between what's demonstrated and what's tested.
