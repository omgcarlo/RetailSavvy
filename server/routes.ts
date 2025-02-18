import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertProductSchema, insertTransactionSchema, insertDebtSchema, insertCustomerSchema, insertExpenseSchema } from "@shared/schema";
import { ZodError } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Error handling middleware for Zod validation
  const validateBody = (schema: any) => async (req: any, res: any, next: any) => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json(error.issues);
      } else {
        next(error);
      }
    }
  };

  // Products
  app.get("/api/products", async (_req, res) => {
    const products = await storage.getProducts();
    res.json(products);
  });

  app.post("/api/products", validateBody(insertProductSchema), async (req, res) => {
    try {
      const productData = {
        name: req.body.name,
        price: req.body.price,  // Schema already validates this as string
        stock: req.body.stock,  // Schema already validates this as string
        imageUrl: req.body.imageUrl,
      };
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/products/:id", async (req, res) => {
    const product = await storage.updateProduct(Number(req.params.id), req.body);
    res.json(product);
  });

  app.delete("/api/products/:id", async (req, res) => {
    await storage.deleteProduct(Number(req.params.id));
    res.sendStatus(204);
  });

  // Transactions
  app.get("/api/transactions", async (_req, res) => {
    const transactions = await storage.getTransactions();
    res.json(transactions);
  });

  app.post("/api/transactions", validateBody(insertTransactionSchema), async (req, res) => {
    try {
      const { items, ...transaction } = req.body;
      // Convert string values to numbers for DB insertion
      const parsedTransaction = {
        ...transaction,
        total: Number(transaction.total),
        isPaid: Number(transaction.isPaid)
      };
      const parsedItems = items.map((item: any) => ({
        ...item,
        price: Number(item.price),
        quantity: Number(item.quantity),
        productId: Number(item.productId)
      }));
      const newTransaction = await storage.createTransaction(parsedTransaction, parsedItems);
      res.status(201).json(newTransaction);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Debts
  app.get("/api/debts", async (_req, res) => {
    const debts = await storage.getDebts();
    res.json(debts);
  });

  app.post("/api/debts", validateBody(insertDebtSchema), async (req, res) => {
    const debt = await storage.createDebt(req.body);
    res.status(201).json(debt);
  });

  app.patch("/api/debts/:id", async (req, res) => {
    const debt = await storage.updateDebt(Number(req.params.id), req.body);
    res.json(debt);
  });

  // Customers
  app.get("/api/customers", async (_req, res) => {
    const customers = await storage.getCustomers();
    res.json(customers);
  });

  app.post("/api/customers", validateBody(insertCustomerSchema), async (req, res) => {
    const customer = await storage.createCustomer(req.body);
    res.status(201).json(customer);
  });

  // Expenses
  app.get("/api/expenses", async (_req, res) => {
    const expenses = await storage.getExpenses();
    res.json(expenses);
  });

  app.post("/api/expenses", validateBody(insertExpenseSchema), async (req, res) => {
    const expense = await storage.createExpense(req.body);
    res.status(201).json(expense);
  });

  const httpServer = createServer(app);
  return httpServer;
}