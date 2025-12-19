# Hospital Management System

A software engineering project demonstrating a full-stack hospital management application.

## 🚀 Tech Stack

*   **Frontend:** HTML5, CSS3, Vanilla JavaScript
*   **Backend:** Node.js, Express.js
*   **Database:** MongoDB (using Mongoose ODM)

## ⚠️ Educational Project Notice

**This is a student project for educational purposes only.** It includes:
- Simplified authentication (session-based, no real security)
- Local MongoDB connection (not production-ready)
- CORS enabled for all origins (development only)

**Do NOT use this code in production without proper security hardening.**

## 📦 Prerequisites

Ensure you have the following installed:
*   [Node.js](https://nodejs.org/)
*   [MongoDB](https://www.mongodb.com/try/download/community) (running locally on port 27017)

## 🛠️ Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone <your-repo-url>
    cd <repo-folder>
    ```

2.  **Install Dependencies:**
    This project uses `package.json` to manage dependencies (similar to `requirements.txt` in Python). Run the following command to install `express`, `mongoose`, etc.:
    ```bash
    npm install
    ```

3.  **Start MongoDB:**
    Make sure your local MongoDB instance is running.

4.  **Seed the Database (Optional):**
    If this is the first time running, the app will auto-seed some initial data. You can also allow the server to handle it.

5.  **Run the Server:**
    ```bash
    node server.js
    ```
    The server will start at `http://localhost:3000`.

6.  **Usage:**
    Open your browser and navigate to `http://localhost:3000` to start.

## 📝 Project Structure

- `server.js`: Main backend entry point.
- `script.js`: Frontend logic.
- `public/`: HTML/CSS files.
- `update_db.js`: Utility script for database updates.
