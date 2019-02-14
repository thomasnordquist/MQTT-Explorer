export async function getRendererEvents() {
  return (await import('./SocketIO')).rendererEvents
}
