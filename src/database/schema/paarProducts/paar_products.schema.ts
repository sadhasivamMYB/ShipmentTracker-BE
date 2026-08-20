import { pgTable, serial, varchar } from "drizzle-orm/pg-core";

export const paarProducts = pgTable('paar_products', {
    id: serial('id').primaryKey(),
    paarNumberRef: varchar('paar_number_ref', { length: 255 }),
    productName: varchar('product_name', { length: 255 }),
    productQuantity: varchar('product_quantity', { length: 255 }),
})