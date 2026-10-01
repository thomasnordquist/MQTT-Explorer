# Unreleased

  - Fix chart Size setting and connection form layout, broken by the MUI v7 Grid upgrade
  - Fix chart hover tooltip rendering in the top-left corner instead of at the pointer
  - Show the error message in the notification bar instead of "{}" when an internal call fails
  - Preserve error messages across the renderer/backend RPC boundary and honour RPC timeouts
  - Add docs/MACOS_LOCAL_BUILD.md: building and installing an unsigned local macOS build

# 0.2.3

  - Highlight differences in the last received message with a "diff" view
  - Magnify app content with "Ctrl +", "Ctrl -", "Ctrl 0"
  - Make user interactions more predictable by removing "select topic on mouse over"
  - Add "Quick Preview" setting, to enable topic selection on mouse over
  - Add JSON formatter
  - Show error when connection to the mqtt broker is lost
  - Fix bug where mqtt explorer resets the tree after a reconnect
  - Fix MQTT-Client id

# 0.2.0
