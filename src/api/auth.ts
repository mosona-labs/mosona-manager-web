import { baseAPI, type ResponseInterface } from './base';

export type OAuthPublicType = {
    id: number;
    icon: string;
    name: string;
};

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
                oauth: OAuthPublicType[];
            }>
        >('/auth/keys', false);
    }

    // OAuth
    async oauthLogin(id: number) {
        return this.getData<
            ResponseInterface<{
                url: string;
                state: string;
            }>
        >('/auth/oauth/' + id, false);
    }
    async oauthCallback(id: number, code: string, state: string) {
        return this.postData<ResponseInterface<string>>('/auth/oauth/' + id, {
            code,
            state,
        });
    }

    // 2FA
    async twoFAStatus() {
        return this.getData<
            ResponseInterface<{
                verified: boolean;
                totp: boolean;
                login_2fa: boolean;
                cooling: number;
            }>
        >('/auth/2fa/status');
    }
    async twoFASendMFA(mode: 'activation' | '2fa') {
        return this.postData<ResponseInterface>('/auth/2fa/send_code', { mode });
    }
    async twoFAVerifyMFA(code: string) {
        return this.postData<ResponseInterface>('/auth/2fa/verify_code', { code });
    }
    async twoFAVerifyTOTP(code: string) {
        return this.postData<ResponseInterface>('/auth/2fa/verify_totp', { code });
    }
}

const ApiAuth = new ApiAuthClass();
export default ApiAuth;
