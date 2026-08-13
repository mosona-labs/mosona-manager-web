import axios from 'axios';
import qs from 'qs';

const API_BASE_URL = '/api';

function handleAuthError(error: any, authRequired = true): boolean {
    const code = error?.response?.data?.code;
    if (code === 'team_access_revoked') {
        window.location.replace('/');
        return true;
    }
    if (authRequired && code === 'login') {
        window.location.href = '/auth?jump=' + window.location.pathname + window.location.hash;
        return true;
    }
    return false;
}

export interface ResponseInterface<T = undefined> {
    code: string;
    msg: string;
    data: T;
}

export class baseAPI {
    async postData<T>(path: string, data: any, isForm = true): Promise<T> {
        try {
            const response = await axios.post(
                API_BASE_URL + path,
                isForm ? qs.stringify(data) : data,
                isForm
                    ? { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
                    : undefined
            );
            if (response.data.code === '2fa_required') {
                window.location.href = '/2fa';
                return null as T;
            }
            return response.data;
        } catch (error: any) {
            if (handleAuthError(error)) {
                return null as T;
            }
            throw error;
        }
    }

    async getData<T>(path: string, authRequired: boolean = true): Promise<T> {
        try {
            const response = await axios.get(API_BASE_URL + path);
            if (response.data.code === '2fa_required') {
                window.location.href = '/2fa';
                return null as T;
            }
            return response.data;
        } catch (error: any) {
            if (handleAuthError(error, authRequired)) {
                return null as T;
            }
            throw error;
        }
    }

    async putData<T>(path: string, data: any, isForm = true): Promise<T> {
        try {
            const response = await axios.put(
                API_BASE_URL + path,
                isForm ? qs.stringify(data) : data,
                isForm
                    ? { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
                    : undefined
            );
            return response.data;
        } catch (error: any) {
            if (handleAuthError(error)) {
                return null as T;
            }
            throw error;
        }
    }

    async deleteData<T>(path: string, authRequired: boolean = true, data?: any): Promise<T> {
        try {
            const response = await axios.delete(API_BASE_URL + path, {
                data: data === undefined ? undefined : qs.stringify(data),
                headers:
                    data === undefined
                        ? undefined
                        : { 'Content-Type': 'application/x-www-form-urlencoded' },
            });
            return response.data;
        } catch (error: any) {
            if (handleAuthError(error, authRequired)) {
                return null as T;
            }
            throw error;
        }
    }
}
