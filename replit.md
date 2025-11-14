# Overview

HoneyGuard is an AI-powered honeypot system designed for intelligent web server threat detection and analysis. The application combines honeypot technology with machine learning algorithms to automatically capture, analyze, and classify malicious traffic. It provides real-time threat monitoring, anomaly detection, and comprehensive security analytics through a modern web interface.

The system captures network traffic, applies machine learning models to detect attack patterns (SQL injection, XSS, brute force, etc.), and presents findings through an intuitive dashboard with real-time updates and alert management.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Components**: Radix UI primitives with shadcn/ui component library for consistent, accessible interface elements
- **Styling**: Tailwind CSS with custom dark theme design system
- **State Management**: TanStack Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Real-time Updates**: WebSocket integration for live data streaming

## Backend Architecture
- **Runtime**: Node.js with Express.js REST API server
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Database Provider**: Neon serverless PostgreSQL
- **Real-time Communication**: WebSocket server for broadcasting live updates
- **Session Management**: Connect-pg-simple for PostgreSQL-backed sessions

## Data Storage Solutions
- **Primary Database**: PostgreSQL for structured data (traffic logs, alerts, ML models, system metrics)
- **Schema Management**: Drizzle Kit for database migrations and schema management
- **In-Memory Storage**: Fallback MemStorage implementation for development/testing

## Authentication and Authorization
- **Session-based Authentication**: User credentials stored in PostgreSQL with session management
- **Password Security**: Hashed password storage (implementation details in user schema)

## Machine Learning Pipeline
- **Traffic Analysis**: Multi-layered anomaly detection system combining supervised and unsupervised learning
- **Algorithm Support**: 
  - Random Forest for supervised classification
  - Isolation Forest for unsupervised anomaly detection
  - LSTM for sequence-based pattern recognition
- **Feature Engineering**: Automatic extraction of numerical features from HTTP requests (IP, method, payload, user agent)
- **Real-time Scoring**: Live anomaly scoring with configurable thresholds
- **Model Management**: Database-stored ML model metadata with performance metrics

## Traffic Capture and Analysis
- **Request Interception**: Middleware-based traffic capture with comprehensive logging
- **Pattern Recognition**: Regex-based detection for common attack vectors (SQL injection, XSS, brute force)
- **Threat Classification**: Automated classification with confidence scoring
- **Behavioral Analysis**: IP-based behavioral profiling and frequency analysis

## External Dependencies

- **Database**: Neon PostgreSQL serverless database
- **UI Framework**: Radix UI component primitives
- **Charts**: Chart.js for data visualization
- **Date Handling**: date-fns for date manipulation and formatting
- **WebSocket**: ws library for real-time communication
- **HTTP Client**: Axios for API requests
- **Development Tools**: Vite with React plugin, ESBuild for production builds
- **Type Safety**: Zod for runtime type validation
- **Styling**: Tailwind CSS with PostCSS processing