# DockSphere Frontend

The frontend application for DockSphere, a DevOps hosting platform built with Next.js, React, and TypeScript.

## Features

- **Modern UI**: Built with Next.js 14, React, and Tailwind CSS
- **Authentication**: JWT-based authentication with secure token management
- **Dashboard**: Project management interface with real-time status updates
- **Responsive Design**: Mobile-first design that works on all devices
- **Type Safety**: Full TypeScript support for better development experience

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp .env.local.example .env.local
```

3. Update the environment variables in `.env.local` with your configuration.

### Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

### Building for Production

Build the application:
```bash
npm run build
```

Start the production server:
```bash
npm start
```

## Project Structure

```
frontend/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   └── Layout.tsx      # Main layout component
├── pages/              # Next.js pages
│   ├── _app.tsx        # App wrapper
│   ├── _document.tsx   # Document configuration
│   ├── index.tsx       # Landing page
│   ├── login.tsx       # Login page
│   ├── signup.tsx      # Signup page
│   └── dashboard.tsx   # Dashboard page
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries
├── styles/             # Global styles
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:8000/api/v1` |
| `NEXTAUTH_URL` | NextAuth URL | `http://localhost:3000` |
| `NEXTAUTH_SECRET` | NextAuth secret key | - |

## Contributing

1. Follow the existing code style
2. Use TypeScript for all new code
3. Add proper error handling
4. Test your changes thoroughly
5. Update documentation as needed

## License

This project is licensed under the MIT License.