import { baseAPI, type ResponseInterface } from './base';

class ApiAuthClass extends baseAPI {
    async login(email: string, password: string, remember_me: boolean, otp?: string) {
        return this.postData<ResponseInterface<string>>('/auth/login', {
            email,
            password,
            remember_me,
            otp,
        });
    }

    async register(username: string, password: string, email: string, token: string) {
        return this.postData<ResponseInterface>('/auth/register', {
            username,
            password,
            email,
            token,
        });
    }

    async logout() {
        return this.postData<ResponseInterface>('/auth/logout', {});
    }

    async authKeys() {
        return this.getData<
            ResponseInterface<{
                captcha: string;
                google: string;
                github: string;
            }>
        >('/auth/keys', false);
    }

    async ping() {
        return this.getData<string>('/auth/ping', false);
    }
}

const ApiAuth = new ApiAuthClass();
export default ApiAuth;
