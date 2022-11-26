import { crudControllers } from '../../utils/CRUD.js';
import { Order } from "./order.model.js";
import { Product } from '../product/product.model.js';
// TODO create type gurd for order list
// TODO make sure the product id or name exits before editing
export async function createOne(req, res) {
    try {
        //edit each product qty through the order list
        const products = JSON.parse(req.body.order_list);
        for (let itm of products) {
            const doc = await Product.findById(itm.id);
            if (doc !== null) {
                doc.stock = doc.stock - itm.qty;
                await doc.save();
            }
        }
        const newModel = await Order.create({ ...req.body, createdBy: req.user?._id });
        return res.status(201).json({ result: "success", message: "created successfully", data: newModel });
    }
    catch (err) {
        if (err instanceof Error)
            return res.status(400).json({ result: "error", message: err.message });
    }
}
export default crudControllers(Order);
