# Restaurant Ordering System

API REST do sistema de autoatendimento de um restaurante. A ideia é o cliente montar o pedido sozinho, então a API precisa entregar o cardápio organizado: as categorias (pizzas, bebidas, sobremesas...) e os produtos de cada uma delas, com preço e disponibilidade.

Projeto da disciplina de Desenvolvimento Back-End (Engenharia de Software). Foi desenvolvido em sala com o professor a partir da entidade Categoria, e nesta APS foi concluída a entidade Produto, seguindo a mesma estrutura.

## Identificação do estudante

- Leandro Augusto Alencar dos Santos

## Tecnologias utilizadas

- Node.js
- TypeScript
- Express
- Supabase (PostgreSQL)
- Git

## Entidades e relacionamentos

### Category

- id (uuid)
- name
- description
- icon
- display_order
- active

### Product

- id (uuid)
- category_id (chave estrangeira para `categories`)
- name
- description
- price
- available
- active

**Relacionamento:** uma Category pode ter vários Products, e cada Product pertence a uma única Category.

## Estrutura do projeto

```
src/
├── config/        -> conexão com o Supabase
├── controller/    -> recebe a requisição, valida e devolve a resposta HTTP
├── models/        -> interfaces que descrevem as entidades
├── repository/    -> acesso ao banco (todas as consultas do Supabase ficam aqui)
├── routes/        -> define os endpoints de cada entidade
├── app.ts         -> configura o express, as rotas e o tratamento de erros
└── server.ts      -> sobe o servidor
database/
└── schema.sql     -> script de criação das tabelas
```

O caminho de uma requisição é: `routes` → `controller` → `repository` → Supabase.

## Configuração e execução

Clonar o repositório e entrar na pasta:

```
git clone <url-do-repositorio>
cd restaurant-ordering-system-sjp-b
```

Instalar as dependências:

```
npm install
```

Criar o arquivo `.env` na raiz usando o `.env.example` como base e preencher com as credenciais do seu projeto no Supabase.

Rodar em modo desenvolvimento:

```
npm run dev
```

O servidor sobe em `http://localhost:3000`.

Para gerar a versão de produção:

```
npm run build
npm start
```

## Variáveis de ambiente

| Variável | Descrição |
|---|---|
| `SUPABASE_URL` | URL do projeto no Supabase (Project Overview > Project URL) |
| `SUPABASE_SECRET_KEY` | Secret key do projeto (Project Settings > API Keys > Secret keys) |

O formato esperado está no arquivo `.env.example`. O `.env` com as credenciais reais fica de fora do repositório (está no `.gitignore`).

## Banco de dados

O banco é o Postgres do Supabase, com 2 tabelas: `categories` e `products`. O script de criação está em `database/schema.sql`: é só colar no SQL Editor do Supabase e executar. A ordem importa, porque `products` tem chave estrangeira para `categories`.

```sql
create table categories (
    id uuid primary key default gen_random_uuid(),
    name varchar(100) not null,
    description varchar(255),
    icon varchar(50),
    display_order integer not null default 0,
    active boolean not null default true,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

create table products (
    id uuid primary key default gen_random_uuid(),
    category_id uuid not null,
    name varchar(150) not null,
    description varchar(500),
    price numeric(10, 2) not null,
    available boolean not null default true,
    active boolean not null default true,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),

    constraint fk_products_category
        foreign key (category_id)
        references categories(id)
);
```

## Documentação dos endpoints

### Categories

| Método | Endpoint | Descrição |
|---|---|---|
| GET | /categories | Lista todas as categorias |
| GET | /categories/search/:keyword | Pesquisa categorias pelo nome ou descrição |
| GET | /categories/:id | Consulta uma categoria pelo ID |
| POST | /categories | Cadastra uma categoria |
| PUT | /categories/:id | Atualiza uma categoria |
| DELETE | /categories/:id | Remove uma categoria |

### Products

| Método | Endpoint | Descrição |
|---|---|---|
| GET | /products | Lista todos os produtos (aceita `?category_id=` para filtrar por categoria) |
| GET | /products/search/:keyword | Pesquisa produtos pelo nome ou descrição |
| GET | /products/:id | Consulta um produto pelo ID |
| POST | /products | Cadastra um produto |
| PUT | /products/:id | Atualiza um produto |
| DELETE | /products/:id | Remove um produto |

### Códigos de resposta

| Código | Quando acontece |
|---|---|
| 200 | Consulta, atualização ou exclusão feita com sucesso |
| 201 | Registro criado com sucesso |
| 400 | Dados inválidos, ID em formato inválido ou categoria informada que não existe |
| 404 | Registro ou rota não encontrado |
| 500 | Erro interno do servidor |

Todas as respostas de erro seguem o formato:

```json
{
  "message": "Produto não encontrado."
}
```

## Exemplos de requisições

**POST /categories**
```json
{
  "name": "Pizzas",
  "description": "Pizzas tradicionais e especiais",
  "icon": "pizza",
  "display_order": 1,
  "active": true
}
```

**POST /products**
```json
{
  "category_id": "id-da-categoria-aqui",
  "name": "Pizza Margherita",
  "description": "Molho de tomate, mussarela e manjericão",
  "price": 42.9,
  "available": true,
  "active": true
}
```

`description`, `available` e `active` são opcionais. Sem eles, o produto é criado com descrição vazia, disponível e ativo.

**PUT /products/:id** (o corpo vai completo, como no cadastro)
```json
{
  "category_id": "id-da-categoria-aqui",
  "name": "Pizza Margherita",
  "description": "Molho de tomate, mussarela de búfala e manjericão",
  "price": 46.9,
  "available": false,
  "active": true
}
```

**Pesquisa por palavra-chave**
```
GET /products/search/pizza
GET /products?category_id=id-da-categoria-aqui
```
