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

    async add(name: string, content: string) {
        return this.postData<ResponseInterface<{ id: number }>>('/v1/key', { name, content });
    }

    async edit(id: number, name: string) {
        return this.putData<ResponseInterface<{ id: number }>>('/v1/key/' + id, { name });
    }

    async delete(id: number) {
        return this.deleteData<ResponseInterface>('/v1/key/' + id);
    }
}

const ApiKey = new ApiKeyClass();
export default ApiKey;
