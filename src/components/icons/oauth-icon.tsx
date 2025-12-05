import { KeyRound } from 'lucide-react';

const OAuthIcon = ({ icon }: { icon: string }) =>
    icon.startsWith('http') ? (
        <img src={icon} className="w-4.5" alt={icon} />
    ) : ['google', 'github'].includes(icon.toLowerCase()) ? (
        <img
            src={'/icons/' + icon.toLowerCase() + '.svg'}
            className="w-4.5 bg-white rounded-full"
            alt={icon}
        />
    ) : (
        <KeyRound />
    );

export default OAuthIcon;
