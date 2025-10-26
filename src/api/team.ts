import { baseAPI, type ResponseInterface } from './base';

export type TeamPlanType = {
    id: number;
    name: string;
    description: string;
    price: number;
    max_server: number;
    max_member: number;
    max_alert: number;
    created_at: string;
    updated_at: string;
};

class ApiTeamClass extends baseAPI {
    async plans() {
        return this.getData<ResponseInterface<TeamPlanType[]>>('/v1/team/plans');
    }
}

const ApiTeam = new ApiTeamClass();
export default ApiTeam;
