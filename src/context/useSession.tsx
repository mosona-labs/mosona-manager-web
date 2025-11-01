import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export interface SessionData {
    id: string;
    serverId: number;
    name: string;
    os: string;
    content: string;
    createdAt: Date;
    terminalConfig?: {
        cols: number;
        rows: number;
        term: string;
    };
    // WebSocket connection per session
    ws: WebSocket | null;
    isConnected: boolean;
}

interface SessionContextType {
    session: SessionData | null;
    sessions: Map<string, SessionData>;

    // Session Actions
    createSession: (
        config: Omit<SessionData, 'id' | 'content' | 'createdAt' | 'ws' | 'isConnected'>,
        onCreated?: (sessionId: string) => void
    ) => void;
    closeSession: (sessionId: string) => void;
    switchSession: (sessionId: string) => SessionData | null;

    // Content Actions
    appendContent: (sessionId: string, content: string) => void;
    clearContent: () => void;

    // WebSocket Actions
    sendData: (sessionId: string, data: string | ArrayBuffer | Uint8Array) => void;
    connectWebSocket: (
        sessionId: string,
        terminalConfig?: { cols: number; rows: number; term: string }
    ) => void;
    disconnect: (sessionId: string) => void;

    // Resize terminal
    resizeTerminal: (cols: number, rows: number) => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [session, setSession] = useState<SessionData | null>(null);
    const [sessions, setSessions] = useState<Map<string, SessionData>>(new Map());
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

    const navigator = useNavigate();

    useEffect(() => {
        if (currentSessionId) {
            setSession(sessions.get(currentSessionId) || null);
        } else {
            setSession(null);
        }
    }, [currentSessionId, sessions]);

    // Append content to specific session
    const appendContent = useCallback((sessionId: string, content: string) => {
        setSessions((prev) => {
            const updated = new Map(prev);
            const session = updated.get(sessionId);
            if (session) {
                session.content += content;
                updated.set(sessionId, { ...session });
            }
            return updated;
        });
    }, []);

    const createSession = useCallback(
        (
            config: Omit<SessionData, 'id' | 'content' | 'createdAt' | 'ws' | 'isConnected'>,
            onCreated?: (sessionId: string) => void
        ) => {
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
            };

            setSessions((prev) => {
                const updated = new Map(prev);
                updated.set(newSession.id, newSession);
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
        [currentSessionId]
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
        [sessions, currentSessionId]
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
        (sessionId: string, terminalConfig?: { cols: number; rows: number; term: string }) => {
            const existingSession = sessions.get(sessionId);
            if (!existingSession) {
                console.error('Session not found:', sessionId);
                return;
            }
            if (existingSession?.ws?.readyState === WebSocket.OPEN) {
                console.warn('WebSocket already connected for this session');
                return;
            }

            // appendContent(sessionId, '\r\nConnecting...');

            const protocol = window.location.protocol === 'http:' ? 'ws://' : 'wss://';
            const wsUrl = `${protocol}${window.location.host}/api/v1/server/terminal/${existingSession.serverId}/ws`;

            try {
                const websocket = new WebSocket(wsUrl);

                websocket.onopen = () => {
                    // Update session with WebSocket
                    setSessions((prev) => {
                        const updated = new Map(prev);
                        const session = updated.get(sessionId);
                        if (session) {
                            session.ws = websocket;
                            session.isConnected = true;
                            if (terminalConfig) {
                                session.terminalConfig = terminalConfig;
                            }
                            updated.set(sessionId, { ...session });
                        }
                        return updated;
                    });

                    // Send init config if provided
                    if (terminalConfig) {
                        const initMessage = JSON.stringify({
                            type: 'resize',
                            cols: terminalConfig.cols,
                            rows: terminalConfig.rows,
                        });
                        websocket.send(initMessage);
                    }
                };

                websocket.onmessage = (event) => {
                    if (event.data instanceof Blob) {
                        event.data
                            .arrayBuffer()
                            .then((buffer) => {
                                const decoder = new TextDecoder('utf-8', { fatal: false });
                                const text = decoder.decode(buffer);
                                appendContent(sessionId, text);
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
                    setSessions((prev) => {
                        const updated = new Map(prev);
                        const session = updated.get(sessionId);
                        if (session) {
                            session.isConnected = false;
                            updated.set(sessionId, { ...session });
                        }
                        return updated;
                    });
                };

                websocket.onclose = () => {
                    console.log('WebSocket disconnected');
                    setSessions((prev) => {
                        const updated = new Map(prev);
                        const session = updated.get(sessionId);
                        if (session) {
                            session.isConnected = false;
                            session.ws = null;
                            session.content += '\r\n[Connection closed]\r\n';
                            updated.set(sessionId, { ...session });
                        }
                        return updated;
                    });
                };
            } catch (error) {
                console.error('Failed to create WebSocket:', error);
            }
        },
        [sessions, appendContent]
    );

    // Disconnect specific session
    const disconnect = useCallback((sessionId: string) => {
        setSessions((prev) => {
            const updated = new Map(prev);
            const session = updated.get(sessionId);
            if (session?.ws) {
                session.ws.close();
                session.ws = null;
                session.isConnected = false;
                updated.set(sessionId, { ...session });
            }
            return updated;
        });
    }, []);

    // Send data to current session
    const sendData = useCallback(
        (sessionId: string, data: string | ArrayBuffer | Uint8Array) => {
            const currentSession = sessions.get(sessionId);
            if (!currentSession?.ws) {
                console.warn('WebSocket is not connected');
                return;
            }

            if (currentSession.ws.readyState === WebSocket.OPEN) {
                if (typeof data === 'string') {
                    currentSession.ws.send(data);
                } else if (data instanceof Uint8Array) {
                    currentSession.ws.send(data.buffer);
                } else {
                    currentSession.ws.send(data);
                }
            } else {
                console.warn('WebSocket is not open');
                connectWebSocket(sessionId, currentSession.terminalConfig);
            }
        },
        [sessions]
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
            sessions.forEach((session) => {
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
