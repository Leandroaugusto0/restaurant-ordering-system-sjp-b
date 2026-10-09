import express from "express";
import type { Request, Response, NextFunction } from "express";
import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";

const app = express();
app.use(express.json());

// =================
// Root
// =================
app.get("/", (req, res) => {
    res.status(200).json({
        message: "API Restaurante",
        version: "1.0.0"
    });
});

// =================
// Categories
// =================
app.use("/categories", categoryRoutes);


// =================
// Products
// =================
app.use("/products", productRoutes);

// =================
// Rota não encontrada
// =================
app.use((req: Request, res: Response) => {
    res.status(404).json({
        message: "Rota não encontrada.",
    });
});

// =================
// Tratamento de erros
// =================
app.use((error: any, req: Request, res: Response, next: NextFunction) => {
    if (error.type === "entity.parse.failed") {
        res.status(400).json({
            message: "JSON inválido no corpo da requisição.",
        });

        return;
    }

    console.error("Erro inesperado: ", error);

    res.status(500).json({
        message: "Erro interno do servidor.",
    });
});

export default app;