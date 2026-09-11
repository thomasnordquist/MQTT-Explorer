import { SparkplugTopic, aliasScopeOf } from './SparkplugTopic'

/**
 * The birth certificates, remembered.
 *
 * Sparkplug sends metric NAMES once, in a birth certificate, and everything after that references
 * them by a numeric ALIAS (spec §6.4.9). So a decoder with no memory can show a DATA message's
 * structure but cannot say what any of it IS — which is the state this viewer was in: an NDATA
 * rendered as `{"alias": 34, "value": 10073}` with no way to know that is `system/uptime`.
 *
 * Hence a small amount of state. It is keyed per edge node because that is the scope the spec gives
 * aliases; a device's metrics share its edge node's alias space, so DBIRTH merges into the same map.
 *
 * 🔴 A viewer cannot always win here, and it is worth knowing why rather than filing a bug later.
 * Birth certificates are NOT retained (the spec requires retain=false), so a session that began
 * before you connected has already sent the only copy of its alias map. Until that node re-births —
 * on its next reconnect, or because a host asked it to — its DATA cannot be resolved by anyone who
 * was not listening at the time. The decoder says so explicitly rather than inventing a name.
 */

/** protobufjs may hand a 64-bit field back as a Long object rather than a number or string. */
function longToNumber(value: object): number | undefined {
  const long = value as { low?: unknown; high?: unknown }
  if (typeof long.low !== 'number' || long.high !== 0) {
    return undefined
  }
  // `low` is the signed reading of the low 32 bits; aliases are unsigned.
  return long.low < 0 ? long.low + 2 ** 32 : long.low
}

function toNumber(value: unknown): number | undefined {
  if (typeof value === 'number') {
    return value
  }
  // protobufjs hands back 64-bit fields as strings (or Long) depending on options.
  if (typeof value === 'string' && value !== '') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : undefined
  }
  if (value && typeof value === 'object') {
    return longToNumber(value)
  }
  return undefined
}

export interface AliasEntry {
  name: string
  datatype?: number
}

/**
 * Cap on the number of edge nodes remembered, oldest evicted first. A viewer left running against a
 * large fleet should not grow without bound; an alias map is a few kilobytes, so this is generous.
 */
const MAX_TRACKED_NODES = 1000

export class SparkplugAliasCache {
  private scopes = new Map<string, Map<number, AliasEntry>>()

  /**
   * Record the aliases a birth certificate defines.
   *
   * A NODE birth REPLACES the scope: a rebirth is free to renumber, and keeping stale entries would
   * silently resolve a metric to whatever it used to be — worse than not resolving it. A DEVICE
   * birth merges, because it adds to its edge node's space rather than redefining it.
   */
  public learn(
    topic: SparkplugTopic,
    metrics: ReadonlyArray<{ name?: string | null; alias?: unknown; datatype?: number | null }>
  ) {
    const scope = aliasScopeOf(topic)
    const replace = topic.messageType === 'NBIRTH'
    const existing = replace ? undefined : this.scopes.get(scope)
    const entries = existing ?? new Map<number, AliasEntry>()

    metrics.forEach(metric => {
      const alias = toNumber(metric.alias)
      if (alias !== undefined && metric.name) {
        entries.set(alias, { name: metric.name, datatype: metric.datatype ?? undefined })
      }
    })

    this.scopes.delete(scope)
    this.scopes.set(scope, entries)

    while (this.scopes.size > MAX_TRACKED_NODES) {
      const oldest = this.scopes.keys().next()
      if (oldest.done) {
        break
      }
      this.scopes.delete(oldest.value)
    }
  }

  public resolve(topic: SparkplugTopic, alias: number): AliasEntry | undefined {
    return this.scopes.get(aliasScopeOf(topic))?.get(alias)
  }

  /** Whether a birth certificate has been seen for this edge node at all. */
  public hasBirth(topic: SparkplugTopic): boolean {
    return this.scopes.has(aliasScopeOf(topic))
  }

  public clear() {
    this.scopes.clear()
  }
}

/**
 * One cache for the process. The decoder is a stateless singleton by design in this app, and the
 * alias map is a property of the broker's traffic rather than of any one view, so it lives here.
 */
export const sparkplugAliasCache = new SparkplugAliasCache()
