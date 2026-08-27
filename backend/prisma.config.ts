import { defineConfig } from "@prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  earlyAccess: true,
  datasource: {
    url: process.env.DATABASE_URL || "mysql://root:@localhost:3306/inventory_system"
  }
});