import { baseAPI, type ResponseInterface } from './base';

export type CategoryType = {
    id: number;
    name: string;
    sort: number;
};

class ApiCategoryClass extends baseAPI {
    async list() {
        return this.getData<ResponseInterface<CategoryType[]>>('/v1/category');
    }

    async create(name: string) {
        return this.postData<ResponseInterface<CategoryType>>('/v1/category', { name });
    }

    async update(id: number, name: string) {
        return this.putData<ResponseInterface<CategoryType>>('/v1/category/' + id, { name });
    }

    async delete(id: number) {
        return this.deleteData<ResponseInterface<null>>('/v1/category/' + id);
    }

    async sort(ids: number[]) {
        return this.putData<ResponseInterface<null>>('/v1/category/sort', ids, false);
    }
}

const ApiCategory = new ApiCategoryClass();
export default ApiCategory;
