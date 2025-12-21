import React, {
    createContext,
    type Dispatch,
    type SetStateAction,
    useCallback,
    useContext,
    useEffect,
    useState,
} from 'react';

import { ToastError } from '@/utils/toast.ts';
import ApiAlert, { type AlertsType } from '@/api/alert.ts';

interface AlertContextValue {
    alerts: Record<number, AlertsType>;
    teamAlerts: AlertsType;
    loading: boolean;
    refresh: () => Promise<void>;
    setAlerts: Dispatch<SetStateAction<Record<number, AlertsType>>>;
    setTeamAlerts: Dispatch<SetStateAction<AlertsType>>;
}

const AlertContext = createContext<AlertContextValue | undefined>(undefined);

export const AlertProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
    const [alerts, setAlerts] = useState<Record<number, AlertsType>>({});
    const [teamAlerts, setTeamAlerts] = useState<AlertsType>({});
    const [loading, setLoading] = useState<boolean>(false);

    const refresh = useCallback(async () => {
        setLoading(true);
        try {
            const res = await ApiAlert.list();
            setAlerts(res.data.alerts);
            setTeamAlerts(res.data.team_alerts);
        } catch (err) {
            ToastError(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void refresh();
    }, [refresh]);

    const value: AlertContextValue = {
        alerts,
        teamAlerts,
        loading,
        refresh,
        setAlerts,
        setTeamAlerts,
    };

    return <AlertContext.Provider value={value}>{children}</AlertContext.Provider>;
};

export function useAlert(): AlertContextValue {
    const ctx = useContext(AlertContext);
    if (!ctx) {
        throw new Error('useAlert must be used within an AlertProvider');
    }
    return ctx;
}
