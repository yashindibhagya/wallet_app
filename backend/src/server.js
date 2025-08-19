import express from "express"
import dotenv from "dotenv"
import { initDB } from "./config/db.js";
import ratelimiter from "./middleware/rateLimiter.js";
import transactionRoute from "./routes/transactionRoutes.js"

dotenv.config();

const app = express();

//middleware
app.use(ratelimiter);
app.use(express.json());

const PORT = process.env.PORT || 5001;


app.use("/api/transactions", transactionRoute)
initDB().then(() => {
    app.listen(PORT, () => {
        console.log("Server is up and running port:", PORT)
    });
});