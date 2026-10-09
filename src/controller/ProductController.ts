import type { Request, Response } from "express";
import ProductRepository from "../repository/ProductRepository.js";
import type { Product } from "../models/Product.js";

const UUID_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// preço máximo que cabe na coluna numeric(10, 2)
const PRECO_MAXIMO = 99999999.99;

function isUuid(valor: unknown): valor is string {
    return typeof valor === "string" && UUID_REGEX.test(valor);
}

// Código do Postgres para violação de chave estrangeira
function isErroChaveEstrangeira(error: any): boolean {
    return error?.code === "23503";
}

// Valida o corpo da requisição e monta o produto.
// Retorna a mensagem de erro ou o produto pronto para ser salvo.
function montarProduto(body: any): { erro: string } | { product: Product } {
    const { category_id, name, description, price, available, active } = body ?? {};

    if (!isUuid(category_id)) {
        return { erro: "category_id é obrigatório e deve ser um UUID válido." };
    }

    if (typeof name !== "string" || !name.trim()) {
        return { erro: "O nome do produto é obrigatório." };
    }

    if (name.length > 150) {
        return { erro: "O nome do produto deve ter no máximo 150 caracteres." };
    }

    if (description !== undefined && description !== null && typeof description !== "string") {
        return { erro: "A descrição deve ser um texto." };
    }

    if (typeof description === "string" && description.length > 500) {
        return { erro: "A descrição deve ter no máximo 500 caracteres." };
    }

    if (typeof price !== "number" || !Number.isFinite(price) || price <= 0) {
        return { erro: "O preço deve ser um número maior que zero." };
    }

    if (price > PRECO_MAXIMO) {
        return { erro: `O preço deve ser no máximo ${PRECO_MAXIMO}.` };
    }

    if (available !== undefined && typeof available !== "boolean") {
        return { erro: "O campo available deve ser true ou false." };
    }

    if (active !== undefined && typeof active !== "boolean") {
        return { erro: "O campo active deve ser true ou false." };
    }

    return {
        product: {
            category_id,
            name: name.trim(),
            description: description ?? "",
            price,
            available: available ?? true,
            active: active ?? true,
        },
    };
}

async function getAll(req: Request, res: Response) {
    const { category_id } = req.query;

    if (category_id !== undefined && !isUuid(category_id)) {
        res.status(400).json({
            message: "category_id inválido."
        });

        return;
    }

    try {
        const products = category_id
            ? await ProductRepository.findByCategory(category_id)
            : await ProductRepository.findAll();

        res.status(200).json(products);
    } catch (error) {
        console.error("Erro ao buscar produtos: ", error);

        res.status(500).json({
            message: "Erro ao buscar produtos.",
        });
    }
}

async function getByKeyword(req: Request<{ keyword: string }>, res: Response) {
    // vírgula, parênteses e % têm significado no filtro do Supabase, então saem da busca
    const keyword = req.params.keyword.replace(/[,()%]/g, " ").trim();

    if (!keyword) {
        res.status(400).json({
            message: "Palavra-chave não informada."
        });

        return;
    }

    try {
        const products = await ProductRepository.searchByKeyword(keyword);

        res.status(200).json(products);
    } catch (error) {
        console.error("Erro ao pesquisar produtos: ", error);

        res.status(500).json({
            message: "Erro ao pesquisar produtos.",
        });
    }
}

async function getById(req: Request<{ id: string }>, res: Response) {
    const { id } = req.params;

    if (!isUuid(id)) {
        res.status(400).json({
            message: "ID do produto inválido."
        });

        return;
    }

    try {
        const product = await ProductRepository.findById(id);

        if (!product) {
            res.status(404).json({
                message: "Produto não encontrado.",
            });

            return;
        }

        res.status(200).json(product);
    } catch (error) {
        console.error("Erro ao buscar produto: ", error);

        res.status(500).json({
            message: "Erro ao buscar produto.",
        });
    }
}

async function create(req: Request, res: Response) {
    const resultado = montarProduto(req.body);

    if ("erro" in resultado) {
        res.status(400).json({
            message: resultado.erro
        });

        return;
    }

    try {
        const product = await ProductRepository.create(resultado.product);

        res.status(201).json(product);
    } catch (error) {
        if (isErroChaveEstrangeira(error)) {
            res.status(400).json({
                message: "A categoria informada não existe.",
            });

            return;
        }

        console.error("Erro ao criar produto: ", error);

        res.status(500).json({
            message: "Erro ao criar produto.",
        });
    }
}

async function update(req: Request<{ id: string }>, res: Response) {
    const { id } = req.params;

    if (!isUuid(id)) {
        res.status(400).json({
            message: "ID do produto inválido."
        });

        return;
    }

    const resultado = montarProduto(req.body);

    if ("erro" in resultado) {
        res.status(400).json({
            message: resultado.erro
        });

        return;
    }

    try {
        const existe = await ProductRepository.findById(id);

        if (!existe) {
            res.status(404).json({
                message: "Produto não encontrado.",
            });

            return;
        }

        const product = await ProductRepository.update(id, resultado.product);

        res.status(200).json(product);
    } catch (error) {
        if (isErroChaveEstrangeira(error)) {
            res.status(400).json({
                message: "A categoria informada não existe.",
            });

            return;
        }

        console.error("Erro ao atualizar produto: ", error);

        res.status(500).json({
            message: "Erro ao atualizar produto.",
        });
    }
}

async function remove(req: Request<{ id: string }>, res: Response) {
    const { id } = req.params;

    if (!isUuid(id)) {
        res.status(400).json({
            message: "ID do produto inválido."
        });

        return;
    }

    try {
        const existe = await ProductRepository.findById(id);

        if (!existe) {
            res.status(404).json({
                message: "Produto não encontrado.",
            });

            return;
        }

        await ProductRepository.remove(id);

        res.status(200).json({
            message: "Produto removido com sucesso.",
        });
    } catch (error) {
        console.error("Erro ao remover produto: ", error);

        res.status(500).json({
            message: "Erro ao remover produto.",
        });
    }
}

export default {
    getAll,
    getById,
    getByKeyword,
    create,
    update,
    remove
}
