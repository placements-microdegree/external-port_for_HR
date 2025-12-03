# External Portal for HR

A React-based external portal built for HR-related workflows. This repository contains a frontend application (Create React App) that integrates with Supabase for backend services and uses Bootstrap / Tailwind for styling utilities. It includes a small utility script to convert Google Drive share links into direct-download/view links.

## Table of contents
- [Features](#features)
- [Tech stack](#tech-stack)
- [Requirements](#requirements)
- [Quick start](#quick-start)
- [Environment variables](#environment-variables)
- [Available scripts](#available-scripts)
- [Project structure](#project-structure)
- [Utilities](#utilities)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Features
- React single-page application
- Supabase (client) integration for auth and data
- Built with Bootstrap and Tailwind utilities (dev)
- Uses icons and animation libraries for a modern UI
- Helper script to fix Google Drive links

## Tech stack
- React (v19)
- Create React App (react-scripts)
- Supabase JS client (@supabase/supabase-js)
- Bootstrap (CSS + icons)
- Tailwind (dev dependency)
- Other UI/UX libs: framer-motion, react-icons, react-toastify, canvas-confetti

## Requirements
- Node.js (LTS recommended)
- npm

## Quick start
1. Clone the repository
   git clone https://github.com/placements-microdegree/external-port_for_HR.git
2. Change into the project directory
   cd external-port_for_HR
3. Install dependencies
   npm install
4. Create a .env file in the project root (see [Environment variables](#environment-variables))
5. Start the dev server
   npm start

The app will run at http://localhost:3000 by default.

## Environment variables
The application uses Supabase; add the following variables to a `.env` file (or use your chosen environment configuration):

- REACT_APP_SUPABASE_URL="https://your-supabase-url.supabase.co"
- REACT_APP_SUPABASE_ANON_KEY="public-anon-key"

Note: CRA only exposes env vars prefixed with REACT_APP_. Keep secrets out of the repository.

## Available scripts (from package.json)
- npm start — start development server (react-scripts start)
- npm build — build production bundle (react-scripts build)
- npm test — run tests (react-scripts test)
- npm eject — eject configuration (react-scripts eject)

## Project structure (high level)
- public/ — static assets served by the app
- src/ — React source code (components, pages, styles)
- fixGoogleDriveLinks.js — utility script (see Utilities)
- package.json / package-lock.json — dependencies & lockfile
- .gitignore

## Utilities
- fixGoogleDriveLinks.js
  - A helper script included to transform Google Drive share URLs into usable direct links (for embedding or downloads). Inspect and run locally as needed (node fixGoogleDriveLinks.js) after reviewing the script to ensure it matches your use case and input format.

## Contributing
- Fork the repository and create feature branches.
- Open pull requests with a clear description of changes.
- Follow existing code style and include tests where appropriate.
- If you plan to make breaking changes, include migration notes in the PR.

## Notes & TODOs
- There is no LICENSE file in the repository. Add a license (MIT, Apache-2.0, etc.) if you plan to open-source or distribute.
- Verify Tailwind configuration and usage—Tailwind is listed as a dev dependency and may require setup in the project (postcss/tailwind config).
- Ensure environment secrets (Supabase keys) are stored securely (CI/CD secrets, environment variables).

## License
No license specified. Add a LICENSE file to make the project's license explicit.

## Contact
For questions about this repository, open an issue or contact the maintainers via GitHub: https://github.com/placements-microdegree
