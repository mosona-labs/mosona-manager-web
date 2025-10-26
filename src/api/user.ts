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
                team: null;
            }>
        >('/v1/user/me');
    }

    async find(email: string) {
        return this.postData<ResponseInterface<UserType | null>>('/v1/user/find', { email });
    }
}

const ApiUser = new ApiUserClass();
export default ApiUser;
