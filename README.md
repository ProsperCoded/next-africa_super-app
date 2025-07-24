# NEXT - Africa's Super-App

A Next.js-based super-app focused on secure messaging, voice/video calling, and future extensibility into wallets, commerce, media, and mini-apps.

## 🚀 Features

### Authentication System

- **Email + Phone Signup**: Users register with email and phone number
- **OTP Verification**: Email-based OTP verification via Brevo
- **Password Creation**: Secure password setup after verification
- **Email + Password Login**: Returning users can log in with credentials
- **Session Management**: Persistent sessions using localStorage
- **Auto-logout**: Multi-tab logout support

### Chat & Communication

- **Real-time Messaging**: Powered by CometChat
- **Voice & Video Calls**: High-quality calling features
- **Group Chats**: Create and manage group conversations
- **File Sharing**: Share photos, videos, documents
- **Message Reactions**: React to messages with emojis
- **Typing Indicators**: See when someone is typing

### UI/UX

- **Light Theme**: Clean, minimal design
- **Responsive**: Works on desktop and mobile
- **Green/Blue Theme**: Soft green primary, dark blue accent
- **Brand Assets**: Custom NEXT logo integration

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Chat/Calling**: CometChat UI Kit & SDK
- **Email Service**: Brevo API
- **Authentication**: Custom implementation with localStorage
- **Styling**: Tailwind CSS with custom theme

## 📦 Setup & Installation

### Prerequisites

- Node.js 18+
- CometChat account (get your App ID, Region, Auth Key, API Key)
- Brevo account (get your API key)

### 1. Clone and Install

```bash
git clone <repository-url>
cd next-africa_super-app
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the root directory:

```env
# CometChat Configuration (Public - Frontend)
NEXT_PUBLIC_COMETCHAT_APP_ID=your_app_id_here
NEXT_PUBLIC_COMETCHAT_REGION=us
NEXT_PUBLIC_COMETCHAT_AUTH_KEY=your_auth_key_here

# CometChat API Key (Private - Backend only)
COMETCHAT_API_KEY=your_api_key_here

# Brevo API Key (Private - Backend only)
NEXT_PRIVATE_BREVO_API_KEY=your_brevo_api_key_here
```

### 3. CometChat Setup

1. Sign up at [CometChat](https://cometchat.com)
2. Create a new app
3. Go to API & Auth Keys section
4. Copy your App ID, Region, Auth Key, and API Key
5. Add them to your `.env.local` file

### 4. Brevo Setup

1. Sign up at [Brevo](https://brevo.com)
2. Go to SMTP & API section
3. Generate an API key
4. Add it to your `.env.local` file

### 5. Run the Application

```bash
npm run dev
```

Visit `http://localhost:3000` to see the app.

## 🔐 Authentication Flow

### New User Signup

1. **Welcome Page**: Choose to sign up or log in
2. **Signup Form**: Enter first name, last name, email, phone
3. **OTP Verification**: Enter 6-digit code sent to email
4. **Password Creation**: Create a secure password
5. **Account Creation**: User created in CometChat automatically
6. **Redirect to Chat**: Ready to start messaging

### Returning User Login

1. **Welcome Page**: Choose to log in
2. **Login Form**: Enter email and password
3. **Verification**: Credentials checked against localStorage
4. **CometChat Login**: Automatic login to chat service
5. **Redirect to Chat**: Access full chat features

### Session Management

- User credentials stored in `localStorage` for persistence
- Multi-tab logout support via storage events
- Automatic cleanup of expired sessions
- Secure logout from both local storage and CometChat

## 📁 Project Structure

```
src/
├── app/
│   ├── api/                    # API routes
│   │   ├── send-otp/          # OTP sending via Brevo
│   │   ├── verify-otp/        # OTP verification
│   │   └── create-cometchat-user/ # CometChat user creation
│   ├── auth/                   # Authentication pages
│   │   ├── welcome/           # Landing page
│   │   ├── signup/            # User registration
│   │   ├── login/             # User login
│   │   ├── verify-otp/        # OTP verification
│   │   └── create-password/   # Password creation
│   ├── chat/                   # Chat interface
│   ├── components/            # Shared components
│   ├── utils/                 # Utility functions
│   ├── assets/                # Brand assets (logos)
│   └── CometChat/             # CometChat integration
```

## 🔧 API Routes

### `/api/send-otp`

- **Method**: POST
- **Body**: `{ email, phone, name }`
- **Function**: Sends OTP via Brevo email
- **Response**: Success confirmation

### `/api/verify-otp`

- **Method**: POST
- **Body**: `{ email, otp }`
- **Function**: Verifies the provided OTP
- **Response**: Verification result

### `/api/create-cometchat-user`

- **Method**: POST
- **Body**: `{ uid, name, email, phone }`
- **Function**: Creates user in CometChat platform
- **Response**: User creation confirmation

## 🎨 Customization

### Theming

The app uses a light theme with:

- **Primary Color**: Soft green (`#00f45e`)
- **Accent Color**: Dark blue
- **Typography**: Clean, modern fonts
- **Layout**: Minimal, spacious design

### Brand Assets

- Logo files located in `src/app/assets/`
- Automatically copied to `public/assets/` for web access
- Used throughout authentication flow

## 🚀 Deployment

### Environment Setup

Ensure all environment variables are configured in your hosting platform:

- Vercel: Add to Environment Variables section
- Netlify: Add to Environment variables in Site settings
- Custom hosting: Set environment variables in your deployment pipeline

### Build & Deploy

```bash
npm run build
npm start
```

## 🔒 Security Notes

### Current Implementation (MVP)

- Passwords stored in localStorage (development only)
- In-memory OTP storage (development only)
- Basic session validation

### Production Recommendations

- Implement proper password hashing (bcrypt, Argon2)
- Use Redis or database for OTP storage
- Add rate limiting for API endpoints
- Implement JWT tokens for session management
- Add HTTPS enforcement
- Regular security audits

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For questions or support:

- Create an issue on GitHub
- Check CometChat documentation
- Review Brevo API documentation

## 🎯 Roadmap

### Phase 1 (Current - MVP)

- ✅ Authentication system
- ✅ Basic chat functionality
- ✅ Voice/video calling

### Phase 2 (Upcoming)

- Wallet integration
- Payment processing
- Enhanced security
- User profiles

### Phase 3 (Future)

- Mini-apps ecosystem
- Commerce integration
- Advanced features
- Mobile app

---

Built with ❤️ for Africa by the NEXT team.
