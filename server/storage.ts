import { IStorage } from "./types";
import createMemoryStore from "memorystore";
import session from "express-session";
import {
  User,
  Product,
  Transaction,
  TransactionItem,
  Debt,
  Customer,
  Expense,
  InsertUser,
  InsertProduct,
  InsertTransaction,
  InsertTransactionItem,
  InsertDebt,
  InsertCustomer,
  InsertExpense,
} from "@shared/schema";

const MemoryStore = createMemoryStore(session);

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private products: Map<number, Product>;
  private transactions: Map<number, Transaction>;
  private transactionItems: Map<number, TransactionItem>;
  private debts: Map<number, Debt>;
  private customers: Map<number, Customer>;
  private expenses: Map<number, Expense>;
  sessionStore: session.SessionStore;
  private currentId: Record<string, number>;

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.transactions = new Map();
    this.transactionItems = new Map();
    this.debts = new Map();
    this.customers = new Map();
    this.expenses = new Map();
    this.currentId = {
      users: 1,
      products: 1,
      transactions: 1,
      transactionItems: 1,
      debts: 1,
      customers: 1,
      expenses: 1,
    };
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.currentId.users++;
    const newUser = { ...user, id };
    this.users.set(id, newUser);
    return newUser;
  }

  // Product methods
  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const id = this.currentId.products++;
    const newProduct = { ...product, id };
    this.products.set(id, newProduct);
    return newProduct;
  }

  async updateProduct(id: number, product: Partial<Product>): Promise<Product> {
    const existingProduct = this.products.get(id);
    if (!existingProduct) throw new Error("Product not found");
    const updatedProduct = { ...existingProduct, ...product };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<void> {
    this.products.delete(id);
  }

  // Transaction methods
  async getTransactions(): Promise<Transaction[]> {
    return Array.from(this.transactions.values());
  }

  async createTransaction(
    transaction: InsertTransaction,
    items: InsertTransactionItem[],
  ): Promise<Transaction> {
    const id = this.currentId.transactions++;
    const newTransaction = { ...transaction, id };
    this.transactions.set(id, newTransaction);

    // Create transaction items
    items.forEach((item) => {
      const itemId = this.currentId.transactionItems++;
      this.transactionItems.set(itemId, { ...item, id: itemId });
    });

    return newTransaction;
  }

  // Debt methods
  async getDebts(): Promise<Debt[]> {
    return Array.from(this.debts.values());
  }

  async createDebt(debt: InsertDebt): Promise<Debt> {
    const id = this.currentId.debts++;
    const newDebt = { ...debt, id };
    this.debts.set(id, newDebt);
    return newDebt;
  }

  async updateDebt(id: number, debt: Partial<Debt>): Promise<Debt> {
    const existingDebt = this.debts.get(id);
    if (!existingDebt) throw new Error("Debt not found");
    const updatedDebt = { ...existingDebt, ...debt };
    this.debts.set(id, updatedDebt);
    return updatedDebt;
  }

  // Customer methods
  async getCustomers(): Promise<Customer[]> {
    return Array.from(this.customers.values());
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const id = this.currentId.customers++;
    const newCustomer = { ...customer, id };
    this.customers.set(id, newCustomer);
    return newCustomer;
  }

  // Expense methods
  async getExpenses(): Promise<Expense[]> {
    return Array.from(this.expenses.values());
  }

  async createExpense(expense: InsertExpense): Promise<Expense> {
    const id = this.currentId.expenses++;
    const newExpense = { ...expense, id };
    this.expenses.set(id, newExpense);
    return newExpense;
  }
}

export const storage = new MemStorage();
