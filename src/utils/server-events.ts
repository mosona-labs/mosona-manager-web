export const SERVER_MUTATION_EVENT = 'server:changed';

export const notifyServerMutation = () => {
    window.dispatchEvent(new Event(SERVER_MUTATION_EVENT));
};
