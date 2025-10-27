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

export type TeamType = {
    id: number;
    name: string;
    description: string;
    color: string;
    image: string;
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

    async create(
        name: string,
        description: string,
        avatar_color: string,
        avatar_image: File | null,
        members: string, // 0,1,2
        plan_id: number
    ) {
        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);
        formData.append('avatar_color', avatar_color);
        if (avatar_image) {
            formData.append('avatar_image', avatar_image);
        }
        formData.append('members', members);
        formData.append('plan_id', plan_id.toString());

        return this.postData<ResponseInterface<number>>('/v1/team', formData, false);
    }
}

const ApiTeam = new ApiTeamClass();
export default ApiTeam;
