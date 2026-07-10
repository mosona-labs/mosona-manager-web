import type { UserType } from './user';

import { baseAPI, type ResponseInterface } from './base';

export type TeamPlanType = {
    id: number;
    name: string;
    description: string;
    price: number;
    created_at: string;
    updated_at: string;
};

export type TeamType = {
    id: number;
    owner_id: number;
    name: string;
    description: string;
    color: string;
    image: string;
    created_at: string;
    updated_at: string;
};

export type TeamMemberType = UserType & {
    role: number; // 0 - Administrator 1 - Read & Terminal Access 2 - Read Only
};

export type TeamPublicPageConfigType = {
    enabled: boolean;
    name?: string | null;
    domain?: string | null;
    title?: string | null;
    description?: string | null;
    custom_css?: string | null;
    url_by_name?: string | null;
    url_by_domain?: string | null;
};

export type TeamEncryptedExportFile = {
    format: string;
    kdf: string;
    salt: string;
    nonce: string;
    ciphertext: string;
};

export type TeamImportFile = TeamEncryptedExportFile | Record<string, unknown>;

class ApiTeamClass extends baseAPI {
    async info() {
        return this.getData<
            ResponseInterface<{
                team: TeamType;
                members: TeamMemberType[];
            }>
        >('/v1/team');
    }

    async edit(
        id: number,
        name: string,
        description: string,
        avatar_color: string,
        avatar_image: File | null,
        members: string // JSON
    ) {
        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);
        formData.append('avatar_color', avatar_color);
        if (avatar_image) {
            formData.append('avatar_image', avatar_image);
        }
        formData.append('members', members);

        return this.putData<ResponseInterface>('/v1/team/' + id, formData, false);
    }

    async create(
        name: string,
        description: string,
        avatar_color: string,
        avatar_image: File | null,
        members: string // JSON
    ) {
        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);
        formData.append('avatar_color', avatar_color);
        if (avatar_image) {
            formData.append('avatar_image', avatar_image);
        }
        formData.append('members', members);

        return this.postData<ResponseInterface<number>>('/v1/team', formData, false);
    }

    async leave(team_id: number) {
        return this.deleteData<ResponseInterface>('/v1/team/leave/' + team_id);
    }

    async getPublicPage() {
        return this.getData<ResponseInterface<TeamPublicPageConfigType>>('/v1/team/public-page');
    }

    async updatePublicPage(data: {
        enabled: boolean;
        name?: string;
        domain?: string;
        title?: string;
        description?: string;
        custom_css?: string;
    }) {
        return this.putData<ResponseInterface<TeamPublicPageConfigType>>(
            '/v1/team/public-page',
            data,
            false
        );
    }

    async exportData(totp_code: string, export_password: string) {
        return this.postData<ResponseInterface<TeamEncryptedExportFile>>(
            '/v1/team/export',
            { totp_code, export_password },
            false
        );
    }

    async importData(totp_code: string, file: TeamImportFile, export_password?: string) {
        const payload =
            export_password === undefined
                ? { totp_code, data: file }
                : { totp_code, export_password, encrypted: file };

        return this.postData<ResponseInterface>('/v1/team/import', payload, false);
    }
}

const ApiTeam = new ApiTeamClass();
export default ApiTeam;
