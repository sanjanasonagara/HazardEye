
## Database & Environment Configuration

This project uses **Environment Variables** for configuration to support different development setups and keep secrets safe.

**Do NOT commit secrets to `appsettings.json`.**

### Quick Start
1.  Copy `.env.example` to `.env` in the `backend/HazardEye.API` directory.
    ```bash
    cp backend/HazardEye.API/.env.example backend/HazardEye.API/.env
    ```
2.  Update `.env` with your local database credentials and other settings.
    *   **DB_HOST**: Database host (default: localhost)
    *   **DB_PORT**: Database port (default: 5432)
    *   **DB_USER**: Your local PostgreSQL username
    *   **DB_PASSWORD**: Your local PostgreSQL password
    *   **JWT_KEY**: A secure random string (>32 chars) for token signing.

### Configuration Variables
| Variable | Description | Default |
| :--- | :--- | :--- |
| `DB_HOST` | Database Hostname | `localhost` |
| `DB_PORT` | Database Port | `5432` |
| `DB_NAME` | Database Name | `hazardeeye` |
| `DB_USER` | PostgreSQL Username | `postgres` |
| `DB_PASSWORD` | PostgreSQL Password | *(Empty)* |
| `JWT_KEY` | JWT Signing Key | *(Must be set)* |
| `JWT_ISSUER` | JWT Issuer Claim | `HazardEye` |
| `MINIO_ACCESS_KEY`| MinIO Access Key | `minioadmin` |

### Troubleshooting
*   If the backend fails to connect to the database, verify your `DB_PORT` and `DB_USER` in `.env`.
*   Ensure `.env` matches the `.env.example` structure.
