
import { google } from 'googleapis';

const SCOPES = [
    'https://www.googleapis.com/auth/calendar.events', // Read/Write events
    'https://www.googleapis.com/auth/userinfo.email', // To identify which account connected
];

/**
 * Get the Google OAuth2 Client
 * Ensures client ID, secret, and redirect URI are configured
 */
export const getOAuthClient = () => {
    const clientId = process.env.GOOGLE_CALENDAR_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CALENDAR_CLIENT_SECRET;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') || 'http://localhost:3000';
    const redirectUri = `${appUrl}/api/auth/callback/google-calendar`;

    if (!clientId || !clientSecret) {
        throw new Error('Missing Google Calendar Credentials');
    }

    return new google.auth.OAuth2(
        clientId,
        clientSecret,
        redirectUri
    );
};

/**
 * Generate the Auth URL for the user to visit
 * @param providerId - We pass this in 'state' to know who is connecting
 */
export const getAuthUrl = (providerId: string) => {
    const oauth2Client = getOAuthClient();

    return oauth2Client.generateAuthUrl({
        access_type: 'offline', // Crucial for getting a Refresh Token
        scope: SCOPES,
        state: providerId, // Persist provider ID through the flow
        prompt: 'consent', // Force consent screen to ensure we get a refresh token
    });
};

/**
 * Exchange the authorization code for tokens
 */
export const getTokens = async (code: string) => {
    const oauth2Client = getOAuthClient();
    const { tokens } = await oauth2Client.getToken(code);
    return tokens;
};
