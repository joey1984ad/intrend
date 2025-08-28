# Environment Variables Setup

Create a `.env.local` file in your project root with the following variables:

## 🔐 Required Environment Variables

### Database Configuration
```bash
DATABASE_URL="postgresql://username:password@localhost:5432/intrend_db"
```

### Google OAuth Configuration
```bash
GOOGLE_CLIENT_ID="your_google_client_id_here"
GOOGLE_CLIENT_SECRET="your_google_client_secret_here"
NEXT_PUBLIC_GOOGLE_CLIENT_ID="your_google_client_id_here"
NEXT_PUBLIC_GOOGLE_REDIRECT_URI="http://localhost:3000/api/auth/google/callback"
```

### Stripe Configuration (for billing)
```bash
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PROFESSIONAL_MONTHLY_PRICE_ID="price_..."
STRIPE_PROFESSIONAL_ANNUAL_PRICE_ID="price_..."
STRIPE_ENTERPRISE_MONTHLY_PRICE_ID="price_..."
STRIPE_ENTERPRISE_ANNUAL_PRICE_ID="price_..."
```

### Facebook API Configuration
```bash
FACEBOOK_APP_ID="your_facebook_app_id"
FACEBOOK_APP_SECRET="your_facebook_app_secret"
FACEBOOK_ACCESS_TOKEN="your_facebook_access_token"
```

### Security
```bash
JWT_SECRET="your_jwt_secret_here"
NEXTAUTH_SECRET="your_nextauth_secret_here"
NEXTAUTH_URL="http://localhost:3000"
```

## 🚀 How to Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to Credentials → Create Credentials → OAuth 2.0 Client ID
5. Set Application Type to "Web application"
6. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/google/callback` (for development)
   - `https://yourdomain.com/api/auth/google/callback` (for production)
7. Copy the Client ID and Client Secret

## 📝 Example .env.local File

```bash
# Copy this to .env.local and fill in your values
DATABASE_URL="postgresql://username:password@localhost:5432/intrend_db"

GOOGLE_CLIENT_ID="123456789-abcdefghijklmnop.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-abcdefghijklmnopqrstuvwxyz"
NEXT_PUBLIC_GOOGLE_CLIENT_ID="123456789-abcdefghijklmnop.apps.googleusercontent.com"
NEXT_PUBLIC_GOOGLE_REDIRECT_URI="http://localhost:3000/api/auth/google/callback"

STRIPE_SECRET_KEY="sk_test_51ABC123..."
STRIPE_PUBLISHABLE_KEY="pk_test_51ABC123..."
STRIPE_WEBHOOK_SECRET="whsec_abc123..."

JWT_SECRET="your-super-secret-jwt-key-here"
NEXTAUTH_SECRET="your-nextauth-secret-here"
NEXTAUTH_URL="http://localhost:3000"
```

## ⚠️ Important Notes

- **Never commit `.env.local` to version control**
- **Use different credentials for development and production**
- **Rotate secrets regularly**
- **Use strong, unique secrets for JWT and NextAuth**
