import type { ServerMinimalType } from './server';

import { baseAPI, type ResponseInterface } from './base';

// SSH/OS fields come from LEFT JOINs in ListTerminals and are nullable
// (agent-mode servers have no SSH record); the backend omits them via omitempty.
export type TerminalType = ServerMinimalType & {
    os?: string | null;
    username?: string | null;
    address?: string | null;
    port?: number | null;
};

class ApiTerminalClass extends baseAPI {
    async list() {
        return this.getData<ResponseInterface<TerminalType[]>>('/v1/server/terminal');
    }
}

const ApiTerminal = new ApiTerminalClass();
export default ApiTerminal;
