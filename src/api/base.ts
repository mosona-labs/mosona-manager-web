import axios from 'axios';
import qs from 'qs';

const API_BASE_URL = '/api';

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
                isForm ? qs.stringify(data) : data
            );
            return response.data;
        } catch (error: any) {
            if (error.response.data.code === 'login') {
                window.location.href =
                    '/auth?jump=' + window.location.pathname + window.location.hash;
                return null as T;
            }
            throw error;
        }
    }

    async getData<T>(path: string, needLogin: boolean = true): Promise<T> {
        try {
            const response = await axios.get(API_BASE_URL + path);
            return response.data;
        } catch (error: any) {
            if (needLogin && error.response.data.code === 'login') {
                window.location.href =
                    '/auth?jump=' + window.location.pathname + window.location.hash;
                return null as T;
            }
            throw error;
        }
    }

    async putData<T>(path: string, data: any, isForm = true): Promise<T> {
        try {
            const response = await axios.put(
                API_BASE_URL + path,
                isForm ? qs.stringify(data) : data
            );
            return response.data;
        } catch (error: any) {
            if (error.response.data.code === 'login') {
                window.location.href =
                    '/auth?jump=' + window.location.pathname + window.location.hash;
                return null as T;
            }
            throw error;
        }
    }

    async deleteData<T>(path: string, needLogin: boolean = true): Promise<T> {
        try {
            const response = await axios.delete(API_BASE_URL + path);
            return response.data;
        } catch (error: any) {
            if (needLogin && error.response.data.code === 'login') {
                window.location.href =
                    '/auth?jump=' + window.location.pathname + window.location.hash;
                return null as T;
            }
            throw error;
        }
    }
}
