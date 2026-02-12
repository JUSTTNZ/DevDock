# DevDock

A desktop app for managing, monitoring, and orchestrating your local development services. Built with Electron, React, and TypeScript.

<!-- Screenshot: Full app with sidebar, dashboard charts, and service cards -->

## Table of Contents

- [Getting Started](#getting-started)
- [App Overview](#app-overview)
- [Pages](#pages)
  - [Dashboard](#dashboard)
  - [Services](#services)
  - [Logs](#logs)
  - [Settings](#settings)
- [Adding a Service](#adding-a-service)
- [Managing Services](#managing-services)
- [Configuration](#configuration)
- [Building & Releases](#building--releases)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Install & Run

```bash
npm install
npm run dev
```

The app opens a window with the sidebar on the left and the Dashboard page by default.

---

## App Overview

DevDock has a **sidebar + main content** layout. The sidebar on the left lets you navigate between four pages: **Dashboard**, **Services**, **Logs**, and **Settings**. The sidebar can be collapsed to icon-only mode by clicking the collapse button at the bottom. Your collapse preference is remembered between sessions.

<!-- Screenshot: Sidebar expanded showing all four nav items -->

The app polls your services every 2 seconds for real-time status updates, CPU/memory metrics, and log output.

---

## Pages

### Dashboard

<!-- Screenshot: Dashboard page with stats, charts, and service grid -->

The Dashboard is your live overview of everything running. It has a **"LIVE" badge** and a real-time clock at the top.

#### Stats Row

Four cards across the top show at a glance:

| Card | What it shows |
|------|---------------|
| **Total** | Total number of registered services |
| **Running** | Services currently running (green) |
| **Stopped** | Services that are stopped (gray) |
| **Crashed** | Services that have crashed (red) |

#### Metrics Strip

A single row below the stats showing aggregate numbers:

- **Total CPU** - Combined CPU usage of all services (e.g. `45.3%`)
- **Total Memory** - Combined memory usage in MB (e.g. `180.5 MB`)
- **Avg CPU** - Average CPU per service
- **Uptime** - Percentage of services currently running

#### Charts

The Dashboard has four real-time charts that update automatically:

1. **CPU Usage** (area chart) - Total CPU percentage over time, Y-axis 0-100%, with a live value indicator
2. **Memory Usage** (area chart) - Total memory in MB over time, with a live value indicator
3. **Network Activity** (full-width area chart) - Three overlaid metrics:
   - Throughput (requests/sec) - purple line
   - Latency (ms) - amber line
   - Error Rate (%) - red dashed line
4. **Status Distribution** (donut chart) - Visual breakdown of service statuses with a total count in the center

<!-- Screenshot: Charts section showing CPU, Memory, Network, and Status donut -->

All charts have hover tooltips showing exact values at any point in time.

#### Service Grid

At the bottom, a grid of **compact service cards** shows each service with its name, status dot, port badge, CPU, and memory. Clicking any card navigates you to the Services page.

---

### Services

<!-- Screenshot: Services page with service cards showing actions -->

The Services page is where you manage all your services. The header shows:

- Title and subtitle
- Total services count badge
- Running services count badge (green)
- **Refresh** button - manually refresh all service statuses
- **Add Service** button - opens the add service form (see [Adding a Service](#adding-a-service))

#### Service Cards

Each service is displayed as a card with the following sections:

**Header:**
- Colored status dot (pulsing green when running, gray when stopped, red when crashed)
- Service name
- Status label (`running`, `stopped`, `crashed`, `starting`)
- Port badge on the right (e.g. `:3000`) - if the service's active port differs from the configured port, a note appears showing the original

**Details:**
- Command being executed (e.g. `npm run dev`)
- Working directory path

**Metrics:**
- CPU usage percentage
- Memory usage in MB
- Uptime duration (e.g. `2h 30m`)

**Actions:**
- When **running**: `Stop` button, `Restart` button, `Delete` button
- When **stopped/crashed**: `Start` button, `Delete` button

The delete button asks for confirmation before removing the service.

**Empty state:** If no services exist, a prompt tells you to click "Add Service" to create your first one.

---

### Logs

<!-- Screenshot: Logs page with service tabs, level filters, and log output -->

The Logs page provides a real-time log viewer for your services.

#### Service Tabs

A row of tabs at the top, one per service. Each tab shows:
- A colored status dot (glowing green if running)
- The service name

Click a tab to view that service's logs.

#### Log Level Filters

Four filter buttons below the tabs:

| Filter | Shows | Color |
|--------|-------|-------|
| **ALL** | Everything | Default |
| **INFO** | Informational messages | Blue |
| **WARN** | Warnings | Yellow |
| **ERROR** | Errors | Red |

Each filter shows a count of matching entries.

#### Log Output

The log area is a scrollable, dark terminal-style panel with monospace font. Each log entry shows:
- **Timestamp** (left, small gray text)
- **Level** (bold, color-coded: blue for INFO, yellow for WARN, red for ERROR)
- **Message** (full log text)

Each entry has a subtle background tint matching its level.

**Auto-scroll:** Logs automatically scroll to the bottom as new entries arrive. If you scroll up to read older logs, auto-scroll pauses and a "Scroll to bottom" button appears.

**Header actions:**
- Entry count (e.g. `142 entries`)
- **Scroll to bottom** button (when scrolled up)
- **Clear** button - clears all logs for the active service

---

### Settings

<!-- Screenshot: Settings page showing theme options and sidebar tabs -->

The Settings page has a **tab sidebar on the left** and the **settings content on the right**. Five tabs are available:

#### Theme

Controls the app's appearance.

**Theme Mode:**
Two clickable cards with visual previews:
- **Dark** (default) - dark backgrounds, light text
- **Light** - light backgrounds, dark text

Selecting a theme applies it immediately across the entire app.

**Accent Color:**
Six color options displayed as swatches you can click:

| Color | Hex |
|-------|-----|
| Blue (default) | `#3b82f6` |
| Purple | `#8b5cf6` |
| Green | `#10b981` |
| Amber | `#f59e0b` |
| Red | `#ef4444` |
| Pink | `#ec4899` |

The accent color changes buttons, active states, highlights, and chart colors across the app instantly.

#### Profile

- **Display Name** - text input (default: "Developer")
- **Email** - email input (default: "dev@example.com")
- **Save Changes** button

#### Billing

Shows a plan card with:
- Plan name ("Pro Plan") and active badge
- Price display
- Feature list with check marks
- **Manage Subscription** button

#### Notifications

Three toggle switches:

| Setting | Description | Default |
|---------|-------------|---------|
| **Email Alerts** | Receive email notifications for service events | On |
| **Crash Alerts** | Get notified when a service crashes | On |
| **Weekly Report** | Weekly summary of service activity | Off |

#### API Access

Displays an API key for external integrations:
- Key is masked by default: `sk-•••••••••••••abcd`
- **Reveal** button shows the full key
- **Hide** button masks it again

---

## Adding a Service

<!-- Screenshot: Add Service modal with form fields filled in -->

Click the **"Add Service"** button on the Services page (or in the Header). A modal form appears with the following fields:

| Field | Type | Required | Example | Description |
|-------|------|----------|---------|-------------|
| **Service Name** | Text | Yes | `Backend API` | A display name for the service |
| **Command** | Text | Yes | `npm run dev` | The shell command to run |
| **Working Directory** | Text + Browse | Yes | `C:\Projects\my-app` | The directory to run the command in. Click the folder icon to open a native folder picker |
| **Port** | Number | No | `3000` | The port your service runs on. Used for display in the UI |
| **Auto-start on launch** | Checkbox | No | - | If checked, the service starts automatically when DevDock opens |
| **Auto-restart on crash** | Checkbox | No | - | If checked, the service restarts automatically if it crashes |

Click **"Add Service"** to create it, or **"Cancel"** to close the form. Validation errors appear in red if required fields are missing.

Once added, the service appears in the Services page and can be started immediately.

---

## Managing Services

### Starting a Service

Click the **Start** button on a stopped or crashed service card. The service runs the configured command in the specified working directory. The status changes to `starting` then `running`.

### Stopping a Service

Click the **Stop** button on a running service. The process is terminated and the status changes to `stopped`.

### Restarting a Service

Click the **Restart** button on a running service. This stops and immediately re-starts the service.

### Deleting a Service

Click the **Delete** button (trash icon) on any service card. A confirmation dialog appears asking "Are you sure you want to delete [service-name]?". Confirm to permanently remove the service from DevDock.

### Port Display

If you configure a port when adding a service, it appears as a badge on the service card (e.g. `:3000`). If the service's actual active port differs from the configured port, both are shown so you know where it's really listening.

---

## Configuration

Service configs are stored in `~/.devdock/config.json`. App settings (theme, accent color, etc.) are in `~/.devdock/settings.json`. These files are created automatically on first launch.

---

## Building & Releases

### Build for Your Platform

```bash
# Windows (NSIS installer)
npm run package:win

# macOS (DMG)
npm run package:mac

# Linux (AppImage + deb)
npm run package:linux
```

Built installers are output to the `release/` directory.

### Automated Releases (CI/CD)

Releases are automated via GitHub Actions. When a version tag is pushed, the CI builds installers for all 3 platforms and publishes them to GitHub Releases.

```bash
# Tag a version
git tag v1.0.0

# Push the tag to trigger the build
git push origin v1.0.0
```

The workflow runs 3 parallel jobs:

| Platform | Runner | Output |
|----------|--------|--------|
| Windows | `windows-latest` | `.exe` (NSIS installer) |
| macOS | `macos-latest` | `.dmg` |
| Linux | `ubuntu-latest` | `.AppImage`, `.deb` |

Once complete, the installers appear on the repository's [Releases](../../releases) page.

---

## Project Structure

```
src/
  main/              # Electron main process
    index.ts           # Window creation, app lifecycle
    ConfigManager.ts   # Service config persistence (~/.devdock/)
    ServiceManager.ts  # Process spawning and monitoring
    ipc-handlers.ts    # IPC bridge between main and renderer
  preload/           # Context bridge (secure IPC)
  renderer/          # React frontend
    src/
      pages/           # Dashboard, Services, Logs, Settings
      components/      # Sidebar, Header, ServiceCard, charts
      hooks/           # useServices, useServiceHistory
  shared/            # Types and constants shared across processes
```

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Electron 28 |
| Frontend | React 18 + TypeScript |
| Bundler | electron-vite (Vite 5) |
| Charts | Recharts |
| Icons | Lucide React |
| Packaging | electron-builder |

---

## License

ISC
