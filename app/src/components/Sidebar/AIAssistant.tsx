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
  Card,
  CardContent,
  CardActions,
} from '@mui/material'
import { Theme } from '@mui/material/styles'
import { withStyles } from '@mui/styles'
import SendIcon from '@mui/icons-material/Send'
import SmartToyIcon from '@mui/icons-material/SmartToy'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ClearIcon from '@mui/icons-material/Clear'
import PublishIcon from '@mui/icons-material/Publish'
import BugReportIcon from '@mui/icons-material/BugReport'
import { Base64Message } from '../../../../backend/src/Model/Base64Message'
import { getLLMService, LLMMessage, MessageProposal, QuestionProposal } from '../../services/llmService'
import { makePublishEvent, rendererEvents } from '../../eventBus'

interface Props {
  node?: any
  connectionId?: string
  classes: any
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  proposals?: MessageProposal[]
  questionProposals?: QuestionProposal[]
  debugInfo?: any // API debug information
}

function AIAssistant(props: Props) {
  const { node, connectionId, classes } = props
  const [expanded, setExpanded] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)
  const [showDebug, setShowDebug] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const llmService = getLLMService()
  const previousNodePathRef = useRef<string>('')

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Auto-generate questions when node changes or chat is expanded
  // Clear chat when node changes
  useEffect(() => {
    const nodePath = node?.path?.()
    if (expanded && node && nodePath && nodePath !== previousNodePathRef.current && llmService.hasApiKey()) {
      previousNodePathRef.current = nodePath
      
      // Clear chat messages and error when switching to a new topic
      setMessages([])
      setError(null)
      setLoadingSuggestions(true)

      llmService
        .generateSuggestedQuestions(node)
        .then(questions => {
          setSuggestedQuestions(questions)
        })
        .catch(err => {
          console.error('Failed to generate suggested questions:', err)
        })
        .finally(() => {
          setLoadingSuggestions(false)
        })
    }
  }, [expanded, node, llmService])

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
      setMessages(prev => [...prev, userMessage])

      try {
        // Generate topic context if available
        const topicContext = node ? llmService.generateTopicContext(node) : undefined

        // Send to LLM - now returns { response, debugInfo }
        const llmResponse = await llmService.sendMessage(text, topicContext)

        // Parse response for proposals and questions
        const parsed = llmService.parseResponse(llmResponse.response)

        // Add assistant response to UI with proposals, questions, and debug info
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: parsed.text,
          timestamp: new Date(),
          proposals: parsed.proposals,
          questionProposals: parsed.questions,
          debugInfo: llmResponse.debugInfo, // Store debug info
        }
        setMessages(prev => [...prev, assistantMessage])
      } catch (err: unknown) {
        const error = err as { message?: string }
        console.error('AI Assistant error:', err)
        console.error('Error details:', error)
        setError(error.message || 'Failed to get response from AI assistant')
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

  const handlePublishProposal = useCallback(
    (proposal: MessageProposal) => {
      if (!connectionId) {
        setError('No active connection to publish message')
        return
      }

      try {
        const publishEvent = makePublishEvent(connectionId)
        const mqttMessage = {
          topic: proposal.topic,
          payload: Base64Message.fromString(proposal.payload),
          retain: false,
          qos: proposal.qos,
        }

        rendererEvents.emit(publishEvent, mqttMessage)

        // Show success feedback
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: `✓ Published to ${proposal.topic}`,
            timestamp: new Date(),
          },
        ])
      } catch (err) {
        setError(`Failed to publish message: ${err}`)
      }
    },
    [connectionId]
  )

  const suggestions = node ? llmService.getQuickSuggestions(node) : []
  const allSuggestions = [...suggestions, ...suggestedQuestions]

  // Check if backend LLM service is available
  const hasApiKey = llmService.hasApiKey()

  // Hide component completely if backend doesn't have LLM configured (new requirement)
  if (!hasApiKey) {
    return null
  }

  return (
    <Box className={classes.root}>
      {/* Header */}
      <Box className={classes.header}>
        <Box className={classes.headerLeft} onClick={() => setExpanded(!expanded)} style={{ flex: 1, cursor: 'pointer' }}>
          <SmartToyIcon className={classes.icon} />
          <Typography variant="subtitle2" className={classes.title}>
            AI Assistant
          </Typography>
          <Chip label="Beta" size="small" color="primary" className={classes.betaChip} />
        </Box>
        <Box className={classes.headerRight}>
          {expanded && messages.length > 0 && (
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation()
                setShowDebug(!showDebug)
              }}
              title="Toggle debug view"
              className={classes.iconButton}
            >
              <BugReportIcon fontSize="small" style={{ color: showDebug ? '#f50057' : 'inherit' }} />
            </IconButton>
          )}
          <Box onClick={() => setExpanded(!expanded)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </Box>
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

          {/* Quick Suggestions - Always shown when available */}
          {hasApiKey && allSuggestions.length > 0 && (
            <Box className={classes.suggestions}>
              <Typography variant="caption" color="textSecondary" className={classes.suggestionsTitle}>
                {loadingSuggestions ? 'Generating questions...' : 'Suggested questions:'}
              </Typography>
              <Box className={classes.suggestionChips}>
                {allSuggestions.slice(0, 6).map((suggestion, idx) => (
                  <Chip
                    key={idx}
                    label={suggestion}
                    size="small"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className={classes.suggestionChip}
                    disabled={loadingSuggestions}
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
              <Box key={idx}>
                <Box className={msg.role === 'user' ? classes.userMessage : classes.assistantMessage}>
                  <Typography variant="body2" className={classes.messageText}>
                    {msg.content}
                  </Typography>
                  <Typography variant="caption" color="textSecondary" className={classes.messageTime}>
                    {msg.timestamp.toLocaleTimeString()}
                  </Typography>
                </Box>

                {/* Render proposals if any */}
                {msg.proposals && msg.proposals.length > 0 && (
                  <Box className={classes.proposalsContainer}>
                    {msg.proposals.map((proposal, pIdx) => (
                      <Card key={pIdx} className={classes.proposalCard} variant="outlined">
                        <CardContent className={classes.proposalContent}>
                          <Typography variant="caption" color="primary" fontWeight="bold">
                            Proposed Action
                          </Typography>
                          <Typography variant="body2" gutterBottom>
                            {proposal.description}
                          </Typography>
                          <Box className={classes.proposalDetails}>
                            <Typography variant="caption" color="textSecondary">
                              Topic: <code>{proposal.topic}</code>
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              Payload: <code>{proposal.payload}</code>
                            </Typography>
                          </Box>
                        </CardContent>
                        <CardActions className={classes.proposalActions}>
                          <Button
                            size="small"
                            variant="contained"
                            color="primary"
                            startIcon={<PublishIcon />}
                            onClick={() => handlePublishProposal(proposal)}
                            disabled={!connectionId}
                          >
                            Send Message
                          </Button>
                        </CardActions>
                      </Card>
                    ))}
                  </Box>
                )}

                {/* Render question proposals if any */}
                {msg.questionProposals && msg.questionProposals.length > 0 && (
                  <Box className={classes.questionProposalsContainer}>
                    <Typography variant="caption" color="textSecondary" gutterBottom>
                      Follow-up questions:
                    </Typography>
                    <Box className={classes.suggestionChips}>
                      {msg.questionProposals.map((qProposal, qIdx) => (
                        <Chip
                          key={qIdx}
                          label={qProposal.question}
                          size="small"
                          color="secondary"
                          onClick={() => handleSuggestionClick(qProposal.question)}
                          className={classes.questionProposalChip}
                          icon={
                            qProposal.category ? (
                              <Typography variant="caption" component="span">
                                {qProposal.category}:
                              </Typography>
                            ) : undefined
                          }
                        />
                      ))}
                    </Box>
                  </Box>
                )}
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

          {/* Debug View - Enhanced with API Traffic */}
          {showDebug && messages.length > 0 && (
            <Paper className={classes.debugContainer} variant="outlined">
              <Typography variant="caption" fontWeight="bold" color="textSecondary" gutterBottom>
                Debug: Complete API Traffic
              </Typography>
              <Box className={classes.debugContent}>
                <pre className={classes.debugPre}>
                  {JSON.stringify(
                    {
                      systemMessage: {
                        role: 'system',
                        content: llmService.getSystemMessage(),
                        note: 'This is the system prompt that provides context to the LLM',
                      },
                      messages: messages.map((msg, idx) => ({
                        index: idx,
                        role: msg.role,
                        content: msg.content.substring(0, 200) + (msg.content.length > 200 ? '...' : ''),
                        fullContent: msg.content,
                        hasTopicContext: msg.role === 'user' && msg.content.startsWith('Context:'),
                        contentLength: msg.content.length,
                        timestamp: msg.timestamp.toISOString(),
                        proposals: msg.proposals?.length || 0,
                        questionProposals: msg.questionProposals?.length || 0,
                        ...(msg.debugInfo && {
                          apiDebug: {
                            provider: msg.debugInfo.provider,
                            model: msg.debugInfo.model,
                            timing: msg.debugInfo.timing,
                            request: {
                              url: msg.debugInfo.request?.url,
                              body: msg.debugInfo.request?.body,
                            },
                            response: {
                              id: msg.debugInfo.response?.id,
                              model: msg.debugInfo.response?.model,
                              created: msg.debugInfo.response?.created,
                              choices: msg.debugInfo.response?.choices,
                              usage: msg.debugInfo.response?.usage,
                              system_fingerprint: msg.debugInfo.response?.system_fingerprint,
                            },
                          },
                        }),
                      })),
                      summary: {
                        totalMessages: messages.length,
                        messagesWithDebugInfo: messages.filter(m => m.debugInfo).length,
                        lastApiCall: messages
                          .filter(m => m.debugInfo)
                          .pop()
                          ?.debugInfo?.timing?.timestamp,
                      },
                    },
                    null,
                    2
                  )}
                </pre>
              </Box>
            </Paper>
          )}

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
              onChange={e => setInputValue(e.target.value)}
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
    flexDirection: 'column' as const,
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
    flexWrap: 'wrap' as const,
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
    overflowY: 'auto' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: theme.spacing(1),
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column' as const,
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
    whiteSpace: 'pre-wrap' as const,
    wordBreak: 'break-word' as const,
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
  proposalsContainer: {
    marginTop: theme.spacing(1),
    marginLeft: theme.spacing(6),
    display: 'flex',
    flexDirection: 'column' as const,
    gap: theme.spacing(1),
  },
  proposalCard: {
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(144, 202, 249, 0.08)' : 'rgba(25, 118, 210, 0.04)',
    borderColor: theme.palette.primary.main,
  },
  proposalContent: {
    paddingBottom: theme.spacing(1),
    '&:last-child': {
      paddingBottom: theme.spacing(1),
    },
  },
  proposalDetails: {
    marginTop: theme.spacing(1),
    display: 'flex',
    flexDirection: 'column' as const,
    gap: theme.spacing(0.5),
    '& code': {
      backgroundColor: theme.palette.action.hover,
      padding: theme.spacing(0.25, 0.5),
      borderRadius: theme.shape.borderRadius,
      fontSize: '0.85em',
    },
  },
  proposalActions: {
    padding: theme.spacing(1, 2),
    paddingTop: 0,
  },
  questionProposalsContainer: {
    marginTop: theme.spacing(1),
    marginLeft: theme.spacing(6),
    display: 'flex',
    flexDirection: 'column' as const,
    gap: theme.spacing(0.5),
  },
  questionProposalChip: {
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: theme.palette.secondary.dark,
    },
  },
  debugContainer: {
    marginTop: theme.spacing(1),
    padding: theme.spacing(1.5),
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.03)',
    maxHeight: '200px',
    overflow: 'auto',
  },
  debugContent: {
    marginTop: theme.spacing(0.5),
  },
  debugPre: {
    margin: 0,
    fontSize: '0.75rem',
    fontFamily: 'monospace',
    whiteSpace: 'pre-wrap' as const,
    wordBreak: 'break-word' as const,
    color: theme.palette.text.secondary,
  },
})

export default withStyles(styles)(AIAssistant)
