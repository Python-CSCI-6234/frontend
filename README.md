# Email Organizer Frontend

A modern web application built with Next.js for organizing and managing emails efficiently.

## Technologies

- [Next.js](https://nextjs.org/) 15.2.3
- [React](https://react.dev/) 19
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [@tambo-ai/react](https://www.npmjs.com/package/@tambo-ai/react)
- [NextAuth.js](https://next-auth.js.org/) for authentication

## Getting Started

### Prerequisites

- Node.js (LTS version recommended)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```
3. Copy the example environment file and configure your environment variables:
   ```bash
   cp example.env.local .env.local
   ```
4. Update the `.env.local` file with your configuration

### Development

Run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Build

To create a production build:

```bash
npm run build
# or
yarn build
```

To start the production server:

```bash
npm run start
# or
yarn start
```

## Project Structure

```

## Features

- Email organization and management
- Modern, responsive UI with Tailwind CSS
- Authentication system
- Markdown support with syntax highlighting
- Type-safe development with TypeScript

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Create production build
- `npm run start` - Start production server
- `npm run lint` - Run ESLint for code quality