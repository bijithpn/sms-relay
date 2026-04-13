# 📡 Decentralized SMS Relay Network

A consumer-powered telecom layer that transforms Android devices into a distributed SMS messaging network. This platform allows businesses to send OTPs and marketing messages cheaply by routing them through real user SIM plans rather than centralized gateways.

## 🏗 Architecture Overview

This project is built as a **Turborepo Monorepo** to ensure strict type safety and shared logic across the entire stack.

- **`apps/web`**: Next.js Dashboard for network orchestration and user earnings.
- **`apps/mobile`**: React Native Android app (the "Node") that handles native SMS sending.
- **`services/api`**: NestJS Core API for auth, device management, and persistence.
- **`services/router`**: The "Brain" - assigns SMS tasks to the best available device using a strategy pattern.
- **`services/worker`**: The "Muscle" - BullMQ based worker that handles retries and delivery tracking.
- **`packages/`**: Shared types, configurations, and UI components.

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js 20+**
- **pnpm** (`npm install -g pnpm`)
- **Docker & Docker Compose** (Required for Redis and PostgreSQL)
- **Android Studio / Emulator** (For mobile node testing)

### 2. Installation
Clone the repository and install dependencies from the root:

```bash
pnpm install
```

### 3. Launching Infrastructure
The project requires Redis (for the job queue) and PostgreSQL (for the database). Use the root `docker-compose.yml` to launch them:

```bash
# Start Redis and PostgreSQL
docker-compose up -d redis postgres
```

**Note:** If you see `ECONNREFUSED 127.0.0.1:6379` in your logs, it means the Redis server is not running. Ensure Docker is started and the containers are healthy.

### 4. Running the Development Environment
Use Turborepo to launch the API, Router, and Worker services simultaneously:

```bash
# From the root directory
pnpm dev
```

The services will be available at:
- **API**: http://localhost:3000
- **Web Dashboard**: http://localhost:3001 (or as assigned by Next.js)

---

## 📱 Mobile Node Setup (Android)

Since this is a telecom-adjacent product, the mobile app requires specific Android permissions to function:

1. **Build the app**: Use the React Native CLI to build for Android.
2. **Grant Permissions**:
   - `SEND_SMS`: Required to send the messages.
   - `READ_PHONE_STATE`: Required to identify the SIM operator and quota.
3. **Connect to API**: Ensure the device is on the same network as your `services/api` or update the `API_URL` in `SmsNodeService.ts`.

---

## ⚙️ Technical Deep Dive

### SMS Routing Logic
The system uses a **Strategy Pattern** to assign tasks:
- **Least Loaded Strategy**: Picks the device with the highest remaining SMS quota.
- **Geo-Match Strategy**: (Future) Matches devices based on the target phone number's region.

### Reliability Flow
`Job Creation` $\rightarrow$ `BullMQ Queue` $\rightarrow$ `Worker` $\rightarrow$ `Routing Engine` $\rightarrow$ `WebSocket Dispatch` $\rightarrow$ `Android Node` $\rightarrow$ `Delivery Report` $\rightarrow$ `Wallet Credit`.

---

## 🛠 Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | Next.js, Tailwind CSS, Zustand, TanStack Query |
| **Mobile** | React Native, Socket.io-client |
| **Backend** | NestJS, TypeORM, PostgreSQL, BullMQ |
| **Cache/Queue** | Redis |
| **Infrastructure** | Docker, Turborepo, pnpm |

## ⚠️ Constraints & Compliance
- **Android Only**: iOS does not allow programmatic SMS sending.
- **SDR (Spam Detection)**: The system includes rate-limiting and device rotation to prevent SIM bans.
- **Compliance**: Designed to be integrated with DLT registration (India) and other regional telecom regulations.
