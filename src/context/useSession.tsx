import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'reconnecting' | 'disconnected';
type TerminalConfig = {
    cols: number;
    rows: number;
    term: string;
};
type PendingInput = string | ArrayBuffer | Uint8Array;
type CreateSessionConfig = Omit<
    SessionData,
    'id' | 'content' | 'createdAt' | 'ws' | 'isConnected' | 'connectionStatus' | 'reconnectAttempt'
>;

export interface SessionData {
    id: string;
    serverId: number;
    name: string;
    os: string;
    content: string;
    createdAt: Date;
    terminalConfig?: TerminalConfig;
    // WebSocket connection per session
    ws: WebSocket | null;
    isConnected: boolean;
    connectionStatus: ConnectionStatus;
    reconnectAttempt: number;
}

interface SessionContextType {
    session: SessionData | null;
    sessions: Map<string, SessionData>;

    // Session Actions
    createSession: (config: CreateSessionConfig, onCreated?: (sessionId: string) => void) => void;
    closeSession: (sessionId: string) => void;
    switchSession: (sessionId: string) => SessionData | null;

    // Content Actions
    appendContent: (sessionId: string, content: string) => void;
    clearContent: () => void;

    // WebSocket Actions
    sendData: (sessionId: string, data: string | ArrayBuffer | Uint8Array) => void;
    connectWebSocket: (sessionId: string, terminalConfig?: TerminalConfig) => void;
    reconnectWebSocket: (sessionId: string) => void;
    disconnect: (sessionId: string) => void;

    // Resize terminal
    resizeTerminal: (cols: number, rows: number) => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

const MAX_RECONNECT_DELAY = 12000;
const MAX_PENDING_INPUT_BYTES = 64 * 1024;

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [session, setSession] = useState<SessionData | null>(null);
    const [sessions, setSessions] = useState<Map<string, SessionData>>(new Map());
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
    const sessionsRef = useRef(sessions);
    const reconnectTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
    const pendingInputRef = useRef<Map<string, PendingInput[]>>(new Map());
    const manualDisconnectRef = useRef<Set<string>>(new Set());
    const outputDecoderRef = useRef<Map<string, TextDecoder>>(new Map());

    const navigator = useNavigate();

    useEffect(() => {
        sessionsRef.current = sessions;
    }, [sessions]);

    useEffect(() => {
        if (currentSessionId) {
            setSession(sessions.get(currentSessionId) || null);
        } else {
            setSession(null);
        }
    }, [currentSessionId, sessions]);

    const clearReconnectTimer = useCallback((sessionId: string) => {
        const timer = reconnectTimersRef.current.get(sessionId);
        if (timer) {
            clearTimeout(timer);
            reconnectTimersRef.current.delete(sessionId);
        }
    }, []);

    const patchSession = useCallback(
        (sessionId: string, patcher: (session: SessionData) => void) => {
            setSessions((prev) => {
                const updated = new Map(prev);
                const target = updated.get(sessionId);
                if (!target) return updated;

                const next = { ...target };
                patcher(next);
                updated.set(sessionId, next);
                sessionsRef.current = updated;
                return updated;
            });
        },
        []
    );

    // Append content to specific session
    const appendContent = useCallback(
        (sessionId: string, content: string) => {
            patchSession(sessionId, (session) => {
                session.content += content;
            });
        },
        [patchSession]
    );

    const appendOutputBytes = useCallback(
        (sessionId: string, bytes: ArrayBuffer) => {
            const decoder =
                outputDecoderRef.current.get(sessionId) ??
                new TextDecoder('utf-8', { fatal: false });
            outputDecoderRef.current.set(sessionId, decoder);
            appendContent(sessionId, decoder.decode(bytes, { stream: true }));
        },
        [appendContent]
    );

    const createSession = useCallback(
        (config: CreateSessionConfig, onCreated?: (sessionId: string) => void) => {
            // const existingSession = Array.from(sessions.values()).find(
            //     (s) => s.serverId === config.serverId
            // );

            // if (existingSession) {
            //     setCurrentSessionId(existingSession.id);
            //     onCreated?.(existingSession.id);
            //     return existingSession.id;
            // }

            const newSession: SessionData = {
                id: `${config.serverId}-${Date.now()}`,
                ...config,
                content: '',
                createdAt: new Date(),
                ws: null,
                isConnected: false,
                connectionStatus: 'idle',
                reconnectAttempt: 0,
            };

            setSessions((prev) => {
                const updated = new Map(prev);
                updated.set(newSession.id, newSession);
                sessionsRef.current = updated;
                return updated;
            });
            setCurrentSessionId(newSession.id);

            queueMicrotask(() => {
                onCreated?.(newSession.id);
            });

            return newSession.id;
        },
        [sessions]
    );

    // Close a session and disconnect WebSocket
    const closeSession = useCallback(
        (sessionId: string) => {
            setSessions((prev) => {
                const updated = new Map(prev);
                const session = updated.get(sessionId);

                clearReconnectTimer(sessionId);
                pendingInputRef.current.delete(sessionId);
                outputDecoderRef.current.delete(sessionId);
                manualDisconnectRef.current.add(sessionId);

                // Close WebSocket connection
                if (session?.ws) {
                    session.ws.close();
                }

                const remainingSessions = Array.from(prev.keys()).filter((id) => id !== sessionId);
                if (remainingSessions.length !== 0) {
                    navigator('/session/' + remainingSessions[0]);
                } else {
                    navigator('/terminal');
                }

                updated.delete(sessionId);
                return updated;
            });
        },
        [clearReconnectTimer, navigator]
    );

    // Switch session without disconnecting
    const switchSession = useCallback(
        (sessionId: string) => {
            if (sessions.has(sessionId)) {
                const targetSession = sessions.get(sessionId);

                setCurrentSessionId(sessionId);
                return targetSession || null;
            } else {
                console.warn('Session not found:', sessionId);
                navigator('/terminal');
                return null;
            }
        },
        [sessions, navigator]
    );

    // Clear content
    const clearContent = useCallback(() => {
        if (!currentSessionId) return;

        setSessions((prev) => {
            const updated = new Map(prev);
            const session = updated.get(currentSessionId);
            if (session) {
                session.content = '';
                updated.set(currentSessionId, { ...session });
            }
            return updated;
        });
    }, [currentSessionId]);

    // WebSocket connect
    const connectWebSocket = useCallback(
        (sessionId: string, terminalConfig?: TerminalConfig) => {
            const existingSession = sessionsRef.current.get(sessionId);
            if (!existingSession) {
                console.error('Session not found:', sessionId);
                return;
            }

            if (
                existingSession.ws?.readyState === WebSocket.OPEN ||
                existingSession.ws?.readyState === WebSocket.CONNECTING
            ) {
                console.warn('WebSocket already connected for this session');
                return;
            }

            clearReconnectTimer(sessionId);
            manualDisconnectRef.current.delete(sessionId);

            const nextAttempt =
                existingSession.connectionStatus === 'reconnecting'
                    ? existingSession.reconnectAttempt
                    : 0;

            patchSession(sessionId, (session) => {
                session.connectionStatus = nextAttempt > 0 ? 'reconnecting' : 'connecting';
                session.isConnected = false;
                session.reconnectAttempt = nextAttempt;
                if (terminalConfig) {
                    session.terminalConfig = terminalConfig;
                }
            });

            const protocol = window.location.protocol === 'http:' ? 'ws://' : 'wss://';
            const wsUrl = `${protocol}${window.location.host}/api/v1/server/terminal/${existingSession.serverId}/ws`;

            try {
                const websocket = new WebSocket(wsUrl);
                websocket.binaryType = 'arraybuffer';

                patchSession(sessionId, (session) => {
                    session.ws = websocket;
                });

                websocket.onopen = () => {
                    clearReconnectTimer(sessionId);

                    const sessionBeforeOpen = sessionsRef.current.get(sessionId);
                    const didReconnect = (sessionBeforeOpen?.reconnectAttempt ?? 0) > 0;

                    patchSession(sessionId, (session) => {
                        session.ws = websocket;
                        session.isConnected = true;
                        session.connectionStatus = 'connected';
                        session.reconnectAttempt = 0;
                        if (terminalConfig) {
                            session.terminalConfig = terminalConfig;
                        }
                    });

                    // Send init config if provided
                    const activeConfig =
                        terminalConfig ?? sessionsRef.current.get(sessionId)?.terminalConfig;
                    if (activeConfig) {
                        const initMessage = JSON.stringify({
                            type: 'resize',
                            cols: activeConfig.cols,
                            rows: activeConfig.rows,
                        });
                        websocket.send(initMessage);
                    }

                    const pendingInput = pendingInputRef.current.get(sessionId) ?? [];
                    pendingInput.forEach((item) => {
                        websocket.send(item);
                    });
                    pendingInputRef.current.delete(sessionId);

                    if (didReconnect) {
                        appendContent(sessionId, '\r\n[Reconnected]\r\n');
                    }
                };

                websocket.onmessage = (event) => {
                    if (event.data instanceof ArrayBuffer) {
                        appendOutputBytes(sessionId, event.data);
                    } else if (event.data instanceof Blob) {
                        event.data
                            .arrayBuffer()
                            .then((buffer) => {
                                appendOutputBytes(sessionId, buffer);
                            })
                            .catch((err) => {
                                console.log('Failed to decode blob:', err);
                            });
                    } else if (typeof event.data === 'string') {
                        appendContent(sessionId, event.data);
                    }
                };

                websocket.onerror = (error) => {
                    console.error('WebSocket error:', error);
                    patchSession(sessionId, (session) => {
                        session.isConnected = false;
                    });
                };

                websocket.onclose = (event) => {
                    console.log('WebSocket disconnected');
                    const latestSession = sessionsRef.current.get(sessionId);
                    if (!latestSession) return;
                    if (latestSession.ws && latestSession.ws !== websocket) return;

                    if (event.code === 1008) {
                        manualDisconnectRef.current.add(sessionId);
                        clearReconnectTimer(sessionId);
                        patchSession(sessionId, (session) => {
                            session.isConnected = false;
                            session.ws = null;
                            session.connectionStatus = 'disconnected';
                            session.reconnectAttempt = 0;
                        });
                        window.location.replace('/');
                        return;
                    }

                    const decoder = outputDecoderRef.current.get(sessionId);
                    if (decoder) {
                        const pendingText = decoder.decode();
                        if (pendingText) appendContent(sessionId, pendingText);
                        outputDecoderRef.current.delete(sessionId);
                    }

                    if (manualDisconnectRef.current.has(sessionId)) {
                        patchSession(sessionId, (session) => {
                            session.isConnected = false;
                            session.ws = null;
                            session.connectionStatus = 'disconnected';
                            session.reconnectAttempt = 0;
                        });
                        return;
                    }

                    const reconnectAttempt = latestSession.reconnectAttempt + 1;
                    const delay = Math.min(
                        1000 * 2 ** Math.max(reconnectAttempt - 1, 0),
                        MAX_RECONNECT_DELAY
                    );

                    patchSession(sessionId, (session) => {
                        session.isConnected = false;
                        session.ws = null;
                        session.connectionStatus = 'reconnecting';
                        session.reconnectAttempt = reconnectAttempt;
                        session.content += `\r\n[Connection lost. Reconnecting in ${Math.round(delay / 1000)}s]\r\n`;
                    });

                    clearReconnectTimer(sessionId);
                    const timer = setTimeout(() => {
                        reconnectTimersRef.current.delete(sessionId);
                        const session = sessionsRef.current.get(sessionId);
                        if (!session || manualDisconnectRef.current.has(sessionId)) return;
                        connectWebSocket(sessionId, session.terminalConfig);
                    }, delay);
                    reconnectTimersRef.current.set(sessionId, timer);
                };
            } catch (error) {
                console.error('Failed to create WebSocket:', error);
                patchSession(sessionId, (session) => {
                    session.isConnected = false;
                    session.ws = null;
                    session.connectionStatus = 'disconnected';
                });
            }
        },
        [appendContent, clearReconnectTimer, patchSession]
    );

    const reconnectWebSocket = useCallback(
        (sessionId: string) => {
            const currentSession = sessionsRef.current.get(sessionId);
            if (!currentSession) return;

            clearReconnectTimer(sessionId);
            manualDisconnectRef.current.delete(sessionId);

            if (currentSession.ws) {
                currentSession.ws.close();
            }

            patchSession(sessionId, (session) => {
                session.ws = null;
                session.isConnected = false;
                session.connectionStatus = 'reconnecting';
                session.reconnectAttempt = Math.max(session.reconnectAttempt, 1);
            });
            connectWebSocket(sessionId, currentSession.terminalConfig);
        },
        [clearReconnectTimer, connectWebSocket, patchSession]
    );

    // Disconnect specific session
    const disconnect = useCallback(
        (sessionId: string) => {
            clearReconnectTimer(sessionId);
            pendingInputRef.current.delete(sessionId);
            manualDisconnectRef.current.add(sessionId);

            setSessions((prev) => {
                const updated = new Map(prev);
                const session = updated.get(sessionId);
                if (session) {
                    if (session.ws) {
                        session.ws.close();
                    }
                    updated.set(sessionId, {
                        ...session,
                        ws: null,
                        isConnected: false,
                        connectionStatus: 'disconnected',
                        reconnectAttempt: 0,
                    });
                }
                sessionsRef.current = updated;
                return updated;
            });
        },
        [clearReconnectTimer]
    );

    // Send data to current session
    const sendData = useCallback(
        (sessionId: string, data: string | ArrayBuffer | Uint8Array) => {
            const currentSession = sessionsRef.current.get(sessionId);
            const payload = data;

            if (!currentSession?.ws) {
                console.warn('WebSocket is not connected');

                const pendingInput = pendingInputRef.current.get(sessionId) ?? [];
                const pendingBytes = pendingInput.reduce((total, item) => {
                    return total + (typeof item === 'string' ? item.length : item.byteLength);
                }, 0);

                if (pendingBytes < MAX_PENDING_INPUT_BYTES) {
                    pendingInput.push(payload);
                    pendingInputRef.current.set(sessionId, pendingInput);
                }

                connectWebSocket(sessionId, currentSession?.terminalConfig);
                return;
            }

            if (currentSession.ws.readyState === WebSocket.OPEN) {
                currentSession.ws.send(payload);
            } else {
                console.warn('WebSocket is not open');
                const pendingInput = pendingInputRef.current.get(sessionId) ?? [];
                pendingInput.push(payload);
                pendingInputRef.current.set(sessionId, pendingInput);
                connectWebSocket(sessionId, currentSession.terminalConfig);
            }
        },
        [connectWebSocket]
    );

    // Resize terminal
    const resizeTerminal = useCallback(
        (cols: number, rows: number) => {
            if (!currentSessionId) return;

            setSessions((prev) => {
                const updated = new Map(prev);
                const session = updated.get(currentSessionId);
                if (session) {
                    if (session.terminalConfig) {
                        session.terminalConfig.cols = cols;
                        session.terminalConfig.rows = rows;
                    }

                    // Send resize message if connected
                    if (session.ws?.readyState === WebSocket.OPEN) {
                        const resizeMessage = JSON.stringify({
                            type: 'resize',
                            cols,
                            rows,
                        });
                        session.ws.send(resizeMessage);
                    }

                    updated.set(currentSessionId, { ...session });
                }
                return updated;
            });
        },
        [currentSessionId]
    );

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            reconnectTimersRef.current.forEach((timer) => {
                clearTimeout(timer);
            });
            sessionsRef.current.forEach((session) => {
                manualDisconnectRef.current.add(session.id);
                if (session.ws) {
                    session.ws.close();
                }
            });
        };
    }, []);

    const value: SessionContextType = {
        session,
        sessions,
        createSession,
        closeSession,
        switchSession,
        appendContent,
        clearContent,
        sendData,
        connectWebSocket,
        reconnectWebSocket,
        disconnect,
        resizeTerminal,
    };

    return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
};

export const useSession = (): SessionContextType => {
    const context = useContext(SessionContext);
    if (!context) {
        throw new Error('useSession must be used within a SessionProvider');
    }
    return context;
};
