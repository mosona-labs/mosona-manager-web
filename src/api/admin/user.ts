import type { UserType } from '@/api/user.ts';

import { baseAPI, type ResponseInterface } from '@/api/base.ts';

export interface OwnedTeamSummary {
    id: number;
    name: string;
}

class ApiAdminUserClass extends baseAPI {
    async list(page: number, size: number, search: string, verify: string) {
        return this.getData<
            ResponseInterface<{
                users: UserType[];
                total: number;
            }>
        >(
            '/admin/users/list?page=' +
                page +
                '&size=' +
                size +
                '&search=' +
                search +
                '&verify=' +
                verify
        );
    }

    async add(user: Omit<UserType, 'id' | 'created_at' | 'updated_at'> & { password: string }) {
        return this.postData<ResponseInterface<{ id: number }>>('/admin/users', user);
    }

    async update(
        id: number,
        user: Omit<UserType, 'id' | 'created_at' | 'updated_at'> & {
            password: string;
            current_password?: string;
        }
    ) {
        return this.putData<ResponseInterface>('/admin/users/' + id, user);
    }

    async del(id: number, confirmation: string, currentPassword: string) {
        return this.deleteData<ResponseInterface<{ teams?: OwnedTeamSummary[] }>>(
            '/admin/users/' + id + '?confirm=' + encodeURIComponent(confirmation),
            true,
            { current_password: currentPassword }
        );
    }
}

const ApiAdminUser = new ApiAdminUserClass();
export default ApiAdminUser;
