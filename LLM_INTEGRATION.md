# LLM Integration for Topic Interaction

## Overview

MQTT Explorer now includes an AI-powered assistant to help users understand and interact with MQTT topics and their data. This feature uses Large Language Models (LLMs) to provide intelligent insights, explanations, and suggestions about your MQTT data.

## Features

### AI Assistant Panel

The AI Assistant appears in the Details tab when you select any topic in the tree. It provides:

- **Quick Suggestions**: Pre-generated questions based on the selected topic
- **Interactive Chat**: Ask custom questions about the topic, its data, or MQTT concepts
- **Context-Aware**: Automatically includes topic metadata and message details in queries
- **Conversation History**: Maintains context across multiple questions
- **Collapsible Interface**: Minimizes when not needed to save screen space

### Capabilities

The AI Assistant can help you:

1. **Understand Data Structures**: Get explanations of JSON payloads and complex data formats
2. **Interpret Values**: Learn what specific values mean in the context of IoT devices
3. **Analyze Patterns**: Understand message patterns and frequencies
4. **Discover Possibilities**: Learn what actions you can perform with specific topics
5. **Learn MQTT Concepts**: Get answers about QoS, retained messages, and MQTT protocol features

## Configuration

### Setting Up Your API Key

1. Click the ⚙️ settings icon in the AI Assistant panel
2. Enter your OpenAI API key
3. Click "Save"

Your API key is stored locally in your browser's localStorage and is never sent to MQTT Explorer's servers.

### Getting an OpenAI API Key

1. Visit [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Sign up or log in to your OpenAI account
3. Create a new API key
4. Copy the key and paste it into MQTT Explorer's configuration dialog

**Note**: Using the AI Assistant will consume OpenAI API credits based on your usage. Please review OpenAI's pricing at [https://openai.com/pricing](https://openai.com/pricing).

## Usage

### Basic Interaction

1. **Connect** to your MQTT broker
2. **Select** a topic from the tree
3. **Expand** the "AI Assistant" panel in the Details tab
4. **Click** on a quick suggestion or type your own question
5. **Send** your question and wait for the AI response

### Example Questions

- "What does this temperature value represent?"
- "How should I interpret this JSON structure?"
- "Why is this message retained?"
- "What QoS level should I use for this topic?"
- "How can I monitor changes to this value?"
- "What devices typically publish to topics like this?"

### Quick Suggestions

The AI Assistant provides contextual suggestions based on the selected topic:

- **"Explain this data structure"**: Get a breakdown of complex payloads
- **"What does this value mean?"**: Understand specific measurements or states
- **"Summarize all subtopics"**: Get an overview of nested topic hierarchies
- **"What can I do with this topic?"**: Discover possible actions and integrations

## Privacy & Security

### Data Handling

- **API Keys**: Stored locally in browser localStorage, never transmitted to MQTT Explorer servers
- **Topic Data**: Topic paths and message payloads are sent to OpenAI's API to provide context
- **Conversation History**: Maintained client-side and reset when you clear the chat

### Best Practices

1. **Sensitive Data**: Be cautious when using the AI Assistant with topics containing sensitive information
2. **API Key Security**: Never share your OpenAI API key with others
3. **Rate Limiting**: The service implements error handling for rate limits
4. **Offline Operation**: The AI Assistant requires internet connectivity to function

## Technical Details

### Architecture

- **Frontend**: React component with Material-UI styling
- **Service Layer**: Singleton LLM service for API communication
- **API Integration**: OpenAI Chat Completions API (GPT-3.5-turbo by default)
- **Context Generation**: Automatic extraction of topic metadata for relevant queries

### Configuration Options

The LLM service supports:

- **Custom API Endpoints**: Can be configured to use compatible APIs
- **Model Selection**: Defaults to `gpt-3.5-turbo` but can be customized
- **Conversation History**: Automatically manages context (keeps last 10 messages)
- **Timeout Handling**: 30-second timeout for API requests

## Troubleshooting

### "Please configure your OpenAI API key first"

**Solution**: Click the settings icon and add your API key.

### "Invalid API key"

**Solutions**:
- Verify the API key is correct
- Check that your OpenAI account is active
- Ensure you have available API credits

### "Rate limit exceeded"

**Solutions**:
- Wait a few minutes before trying again
- Check your OpenAI API usage dashboard
- Consider upgrading your OpenAI plan if needed

### "Request timeout"

**Solutions**:
- Check your internet connection
- Try asking a simpler question
- Verify OpenAI's service status

## Limitations

- Requires active internet connection
- Needs valid OpenAI API key with available credits
- Responses are limited to 500 tokens for performance
- May not have knowledge of proprietary or custom MQTT implementations
- Beta feature - under active development

## Future Enhancements

Potential improvements being considered:

- Support for additional LLM providers (Anthropic, Azure OpenAI, etc.)
- Ability to save and share helpful conversations
- Integration with automation and scripting features
- Custom prompts and templates for specific use cases
- Offline mode with cached responses for common questions

## Feedback

This is a beta feature. If you encounter issues or have suggestions, please open an issue on the [GitHub repository](https://github.com/thomasnordquist/MQTT-Explorer/issues).
