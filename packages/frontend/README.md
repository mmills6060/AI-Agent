# AI Agent Frontend

A Next.js frontend application featuring an AI Assistant button and popover in the bottom right corner.

## Features

- 🤖 AI Assistant button and popover interface
- 📱 Responsive design
- ⚡ Server-side rendering with Next.js App Router
- 🎨 Modern, clean UI design

## Getting Started

First, install the dependencies:

```bash
npm install
# or
pnpm install
# or
yarn install
```

Then, run the development server:

```bash
npm run dev
# or
pnpm dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## AI Assistant Integration

1. Start the backend LangGraph service from `packages/backend`:
   ```bash
   cd ../backend
   npm install
   npm run dev
   ```
2. Configure the frontend to reach the backend by creating `.env.local` in `packages/frontend`:
   ```bash
   BACKEND_URL=http://localhost:3001
   ```
3. Restart the Next.js dev server so the assistant modal can proxy `/api/chat` requests through the backend `POST /api/langgraph/run` endpoint.

## Project Structure

- `app/` - Next.js App Router pages and layouts
- `components/` - Reusable React components, including assistant UI
- `lib/` - Utility functions

## Tech Stack

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **@assistant-ui/react** - AI Assistant UI components

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial
