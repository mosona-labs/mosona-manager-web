import type { TeamType } from './team';

import { baseAPI, type ResponseInterface } from './base';

export type UserType = {
    id: number;
    username: string;
    email: string;
    is_admin: boolean;
    created_at: string;
    updated_at: string;
};

export type UserSessionType = {
    id: string;
    uid: number;
    tid: number;
    user_agent: string;
    time: number;
};

class ApiUserClass extends baseAPI {
    async me() {
        return this.getData<
            ResponseInterface<{
                user: UserType;
                team: TeamType;
                teams: TeamType[];
            }>
        >('/v1/user/me');
    }

    async find(email: string) {
        return this.postData<ResponseInterface<UserType | null>>('/v1/user/find', { email });
    }

    // Info
    async changeUsername(username: string) {
        return this.putData<ResponseInterface<null>>('/v1/user/edit/username', { username });
    }

    // Team
    async setActiveTeam(team_id: number) {
        return this.postData<ResponseInterface<null>>('/v1/user/config/active-team/' + team_id, {});
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
        return this.deleteData<ResponseInterface<null>>('/v1/user/sessions/' + session_id);
    }
}

const ApiUser = new ApiUserClass();
export default ApiUser;
