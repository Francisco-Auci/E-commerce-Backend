import { randomUUID } from "crypto";
import productModel from "../dao/fileSystem/mongodb/models/product.model.js";

class ProductController {
  static getProducts = async (req, res) => {
    const { page = 1, limit = 10, sort, category, status } = req.query;
    const queryOptions = {};

    if (category) {
      queryOptions.category = category;
    }

    if (status === "avaliable") {
      queryOptions.stock = { $gt: 0 };
    } else if (status === "unavailable") {
      queryOptions.stock = { $eq: 0 };
    }

    const products = await productModel.paginate(queryOptions, {
      limit: limit,
      page: page ?? 1,
      sort: sort
        ? { price: sort === "desc" ? -1 : sort === "asc" ? 1 : 0 }
        : undefined,
      lean: true,
    });
    res.json(products);
  };

  static getProductById = async (req, res) => {
    const productsId = await productModel.find(
      (product) => product.id === req.params.pid
    );
    const product = await productModel.findById(productsId);

    if (!product) {
      res.json({ error: "producto no encontrado" });
    } else {
      res.json({ product });
    }
  };

  static addProduct = async (req, res) => {
    const prod = req.body;
    prod.id = randomUUID();
    const products = await productModel.create(prod);
    res.json(products);
  };

  static updateProduct = async (req, res) => {
    const productId = req.params.pid;
    const prod = req.body;
    const products = await productModel.findByIdAndUpdate(productId, prod);
    res.send({
      status: "success",
      products: products,
    });
  };

  static deleteProduct = async (req, res) => {
    const productId = req.params.pid;
    const products = await productModel.findByIdAndDelete(productId);
    res.json(products);
  };
}

export { ProductController };