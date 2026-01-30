# Environment Setup for Expo Mobile App

## Step 1: Create .env file

Create a `.env` file in the `apps/mobile/` directory with your Render backend URL:

```env
API_URL=https://your-backend.onrender.com
```

Replace `https://your-backend.onrender.com` with your actual Render backend URL.

## Step 2: Restart Expo

After creating or updating the `.env` file, you must restart Expo with cache cleared:

```bash
cd apps/mobile
npx expo start --clear
```

Or use:
```bash
npm run start
```

Then press `c` to clear cache.

## Step 3: Connect via Expo Go

### Option A: Same Wi-Fi Network
1. Make sure your phone and computer are on the same Wi-Fi network
2. Scan the QR code with Expo Go app
3. The app should connect automatically

### Option B: Tunnel Mode (Different Networks)
If you're on different networks, use tunnel mode:

```bash
npm run start:tunnel
```

This creates a tunnel connection that works across different networks.

## Backend API Endpoints Expected

The app expects these endpoints on your Render backend:

- `POST /auth/signup` - User registration
  - Body: `{ email: string, password: string }`
  - Returns: `{ user: {...}, token: string }`

- `POST /auth/login` - User login
  - Body: `{ email: string, password: string }`
  - Returns: `{ user: {...}, token: string }`

## Troubleshooting

1. **App not connecting to backend:**
   - Check that `.env` file exists and has correct `API_URL`
   - Restart Expo with `--clear` flag
   - Verify backend is running and accessible
   - Check CORS settings on backend

2. **Network errors:**
   - Use tunnel mode if on different networks
   - Check backend URL is correct (no trailing slash)
   - Verify backend is not sleeping (Render free tier)

3. **Environment variables not loading:**
   - Make sure `.env` is in `apps/mobile/` directory
   - Restart Expo completely
   - Check `babel.config.js` has react-native-dotenv plugin
