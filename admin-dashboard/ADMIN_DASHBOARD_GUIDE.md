# Digital Coffee - Admin Dashboard Guide

## Project Overview

A modern web-based admin dashboard for Digital Coffee built with:
- **React** + **TypeScript** + **Vite**
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Firebase** for authentication
- **Axios** for API calls
- **Lucide React** for icons

## Project Structure

```
admin-dashboard/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx          # Main sidebar navigation
│   │   │   ├── Header.tsx           # Top header with profile & notifications
│   │   │   └── DashboardLayout.tsx  # Main layout wrapper
│   │   ├── auth/
│   │   │   └── LoginForm.tsx        # Login component
│   │   └── common/
│   │       ├── Button.tsx           # Reusable button component
│   │       └── Card.tsx             # Card wrapper component
│   ├── pages/
│   │   ├── Login.tsx                # Login page
│   │   ├── Dashboard.tsx            # Main dashboard
│   │   ├── Customers.tsx            # Customer management
│   │   └── AudioManagement.tsx      # Audio upload & categories
│   ├── config/
│   │   └── firebase.ts              # Firebase configuration
│   ├── services/
│   │   ├── auth.ts                  # Authentication service
│   │   └── api.ts                   # API service
│   ├── types/
│   │   └── index.ts                 # TypeScript types
│   ├── App.tsx                      # Main app component
│   ├── main.tsx                     # App entry point
│   └── index.css                    # Tailwind styles
└── README.md