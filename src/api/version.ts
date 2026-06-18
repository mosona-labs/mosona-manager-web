import { baseAPI } from '@/api/base.ts';

export type VersionResponse = {
    code: string;
    version: string;
};

class ApiVersionClass extends baseAPI {
    async get() {
        return this.getData<VersionResponse>('/v1/version', false);
    }
}

const ApiVersion = new ApiVersionClass();
export default ApiVersion;
