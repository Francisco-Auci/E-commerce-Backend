import { Router } from "express";
import { CartController } from "../controller/cart.controller.js";

const router = Router();

router.get("/", CartController.getCart);

router.get("/:cid", CartController.getCartById);

router.post("/", CartController.addCart);

router.post("/:cid/products/:pid", CartController.addProdToCart);

router.put("/:cid", CartController.updateCart);

router.put("/:cid/products/:pid", CartController.updateProdToCart);

router.delete("/:cid", CartController.deleteCart);

router.delete("/:cid/products/:pid", CartController.deleteProdToCart);

export { router as cartsRouter };