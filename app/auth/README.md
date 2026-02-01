# Google Authentication Setup

## Steps to get Google OAuth credentials:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth client ID"
5. Choose "Web application"
6. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google` (for development)
7. Copy the Client ID and Client Secret

## Add to .env file:

```
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
NEXTAUTH_SECRET=your_random_secret_here
NEXTAUTH_URL=http://localhost:3000
```

## Generate NEXTAUTH_SECRET:

You can generate a random secret using:
```bash
openssl rand -base64 32
```

Or use any random string generator.

## For production:

Update `NEXTAUTH_URL` to your production URL and add the production callback URL in Google Cloud Console.
