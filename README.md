# XOXO-Clash 🎮

A modern, real-time multiplayer Tic Tac Toe game built with React, TypeScript, and WebSocket technology.

## 🚀 Live Demo

**Play Now:** [https://xoxo-clash-mu.vercel.app/](https://xoxo-clash-mu.vercel.app/)

## 📸 Screenshots

### Game Interface
![Game Screenshot 1](./ui/public/Screenshot%202025-11-07%20at%2010.37.13.png)

### Multiplayer Gameplay
![Game Screenshot 2](./ui/public/Screenshot%202025-11-07%20at%2010.38.41.png)

## ✨ Features

- 🎯 **Real-time Multiplayer**: Play with friends in real-time using WebSocket connections
- 🎨 **Modern UI**: Clean, responsive design with smooth animations
- 🏠 **Room System**: Create or join game rooms with unique room codes
- 📱 **Mobile Responsive**: Optimized for both desktop and mobile devices
- 🔄 **Live Updates**: Instant game state synchronization across all players
- 🎪 **Interactive Animations**: Engaging user experience with smooth transitions

## 🛠️ Tech Stack

### Frontend
- **React 19** - Modern UI library
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Vite** - Fast development and build tool
- **Lucide React** - Beautiful icons

### Backend
- **Node.js** - Runtime environment
- **WebSocket (ws)** - Real-time communication
- **TypeScript** - Server-side type safety
- **Prisma** - Database ORM
- **PostgreSQL** - Database (Neon)

### DevOps
- **Docker** - Containerization
- **Vercel** - Frontend deployment
- **Docker Compose** - Multi-service orchestration

## 🚀 Getting Started

### Prerequisites
- Node.js 22+
- Docker & Docker Compose
- PostgreSQL database (or use Neon)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/nikhilachale/XOXO-Clash.git
   cd XOXO-Clash
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your database URL and other configurations
   ```

3. **Run with Docker Compose**
   ```bash
   docker-compose up --build
   ```

4. **Access the application**
   - Frontend: http://localhost:5173
   - WebSocket Server: ws://localhost:8080

### Manual Setup

#### Frontend (UI)
```bash
cd ui
npm install
npm run dev
```

#### Backend (WebSocket Server)
```bash
cd websocket
npm install
cd db && npx prisma generate
cd .. && npm run build
npm start
```

## 🏗️ Project Structure

```
XOXO-Clash/
├── ui/                     # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── App.tsx        # Main app component
│   │   └── main.tsx       # Entry point
│   ├── public/            # Static assets & screenshots
│   └── package.json
├── websocket/             # WebSocket server
│   ├── db/               # Database configuration
│   │   ├── prisma/       # Prisma schema & migrations
│   │   └── src/
│   ├── index.ts          # WebSocket server
│   └── package.json
├── docker/               # Docker configurations
│   ├── Dockerfile.ui     # Frontend Dockerfile
│   └── Dockerfile.ws     # Backend Dockerfile
├── docker-compose.yml    # Multi-service setup
└── README.md
```

## 🎮 How to Play

1. **Start a Game**: Visit the live demo or run locally
2. **Create Room**: Click "Create Room" to start a new game
3. **Share Code**: Share the room code with a friend
4. **Join Game**: Your friend can join using the room code
5. **Play**: Take turns placing X's and O's to get three in a row!

## 🐳 Docker Support

The application is fully containerized with Docker:

- **Development Mode**: Hot reload enabled for both frontend and backend
- **Production Mode**: Optimized builds with nginx/serve
- **Database**: PostgreSQL with Prisma migrations
- **Networking**: Services communicate via Docker networks

## 🌐 Deployment

### Frontend (Vercel)
The frontend is deployed on Vercel with automatic deployments from the main branch.

### Backend Options
- Docker containers on any cloud provider
- Heroku, Railway, or similar PaaS platforms
- Self-hosted with Docker Compose

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and commit: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 👨‍💻 Author

**Nikhil Achale**
- GitHub: [@nikhilachale](https://github.com/nikhilachale)
- Live Demo: [XOXO-Clash](https://xoxo-clash-mu.vercel.app/)

## 🙏 Acknowledgments

- Built with modern web technologies
- Inspired by classic Tic Tac Toe gameplay
- Enhanced with real-time multiplayer capabilities

---

**Enjoy playing XOXO-Clash! 🎯**
