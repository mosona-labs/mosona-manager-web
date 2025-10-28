import { toast } from 'sonner';

const ToastError = (err: any) => {
    const status = err.response.data.code as string;
    if (status == 'err' || status == 'error')
        toast.error('Error', {
            description: err.response.data.msg,
        });
    else
        toast.warning(status.substring(0, 1).toUpperCase() + status.substring(1), {
            description: err.response.data.msg,
        });
};

export { ToastError };
