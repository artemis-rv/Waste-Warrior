# Waste-Warrior: Routes, Navigation & Endpoints Reference

Comprehensive documentation of all application URLs, navigation sections, API endpoints, and database operations for each user panel and system layer in **Waste-Warrior**.

---

## Table of Contents
1. [Frontend Top-Level Application Routes](#1-frontend-top-level-application-routes)
2. [Admin Panel Navigation & Operations](#2-admin-panel-navigation--operations)
3. [Worker Panel Navigation & Operations](#3-worker-panel-navigation--operations)
4. [Resident / Citizen Panel Navigation & Operations](#4-resident--citizen-panel-navigation--operations)
5. [Backend REST API Endpoints (Express Server)](#5-backend-rest-api-endpoints-express-server)
6. [Supabase Database & Storage Operations Matrix](#6-supabase-database--storage-operations-matrix)

---

## 1. Frontend Top-Level Application Routes

| URL Path | Access Level | Component | Description |
| :--- | :--- | :--- | :--- |
| `/` | Public | [`src/pages/Index.tsx`](file:///d:/Waste-Warrior/src/pages/Index.tsx) | Landing page showcasing hero section, features, impact preview, and call-to-action buttons. |
| `/auth` | Public / Guest | [`src/components/auth/AuthPage.jsx`](file:///d:/Waste-Warrior/src/components/auth/AuthPage.jsx) | Sign in and registration forms with role selection. Redirects to `/dashboard` if authenticated. |
| `/dashboard` | Protected (Logged-in Users) | [`src/pages/DashboardPage.jsx`](file:///d:/Waste-Warrior/src/pages/DashboardPage.jsx) | Main app gateway that renders the corresponding dashboard (`Admin`, `Worker`, `Resident`) based on the authenticated user's role. |
| `*` | Public | [`src/pages/NotFound.tsx`](file:///d:/Waste-Warrior/src/pages/NotFound.tsx) | 404 error catch-all page for undefined routes. |

---

## 2. Admin Panel Navigation & Operations

The Admin Panel is housed in [`src/components/dashboards/AdminDashboard.jsx`](file:///d:/Waste-Warrior/src/components/dashboards/AdminDashboard.jsx) with sidebar navigation handled by [`src/components/admin/AdminSidebar.jsx`](file:///d:/Waste-Warrior/src/components/admin/AdminSidebar.jsx).

### 2.1 Navigation Sections (Sidebar Views)

| Section Key (`id`) | Nav Label | Component | Functionality |
| :--- | :--- | :--- | :--- |
| `dashboard` | **Dashboard** | [`src/components/admin/sections/DashboardOverview.jsx`](file:///d:/Waste-Warrior/src/components/admin/sections/DashboardOverview.jsx) | KPI overview cards (Total users, active workers, reports pending/completed, collection points, total credits, kit stats). |
| `map` | **Map & Tracking** | [`src/components/admin/sections/MapTracking.jsx`](file:///d:/Waste-Warrior/src/components/admin/sections/MapTracking.jsx) | Interactive Mapbox map rendering real-time worker locations, reported waste hotspots, and collection bins. |
| `collection-points` | **Collection Points** | [`src/components/admin/sections/CollectionPointManagement.jsx`](file:///d:/Waste-Warrior/src/components/admin/sections/CollectionPointManagement.jsx) | CRUD management for waste collection hubs (Add, edit, view capacity, contact details, coordinates). |
| `users` | **User Management** | [`src/components/admin/sections/UserManagement.jsx`](file:///d:/Waste-Warrior/src/components/admin/sections/UserManagement.jsx) | Directory of all users, change user roles (`resident`, `worker`, `admin`), and ban/unban accounts. |
| `champions` | **Green Champions** | [`src/components/modules/Leaderboard/LeaderboardAdmin.jsx`](file:///d:/Waste-Warrior/src/components/modules/Leaderboard/LeaderboardAdmin.jsx) / [`src/components/admin/sections/GreenChampions.jsx`](file:///d:/Waste-Warrior/src/components/admin/sections/GreenChampions.jsx) | Award/deduct user credits, toggle "Green Champion" status, and reset the seasonal leaderboard. |
| `credits` | **Credits & Penalties** | [`src/components/admin/sections/CreditsManagement.jsx`](file:///d:/Waste-Warrior/src/components/admin/sections/CreditsManagement.jsx) | Manual credit grants and penalties with required reasons and audit logging (`credit_audit_log`). |
| `kits` | **Kit Distribution** | [`src/components/admin/sections/KitDistribution.jsx`](file:///d:/Waste-Warrior/src/components/admin/sections/KitDistribution.jsx) | Create and assign waste segregation starter kits to residents and mark them as delivered. |
| `workers` | **Workers Management** | [`src/components/admin/sections/WorkersManagement.jsx`](file:///d:/Waste-Warrior/src/components/admin/sections/WorkersManagement.jsx) | Worker list, assignment load monitoring, and quick-dispatch of pending reports to workers. |
| `reports` | **Report Monitoring** | [`src/components/admin/sections/ReportMonitoring.jsx`](file:///d:/Waste-Warrior/src/components/admin/sections/ReportMonitoring.jsx) | Full audit of submitted waste reports, set worker deadlines, or escalate non-resolved tasks with penalties. |
| `verification` | **Visit Verification** | [`src/components/admin/sections/VisitVerification.jsx`](file:///d:/Waste-Warrior/src/components/admin/sections/VisitVerification.jsx) | Review worker proof-of-completion photos and GPS timestamps to approve or reject cleanups. |
| `learning-progress` | **Learning Progress** | [`src/components/admin/sections/LearningProgressManagement.jsx`](file:///d:/Waste-Warrior/src/components/admin/sections/LearningProgressManagement.jsx) | Track user module progress, video watch status, quiz scores, and issued certificates. |
| `export` | **Export Reports** | [`src/components/admin/sections/ExportReports.jsx`](file:///d:/Waste-Warrior/src/components/admin/sections/ExportReports.jsx) | Generate and download CSV reports filtered by date ranges for reports, credits, and user stats. |

### 2.2 Data & Database Operations
- **`GET / SELECT`**:
  - `users`: Query all users, roles, credit balances, ban statuses, worker activity.
  - `reports`: Query all waste reports with user information, statuses, worker assignments, timestamps.
  - `collection_points`: Query coordinates, capacities, contact details.
  - `credit_audit_log`: Query administrative audit log records with user references.
  - `kits`: Query kit inventory and delivery statuses.
  - `learning_modules`, `user_learning_progress`, `certifications`: Query educational analytics.
- **`POST / INSERT`**:
  - `collection_points`: Create new collection hub locations.
  - `kits`: Create new starter kits with item specifications.
  - `credit_audit_log`: Record credit adjustments, bonus grants, or penalty subtractions.
- **`PUT / PATCH / UPDATE`**:
  - `users`: Modify role, toggle `is_banned`, toggle `is_green_champion`, update `credits`, reset leaderboard scores.
  - `reports`: Assign `assigned_to` worker, assign `deadline`, change status to `assigned` or `escalated`, record verification with `is_verified` and `verification_notes`.
  - `collection_points`: Update hub details, coordinates, addresses, capacities.
  - `kits`: Update delivery status (`is_delivered = true`).

---

## 3. Worker Panel Navigation & Operations

The Worker Panel is managed inside [`src/components/dashboards/WorkerDashboard.jsx`](file:///d:/Waste-Warrior/src/components/dashboards/WorkerDashboard.jsx) wrapped with [`src/components/layout/DashboardLayout.jsx`](file:///d:/Waste-Warrior/src/components/layout/DashboardLayout.jsx).

### 3.1 Navigation Sections

| Section Key (`id`) | Nav Label | View / Section | Functionality |
| :--- | :--- | :--- | :--- |
| `pickups` | **Assigned Pickups** | `PickupsSection` | List of waste assignments assigned to this worker. View address, launch Google Maps navigation, upload cleanup evidence photo with geolocation, mark status as `in_progress` or `completed`. |
| `progress` | **Progress Tracker** | `ProgressSection` | Visual completion rate metrics, today's pickups vs. weekly tasks, and performance stats. |
| `notifications` | **Notifications** | `NotificationsSection` | Real-time notifications for newly assigned pickups and status alerts. |
| `support` | **Support & Help** | `SupportSection` | Emergency helpline numbers, worker support contact emails, and waste handling safety guidelines. |
| `profile` | **Worker Info** | `ProfileSection` | Worker identity card displaying Worker ID, active status badge, language preference, and phone number. |

### 3.2 Data & Database Operations
- **`GET / SELECT`**:
  - `reports` where `assigned_worker_id = user.id`: Fetch assigned pickup tasks.
  - `workers` where `user_id = user.id`: Fetch worker profile and active status.
  - `worker_notifications` where `worker_id = user.id`: Fetch notification feed.
- **`POST / Storage Upload`**:
  - Supabase Storage Bucket `waste-reports/evidence/*`: Upload cleanup proof photos.
- **`PUT / PATCH / UPDATE`**:
  - `reports`: Update `status` to `in_progress` / `completed`, set `segregation_done`, update `evidence_photo_url`, `evidence_lat`, `evidence_lng`, `evidence_timestamp`, and `resolved_at`.
  - `worker_notifications`: Mark notification as read (`is_read = true`).
- **`Websocket Subscriptions`**:
  - Supabase Realtime channel `worker-notifications`: Listen for `INSERT` events on `worker_notifications` for this worker.

---

## 4. Resident / Citizen Panel Navigation & Operations

The Resident Panel is managed inside [`src/components/dashboards/ResidentDashboard.jsx`](file:///d:/Waste-Warrior/src/components/dashboards/ResidentDashboard.jsx).

### 4.1 Navigation Sections

| Section Key (`id`) | Nav Label | Component | Functionality |
| :--- | :--- | :--- | :--- |
| `overview` | **Overview** | `renderOverviewSection` | Overview cards (Total reports, credits, resolved status), quick report launcher, recent activity tabs. |
| `report` | **Report Waste** | [`src/components/forms/ReportForm.jsx`](file:///d:/Waste-Warrior/src/components/forms/ReportForm.jsx) | Upload up to 3 waste photos, capture GPS location / manual address, write description, and claim 10 credits upon submission. |
| `learning` | **Learning** | [`src/pages/LearningPage.jsx`](file:///d:/Waste-Warrior/src/pages/LearningPage.jsx) / [`src/components/features/LearningModules.jsx`](file:///d:/Waste-Warrior/src/components/features/LearningModules.jsx) | Educational modules with embedded video lessons, interactive quizzes ([`src/components/features/QuizModal.jsx`](file:///d:/Waste-Warrior/src/components/features/QuizModal.jsx)), and downloadable completion certificates ([`src/components/features/CertificateGenerator.jsx`](file:///d:/Waste-Warrior/src/components/features/CertificateGenerator.jsx)). |
| `credits` | **Credits** | [`src/components/features/CreditsSystem.jsx`](file:///d:/Waste-Warrior/src/components/features/CreditsSystem.jsx) | Credit balance ledger, credit earnings history, and coupon code generator to redeem credits. |
| `leaderboard` | **Green Champions** | [`src/components/modules/Leaderboard/LeaderboardDashboard.jsx`](file:///d:/Waste-Warrior/src/components/modules/Leaderboard/LeaderboardDashboard.jsx) | Community ranking board showing top performers, podium rankings, and champion badges. |
| `impact` | **Impact** | [`src/pages/ImpactPage.jsx`](file:///d:/Waste-Warrior/src/pages/ImpactPage.jsx) | Environmental impact stats, before & after transformation carousel, community cleanup testimonials. |

### 4.2 Data & Database Operations
- **`GET / SELECT`**:
  - `reports` where `user_id = userProfile.id`: Fetch personal reports history.
  - `notifications` where `user_id = userProfile.id`: Fetch notifications.
  - `credits_log` where `user_id = userProfile.id`: Fetch credit log entries.
  - `redeems` where `user_id = userProfile.id`: Fetch generated redemption coupons.
  - `learning_modules`, `user_learning_progress`, `certifications`: Fetch module and quiz states.
  - `users`: Fetch leaderboard scores ordered by `credits DESC`.
- **`POST / INSERT / Storage Upload`**:
  - Supabase Storage Bucket `waste-reports/*`: Upload report images.
  - `reports`: Create new waste report with photos & coordinates.
  - `credits_log`: Log credits earned or redeemed.
  - `redeems`: Generate a new coupon code.
  - `user_learning_progress`: Upsert video watch status and quiz score.
  - `certifications`: Generate certification upon passing all modules.
- **`PUT / PATCH / UPDATE`**:
  - `users`: Increment credit balance by 10 upon report; deduct credits upon redemption; update user profile details (`full_name`, `phone`, `address`).
- **`Websocket Subscriptions`**:
  - Supabase Realtime channel `report_updates`: Listen for status updates on personal reports.

---

## 5. Backend REST API Endpoints (Express Server)

The Express backend server runs via [`backend/src/app.js`](file:///d:/Waste-Warrior/backend/src/app.js) with base URL `http://localhost:5000/api` (or configured `VITE_API_URL`).

| HTTP Method | Route Endpoint | Middleware / Auth | Request Body / Params | Response | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`GET`** | `/api/health` | Public | None | `{ status: "ok", timestamp: ... }` | Backend server health check ([`backend/src/routes/health.routes.js`](file:///d:/Waste-Warrior/backend/src/routes/health.routes.js)). |
| **`POST`** | `/api/auth/register` | Public | `{ email, password, fullName }` | `{ message: "Registration successful", user: { id, email, fullName, role, credits, ... } }` | Creates user account in database with hashed password and sets HTTP-only JWT cookie ([`backend/src/routes/auth.routes.js`](file:///d:/Waste-Warrior/backend/src/routes/auth.routes.js)). |
| **`POST`** | `/api/auth/login` | Public | `{ email, password }` | `{ message: "Login successful", user: { id, email, fullName, role, credits, ... } }` | Authenticates credentials, generates JWT token stored in secure cookie ([`backend/src/routes/auth.routes.js`](file:///d:/Waste-Warrior/backend/src/routes/auth.routes.js)). |
| **`POST`** | `/api/auth/logout` | Public | None | `{ message: "Logged out successfully" }` | Clears the authentication JWT cookie ([`backend/src/routes/auth.routes.js`](file:///d:/Waste-Warrior/backend/src/routes/auth.routes.js)). |
| **`GET`** | `/api/auth/me` | `authenticate` (JWT Cookie) | None | `{ user: { id, email, fullName, role, credits, language, ... } }` | Returns the currently authenticated user's session profile ([`backend/src/routes/auth.routes.js`](file:///d:/Waste-Warrior/backend/src/routes/auth.routes.js)). |

---

## 6. Supabase Database & Storage Operations Matrix

| Table / Storage Resource | Resident Actions | Worker Actions | Admin Actions |
| :--- | :--- | :--- | :--- |
| **`users`** | Read (Self, Leaderboard), Update (Profile, Credits) | Read (Self) | Read (All), Update (Role, Credits, Bans, Champions, Reset) |
| **`reports`** | Insert (New Report), Read (Own Reports) | Read (Assigned), Update (Status, Proofs, Geolocation) | Read (All), Update (Assign worker, Deadlines, Escalations, Verification) |
| **`collection_points`** | Read (Nearby points on map) | Read | Create, Read, Update, Delete (CRUD) |
| **`kits`** | Read (Assigned kit status) | — | Create (New kits), Read (All), Update (Mark Delivered) |
| **`credits_log`** | Read (History), Insert (Earn/Redeem) | — | Read (All logs) |
| **`credit_audit_log`**| — | — | Create (Manual adjustments/penalties), Read (All) |
| **`redeems`** | Create (Generate code), Read (History) | — | Read |
| **`learning_modules`** | Read | Read | Read, Manage |
| **`user_learning_progress`** | Upsert (Watch video, Submit quiz) | — | Read (All user progress) |
| **`certifications`** | Insert (Claim certificate), Read (Self) | — | Read (All certificates) |
| **`worker_notifications`** | — | Read, Update (`is_read = true`) | Create, Read |
| **`notifications`** | Read, Update (`is_read = true`) | — | Read |
| **Storage: `waste-reports`** | Upload report images | Upload evidence photos | Read / View all photos |
