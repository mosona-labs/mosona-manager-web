import type { UserType } from '@/api/user.ts';

import { baseAPI, type ResponseInterface } from '@/api/base.ts';

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
        user: Omit<UserType, 'id' | 'created_at' | 'updated_at'> & { password: string }
    ) {
        return this.putData<ResponseInterface>('/admin/users/' + id, user);
    }

    async del(id: number) {
        return this.deleteData<ResponseInterface>('/admin/users/' + id);
    }
}

const ApiAdminUser = new ApiAdminUserClass();
export default ApiAdminUser;
