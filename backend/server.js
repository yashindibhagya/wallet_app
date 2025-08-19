import express from "express"
import dotenv from "dotenv"
import { sql } from "./config/db.js";

dotenv.config();

const app = express();

//middleware
app.use(express.json());

const PORT = process.env.PORT || 5001;

async function initDB() {
    try {
        await sql`CREATE TABLE IF NOT EXISTS transactions(
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        category VARCHAR(255) NOT NULL,
        created_at DATE NOT NULL DEFAULT CURRENT_DATE
        )`;

        console.log("DB initialized")
    } catch (error) {
        console.log("Error initializing DB", error);
        process.exit(1);  //status code 1 means failture, 0 success
    }
}

app.get("/api/transactions/:userId", async (req, res) => {
    try {
        const { userId } = req.params;

        const transactions = await sql`
        SELECT * FROM transactions WHERE user_id = ${userId} ORDER BY created_at DESC
        `

        res.status(200).json(transactions);
    } catch (error) {
        console.log("Error gettnig the transactions", error)
        res.status(500).json({ message: "Internal server error" })
    }
})

app.post("/api/transactions", async (req, res) => {
    try {
        const { title, amount, category, user_id } = req.body;

        if (!title || !user_id || !category || amount === undefined) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const transaction = await sql`
        INSERT INTO transactions(user_it, title, amount, category
        VALUES (${user_id},${title},${amount},${category})
        RETURNING *
        `

        console.log(transaction);
        res.status(201).json(transaction[0])


    } catch (error) {
        console.log("Error creating the transaction", error)
        res.status(500).json({ message: "Internal server error" })
    }
})

app.delete("/api/transactions/:id", async (req, res) => {
    try {
        const { id } = req.params;

        if (isNaN(parseInt(id))) {
            return res.status(400).json({ message: "Invalid transaction ID" })
        }

        const result = await sql`
        DELETE FROM transactions WHERE id = ${id} RETURNING * 
        `

        if (result.length === 0) {
            return res.status(404).json({ message: "Transaction not found" })
        }

        res.status(200).json({ message: "Transaction deleted successfully" })

    } catch (error) {
        console.log("Error deleting the transaction", error)
        res.status(500).json({ message: "Internal server error" })
    }
})

initDB().then(() => {
    app.listen(PORT, () => {
        console.log("Server is up and running port:", PORT)
    });
});