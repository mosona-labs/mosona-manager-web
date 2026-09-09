import { toast } from 'sonner';

const ToastError = (err: any) => {
    // Network errors/timeouts have no response payload at all.
    const code = err?.response?.data?.code;
    const msg = err?.response?.data?.msg;
    if (code) {
        if (code == 'err' || code == 'error')
            toast.error('Error', {
                description: msg,
            });
        else
            toast.warning(code.substring(0, 1).toUpperCase() + code.substring(1), {
                description: msg,
            });
    } else {
        toast.warning('Connection Error', {
            description: 'Please check your network connection and try again.',
        });
    }
};

export { ToastError };
