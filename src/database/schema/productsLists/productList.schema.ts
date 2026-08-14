
import { pgTable, serial, varchar } from "drizzle-orm/pg-core";

export const ProductLists = pgTable('product_lists', {

    id: serial('id').primaryKey(),
    productPfiId: varchar('product_pfi_id', { length: 255 }),
    productCode: varchar('product_code', { length: 255 }),
    productName: varchar('product_name', { length: 255 }),
    pfi_qty: varchar('pfi_qty', { length: 255 }),
    pfi_netPrice: varchar('pfi_netPrice', { length: 255 }),
    fob: varchar('fob_value', { length: 255 }),
    fi_qty: varchar('fi_qty', { length: 255 }),
    fi_netPrice: varchar('fi_netPrice', { length: 255 }),
})