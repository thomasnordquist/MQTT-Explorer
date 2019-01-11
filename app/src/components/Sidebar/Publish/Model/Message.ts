interface Message {
  topic: string
  payload?: string
  sent: Date
}

export default Message
