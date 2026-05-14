import { db } from '@vercel/postgres';

export default async function handler(req, res) {
    const client = await db.connect();
    const { id } = req.query;

    if (req.method === 'GET') {
        const { rows } = await client.sql`SELECT * FROM products ORDER BY product_id ASC;`;
        return res.status(200).json(rows);
    }

    if (req.method === 'POST') {
        const { name, price, stock, category_id = 1 } = req.body;
        try {
            const existing = await client.sql`SELECT * FROM products WHERE LOWER(name) = LOWER(${name});`;
            
            if (existing.rows.length > 0) {
                const newStock = existing.rows[0].stock + stock;
                await client.sql`UPDATE products SET stock = ${newStock}, price = ${price} WHERE product_id = ${existing.rows[0].product_id};`;
                return res.status(200).json({ message: 'Stock updated' });
            } else {
                await client.sql`INSERT INTO products (name, price, stock, category_id) VALUES (${name}, ${price}, ${stock}, ${category_id});`;
                return res.status(201).json({ message: 'Product created' });
            }
        } catch (e) {
            return res.status(500).json({ error: e.message });
        }
    }

    if (req.method === 'DELETE') {
        try {
            await client.sql`DELETE FROM sale_items WHERE product_id = ${id};`;
            await client.sql`DELETE FROM products WHERE product_id = ${id};`;
            return res.status(200).json({ success: true });
        } catch (e) {
            return res.status(500).json({ error: e.message });
        }
    }
}
