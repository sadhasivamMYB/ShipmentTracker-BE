import "dotenv/config"
import express from "express"
import cors from "cors"
import authRoutes from "./routes/auth.routes"
import workspaceRoutes from "./routes/workspace.routes"
import uploadRoutes from "./routes/upload.routes"
import summaryRoutes from "./routes/summary.routes"
import templateRoutes from "./routes/template.route"
import documentTypeRoutes from "./routes/documentType.routes"
import usersRoutes from "./routes/users.routes"
import { testConnection } from "./config/database"

const app = express()

const allowedOrigins = process.env.ALLOWED_ORIGIN_LISTS?.split(",").map(origin => origin.trim()) || [];

app.use(
    cors({
        origin: (origin, callback) => {
            //   // Allow requests without Origin (Postman, curl, mobile apps)
            //   if (!origin) {
            //     return callback(null, true);
            //   }

            if (allowedOrigins.includes(origin as string)) {
                return callback(null, true);
            }

            return callback(new Error(`Origin '${origin}' is not allowed by CORS`));
        },
        credentials: true,
    })
);


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

testConnection().then(() => {
    console.log("Connected to database")
}).catch((err) => {
    console.log("Failed to connect to database", err)
})
app.use("/api/auth", authRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/api/workspace", workspaceRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/summary", summaryRoutes);
app.use("/api/template", templateRoutes);
app.use("/api/document-types", documentTypeRoutes);
app.use("/api/users", usersRoutes);

app.get("/health", (
    _req, res) => {

    res.status(200).json({
        success: true,
        message: `Everything is working fine! ${new Date().toISOString()}  `
    })
})
app.use((err: any, _req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (err.message && err.message.includes('not allowed by CORS')) {
        console.error(`[CORS Error] ${err.message}`);
        res.status(403).json({ success: false, message: err.message });
        return;
    }

    console.error(err);
    res.status(500).json({ success: false, message: "Internal server error" });
});

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})