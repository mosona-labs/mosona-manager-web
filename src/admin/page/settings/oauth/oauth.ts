export type BuiltInOAuthType = {
    name: string;
    icon: string;
    authorize_url: string;
    token_url: string;
    user_url: string;
};

const OAuthList: BuiltInOAuthType[] = [
    {
        name: 'Github',
        icon: 'github',
        authorize_url: 'https://github.com/login/oauth/authorize',
        token_url: 'https://github.com/login/oauth/access_token',
        user_url: 'https://api.github.com/user',
    },
    {
        name: 'Google',
        icon: 'google',
        authorize_url: 'https://accounts.google.com/o/oauth2/v2/auth',
        token_url: 'https://oauth2.googleapis.com/token',
        user_url: 'https://www.googleapis.com/oauth2/v2/userinfo',
    },
];

export default OAuthList;
