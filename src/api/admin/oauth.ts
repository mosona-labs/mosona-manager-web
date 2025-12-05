import { baseAPI, type ResponseInterface } from '@/api/base.ts';

export type OAuthProviderType = {
    id: number;
    name: string;
    icon: string;
    auth_url: string;
    token_url: string;
    userinfo_url: string;
    client_id: string;
    client_secret: string;
    skip_2fa: boolean;
    is_enabled: boolean;
    updated_at: string;
    created_at: string;
};

class ApiAdminOAuthClass extends baseAPI {
    async list(page: number, size: number) {
        return this.getData<
            ResponseInterface<{
                items: OAuthProviderType[];
                total: number;
            }>
        >('/admin/oauth?page=' + page + '&size=' + size);
    }

    async add(data: Omit<OAuthProviderType, 'id' | 'created_at' | 'updated_at'>) {
        return this.postData<ResponseInterface>('/admin/oauth', data);
    }

    async update(id: number, data: Omit<OAuthProviderType, 'id' | 'created_at' | 'updated_at'>) {
        return this.putData<ResponseInterface>('/admin/oauth/' + id, data);
    }

    async del(id: number) {
        return this.deleteData<ResponseInterface>('/admin/oauth/' + id);
    }

    async sort(ids: number[]) {
        return this.postData<ResponseInterface>('/admin/oauth/sort', ids, false);
    }
}

const ApiAdminOAuth = new ApiAdminOAuthClass();
export default ApiAdminOAuth;
