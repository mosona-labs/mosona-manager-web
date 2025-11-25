import { toast } from 'sonner';

const ToastError = (err: any) => {
    if (err.response.data.code) {
        const status = err.response.data.code as string;
        if (status == 'err' || status == 'error')
            toast.error('Error', {
                description: err.response.data.msg,
            });
        else
            toast.warning(status.substring(0, 1).toUpperCase() + status.substring(1), {
                description: err.response.data.msg,
            });
    } else {
        toast.warning('Connection Error', {
            description: 'Please check your network connection and try again.',
        });
    }
};

export { ToastError };
