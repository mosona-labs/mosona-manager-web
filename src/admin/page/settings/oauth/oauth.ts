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
        name: 'Gitlab',
        icon: 'gitlab',
        authorize_url: 'https://gitlab.com/oauth/authorize',
        token_url: 'https://gitlab.com/oauth/token',
        user_url: 'https://gitlab.com/api/v4/user',
    },
    {
        name: 'Google',
        icon: 'google',
        authorize_url: 'https://accounts.google.com/o/oauth2/v2/auth',
        token_url: 'https://oauth2.googleapis.com/token',
        user_url: 'https://www.googleapis.com/oauth2/v2/userinfo',
    },
    {
        name: 'Discord',
        icon: 'discord',
        authorize_url: 'https://discord.com/api/oauth2/authorize',
        token_url: 'https://discord.com/api/oauth2/token',
        user_url: 'https://discord.com/api/users/@me',
    },
    {
        name: 'Microsoft',
        icon: 'microsoft',
        authorize_url: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
        token_url: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
        user_url: 'https://graph.microsoft.com/v1.0/me',
    },
    {
        name: 'Meta Facebook',
        icon: 'meta',
        authorize_url: 'https://www.facebook.com/v19.0/dialog/oauth',
        token_url: 'https://graph.facebook.com/v19.0/oauth/access_token',
        user_url: 'https://graph.facebook.com/me?fields=id,name,email,picture',
    },
    {
        name: 'X (Twitter)',
        icon: 'x',
        authorize_url: 'https://twitter.com/i/oauth2/authorize',
        token_url: 'https://api.twitter.com/2/oauth2/token',
        user_url: 'https://api.twitter.com/2/users/me',
    },
    {
        name: 'LinkedIn',
        icon: 'linkedin',
        authorize_url: 'https://www.linkedin.com/oauth/v2/authorization',
        token_url: 'https://www.linkedin.com/oauth/v2/accessToken',
        user_url: 'https://api.linkedin.com/v2/me',
    },
    {
        name: 'Custom',
        icon: '',
        authorize_url: '',
        token_url: '',
        user_url: '',
    },
];

export default OAuthList;
