# Vibe Engine AI

https://vibe-engine-ai.vercel.app/
A modern, AI-powered application builder that enables users to create apps and websites through natural language conversations. Built with Next.js 15, TypeScript, and a robust tech stack for scalable, production-ready applications.

## 🚀 Features

- **AI-Powered Development**: Build applications by chatting with AI in a conversational interface
- **Real-time Code Generation**: Generate and preview code fragments in real-time
- **Project Management**: Create, manage, and organize multiple projects
- **Sandboxed Execution**: Safe code execution using E2B code interpreter
- **Modern UI**: Beautiful, responsive interface built with Shadcn UI and Tailwind CSS
- **Type-Safe API**: End-to-end type safety with tRPC
- **Authentication**: Secure user authentication with Clerk
- **Background Jobs**: Asynchronous task processing with Inngest

## 🛠️ Tech Stack

### Core Framework
- **Next.js 15.3.6** - React framework with App Router
- **React 19** - UI library
- **TypeScript 5** - Type-safe development

### Backend & Database
- **tRPC** - End-to-end typesafe APIs
- **Prisma 7.2.0** - Next-generation ORM
- **PostgreSQL** - Relational database
- **Inngest** - Background job processing

### Authentication & Services
- **Clerk** - User authentication and management
- **E2B Code Interpreter** - Sandboxed code execution

### UI & Styling
- **Shadcn UI** - High-quality React components
- **Radix UI** - Unstyled, accessible component primitives
- **Tailwind CSS 4** - Utility-first CSS framework
- **Lucide React** - Icon library

### Additional Libraries
- **TanStack Query** - Data fetching and caching
- **React Hook Form** - Form state management
- **Zod** - Schema validation
- **date-fns** - Date utility library

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 20.x or higher
- **npm**, **yarn**, **pnpm**, or **bun**
- **PostgreSQL** database
- **Clerk** account (for authentication)
- **E2B** account (for code interpreter)
- **Inngest** account (for background jobs)

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/psinguyenz/lovable-clone.git
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory with the following variables:
   ```env
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/vibe"

   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key

   # E2B Code Interpreter
   E2B_API_KEY=your_e2b_api_key

   # Inngest
   INNGEST_EVENT_KEY=your_inngest_event_key
   INNGEST_SIGNING_KEY=your_inngest_signing_key

   # Application
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Set up the database**
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

## 📁 Project Directory Structure

```
vibe/
├── prisma/                          # Database schema and migrations
│   ├── migrations/                  # Database migration files
│   │   ├── 20260109151631_message_fragment/
│   │   ├── 20260110045440_projects/
│   │   ├── 20260116051713_user_id/
│   │   └── 20260116073245_usage/
│   ├── schema.prisma                # Prisma schema definition
│   └── migration_lock.toml
│
├── public/                          # Static assets
│   ├── logo.svg                     # Custom logo
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
│
├── sandbox-templates/               # E2B sandbox templates
│   └── nextjs/
│       ├── compile_page.sh
│       ├── e2b.Dockerfile
│       └── e2b.toml
│
├── src/
│   ├── app/                         # Next.js App Router pages
│   │   ├── (home)/                  # Home route group
│   │   │   ├── layout.tsx           # Home layout
│   │   │   ├── page.tsx             # Home page
│   │   │   ├── pricing/
│   │   │   │   └── page.tsx         # Pricing page
│   │   │   ├── sign-in/
│   │   │   │   └── page.tsx         # Sign in page
│   │   │   └── sign-up/
│   │   │       └── page.tsx         # Sign up page
│   │   ├── api/                     # API routes
│   │   │   ├── inngest/
│   │   │   │   └── route.ts         # Inngest webhook handler
│   │   │   └── trpc/
│   │   │       └── [trpc]/
│   │   │           └── route.ts     # tRPC API endpoint '/api/trpc'
│   │   ├── projects/
│   │   │   └── [projectId]/
│   │   │       └── page.tsx         # Project detail page
│   │   ├── error.tsx                # Global error
│   │   ├── favicon.ico
│   │   ├── globals.css              # Global styles
│   │   └── layout.tsx               # Root layout
│   │
│   ├── components/                  # Reusable React components
│   │   ├── ui/                      # Shadcn UI components
│   │   │   ├── accordion.tsx
│   │   │   └── ... (50+ UI components)
│   │   ├── code-view/
│   │   │   ├── code-theme.css       # Dark theme
│   │   │   └── index.tsx            # Code syntax highlighting
│   │   ├── file-explorer.tsx        # File tree explorer
│   │   ├── hint.tsx                 # Hint/tooltip component
│   │   ├── tree-view.tsx            # Tree view component
│   │   └── user-control.tsx         # Clerk user control component
│   │
│   ├── generated/                   # Generated code
│   │   └── prisma/                  # Generated Prisma client
│   │
│   ├── hooks/                       # Custom React hooks
│   │   ├── use-current-theme.ts     # Select theme
│   │   ├── use-mobile.ts            # Custom React use-mobile hooks
│   │   └── use-scroll.ts            # Disable normal scroll
│   │
│   ├── inngest/                     # Inngest background jobs
│   │   ├── client.ts                # Create client to send and receive events
│   │   ├── functions.ts             # Background job functions, agent set up and tools
│   │   ├── type.ts                  # SANDBOX_TIMEOUT
│   │   └── utils.ts                 # Custom utility functions
│   │
│   ├── lib/                         # Utility libraries
│   │   ├── db.ts                    # Database connection
│   │   ├── usage.ts                 # Usage tracking utilities
│   │   └── utils.ts                 # General utilities like cn and File Explorer related
│   │
│   ├── modules/                     # Feature modules
│   │   ├── home/                    # Home module
│   │   │   ├── constants.ts         # Suggestions build
│   │   │   └── ui/
│   │   │       └── components/
│   │   │           ├── navbar.tsx   # Nav bar above
│   │   │           ├── project-form.tsx         # Project format
│   │   │           └── projects-list.tsx        # Projects of an user
│   │   ├── messages/                # Messages module
│   │   │   └── server/
│   │   │       └── procedures.ts    # tRPC message procedures
│   │   ├── projects/                # Projects module
│   │   │   ├── server/
│   │   │   │   └── procedures.ts    # tRPC project procedures
│   │   │   └── ui/
│   │   │       ├── components/
│   │   │       │   ├── fragment-web.tsx         # UI of the fragment
│   │   │       │   ├── message-card.tsx         # Render 1 message
│   │   │       │   ├── message-form.tsx         # Message format
│   │   │       │   ├── message-loading.tsx      # UI of messages loading
│   │   │       │   ├── messages-container.tsx   # The whole chat panel: messages list + input
│   │   │       │   ├── project-header.tsx       # UI of the header
│   │   │       │   └── usage.tsx                # UI of the usage
│   │   │       └── views/
│   │   │           └── project-view.tsx         # View a whole project
│   │   └── usage/                   # Usage tracking module
│   │       └── server/
│   │           └── procedures.ts    # tRPC usage procedures
│   │
│   ├── trpc/                        # tRPC setup
│   │   ├── routers/
│   │   │   └── _app.ts              # Main app router
│   │   ├── client.tsx               # tRPC client setup
│   │   ├── init.ts                  # tRPC initialization
│   │   ├── query-client.tsx         # React Query client
│   │   └── server.tsx               # tRPC server setup
│   │
│   ├── middleware.ts                # Used for redirect
│   ├── prompt.ts                    # AI prompt templates
│   └── types.ts                     # TreeItem
│
├── .env.example                     # Environment variables template
├── components.json                  # Shadcn UI configuration
├── eslint.config.mjs                # ESLint configuration
├── next.config.ts                   # Next.js configuration
├── next-env.d.ts                    # Next.js TypeScript definitions
├── package.json                     # Dependencies and scripts
├── postcss.config.mjs               # PostCSS configuration
├── prisma.config.ts                 # Prisma configuration
├── tsconfig.json                    # TypeScript configuration
└── README.md                        # This file
```

## 🗄️ Database Schema

The application uses Prisma ORM with PostgreSQL. Key models include:

- **Project**: User projects with metadata
- **Message**: Conversation messages between users and AI
- **Fragment**: Code fragments generated by AI
- **Usage**: Usage tracking and limits

## 🚦 Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint to check code quality
- `npx prisma migrate dev` - Create and apply database migrations
- `npx prisma generate` - Generate Prisma Client
- `npx prisma studio` - Open Prisma Studio to view database

## 🔐 Environment Variables

Make sure to configure all required environment variables in your `.env` file. Refer to the Installation section for the complete list.

## 🏗️ Architecture

The application follows a modular architecture:

- **Feature Modules**: Organized by domain (home, projects, messages, usage)
- **Server Procedures**: tRPC procedures for type-safe API calls
- **UI Components**: Reusable React components organized by feature
- **Shared Utilities**: Common utilities and helpers in `lib/`

## 🧪 Development

### Code Style

- TypeScript strict mode enabled
- ESLint for code quality
- Prettier (if configured) for code formatting

### Adding New Features

1. Create feature module in `src/modules/`
2. Add tRPC procedures in `server/procedures.ts`
3. Create UI components in `ui/components/`
4. Add routes in `src/app/` if needed

## 📦 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository in Vercel
3. Configure environment variables
4. Deploy

### Other Platforms

The application can be deployed to any platform that supports Next.js:
- AWS Amplify
- Netlify
- Railway
- Render

Make sure to:
- Set up PostgreSQL database
- Configure all environment variables
- Run database migrations
- Set up Inngest webhook endpoints
---

Built with ❤️ using Next.js, TypeScript, and modern web technologies.
