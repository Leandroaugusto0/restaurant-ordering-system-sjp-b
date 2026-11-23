import express from "express";

const app = express();

app.use(express.json());

interface Category {
    id: number;
    name: string;
    description: string;
}

interface Product {
    id: number;
    categoryId: number;
    name: string;
    description: string;
    price: number;
}



const categories: Category[] = [
    {
        "id": 1,
        "name": "Pizzas",
        "description": "Pizzas tradicionais, especiais e sabores da casa."
    },
    {
        "id": 2,
        "name": "Bebidas",
        "description": "Refrigerantes, sucos, águas e outras bebidas para acompanhar a pizza."
    },
    {
        "id": 3,
        "name": "Sobremesas",
        "description": "Opções doces para finalizar a refeição, como pizzas doces e sobremesas."
    }
];

const products: Product[] = [
    {
        "id": 1,
        "categoryId": 1,
        "name": "Pizza Margherita",
        "description": "Molho de tomate, mussarela, tomate e manjericão fresco.",
        "price": 39.90
    },
    {
        "id": 2,
        "categoryId": 1,
        "name": "Pizza Calabresa",
        "description": "Molho de tomate, mussarela, calabresa fatiada e cebola.",
        "price": 42.90
    },
    {
        "id": 3,
        "categoryId": 2,
        "name": "Coca-Cola 2L",
        "description": "Refrigerante Coca-Cola em garrafa de 2 litros.",
        "price": 12.00
    },
    {
        "id": 4,
        "categoryId": 3,
        "name": "Pizza de Chocolate",
        "description": "Pizza doce com chocolate cremoso e granulado.",
        "price": 36.90
    }
]

var categoryidcounter = categories.length + 1;
var productidcounter = products.length + 1;

app.get("/", (req, res) => {
    res.status(200).json({
        message: "API Restaurante",
        version: "1.0.0"
    });
});

app.get("/categories", (req, res) => {
    res.status(200).json(categories);
});

app.post("/categories", (req, res) => {
    const { name, description } = req.body as Category;

    const newCategory = {
        id: categoryidcounter,
        name,
        description
    };

    categories.push(newCategory);
    categoryidcounter = ++categoryidcounter;
    res.status(201).json(newCategory);
});

app.put("/categories/:id", (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body as Category;
    const categoryIndex = categories.findIndex(c => c.id === parseInt(id));
    if (categoryIndex === -1) {return res.status(404).json({ message: `Categoria ${id} não encontrada.` });}
   
    const oldCategory = categories[categoryIndex]!;
    const newCategory = {
        id: oldCategory.id,
        name: name ?? oldCategory.name,
        description: description ?? oldCategory.description
    };
    categories[categoryIndex] = newCategory;
    res.status(200).json(newCategory);
});

app.delete("/categories/:id", (req, res) => {
    const { id } = req.params;
    const categoryIndex = categories.findIndex(c => c.id === parseInt(id));
    if (categoryIndex === -1) {
        return res.status(404).json({ message: `Categoria ${id} não encontrada.` });
    }

    if (products.some(p => p.categoryId === parseInt(id))) {
        return res.status(400).json({ message: `Não é possível remover a categoria ${id} pois existem produtos associados a ela.` });
    }
    categories.splice(categoryIndex, 1);
    res.status(200).json({ message: `Categoria ${id} removida com sucesso.` });
});

app.get("/products", (req, res) => {
    res.status(200).json(products);
});

app.post("/products", (req, res) => {
    const { categoryId, name, description, price } = req.body as Product;

    const findcategory = categories.find(c => c.id === categoryId);
    if (!findcategory) { return res.status(400).json({ message: `Categoria ${categoryId} não encontrada.` }); }

    const newProduct = {
        id: productidcounter,
        categoryId,
        name,
        description,
        price
    };

    products.push(newProduct);
    productidcounter = ++productidcounter;
    res.status(201).json(newProduct);
});

app.put("/products/:id", (req, res) => {
    const { id } = req.params;
    const { categoryId, name, description, price } = req.body as Product;

    const oldProduct = products.find(p => p.id === parseInt(id));
    if (!oldProduct) { return res.status(400).json({ message: `Produto ${id} não encontrado.` }); }

    if(categoryId) {
    const findcategory = categories.find(c => c.id === categoryId);
    if (!findcategory) { return res.status(400).json({ message: `Categoria ${categoryId} não encontrada.` }); }
}
    const newProduct = {
        id: oldProduct.id,
        categoryId: categoryId ?? oldProduct.categoryId,
        name: name ?? oldProduct.name,
        description: description ?? oldProduct.description,
        price: price ?? oldProduct.price
    };

    const productIndex = products.findIndex(p => p.id === parseInt(id));
    products.splice(productIndex, 1, newProduct);
    res.status(201).json(newProduct);
});


app.delete("/products/:id", (req, res) => {
    const { id } = req.params;
    const productIndex = products.findIndex(p => p.id === parseInt(id));
    if (productIndex === -1) {
        return res.status(404).json({ message: `Produto ${id} não encontrado.` });
    }
    products.splice(productIndex, 1);
    res.status(200).json({ message: `Produto ${id} removido com sucesso.` });
});

export default app;