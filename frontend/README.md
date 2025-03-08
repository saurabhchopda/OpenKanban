# OpenKanban

OpenKanban is a modern, responsive Kanban board application built with React, TypeScript, and Vite. It provides a simple, intuitive interface for managing tasks using the Kanban methodology.

## Features

- **Kanban Board:** Easily organize and track tasks.
- **Dashboard:** Visualize and manage projects with an overview of tasks and statuses.
- **Authentication:** Secure login system.
- **Responsive Design:** Optimized for desktop and mobile devices.
- **Customizable Themes:** Switch between light and dark modes.

## Tech Stack

- **React:** For building the user interface.
- **TypeScript:** For static type checking and improved development experience.
- **Vite:** For fast development and bundling.
- **Tailwind CSS:** For utility-first styling.
- **ESLint:** For code linting and maintaining code quality.

## Installation

### Prerequisites

- Node.js (>= 14)
- npm or yarn

### Steps

1. **Clone the repository:**

   ```bash
   git clone https://github.com/your-username/OpenKanban.git
   cd OpenKanban/frontend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Project Structure

```
OpenKanban/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── KanbanBoard.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Navbar.tsx
│   │   │   └── theme-provider.tsx
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/
│   │   └── index.html
│   ├── tsconfig.json
│   └── package.json
├── README.md
└── LICENSE
```

## ESLint Configuration

For production applications, expand the ESLint configuration to enable type-aware lint rules:

```js
// eslint.config.js
import react from "eslint-plugin-react";

export default tseslint.config({
  languageOptions: {
    parserOptions: {
      project: ["./tsconfig.node.json", "./tsconfig.app.json"],
      tsconfigRootDir: import.meta.dirname,
    },
  },
  settings: { react: { version: "18.3" } },
  plugins: {
    react,
  },
  rules: {
    ...react.configs.recommended.rules,
    ...react.configs["jsx-runtime"].rules,
  },
});
```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request with improvements.

## License

This project is licensed under the [MIT License](LICENSE).

## Acknowledgements

Thanks to the open-source community for their invaluable support and contributions.
