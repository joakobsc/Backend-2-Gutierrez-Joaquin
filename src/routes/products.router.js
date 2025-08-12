import { Router } from "express";
import { productsModel } from "../models/product.model.js";
import mongoose from "mongoose";
const router = Router();
//Endpoints conf

//GET
router.get("/", async (req, res) => {
  try {
    //desestructuramos req.query

    const { limit = 10, page = 1, sort, query } = req.query;

    // Parseo de `limit` y `page` a enteros
    const limitParsed = parseInt(limit, 10);
    const pageParsed = parseInt(page, 10);

    //Filtro si se incluye query en la petición
    // Filtra por categoría o disponibilidad
    const searchFilter = query ? { $or: [{ category: query }] } : {};

    //Ordenamiento
    const sortOptions =
      sort === "asc" ? { price: 1 } : sort === "desc" ? { price: -1 } : {};

    //Consulta paginada
    const products = await productsModel
      .find(searchFilter)
      .sort(sortOptions)
      .skip((pageParsed - 1) * limitParsed)
      .limit(limitParsed);
    // Calculamos el número total de productos y la cantidad de páginas
    const totalProducts = await productsModel.countDocuments(searchFilter);
    const totalPages = Math.ceil(totalProducts / limitParsed);

    // Retornamos los resultados
    res.json({
      status: "success",
      payload: products,
      totalPages,
      page: pageParsed,
      prevPage: pageParsed > 1 ? pageParsed - 1 : null,
      nextPage: pageParsed < totalPages ? pageParsed + 1 : null,
      hasPrevPage: pageParsed > 1,
      hasNextPage: pageParsed < totalPages,
      prevLink:
        pageParsed > 1
          ? `/api/products?limit=${limitParsed}&page=${
              pageParsed - 1
            }&sort=${sort}`
          : null,
      nextLink:
        pageParsed < totalPages
          ? `/api/products?limit=${limitParsed}&page=${
              pageParsed + 1
            }&sort=${sort}`
          : null,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ status: "error", message: "Error al obtener productos" });
  }
});
//GET:pid

router.get("/:pid", async (req, res) => {
  try {
    //Validamos que el pid sea un ObjectId válido.
    const productId = req.params.pid;
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ error: "ID inválido" });
    }
    //buscamos producto por Id
    const product = await productsModel.findById(productId);
    if (product) {
      res.json(product);
    } else {
      res.status(400).json({ error: "Producto no encontrado" });
    }
  } catch (error) {
    console.log(error);
  }
});

//POST

router.post("/", async (req, res) => {
  try {
    const { title, description, code, price, stock, category, thumbnail } =
      req.body;

    //Verificamos que los campos se completen
    if (!title || !description || !code || !price || !stock || !category) {
      return res
        .status(400)
        .json({ error: "Todos los campos son obligatorios" });
    }
    const productData = await productsModel.create({
      title,
      description,
      code,
      price,
      stock,
      category,
      thumbnail,
    });
    res.status(201).send(productData);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al crear el producto" });
  }
});

//PUT:pid

router.put("/:pid", async (req, res) => {
  try {
    //Validamos que el pid sea un ObjectId válido.
    const productId = req.params.pid;
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ error: "ID inválido" });
    }
    const productUpdate = req.body;
    const updatedProduct = await productsModel.findByIdAndUpdate(
      productId,
      productUpdate,
      { new: true }
    );
    res.status(202).send(updatedProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar el producto" });
  }
});

//DELETE:pid

router.delete("/:pid", async (req, res) => {
  try {
    //Validamos que el pid sea un ObjectId válido.
    const productId = req.params.pid;
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ error: "ID inválido" });
    }
    const deletedProduct = await productsModel.findByIdAndDelete(productId);

    if (deletedProduct) {
      // Si el producto fue eliminado exitosamente
      res.status(200).json({
        message: "Producto eliminado exitosamente",
        product: deletedProduct,
      });
    } else {
      // Si no se encuentra el producto en la base de datos
      res.status(404).json({ error: "Producto no encontrado" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar el producto" });
  }
});

export default router;
