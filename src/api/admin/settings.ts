import { baseAPI, type ResponseInterface } from '@/api/base.ts';

export type AdminSettingsType = {
    debug: boolean;

    title: string;
    favicon: string;

    // Domain
    domain: string;

    // Email
    email_provider: string;
    // SMTP
    smtp_host: string;
    smtp_port: number;
    smtp_username: string;
    smtp_password: string;
    smtp_tls: boolean;

    // Login
    session_bind_ip: boolean;
    email_verify_login: boolean;

    // Registration
    registration_enabled: boolean;
    registration_verify_email: boolean;
    captcha_site_key: string;
    captcha_secret_key: string;
};

export type UploadFaviconResponse = {
    favicon: string;
};

class ApiAdminSettingsClass extends baseAPI {
    async get() {
        return this.getData<ResponseInterface<AdminSettingsType>>('/admin/settings');
    }

    async set(data: { key: string; value: string }[]) {
        return this.postData<ResponseInterface>('/admin/settings', data, false);
    }

    async uploadFavicon(file: File) {
        const formData = new FormData();
        formData.append('image', file);

        return this.postData<ResponseInterface<UploadFaviconResponse>>(
            '/admin/settings/favicon',
            formData,
            false
        );
    }

    // Test
    async testEmail() {
        return this.postData<ResponseInterface>('/admin/settings/test/email', {}, false);
    }
}

const ApiAdminSettings = new ApiAdminSettingsClass();
export default ApiAdminSettings;
