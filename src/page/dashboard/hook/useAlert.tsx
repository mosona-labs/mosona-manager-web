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
import ApiAlert, { type AlertItemConfigType, type AlertsType } from '@/api/alert.ts';

interface AlertContextValue {
    alerts: Record<number, AlertsType>;
    teamAlerts: AlertsType;
    itemConfigs: AlertItemConfigType[];
    loading: boolean;
    refresh: () => Promise<void>;
    setAlerts: Dispatch<SetStateAction<Record<number, AlertsType>>>;
    setTeamAlerts: Dispatch<SetStateAction<AlertsType>>;
    setItemConfigs: Dispatch<SetStateAction<AlertItemConfigType[]>>;
}

const AlertContext = createContext<AlertContextValue | undefined>(undefined);

export const AlertProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
    const [alerts, setAlerts] = useState<Record<number, AlertsType>>({});
    const [teamAlerts, setTeamAlerts] = useState<AlertsType>({});
    const [itemConfigs, setItemConfigs] = useState<AlertItemConfigType[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const refresh = useCallback(async () => {
        setLoading(true);
        try {
            const res = await ApiAlert.list();
            setAlerts(res.data.alerts);
            setTeamAlerts(res.data.team_alerts);
            setItemConfigs(res.data.item_configs || []);
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
        itemConfigs,
        loading,
        refresh,
        setAlerts,
        setTeamAlerts,
        setItemConfigs,
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
