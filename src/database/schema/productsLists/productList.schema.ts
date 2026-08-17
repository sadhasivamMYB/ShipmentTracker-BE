
import { decimal, pgTable, serial, varchar } from "drizzle-orm/pg-core";

export const ProductLists = pgTable('product_lists', {

    id: serial('id').primaryKey(),
    productPfiId: varchar('product_pfi_id', { length: 255 }),
    productCode: varchar('product_code', { length: 255 }),
    productName: varchar('product_name', { length: 255 }),
    pfi_qty: decimal('pfi_qty', { precision: 10, scale: 2 }),
    pfi_netPrice: decimal('pfi_netPrice', { precision: 10, scale: 2 }),
    fob: varchar('fob_value', { length: 255 }),
    fi_qty: decimal('fi_qty', { precision: 10, scale: 2 }),
    fi_netPrice: decimal('fi_netPrice', { precision: 10, scale: 2 }),
})