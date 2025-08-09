# Polling App Frontend

This is the frontend for the Polling App, built with React.

## Features

- Create and participate in polls
- View poll results in real-time
- Responsive UI

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

## Setup

1. **Clone the repository:**
   ```sh
   git clone https://github.com/yourusername/polling-app.git
   cd polling-app/Polling-App/frontend
   ```

2. **Install dependencies:**
   ```sh
   npm install
   ```
   or
   ```sh
   yarn install
   ```

3. **Start the development server:**
   ```sh
   npm start
   ```
   or
   ```sh
   yarn start
   ```

4. **Access the app:**
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

If your frontend needs to connect to the backend, create a `.env` file in the `frontend` directory:

```
REACT_APP_API_URL=http://localhost:3000
```

## Project Structure

```
frontend/
├── public/
├── src/
│   ├── components/
│   ├── pages/
│   ├── App.js
│   └── index.js
├── package.json
└── README.md
```

## Scripts

- `npm start` — Runs the app in development mode
- `npm run build` — Builds the app for production
- `npm test` — Runs tests

