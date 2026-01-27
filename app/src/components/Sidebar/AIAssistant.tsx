/**
 * AI Assistant Component
 * Provides an interactive AI chat interface for topic exploration
 */

import React, { useState, useCallback, useRef, useEffect } from 'react'
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  Chip,
  CircularProgress,
  Collapse,
  Alert,
  Button,
} from '@mui/material'
import { Theme } from '@mui/material/styles'
import { withStyles } from '@mui/styles'
import SendIcon from '@mui/icons-material/Send'
import SmartToyIcon from '@mui/icons-material/SmartToy'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ClearIcon from '@mui/icons-material/Clear'
import { getLLMService, LLMMessage } from '../../services/llmService'

interface Props {
  node?: any
  classes: any
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
}

function AIAssistant(props: Props) {
  const { node, classes } = props
  const [expanded, setExpanded] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const llmService = getLLMService()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = useCallback(
    async (messageText?: string) => {
      const text = messageText || inputValue.trim()
      if (!text) return

      // Check if backend LLM service is available
      if (!llmService.hasApiKey()) {
        setError('LLM service not configured on server. Please contact your administrator.')
        return
      }

      setInputValue('')
      setError(null)
      setLoading(true)

      // Add user message to UI
      const userMessage: ChatMessage = {
        role: 'user',
        content: text,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, userMessage])

      try {
        // Generate topic context if available
        const topicContext = node ? llmService.generateTopicContext(node) : undefined

        // Send to LLM
        const response = await llmService.sendMessage(text, topicContext)

        // Add assistant response to UI
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: response,
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, assistantMessage])
      } catch (err: unknown) {
        const error = err as { message?: string }
        setError(error.message || 'Failed to get response')
      } finally {
        setLoading(false)
      }
    },
    [inputValue, node, llmService]
  )

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSendMessage()
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion)
  }

  const handleClearChat = () => {
    setMessages([])
    llmService.clearHistory()
    setError(null)
  }

  const suggestions = node ? llmService.getQuickSuggestions(node) : []
  
  // Check if backend LLM service is available
  const hasApiKey = llmService.hasApiKey()

  // Hide component completely if backend doesn't have LLM configured (new requirement)
  if (!hasApiKey) {
    return null
  }

  return (
    <Box className={classes.root}>
      {/* Header */}
      <Box className={classes.header} onClick={() => setExpanded(!expanded)}>
        <Box className={classes.headerLeft}>
          <SmartToyIcon className={classes.icon} />
          <Typography variant="subtitle2" className={classes.title}>
            AI Assistant
          </Typography>
          <Chip label="Beta" size="small" color="primary" className={classes.betaChip} />
        </Box>
        <Box className={classes.headerRight}>
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </Box>
      </Box>

      {/* Chat Interface */}
      <Collapse in={expanded}>
        <Box className={classes.content}>
          {/* Error Alert */}
          {error && (
            <Alert severity="error" className={classes.alert} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Quick Suggestions */}
          {hasApiKey && messages.length === 0 && suggestions.length > 0 && (
            <Box className={classes.suggestions}>
              <Typography variant="caption" color="textSecondary" className={classes.suggestionsTitle}>
                Quick questions:
              </Typography>
              <Box className={classes.suggestionChips}>
                {suggestions.slice(0, 4).map((suggestion, idx) => (
                  <Chip
                    key={idx}
                    label={suggestion}
                    size="small"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className={classes.suggestionChip}
                  />
                ))}
              </Box>
            </Box>
          )}

          {/* Messages */}
          <Box className={classes.messages}>
            {messages.length === 0 && !error && (
              <Box className={classes.emptyState}>
                <SmartToyIcon className={classes.emptyIcon} />
                <Typography variant="body2" color="textSecondary" align="center">
                  Ask me anything about this topic!
                </Typography>
              </Box>
            )}

            {messages.map((msg, idx) => (
              <Box
                key={idx}
                className={msg.role === 'user' ? classes.userMessage : classes.assistantMessage}
              >
                <Typography variant="body2" className={classes.messageText}>
                  {msg.content}
                </Typography>
                <Typography variant="caption" color="textSecondary" className={classes.messageTime}>
                  {msg.timestamp.toLocaleTimeString()}
                </Typography>
              </Box>
            ))}

            {loading && (
              <Box className={classes.loadingBox}>
                <CircularProgress size={20} />
                <Typography variant="caption" color="textSecondary" sx={{ ml: 1 }}>
                  Thinking...
                </Typography>
              </Box>
            )}

            <div ref={messagesEndRef} />
          </Box>

          {/* Input */}
          <Box className={classes.inputContainer}>
            {messages.length > 0 && (
              <IconButton size="small" onClick={handleClearChat} className={classes.clearButton}>
                <ClearIcon fontSize="small" />
              </IconButton>
            )}
            <TextField
              fullWidth
              size="small"
              placeholder="Ask about this topic..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
              className={classes.input}
              multiline
              maxRows={3}
            />
            <IconButton
              color="primary"
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim() || loading}
              className={classes.sendButton}
            >
              <SendIcon />
            </IconButton>
          </Box>
        </Box>
      </Collapse>
    </Box>
  )
}

const styles = (theme: Theme) => ({
  root: {
    marginTop: theme.spacing(2),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing(1.5, 2),
    backgroundColor: theme.palette.action.hover,
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: theme.palette.action.selected,
    },
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
  },
  icon: {
    color: theme.palette.primary.main,
  },
  title: {
    fontWeight: 600,
  },
  betaChip: {
    height: '20px',
    fontSize: '0.7rem',
  },
  iconButton: {
    padding: theme.spacing(0.5),
  },
  content: {
    padding: theme.spacing(2),
    display: 'flex',
    flexDirection: 'column' as 'column',
    gap: theme.spacing(1.5),
  },
  alert: {
    marginBottom: theme.spacing(1),
  },
  suggestions: {
    marginBottom: theme.spacing(1),
  },
  suggestionsTitle: {
    display: 'block',
    marginBottom: theme.spacing(0.5),
  },
  suggestionChips: {
    display: 'flex',
    flexWrap: 'wrap' as 'wrap',
    gap: theme.spacing(0.5),
  },
  suggestionChip: {
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
    },
  },
  messages: {
    maxHeight: '300px',
    overflowY: 'auto' as 'auto',
    display: 'flex',
    flexDirection: 'column' as 'column',
    gap: theme.spacing(1),
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column' as 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(4),
    gap: theme.spacing(1),
  },
  emptyIcon: {
    fontSize: '3rem',
    color: theme.palette.action.disabled,
  },
  userMessage: {
    alignSelf: 'flex-end',
    maxWidth: '80%',
    padding: theme.spacing(1, 1.5),
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    borderRadius: theme.spacing(1.5),
    borderBottomRightRadius: theme.spacing(0.5),
  },
  assistantMessage: {
    alignSelf: 'flex-start',
    maxWidth: '80%',
    padding: theme.spacing(1, 1.5),
    backgroundColor: theme.palette.action.hover,
    borderRadius: theme.spacing(1.5),
    borderBottomLeftRadius: theme.spacing(0.5),
  },
  messageText: {
    whiteSpace: 'pre-wrap' as 'pre-wrap',
    wordBreak: 'break-word' as 'break-word',
  },
  messageTime: {
    display: 'block',
    marginTop: theme.spacing(0.5),
    fontSize: '0.65rem',
  },
  loadingBox: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(1),
  },
  inputContainer: {
    display: 'flex',
    gap: theme.spacing(1),
    alignItems: 'flex-end',
  },
  clearButton: {
    padding: theme.spacing(0.5),
  },
  input: {
    flex: 1,
  },
  sendButton: {
    padding: theme.spacing(1),
  },
})

export default withStyles(styles)(AIAssistant)
