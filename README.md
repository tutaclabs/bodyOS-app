# bodyOS - Educational Wellness Co-Pilot

bodyOS is a local-first wellness tracking and protocol management platform designed for educational purposes. The app helps you track protocols, manage reconstitution calculations, monitor wellness metrics, and access educational resources—all while keeping your data private and stored locally on your device.

## 🎯 Features

### Core Features
- **Reconstitution Calculator**: Calculate precise syringe draw amounts for peptide reconstitution
- **Protocol Scheduler**: Manage active protocols with cycle tracking (days on/off)
- **Wellness Metrics Tracking**: Daily tracking of energy, metabolism, bowel frequency, and recovery
- **Bio-Supportive Floors**: Track protein, fiber, and hydration targets (no calorie counting)
- **Goal Programs**: Structured wellness programs (e.g., 14-Day Energy Reset) with daily habits and educational content

### Intelligence & Education
- **BodyOS Intelligence**: AI-powered wellness education assistant with safety guardrails
- **Knowledge Library**: Searchable database of compounds, peptides, and supplements with standardized information
- **Personalized Insights**: AI-generated insights based on your protocols and nutrition data
- **Safety Analysis**: Protocol safety checking with interaction warnings

### User Experience
- **Interactive Onboarding**: 90-second lifestyle snapshot to personalize your experience
- **Bilingual Support**: Full English and Portuguese language support
- **Medical Disclaimers**: Built-in educational disclaimers (EN/PT)
- **Local-First Storage**: All data stored locally—never leaves your device

## 📱 Platforms

### Web App
- Access via browser at `http://localhost:5173` (development)
- Responsive design works on desktop and mobile browsers
- No installation required

### Mobile App (React Native / Expo)
- iOS and Android support
- Native mobile experience
- Install via Expo Go or build standalone app

## 🚀 Getting Started

### Prerequisites

**Web App:**
- Node.js 18+ (currently tested with v18.15.0)
- npm or yarn

**Mobile App:**
- Node.js 20+ (required for React Native dependencies)
- Expo CLI (installed automatically with npm install)
- iOS: Xcode and iOS Simulator (macOS only)
- Android: Android Studio and Android Emulator
- Or use Expo Go app on physical device

### Installation

#### Web App

```bash
# From project root
npm install
npm run dev
```

The app will be available at `http://localhost:5173`

#### Mobile App

```bash
# Navigate to mobile directory
cd apps/mobile
npm install
npm start
```

Then:
- Press `i` for iOS Simulator (requires Xcode on macOS)
- Press `a` for Android Emulator (requires Android Studio)
- Scan QR code with Expo Go app on your phone

**Alternative start commands:**
```bash
npm run start:localhost  # Force localhost connection
npm run start:tunnel     # Use tunnel mode (works behind firewalls)
npm run ios              # Direct iOS launch
npm run android          # Direct Android launch
```

## 📖 How to Use

### First Time Setup

1. **Landing Page**: View the hero section and app overview
2. **Login/Sign Up**: 
   - Click "Get Started" to access login screen
   - Sign up with email and password (minimum 6 characters)
   - Or sign in if you already have an account
   - *Note: Credentials are stored locally for testing purposes*
3. **Onboarding**: Complete the 3-step onboarding:
   - Step 1: Select your optimization goals (Energy, Sleep, Skin, etc.)
   - Step 2: Choose your experience level (Beginner, Intermediate, Advanced)
   - Step 3: Set lifestyle factors (sleep quality, stress level, training frequency)
4. **Medical Disclaimer**: Read and accept the educational disclaimer

### Main App Navigation

**Mobile App Tabs:**
- **Dashboard**: View active protocols, nutrition floors, and insights
- **Calc**: Reconstitution calculator
- **Health**: Wellness metrics and safety resources
- **Library**: Knowledge library and BodyOS Intelligence chat
- **Goals**: Goal programs and daily habit tracking

**Web App:**
- All features accessible in a single scrollable view
- Mobile-responsive with bottom navigation on small screens

### Using Core Features

#### Reconstitution Calculator

1. Navigate to **Calc** tab (mobile) or find the "Reconstitution Wizard" section (web)
2. Enter:
   - **Total Vial Content (mg)**: e.g., 5mg
   - **BAC Water Added (ml)**: e.g., 2ml
   - **Desired Dose (mcg)**: e.g., 250mcg
3. View the calculated **Draw Amount** in units (100-unit syringe)
4. Safety warnings appear for large volumes or high doses

#### Protocol Management

1. Go to **Dashboard** tab
2. Click the **+** button to add a protocol
3. Choose input method:
   - **Manual Entry**: Enter name, days on, days off
   - **AI Parse**: Describe naturally (e.g., "Add BPC-157, 5 days on, 2 days off")
4. View active protocols with cycle information
5. Use **Check Safety** to analyze protocol interactions
6. Delete protocols by clicking the trash icon

#### Wellness Metrics

1. Navigate to **Health** tab
2. Find the **Wellness Metrics** section
3. Track daily:
   - **Energy Level**: Use +/- buttons or slider (1-10 scale)
   - **Metabolism Notes**: Free-form text notes
   - **Bowel Frequency**: Number of times per day
   - **Post-Recovery Pain**: Scale from 0-10
4. Click **Save Entry** to store today's metrics
5. Data is date-stamped and stored locally

#### Goal Programs

1. Go to **Goals** tab
2. Browse available programs (e.g., "14-Day Energy Reset")
3. Click **Start Program** to begin
4. Each day:
   - View daily habits checklist
   - Check off completed habits
   - Read educational content (when available)
   - Navigate between days with Previous/Next buttons
5. Track progress percentage
6. Exit program anytime to return to program selection

#### BodyOS Intelligence Chat

1. Navigate to **Library** tab
2. Scroll to **BodyOS Intelligence** section
3. **First time**: Add your OpenAI API key (stored locally, never shared)
4. Ask questions about:
   - General wellness information
   - Compound mechanisms
   - Educational content
5. **Safety Features**:
   - Blocks personalized dosing requests
   - Red flags for pregnancy, chronic disease, severe symptoms
   - Provides educational responses only

#### Knowledge Library

1. Go to **Library** tab
2. Use search bar to find compounds
3. Filter by category (All, Peptide, Vitamin, etc.)
4. Click any item to expand and view:
   - Mechanism of Action
   - Wellness Uses
   - Common Forms & Timing
   - Who Should Avoid
   - Interactions
   - Evidence Level
   - Regulatory Status

#### Bio-Supportive Floors

1. On **Dashboard**, find "Bio-Supportive Floors"
2. Track three metrics:
   - **Protein** (grams)
   - **Fiber** (grams)
   - **Hydration** (liters)
3. Use **+** and **-** buttons to adjust current values
4. Progress bars show percentage toward daily targets
5. No calorie tracking—focus on minimum floors only

### Language Toggle

- Click the **EN/PT** button in the header
- All UI text switches between English and Portuguese
- Language preference is saved automatically

### Navigation

**Return to Landing/Hero Section:**
- **Mobile**: Click the bodyOS logo/text in the header
- **Web**: Click the Home icon in navigation
- **Logout**: Click "Logout" button in header (mobile) to return to landing

## 🔐 Authentication (Testing)

For testing purposes, the app uses local authentication:

**Sign Up:**
- Email: Any valid email format
- Password: Minimum 6 characters
- Credentials stored locally in AsyncStorage (mobile) or localStorage (web)

**Sign In:**
- Use the email and password you registered
- Session persists across app restarts
- Logout clears session and returns to landing

**Note**: This is for testing only. In production, implement proper authentication.

## 🛡️ Privacy & Data

- **100% Local Storage**: All data stored on your device
- **No Cloud Sync**: Data never leaves your device
- **No Analytics**: Zero tracking or data collection
- **API Keys**: Stored locally, never shared
- **Chat History**: Optional, stored locally if enabled

## ⚙️ Configuration

### OpenAI API Key (Optional)

Required for:
- BodyOS Intelligence chat
- AI protocol parsing
- Safety analysis
- Personalized insights

**To add API key:**
1. Get key from [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. In app, navigate to Library or Health tab
3. Click "Add API Key"
4. Enter key (stored locally, never shared)

## 🐛 Troubleshooting

### Mobile App Connection Issues

**Simulator timeout error:**
```bash
# Try tunnel mode
cd apps/mobile
npm run start:tunnel
```

**Network issues:**
- Ensure device/simulator and computer are on same network
- Try `npm run start:localhost` for localhost-only connection
- Use Expo Go app on physical device as alternative

### Data Not Persisting

- Check that AsyncStorage (mobile) or localStorage (web) is enabled
- Clear app data and restart if needed
- Data is stored per device/browser

### API Key Issues

- Verify key is valid and has credits
- Check key is saved correctly (should show "Remove Key" option)
- Ensure internet connection for API calls

## 📝 Development

### Project Structure

```
Bio-Hack App/
├── src/                    # Web app source
│   ├── components/        # React components
│   ├── screens/           # Screen components
│   ├── core/              # Business logic
│   ├── contexts/          # React contexts
│   ├── hooks/             # Custom hooks
│   ├── locales/           # Translation files
│   └── data/              # Static data
├── apps/mobile/           # Mobile app (React Native)
│   └── src/               # Same structure as web
└── dist/                  # Web build output
```

### Key Files

- `src/App.jsx` / `apps/mobile/App.js`: Main app routing
- `src/BodyOSApp.jsx`: Main web app component
- `src/core/reconstitution.js`: Calculator logic (DO NOT MODIFY)
- `src/core/storage.js`: Storage adapter
- `src/core/keys.js`: Storage key constants

## 🎨 Design

- **Color Scheme**: Orange primary (#F26101) with luxury-neutral palette (beige/gold)
- **Typography**: Inter font family
- **Style**: Clean, non-medical aesthetic
- **Responsive**: Mobile-first design

## ⚠️ Important Notes

1. **Educational Purpose Only**: This app is for educational purposes and does not provide medical advice
2. **No Medical Claims**: All information is general and educational
3. **Consult Professionals**: Always consult healthcare professionals for medical decisions
4. **Local Storage**: Data is stored locally—backup important information
5. **Testing Mode**: Authentication is for testing only

## 📄 License

Private project - All rights reserved

## 🤝 Support

For issues or questions:
1. Check this README
2. Review troubleshooting section
3. Check console for error messages
4. Verify all dependencies are installed

---

**Built with**: React, React Native, Expo, Tailwind CSS, OpenAI API
