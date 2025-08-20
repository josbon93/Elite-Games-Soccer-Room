# Elite Games - Indoor Sports Mini-Game Park Management System

## Overview

Elite Games is a full-stack web application designed to manage an indoor sports mini-game park featuring three interactive games: Soccer Skeeball, Elite Shooter, and Team Relay Shootout. The system provides a comprehensive game selection interface, player/team configuration, session management, and game flow coordination. Built as a modern React SPA with an Express.js backend, the application serves as a central hub for managing game sessions and coordinating gameplay experiences.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client-side application is built using **React 18** with **TypeScript** and follows a component-based architecture. Key architectural decisions include:

- **Routing**: Wouter for lightweight client-side routing with pages for home, game mode selection, player selection, and game start
- **State Management**: Zustand for global game state management, tracking current game, mode, player counts, and active sessions
- **UI Framework**: Shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling
- **Animations**: Framer Motion for smooth transitions and interactive animations throughout the user experience
- **Data Fetching**: TanStack Query (React Query) for server state management with automatic caching and synchronization

The application uses a modern build setup with Vite for fast development and hot module replacement.

### Backend Architecture
The server-side is built with **Express.js** using TypeScript and follows a RESTful API pattern:

- **API Structure**: RESTful endpoints for games (`/api/games`) and sessions (`/api/sessions`) with CRUD operations
- **Data Storage**: Currently implemented with in-memory storage (`MemStorage` class) but architected with an `IStorage` interface for easy database integration
- **Request Handling**: Express middleware for JSON parsing, CORS handling, and request logging
- **Error Management**: Centralized error handling middleware with proper HTTP status codes and error responses

### Data Layer
The data layer is designed with **Drizzle ORM** and **PostgreSQL** integration:

- **Schema Definition**: Shared schema definitions using Drizzle ORM with Zod validation for type safety
- **Database Tables**: `games` and `game_sessions` tables with proper relationships and constraints
- **Validation**: Zod schemas for runtime type validation and API request/response validation
- **Migration System**: Drizzle Kit for database migrations and schema management

### Session Management
Game sessions are managed through a structured flow:

- **Session Creation**: POST to `/api/sessions` with validated game configuration data
- **State Tracking**: Sessions track mode (individual/team), player counts, team configurations, and status
- **Flow Control**: Multi-step process from game selection → mode selection → player configuration → game start

### Game Logic Implementation
Soccer Skeeball features a dynamic round system based on participant count:

- **2-4 participants**: Each gets their own round (2-4 rounds total)
- **5-6 participants**: 3 rounds with 2 participants per round
- **7-8 participants**: 4 rounds with 2 participants per round
- **Scoring System**: 15-zone grid with values from -10 to +50 points matching provided target layout
- **Timer System**: 5-minute total game timer with 45-second round timers
- **Score Tracking**: Real-time score entry and total calculation with final leaderboard

### Component Architecture
The frontend follows a hierarchical component structure:

- **Layout Components**: Page-level components for different application states
- **Feature Components**: Game cards, modals, and interactive elements with motion animations
- **UI Components**: Reusable Shadcn/ui components for consistent design system
- **Custom Components**: Elite-branded components like logo and game-specific interfaces

## External Dependencies

### Database Integration
- **Neon Database**: Serverless PostgreSQL with `@neondatabase/serverless` driver
- **Drizzle ORM**: Type-safe database ORM with PostgreSQL dialect
- **Connection Pooling**: Built-in connection management through Neon serverless driver

### UI and Styling
- **Radix UI**: Comprehensive set of accessible, unstyled UI primitives for complex components
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens and theming
- **Framer Motion**: Production-ready motion library for React animations and transitions
- **Font Awesome**: Icon library for consistent iconography throughout the application

### Development and Build Tools
- **Vite**: Fast build tool with HMR, optimized for modern React development
- **TypeScript**: Full type safety across the entire application stack
- **ESBuild**: Fast JavaScript bundler used by Vite for production builds
- **TSX**: TypeScript execution environment for running server code in development

### Validation and Forms
- **Zod**: Runtime type validation and schema definition for API contracts
- **React Hook Form**: Performant forms library with minimal re-renders
- **Hookform Resolvers**: Zod integration for form validation

### State and Data Management
- **TanStack Query**: Powerful data synchronization for server state management
- **Zustand**: Lightweight state management for client-side application state
- **Date-fns**: Modern date utility library for time-based operations

### Development Environment
- **Replit Integration**: Custom Vite plugins for Replit development environment
- **Runtime Error Handling**: Development-time error overlay for debugging
- **Environment Variables**: Database URL and configuration management through environment variables

## Local Deployment Architecture

The application has been configured for local server deployment in the Elite Games Soccer room environment:

### Local Server Setup
- **Network Configuration**: Server binds to `0.0.0.0:5000` for local network access
- **Tablet Connectivity**: Designed for multiple Galaxy tablets connecting via WiFi
- **Deployment Scripts**: Automated setup scripts for Windows (`start-local-server.bat`) and Linux/macOS (`start-local-server.sh`)
- **Network Discovery**: Automatic local IP detection and tablet access URL generation

### Deployment Files
- **DEPLOYMENT_GUIDE.md**: Comprehensive setup instructions for local server installation
- **README-LOCAL-SETUP.md**: Quick start guide for Elite Games staff
- **package-scripts/setup-local.js**: Network configuration and system requirements checker
- **Local Configuration**: Automatic generation of local network settings and access URLs

### Physical Environment Requirements
- **Server Hardware**: Minimum 2GB RAM, Node.js v18+, Windows/Linux/macOS support
- **Network Setup**: Local WiFi network with static IP recommendation for server
- **Firewall Configuration**: Port 5000 access for tablet connectivity
- **Tablet Access**: Web browser access via `http://[server-ip]:5000` on same network