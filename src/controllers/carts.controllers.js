import { clog } from "../server.js";

// Importo las subclases
import CartServices from "../services/carts.services.js";
import ProductServices from "../services/products.services.js";

// Importo los modelos
import { cartModel } from "../models/cart.models.js";
import { UserModel } from "../models/user.model.js";
import { productModel } from "../models/product.model.js";
import { confirmOrderMail } from "../services/mail.services.js";

// Instancio las clases pasándole los modelos de Mongoose como parámetros
const cartServices = new CartServices(cartModel);
const productServices = new ProductServices(productModel);

export const newCart = async (req, res) => {
  const { body } = req;
  try {
    const cart = await cartServices.createCart(body);
    if (req.user) {
      const id = req.user._id;
      const user = await UserModel.findById(id);
      user.carts.push(cart._id);
      await user.save();
    }
    res.status(200).send(cart._id);
  } catch (error) {
    clog(error);
  }
};

export const getCarts = async (req, res) => {
  const { cartId } = req.params;
  if (cartId) {
    const cart = await cartServices.getCartById(cartId);
    if (cart) {
      res.status(200).send({ cart });
    } else {
      res.send("El carrito que intenta buscar no existe");
    }
  } else {
    try {
      const carts = await cartServices.getCarts();
      res.status(200).send({ carts });
    } catch (error) {
      clog(error);
    }
  }
};

export const deleteCartById = async (req, res) => {
  const { cartId } = req.params;
  try {
    const borrado = await cartServices.deleteCartById(cartId);
    if (borrado) {
      res.status(200).send("Borrado con éxito");
    } else {
      res.status("El carrito que intenta borrar no existe");
    }
  } catch (error) {
    clog(error);
  }
};

export const addProductToCart = async (req, res) => {
  const { cartId, productId } = req.params;
  try {
    const newProduct = await productServices.getProductById(productId);
    // Agrega el producto al carrito, luego retorna el producto agregado
    const addedProduct = await cartServices.addProduct(cartId, newProduct);
    if (addedProduct) {
      res.status(200).send(`Producto agregado al carrito: ${addedProduct}`);
    } else {
      res.send("Carrito inexistente");
    }
  } catch (error) {
    clog(error);
  }
};

export const getProductsInCart = async (req, res) => {
  const { cartId } = req.params;
  try {
    const productosDelCarrito = await cartServices.getCartById(cartId);
    if (productosDelCarrito) {
      res.status(200).send(productosDelCarrito.products);
    } else {
      res.send("No se encontró ningún carrito con ese ID");
    }
  } catch (error) {
    clog(error);
  }
};

export const deleteProductFromCart = async (req, res) => {
  const { cartId, productId } = req.params;
  try {
    const deleteProduct = await cartServices.deleteProduct(cartId, productId);
    if (deleteProduct) {
      res.status(200).send("El producto fue eliminado del carrito");
    } else {
      res.send("El carrito y/o el producto no existen");
    }
  } catch (error) {
    clog(error);
  }
};

export const confirmOrder = async (req, res) => {
  const { cartId } = req.params;
  const firstName = req.user.firstName;
  const email = req.user.email;
  try {
    const cart = await cartServices.getCartById(cartId);
    await confirmOrderMail(firstName, email, cart.products);
    res.send({ msg: "Compra confirmada" });
  } catch (error) {
    console.log(error);
  }
};
