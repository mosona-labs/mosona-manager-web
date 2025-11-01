import type { ServerMinimalType } from './server';

import { baseAPI, type ResponseInterface } from './base';

export type TerminalType = ServerMinimalType & {
    username: string;
    address: string;
    port: number;
    os: string;
};

class ApiTerminalClass extends baseAPI {
    async list() {
        return this.getData<ResponseInterface<TerminalType[]>>('/v1/server/terminal');
    }
}

const ApiTerminal = new ApiTerminalClass();
export default ApiTerminal;
