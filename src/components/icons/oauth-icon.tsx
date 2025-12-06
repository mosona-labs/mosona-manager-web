import { KeyRound } from 'lucide-react';

const OAuthIcon = ({ icon }: { icon: string }) =>
    icon.startsWith('http') ? (
        <img src={icon} className="w-4.5" alt={icon} />
    ) : ['google', 'github', 'discord'].includes(icon.toLowerCase()) ? (
        <img
            src={'/icons/' + icon.toLowerCase() + '.svg'}
            className="w-4.5 bg-white rounded-full"
            alt={icon}
        />
    ) : ['gitlab', 'discord', 'microsoft', 'meta', 'x', 'linkedin'].includes(icon.toLowerCase()) ? (
        <div className={'w-4.5 p-0.5 bg-white rounded-full overflow-hidden'}>
            <img src={'/icons/' + icon.toLowerCase() + '.svg'} className=" bg-white" alt={icon} />
        </div>
    ) : (
        <KeyRound />
    );

export default OAuthIcon;
