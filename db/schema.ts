import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const messages = sqliteTable("contact_messages", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  company: text("company").notNull(),
  message: text("message").notNull(),
  tools: text("tools").notNull(),
  projectType: text("project_type").notNull(),
  budget: text("budget").notNull(),
  createdAt: integer("created_at").notNull(),
  senderHash: text("sender_hash").notNull(),
}, table => [index("idx_messages_sender_time").on(table.senderHash, table.createdAt)]);

export const portfolioProjects = sqliteTable("portfolio_projects", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  company: text("company").notNull(),
  role: text("role").notNull(),
  status: text("status").notNull(),
  date: text("date").notNull(),
  type: text("type").notNull(),
  summary: text("summary").notNull(),
  problem: text("problem").notNull(),
  solution: text("solution").notNull(),
  workflow: text("workflow").notNull(),
  technologies: text("technologies").notNull(),
  screenshots: text("screenshots").notNull(),
  learnings: text("learnings").notNull(),
  nextSteps: text("next_steps").notNull(),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
}, table => [index("idx_portfolio_projects_created").on(table.createdAt)]);

export const siteSettings = sqliteTable("site_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: integer("updated_at").notNull(),
});
