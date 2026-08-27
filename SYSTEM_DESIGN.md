# System Design: Internal Inventory Management System

## 1. System Architecture Diagram

\`\`\`mermaid
graph TD
    Client["Browser (Desktop / Mobile Camera)"] -->|"HTTPS / CORS"| Express["Express Backend (Node.js + TS)"]
    Express -->|"Auth Middleware"| CookieCheck{"HTTP-Only Cookie Valid?"}
    CookieCheck -->|No| Reject401["401 Unauthorized -> /login"]
    CookieCheck -->|Yes| RoleCheck{"Role Authorization Middleware"}
    RoleCheck -->|Permitted| Controller["Controller Layer"]
    Controller --> Service["Service Layer"]
    Service --> ActivityLog["Activity Log Service"]
    Service --> Prisma["Prisma ORM (MySQL Provider)"]
    ActivityLog --> Prisma
    Prisma --> MariaDB[("MariaDB 10.4.x Database")]
\`\`\`

## 2. Entity Relationship Diagram (ERD)

\`\`\`mermaid
erDiagram
    users ||--o{ inventory : "created_by"
    users ||--o{ inventory : "updated_by"
    users ||--o{ activity_logs : "performed_by"
    categories ||--o{ inventory : "categorizes"

    users {
        string id PK
        string name
        string username UK
        string password
        enum role "SUPER_ADMIN, ADMIN, VIEWER"
        enum status "ACTIVE, INACTIVE"
        datetime created_at
        datetime updated_at
    }

    categories {
        string id PK
        string name UK
        enum status "ACTIVE, INACTIVE"
        datetime created_at
        datetime updated_at
    }

    inventory {
        string asset_number PK
        string serial_number "Nullable"
        string name
        string brand "Nullable"
        string category_id FK
        string assigned_to "Plain text / Nullable"
        string device_password "Nullable"
        string purchase_month "YYYY-MM"
        string qr_code "Detail URL"
        enum status "ACTIVE, INACTIVE"
        string created_by_id FK
        string updated_by_id FK
        datetime created_at
        datetime updated_at
    }

    activity_logs {
        string id PK
        string user_id FK
        enum action "CREATE, UPDATE, DELETE, CHANGE_ROLE, ACTIVATE, DEACTIVATE"
        string entity_type "INVENTORY, USER"
        string entity_id
        string description
        string old_data "Nullable JSON"
        string new_data "Nullable JSON"
        string ip_address "Nullable"
        string user_agent "Nullable"
        datetime created_at
    }
\`\`\`

## 3. Role-Based Access Control (RBAC) Matrix

| Resource & Action | SUPER_ADMIN | ADMIN | VIEWER |
| :--- | :--- | :--- | :--- |
| **View Dashboard** | Yes | Yes | Yes |
| **Scan QR / View Detail** | Yes | Yes | Yes |
| **View Device Passwords** | Yes | Yes | No (Masked/Redacted) |
| **Create / Update Inventory** | Yes | Yes | No |
| **Change Inventory Status** | Yes | Yes | No |
| **Permanent Delete Inventory** | Yes | Yes | No |
| **View Categories** | Yes | Yes | Yes |
| **Create / Edit Categories** | Yes | No | No |
| **User Management (CRUD/Roles)**| Yes | No | No |
| **View Audit Logs** | Yes | Yes | No |

## 4. Key Flows

### QR Code Scanning & Authentication
1. **Unauthenticated Scan**: Accessing `/inventory/AST-001` checks session cookie. Absence redirects user to `/login?redirect=%2Finventory%2FAST-001`. Upon password verification, user returns to requested asset.
2. **Authenticated Scan**: Valid HTTP-only cookie bypasses login; asset details render immediately.

### Activity Logging
1. User actions (`CREATE`, `UPDATE`, `DELETE`, `CHANGE_ROLE`, `ACTIVATE`, `DEACTIVATE`) on `INVENTORY` and `USER` entities automatically log previous and updated states (excluding password hashes and device passwords).
2. Category actions, QR scans, and login events are omitted from logs to keep the audit trail focused.