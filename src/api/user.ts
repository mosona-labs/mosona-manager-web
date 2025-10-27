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

    async setActiveTeam(team_id: number) {
        return this.postData<ResponseInterface<null>>('/v1/user/config/active-team/' + team_id, {});
    }
}

const ApiUser = new ApiUserClass();
export default ApiUser;
