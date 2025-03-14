import {
  pgTable,
  text,
  serial,
  integer,
  decimal,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// Product schema
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  stock: integer("stock").notNull(),
  imageUrl: text("image_url"),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  date: timestamp("date", { mode: "string" }).notNull().defaultNow(), // Use timestamp with ISO string format
  customerId: integer("customer_id").references(() => customers.id), // Add foreign key constraint
  isPaid: integer("is_paid").notNull(),
});

// Transaction items schema
export const transactionItems = pgTable("transaction_items", {
  id: serial("id").primaryKey(),
  transactionId: integer("transaction_id").notNull(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
});

// Debt schema
export const debts = pgTable("debts", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  date: timestamp("date").notNull().defaultNow(),
  description: text("description"),
  isPaid: integer("is_paid").notNull(),
});

// Customer schema
export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  contact: text("contact"),
});

// Expense schema
export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description").notNull(),
  date: timestamp("date").notNull().defaultNow(),
});

// Create insert schemas
export const insertUserSchema = createInsertSchema(users);
export const insertProductSchema = createInsertSchema(products).extend({
  price: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: "Price must be a valid non-negative number",
  }),
  stock: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: "Stock must be a valid non-negative number",
  }),
});
export const insertTransactionItemSchema = createInsertSchema(
  transactionItems,
).extend({
  price: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: "Price must be a valid non-negative number",
  }),
});
export const insertTransactionSchema = createInsertSchema(transactions).extend({
  total: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: "Total must be a valid non-negative number",
  }),
  items: z.array(insertTransactionItemSchema.omit({ transactionId: true })),
});
export const insertDebtSchema = createInsertSchema(debts);
export const insertCustomerSchema = createInsertSchema(customers);
export const insertExpenseSchema = createInsertSchema(expenses);

// Add currency type and schema
export const currencySchema = z.enum(["USD", "PHP"]);
export type Currency = z.infer<typeof currencySchema>;

// Export types
export type User = typeof users.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type TransactionItem = typeof transactionItems.$inferSelect;
export type Debt = typeof debts.$inferSelect;
export type Customer = typeof customers.$inferSelect;
export type Expense = typeof expenses.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type InsertTransactionItem = z.infer<typeof insertTransactionItemSchema>;
export type InsertDebt = z.infer<typeof insertDebtSchema>;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type InsertExpense = z.infer<typeof insertExpenseSchema>;
