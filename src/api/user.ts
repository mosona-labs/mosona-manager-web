import type { TeamType } from './team';

import { baseAPI, type ResponseInterface } from './base';

export type UserType = {
    id: number;
    username: string;
    email: string;
    is_admin: boolean;
    verified?: boolean;
    totp_enabled?: boolean;
    created_at: string;
    updated_at: string;
    login_at?: string;
    pwd_at?: string;
};

export type UserSessionType = {
    id: string;
    uid: number;
    tid: number;
    user_agent: string;
    time: number;
};

export type AuthIdentityType = {
    id: number;
    name: string;
    icon: string;
    linked: {
        name: string;
        email: string;
        last_login_at: string;
    };
};

class ApiUserClass extends baseAPI {
    async me(authRequired: boolean = true) {
        return this.getData<
            ResponseInterface<{
                user: UserType;
                team: TeamType | null;
                teams: TeamType[];
            }>
        >('/v1/user/me', authRequired);
    }

    async find(email: string) {
        return this.postData<ResponseInterface<UserType | null>>('/v1/user/find', { email });
    }

    // Info
    async changeUsername(username: string) {
        return this.putData<ResponseInterface>('/v1/user/edit/username', { username });
    }

    // Team
    async setActiveTeam(team_id: number) {
        return this.postData<ResponseInterface>('/v1/user/config/active-team/' + team_id, {});
    }

    // Session
    async sessions() {
        return this.getData<
            ResponseInterface<{
                current: string;
                list: UserSessionType[];
            }>
        >('/v1/user/sessions');
    }
    async revokeSession(session_id: string) {
        return this.deleteData<ResponseInterface>('/v1/user/sessions/' + session_id);
    }
    async revokeAllSessions() {
        return this.deleteData<ResponseInterface>('/v1/user/sessions');
    }

    // OAuth
    async oauthIdentities() {
        return this.getData<ResponseInterface<AuthIdentityType[]>>('/v1/user/oauth');
    }
    async revokeOAuthIdentity(provider_id: number) {
        return this.deleteData<ResponseInterface>('/v1/user/oauth/' + provider_id);
    }
    async linkOAuthIdentity(id: number, code: string, state: string) {
        return this.postData<ResponseInterface>('/v1/user/oauth/' + id, {
            code,
            state,
        });
    }

    // TOTP
    async enableTOTP() {
        return this.postData<
            ResponseInterface<{
                secret: string;
                url: string;
            }>
        >('/v1/user/totp/enable', {});
    }
    async confirmTOTP(secret: string, code: string) {
        return this.postData<ResponseInterface>('/v1/user/totp/confirm', { secret, code });
    }
    async disableTOTP(code?: string) {
        return this.postData<ResponseInterface>('/v1/user/totp/disable', { v_code: code });
    }
}

const ApiUser = new ApiUserClass();
export default ApiUser;
