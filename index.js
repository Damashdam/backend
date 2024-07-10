const express = require("express");
const app = express();
const dotenv = require("dotenv");
const cors = require("cors");
const PORT = process.env.PORT || 3000;
const connectDB = require("./config/db.js");
const { verifyToken } = require("./middleware/auth.middleware.js");

dotenv.config(); // Load config

async function main() {
    await connectDB(); // Connect to MongoDB

    app.use(express.json());
    app.use(cors({
        origin: "http://localhost:5173", // Adjust CORS origin as per your frontend URL
    }));

    // Routes
    const authRoutes = require("./routes/auth.route.js");
    const protectedRoutes = require("./routes/protected.route.js");
    const tasksRoutes = require("./routes/tasks.js");

    app.use("/api/auth", authRoutes);
    app.use("/api/protected", verifyToken, protectedRoutes);
    app.use("/api/tasks", verifyToken, tasksRoutes); // Use the task routes and protect it with verifyToken

    // Start server
    const server = app.listen(PORT, function (err) {
        if (err) console.log(err);
        console.log("Server listening on PORT", PORT);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
        server.close(() => {
            console.log('Process terminated');
        });
    });

    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.error(`Port ${PORT} is already in use`);
            process.exit(1);
        } else {
            throw err;
        }
    });
}

main();

module.exports = app; // Export app for testing purposes
