
import productManager from "../dao/managers/productManager.js";
const productList = new productManager("src/files/products.json");

import productManagerMongo from "../dao/managers/productManager.mongodb.js";
import productsModel from "../dao/models/products.model.js";
import mongoosePaginate from 'mongoose-paginate-v2';
const productListMongo = new productManagerMongo("src/dao/managers/productManager.mongodb.js");


import { Router } from "express";
import { io } from '../app.js';

const routerView = Router();


 //-----------------------Products Handlebars---------------------------------//

 //http://localhost:8080/products
 routerView.get("/products", async (req, res) => {
  try {
    const limitDefault = 10;
    const pageDefault = 1;
    
    //const findPage = parseInt(req.params.ppg) || parseInt(pageDefault); 
    const findPage = parseInt(req.query.page) || parseInt(pageDefault);
    const findLimit = parseInt(req.query.limit) || parseInt(limitDefault); 
    const sortOrder = req.query.sort == 'desc' ? -1 : 1;
    const queryCategory = req.query.category;
    const queryId =  parseInt(req.query.id);

    //Busco por categoria
    const findCategory = {}; 
    if (queryCategory) {
      findCategory.category = queryCategory;
    };
    // Busco por _id 
    if (queryId) {
      findCategory._id = queryId;
    };
    //Parametros de filtro
    const findBdProd = {
      page: findPage,
      limit: findLimit,
      sort: { price: sortOrder },
      lean: true
    };

    const productsPagination = await productsModel.paginate(findCategory, findBdProd);

    //le paso a respuesta de products los link
    productsPagination.prevLink = productsPagination.hasPrevPage === true
        ? `http://localhost:8080/products/?page=${productsPagination.prevPage}&limit=5&sort=&category=&id=`
        : null;

    productsPagination.nextLink = productsPagination.hasNextPage === true
      ? `http://localhost:8080/products/?page=${productsPagination.nextPage}&limit=5&sort=&category=&id=`
      : null;

    productsPagination.isValid= !(findPage<=0||findPage> productsPagination.totalPages)

    //Renderizo respuesta
    res.render('products', productsPagination);
   
  } catch(error) {
    console.log(`Error al realizar la búsqueda paginada: ${error}`);

    return res.status(404).json({status:"error",message: `Error al realizar la búsqueda paginada en BBBD ${error}`});
  }
});


   //-----------------------CHAT Handlebars---------------------------------//
   //http://localhost:8080/chat
   routerView.get("/chat", async (req, res) => {
    const chat = "prueba chat web soket"
       return res.render('chat',{
        chat});
   });
  
/*
   //----------------------REALTIME Handlebars---------------------------------//
// Ruta GET para mostrar el listado de productos en tiempo real
routerView.get("/realtimeproducts", async (req, res) => {
  const filterLimit = await productList.products();
  if (req.query.limit) {
    const productsRealTime = filterLimit.slice(0, req.query.limit);
    return res.render('realtimeproducts', { productsRealTime });
  } else {
    const productsRealTime = filterLimit.slice(0, req.query.limit);
    return res.render('realtimeproducts', { productsRealTime });
  };
});
*/


export default routerView;

