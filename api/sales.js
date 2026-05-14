import { db } from '@vercel/postgres';

export default async function handler(req, res) {
    const client = await db.connect();
    if (req.method === 'POST') {
        const { total_amount, items } = req.body;
        try {
            const sale = await client.sql`
                INSERT INTO sales (total_amount) 
                VALUES (${total_amount}) 
                RETURNING sale_id;
            `;
            const saleId = sale.rows[0].sale_id;

            for (const item of items) {
                await client.sql`
                    INSERT INTO sale_items (sale_id, product_id, quantity, unit_price)
                    VALUES (${saleId}, ${item.id}, ${item.qty}, ${item.price});
                `;
                await client.sql`
                    UPDATE products 
                    SET stock = stock - ${item.qty} 
                    WHERE product_id = ${item.id};
                `;
            }
            return res.status(200).json({ success: true });
        } catch (e) {
            return res.status(500).json({ error: e.message });
        }
    }
}
