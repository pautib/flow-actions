# Workflow System

A modern workflow automation system built with Node.js, Express, and React. This monorepo contains both the backend server and frontend web application for managing and executing workflows.

## Features
- Trigger workflows programmatically
- Integrate with third-party services (e.g., Slack)
- Modern web interface for workflow management
- Lightweight and scalable architecture
- Monorepo structure using pnpm workspaces

## Project Structure
```
workflow-system/
├── packages/
│   ├── server/     # Backend API server
│   └── web/        # Frontend React application
├── package.json    # Root package configuration
└── pnpm-workspace.yaml
```

## Requirements
- Node.js >= 20
- pnpm >= 10.8.1

## Installation

1. Clone the repository:
```bash
git clone https://github.com/pautib/workflow-system.git
cd workflow-system
```

2. Install dependencies:
```bash
pnpm install
```

## Development

1. Start both server and web applications in development mode:
```bash
pnpm dev
```

2. Access the applications:
- Frontend: http://localhost:3000
- Backend: http://localhost:4000

## Building for Production

To build both server and web applications:
```bash
pnpm build
```

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch:
```bash
git checkout -b feature-name
```
3. Commit your changes:
```bash
git commit -m "Description of changes"
```
4. Push to your fork:
```bash
git push origin feature-name
```
5. Submit a pull request

## License
This project is licensed under the MIT License



