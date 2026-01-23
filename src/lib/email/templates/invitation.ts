interface InvitationEmailProps {
    inviteUrl: string;
    inviterName?: string;
    organizationName?: string;
    role: string;
}

export const getInvitationEmail = ({
    inviteUrl,
    inviterName = 'An admin',
    organizationName = 'ScheduleApp',
    role,
}: InvitationEmailProps) => {
    const subject = `Join ${organizationName} on ScheduleApp`;

    // Simple responsive HTML template
    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .button { display: inline-block; padding: 12px 24px; background-color: #0D9488; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; }
        .footer { margin-top: 30px; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <h2>You've been invited!</h2>
        <p>Hello,</p>
        <p><strong>${inviterName}</strong> has invited you to join <strong>${organizationName}</strong> as a <strong>${role}</strong>.</p>
        
        <p>Click the button below to accept your invitation and set up your account:</p>
        
        <p style="text-align: center; margin: 30px 0;">
            <a href="${inviteUrl}" class="button" style="color: white !important;">Accept Invitation</a>
        </p>
        
        <p>Or copy and paste this link into your browser:</p>
        <p style="color: #0D9488; word-break: break-all;">${inviteUrl}</p>
        
        <div class="footer">
            <p>This invitation allows you to access the team dashboard. If you were not expecting this, you can ignore this email.</p>
        </div>
    </div>
</body>
</html>
    `;

    return { subject, html };
};
