import { baseAPI, type ResponseInterface } from '@/api/base.ts';

export type KeyType = {
    id: number;
    name: string;
    created_at: string;
    updated_at: string;
};

class ApiKeyClass extends baseAPI {
    async list() {
        return this.getData<ResponseInterface<KeyType[]>>('/v1/key');
    }

    async add(name: string, content: string, password: string) {
        return this.postData<ResponseInterface<{ id: number }>>('/v1/key', {
            name,
            content,
            password,
        });
    }

    async edit(id: number, name: string, password: string) {
        return this.putData<ResponseInterface<{ id: number }>>('/v1/key/' + id, { name, password });
    }

    async delete(id: number) {
        return this.deleteData<ResponseInterface>('/v1/key/' + id);
    }
}

const ApiKey = new ApiKeyClass();
export default ApiKey;
