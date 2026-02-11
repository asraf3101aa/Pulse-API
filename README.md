# Pulse API

A robust, production-ready RESTful API built with Node.js, Express, and TypeScript.

## 🚀 Features

- **TypeScript**: Typed codebase for better developer experience and code quality.
- **Security**: Secured with [Helmet](https://helmetjs.github.io/) and [CORS](https://github.com/expressjs/cors).
- **Validation**: Request validation using [Zod](https://zod.dev/).
- **Error Handling**: Centralized error handling mechanism with structured responses.
- **Logging**: Production-grade logging with [Winston](https://github.com/winstonjs/winston).
- **Compression**: Gzip compression for better performance.
- **Structure**: Modular and scalable folder structure.

## 🛠️ Prerequisites

- [Node.js](https://nodejs.org/) (v20 or higher recommended)
- [npm](https://www.npmjs.com/)

## 📦 Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd pulse-api
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Copy `.env.example` (if available) or create a `.env` file in the root directory:
   ```env
   NODE_ENV=development
   PORT=3000
   ```

## 📜 Scripts

- **`npm run dev`**: Starts the application in development mode with hot-reloading (nodemon + ts-node).
- **`npm run build`**: Compiles the TypeScript code to JavaScript in the `dist` directory.
- **`npm start`**: runs the compiled application from `dist/server.js`.
- **`npm run lint`**: Lints the codebase using ESLint.

## 📂 Project Structure

```
src/
├── config/         # Environment variables and configuration (logger, etc.)
├── controllers/    # Route controllers (request handler logic)
├── middlewares/    # Custom express middlewares (error handling, validation)
├── routes/         # API route definitions
├── utils/          # Utility classes and functions (ApiError, catchAsync, ApiResponse)
├── app.ts          # Express app setup and middleware configuration
└── server.ts       # Application entry point
```

## 📡 API Response Format

The API follows a consistent response structure for all endpoints.

### Success
```json
{
  "status": "success",
  "message": "Operation successful",
  "data": {
    "key": "value"
  }
}
```

### Validation Error (Fail)
Used when the client provides invalid data (400 Bad Request).
```json
{
  "status": "fail",
  "message": "Validation Error",
  "errors": {
    "field_name": ["Error message for this field"]
  }
}
```

### System Error
Used for server errors (500 Internal Server Error) or other operational errors.
```json
{
  "status": "error",
  "message": "Internal Server Error"
}
```

## 🐛 Debugging

The project is configured for VS Code debugging.
1. Go to the **Run and Debug** view in VS Code.
2. Select **"Debug: Start Server (ts-node)"** or **"Debug: Start Server (nodemon)"**.
3. Press `F5` to start debugging.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the ISC License.
