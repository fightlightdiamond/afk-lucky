# Lucky - Interactive Story Platform

[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

Lucky is a modern, interactive story platform built with Next.js, TypeScript, and Prisma. It features user authentication, story creation, and interactive storytelling capabilities.

## ✨ Features

- 🔐 User authentication (login/register)
- 📝 Create and manage interactive stories
- 🎨 Modern UI with dark/light mode support
- 📱 Responsive design
- 📊 Story analytics and usage tracking
- 🔍 Advanced search and filtering
- 📱 Mobile-friendly interface
- 🚀 Built with Next.js 13+ App Router

## 🚀 Tech Stack

- **Frontend**: Next.js 13+, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI
- **State Management**: Zustand
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT
- **Form Handling**: React Hook Form with Zod validation
- **UI Components**: Radix UI, Lucide Icons
- **Testing**: Vitest, Storybook
- **Deployment**: Docker, Vercel

## 🛠️ Prerequisites

- Node.js 18+
- PostgreSQL
- pnpm (recommended)

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/lucky_.git
   cd lucky_
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory and add the following:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/lucky?schema=public"
   JWT_SECRET=your_jwt_secret
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret
   ```

4. **Set up the database**
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Run the development server**
   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🐳 Docker Setup

You can also run the application using Docker:

```bash
docker-compose up -d
```

This will start the Next.js application and PostgreSQL database in containers.

## 📦 Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm storybook` - Start Storybook
- `pnpm test` - Run tests

## 📂 Project Structure

```
src/
├── app/                    # App router pages
│   ├── api/               # API routes
│   ├── story/             # Story-related pages
│   └── ...
├── components/            # Reusable components
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions
├── prisma/                # Database schema and migrations
└── styles/                # Global styles
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

Made with ❤️ by [Your Name]
