import { baseAPI, type ResponseInterface } from './base';

export type ServerMinimalType = {
    id: number;
    name: string;
    weight: number;
    category: number;
};

export type ServerFullType = {
    id: number;
    category: number;
    type: number;
    name: string;
    allow_monitor: boolean;
    allow_terminal: boolean;
    weight: number;
    note: string;
    provider: string;
    cycle: number;
    start_time: string; // ISO timestamp from API
    end_time: string; // ISO timestamp from API
    amount: string;
    auto_renew: boolean;
    bandwidth: string;
    traffic: string;
    traffic_type: number;
    note_public: string;

    // Connection
    address: string;
    port: number;

    // SSH
    username: string;
    key_id: number;

    // Agent
    agent_uuid?: string;
    agent_status: number;
    agent_version?: string;
    agent_last_seen_at?: string;
};

export type ServerAddRequest = {
    name: string;
    mode: number; // 0: SSH, 1: Active Agent, 2: Passive Agent
    category_id: number;
    allow_monitor: boolean;
    allow_terminal: boolean;
    weight: number;
    // Information
    note: string;
    provider: string;
    cycle: number;
    start_time: Date | string;
    end_time: Date | string;
    amount: string;
    auto_renew: boolean;
    bandwidth: string;
    traffic: string;
    traffic_type: number;
    note_public: string;
    // Connection
    address?: string;
    port?: number;
    username?: string;
    password?: string;
    key_id?: number;
    host_key?: string;
};

export type ServerEditRequest = {
    name: string;
    address: string;
    port: number;
    username: string;
    password: string;
    key_id: number;
    category: number;
    allow_monitor: boolean;
    allow_terminal: boolean;
    weight: number;
    note: string;
    provider: string;
    cycle: number;
    start_time: Date | string | null;
    end_time: Date | string | null;
    amount: string;
    auto_renew: boolean;
    bandwidth: string;
    traffic: string;
    traffic_type: number;
    note_public: string;
    host_key?: string;
};

export type SSHHostKeyConfirmation = {
    fingerprint: string;
    host_key: string;
    changed: boolean;
};

export function getSSHHostKeyConfirmation(error: unknown): SSHHostKeyConfirmation | null {
    if (typeof error !== 'object' || error === null) return null;
    const response = (
        error as {
            response?: {
                status?: number;
                data?: { code?: string; data?: Partial<SSHHostKeyConfirmation> };
            };
        }
    ).response;
    if (
        response?.status !== 409 ||
        response.data?.code !== 'ssh_host_key_confirmation_required' ||
        typeof response.data.data?.fingerprint !== 'string' ||
        typeof response.data.data?.host_key !== 'string'
    ) {
        return null;
    }
    return {
        fingerprint: response.data.data.fingerprint,
        host_key: response.data.data.host_key,
        changed: response.data.data.changed === true,
    };
}

class ApiServerClass extends baseAPI {
    async info(serverId: number) {
        return this.getData<ResponseInterface<ServerFullType>>('/v1/server/' + serverId);
    }

    async add(data: ServerAddRequest) {
        return this.postData<
            ResponseInterface<{
                id: number;
                // Active
                host?: string;
                port?: number;
                agent_uid?: string;
                public_key?: string;
                // Passive
                hub?: string;
                enroll_token?: string;
            }>
        >('/v1/server', data);
    }

    async edit(serverId: number, data: ServerEditRequest) {
        return this.putData<ResponseInterface>('/v1/server/' + serverId, data, false);
    }

    async delete(serverId: number) {
        return this.deleteData<ResponseInterface>('/v1/server/' + serverId);
    }

    async reinstallAgent(serverId: number, mode: 1 | 2, address?: string, port?: number) {
        return this.postData<
            ResponseInterface<{
                // Active
                host?: string;
                port?: number;
                agent_uid?: string;
                public_key?: string;
                // Passive
                hub?: string;
                enroll_token?: string;
            }>
        >('/v1/server/' + serverId + '/reinstall', {
            mode,
            address,
            port,
        });
    }

    async setCategory(serverId: number, categoryId: number) {
        return this.putData<ResponseInterface>('/v1/server/' + serverId + '/category', {
            category_id: categoryId,
        });
    }
}

const ApiServer = new ApiServerClass();
export default ApiServer;
