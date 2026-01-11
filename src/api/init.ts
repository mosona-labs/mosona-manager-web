import { baseAPI, type ResponseInterface } from '@/api/base.ts';

class ApiInitClass extends baseAPI {
    async status() {
        return this.getData<ResponseInterface<boolean>>('/init');
    }

    async setup(
        username: string,
        password: string,
        email: string,
        website_url: string,
        registration_enable: boolean
    ) {
        return this.postData<ResponseInterface>('/init', {
            username,
            password,
            email,
            website_url,
            registration_enable,
        });
    }
}

const ApiInit = new ApiInitClass();
export default ApiInit;
