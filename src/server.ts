import "dotenv/config"
import express from "express"
import cors from "cors"
import authRoutes from "./routes/auth.routes"
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