import "dotenv/config"
import express from "express"
import cors from "cors"
import authRoutes from "./routes/auth.routes"
import workspaceRoutes from "./routes/workspace.routes"
import uploadRoutes from "./routes/upload.routes"
import summaryRoutes from "./routes/summary.routes"
import templateRoutes from "./routes/template.route"
import documentTypeRoutes from "./routes/documentType.routes"
import { testConnection } from "./config/database"

const app = express()

app.use(cors())
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

app.get("/health", (req, res) => {

    res.status(200).json({
        success: true,
        message: `Everything is working fine! ${new Date().toISOString()}  `
    })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})