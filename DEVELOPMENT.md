# Development Guide

## Local Development Setup

The demo-app is configured to use the local package with HMR support for efficient development.

### Package Structure

```
notifications/                  # Root package
├── src/                       # Package source code
├── dist/                      # Built package (generated)
├── package.json              # Package configuration
├── vite.config.ts            # Package build config
└── demo-app/                 # Demo Laravel application
    ├── package.json          # Links to parent package via "file:.."
    └── vite.config.ts        # Configured for HMR with local package
```

### Development Workflow

#### Option 1: Run Both Simultaneously (Recommended)

**Terminal 1 - Package + Vite Dev Server:**
From the `demo-app` directory:

```bash
npm run dev:full
```

This runs both:
- Package build in watch mode (`npm run dev` in root)
- Demo app Vite dev server (`npm run dev` in demo-app)

**Terminal 2 - Laravel Server:**
```bash
cd /home/manu/work/inertia-vuetify/notifications/demo-app
php artisan serve
```

**Access the app:**
- http://localhost:8000

#### Option 2: Run Separately

**Terminal 1 - Package Build (watch mode):**
```bash
cd /home/manu/work/inertia-vuetify/notifications
npm run dev
```

**Terminal 2 - Vite Dev Server:**
```bash
cd /home/manu/work/inertia-vuetify/notifications/demo-app
npm run dev
```

**Terminal 3 - Laravel Server:**
```bash
cd /home/manu/work/inertia-vuetify/notifications/demo-app
php artisan serve
```

**Access the app:**
- http://localhost:8000

### How HMR Works

1. The demo-app's `package.json` includes: `"@inertia-vuetify/notifications": "file:.."`
2. This creates a symlink: `demo-app/node_modules/@inertia-vuetify/notifications -> ../../..`
3. The demo-app's `vite.config.ts` is configured to:
   - Exclude the package from optimization: `optimizeDeps.exclude`
   - Watch the package files: `server.watch.ignored`
4. When you edit package source files, Vite rebuilds the package and the demo-app picks up changes automatically

### Making Changes

1. Edit package source files in `src/`
2. Vite automatically rebuilds to `dist/`
3. Demo app HMR detects changes and updates the browser
4. Test your changes in the demo app immediately

### Building for Production

**Package:**
```bash
npm run build
```

**Demo App:**
```bash
cd demo-app
npm run build
```

### Troubleshooting

**Changes not reflecting:**
- Ensure package build is running in watch mode (`npm run dev`)
- Check that symlink exists: `ls -la demo-app/node_modules/@inertia-vuetify/`
- Restart both dev servers if needed

**Type errors:**
- Run `npm run typecheck` in package root
- Ensure TypeScript is properly configured in both package and demo-app

**Dependency conflicts:**
- The package uses peerDependencies for Vue, Vuetify, and Inertia
- Demo app provides these dependencies
- If version mismatches occur, update demo-app versions to match package requirements

