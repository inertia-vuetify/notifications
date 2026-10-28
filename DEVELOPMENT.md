# Development Guide

## Local Development Setup

The demo-app is configured to use the local package with HMR support for efficient development.

Use Node 24 LTS for package and demo validation, matching CI and release tooling.
The demo runs Laravel 13 with the Inertia 3 Laravel adapter and Laravel Boost 2.
Its Composer platform targets PHP 8.3, Laravel 13's minimum, so updates on newer
PHP installations preserve the declared minimum version.

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

#### Initial Setup

The demo app is a Laravel app. Install both PHP and Node dependencies before running demo builds:

```bash
cd demo-app
composer install
npm ci
```

The Wayfinder Vite plugin runs `php artisan wayfinder:generate --with-form` during Vite build and dev startup. Without Composer dependencies, `vendor/autoload.php` is missing and the demo build fails before Vue or Vuetify compilation starts.

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
cd demo-app
php artisan serve
```

**Access the app:**
- http://localhost:8000

#### Option 2: Run Separately

**Terminal 1 - Package Build (watch mode):**
```bash
cd <repository root>
npm run dev
```

**Terminal 2 - Vite Dev Server:**
```bash
cd demo-app
npm run dev
```

**Terminal 3 - Laravel Server:**
```bash
cd demo-app
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
npm run typecheck
npm run test
npm run build
npm run lint:package
```

**Demo App:**
```bash
cd demo-app
npm run typecheck
npm run lint:check
npm run build
npm run build:ssr
vendor/bin/phpunit
```

The PHP tests use in-memory SQLite, array sessions/cache/mail, and a test-only
application key from `phpunit.xml`. They exercise the demo flash redirects without
provider calls. The package's `NotificationProvider` tests mount real Vuetify
snackbars to check rendering, dismissal, and attributes. The plugin tests boot a
real Inertia app per test and answer its requests with a fake backend through
Inertia's `http` client, to check flash deduplication across responses, prefetches,
deferred props, and `router.flash()`; the remaining tests cover parsing and action
dispatch.

The demo's single `resources/js/app.ts` entry also serves SSR through the
`@inertiajs/vite` plugin. In development, `npm run dev` renders SSR through the
Vite server; for a production check, run `npm run build:ssr`, start
`node bootstrap/ssr/app.js`, and serve the app with Laravel.

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
