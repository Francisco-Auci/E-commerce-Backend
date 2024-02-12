import express from "express";
import { engine } from "express-handlebars";
import __dirname from "./utils.js";
import { Server } from "socket.io";
import { productsRouter } from "./routes/products.js";
import { viewRouter } from "./routes/view-router.js";
import { cartsRouter } from "./routes/carts.js";
import mongoose from "mongoose";
import productModel from "./dao/fileSystem/mongodb/models/product.model.js";
import { messageRouter } from "./routes/message.js";
import messageModel from "./dao//fileSystem/mongodb/models/message.model.js";

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(__dirname + "/public"));

app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", __dirname + "/views");

app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);
app.use("/api/message", messageRouter);
app.use("/views", viewRouter);

const MONGO =
  "mongodb://localhost:27017";

const connection = mongoose.connect(MONGO);

const PORT = 8080;
const httpServer = app.listen(PORT, () =>
  console.log(`Server running on port: ${PORT}`)
);

const socketServer = new Server(httpServer);

socketServer.on("connection", async (socket) => {
  console.log("new connection");

  socket.on("disconnect", () => {
    console.log("user disconnect");
  });

  socketServer.emit("messages", await messageModel.find());

  socket.emit("initialProducts", await productModel.find());

  socket.on("newProduct", async (newProd) => {
    await productModel.create(newProd);
    const updatedProducts = await productModel.find();
    socket.emit("updateProducts", updatedProducts);
  });

  socket.on("deleteProduct", async (idToDelete) => {
    console.log(idToDelete);
    if (idToDelete) {
      await productModel.findByIdAndDelete(idToDelete);
      const updatedProducts = await productModel.find();
      socketServer.emit("updateProducts", updatedProducts);
    } else {
      console.error("no hay id valido");
    }
  });

  socket.on("newUser", (user) => {
    console.log(`>${user} se ha conectado`);
  });

  socket.on("chat-messages", async (message) => {
    await messageModel.create(message);
    const messages = await messageModel.find();
    socketServer.emit("message", messages);
  });

  socket.emit("msg", "bienvenido al chat");

  socket.on("newUser", (user) => {
    socket.broadcast.emit("newUser", user);
  });

  socket.on("chat:typing", (user) => {
    socket.broadcast.emit("chat:typing", user);
  });
});

export default socketServer;