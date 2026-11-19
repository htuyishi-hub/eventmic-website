/**
 * @typedef {'host' | 'attendee'} Role
 * @typedef {'connecting' | 'connected' | 'reconnecting' | 'disconnected'} ConnectionState
 * @typedef {'listening' | 'hand_raised' | 'on_air'} AttendeeSelfState
 * @typedef {'live' | 'ended'} SessionStatus
 * @typedef {'INVALID_CODE' | 'SESSION_ENDED' | 'FULL' | 'UNKNOWN'} ErrorCode
 * 
 * @typedef {Object} SessionInfo
 * @property {string} code - 6-character room code
 * @property {string} name - Session display name
 * @property {SessionStatus} status - Status of session ('live' | 'ended')
 * @property {number} createdAt - Creation timestamp (epoch ms)
 * 
 * @typedef {Object} QueuedAttendee
 * @property {string} id - Unique attendee identifier
 * @property {string} name - Display name
 * @property {number} raisedAt - Timestamp when hand was raised (epoch ms)
 * 
 * @typedef {Object} ActiveSpeaker
 * @property {string} id - Speaker attendee identifier
 * @property {string} name - Speaker display name
 * @property {number} startedAt - Timestamp when floor was granted (epoch ms)
 * 
 * @typedef {Object} TransportError
 * @property {ErrorCode} code - Error category
 * @property {string} message - Human-readable explanation
 * 
 * @typedef {Object} TransportEvents
 * @property {(queue: QueuedAttendee[]) => void} queue
 * @property {(floor: ActiveSpeaker | null) => void} floor
 * @property {(level: number) => void} level
 * @property {(session: SessionInfo) => void} session
 * @property {(state: ConnectionState) => void} connection
 * @property {(error: TransportError) => void} error
 * @property {(data: { count: number }) => void} attendees
 * @property {(state: AttendeeSelfState) => void} self
 * 
 * @typedef {Object} TransportInterface
 * @property {(params: { name: string }) => Promise<SessionInfo>} createSession
 * @property {() => Promise<void>} endSession
 * @property {(params: { role: Role, code: string, name?: string }) => Promise<void>} connect
 * @property {() => Promise<void>} disconnect
 * @property {() => Promise<void>} raiseHand
 * @property {() => Promise<void>} lowerHand
 * @property {(attendeeId: string) => Promise<void>} grant
 * @property {(attendeeId: string) => Promise<void>} revoke
 * @property {(muted: boolean) => Promise<void>} muteSpeaker
 * @property {(level: number) => Promise<void>} sendLevel
 * @property {(event: string, handler: Function) => () => void} on
 */

export {};
