# 📡 SMS RELAY (Private Gateway)

A high-performance, self-hosted SMS and OTP relay network that transforms standard Android devices into a private, secure, and infinitely scalable telecom layer. Designed for developers who need complete control over their messaging infrastructure without the per-message costs of commercial providers.

![Stack](https://img.shields.io/badge/Stack-Next.js%20|%20NestJS%20|%20Flutter-1f1f1f?style=flat-square)

---

## ✨ Core Features

### 🛡️ Spam Guard (Node Security)
- **Daily SMS Quotas**: Prevent SIM cards from being flagged by carriers by setting strict daily limits per mobile node.
- **Hourly Recipient Limits**: Block automated accounts from spamming your gateway with rate-limiting at the recipient level.
- **Global Toggle**: Instantly enable or disable protection across your entire network.

### 🔐 0-Wait OTP Service
- **Dynamic Lengths**: Generate 4-8 digit OTP codes with custom expiration windows.
- **Device-Aware Routing**: Automatically routes OTPs to the most reliable/online node in your network.
- **SHA-256 Hashing**: Verification codes are never stored in plain text, ensuring zero leak risk.

### 📱 High-Fidelity Mobile Nodes
- **Native Flutter Integration**: Ultra-low latency communication between the API and Android hardware.
- **Heartbeat Monitoring**: Real-time health reporting (Battery, Signal Strength, Online status).
- **QR Pairing**: Zero-configuration setup — scan a code from the dashboard to instantly register a node.

### 🎨 Premium Mistral-Style Dashboard
- **Warm Ivory UI**: A sophisticated, high-contrast dashboard inspired by frontier AI design languages.
- **Billboard Typography**: High-impact headlines and architectural geometry for a production-ready feel.
- **Real-time Monitoring**: Live SSE streams of delivery statuses and system health.

---

## 🏗 System Architecture

This project is managed as a **Turborepo Monorepo** for unified development and deployment:

| Service | Technology | Role |
| :--- | :--- | :--- |
| **`apps/web`** | Next.js (App Router) | Multi-node command center & settings. |
| **`apps/mobile`**| Flutter | Native Android SMS engine & health reporter. |
| **`services/api`** | NestJS | Task orchestration, rate-limiting & device life-cycle. |
| **`packages/ui`** | Tailwind / Vanilla CSS | Shared Mistral-inspired design system tokens. |

---

## 🚀 Quick Setup

### 1. Requirements
- **Node.js 20+** and **pnpm**
- **Docker** (for PostgreSQL)
- **An Android Device** (Physical)
- **Ngrok/LocalTunnel** (If hosting behind a symmetric NAT)

### 2. Deployment

```bash
# 1. Clone well and install
pnpm install

# 2. Environment Setup
# Copy services/api/.env.example to .env and set your ADMIN_SECRET
# Copy apps/web/.env.example to .env

# 3. Start Infrastructure
docker-compose up -d

# 4. Launch Development Environment
pnpm dev
```

### 3. Connection
1. Access the dashboard at `http://localhost:3000`.
2. Navigate to **Gateways** and scan the QR code using the **SMS Relay Mobile App**.
3. Ensure your phone has a valid SIM card and "Send SMS" permissions granted.

---

## 🔒 Security Model

We use a **Headless Secret** architecture:
- **Shared Secret**: Access is governed by `X-Admin-Secret`. No user databases or password resets.
- **Hashed Persistence**: Only hashes of verification codes touch the database.
- **Private Discovery**: Nodes use local publicUrls or encrypted tunnels for communication.

---

## ⚖️ License
MIT - Built for the community.
