import { baseAPI, type ResponseInterface } from '@/api/base.ts';

export type NotificationType = {
    module: string;
    target: string;
};

class ApiNotificationClass extends baseAPI {
    async list() {
        return this.getData<ResponseInterface<NotificationType[]>>('/v1/team/notification');
    }

    async update(data: NotificationType[]) {
        return this.putData<ResponseInterface>('/v1/team/notification', data, false);
    }

    async test(uri: string) {
        return this.postData<ResponseInterface>('/v1/team/notification/test', { uri });
    }
}

const ApiNotification = new ApiNotificationClass();
export default ApiNotification;
