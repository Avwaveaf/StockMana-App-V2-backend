const expressAsyncHandler = require('express-async-handler');
const Product = require('../models/productModel');
const { humanFileSize } = require('../utils/fileUpload');
const cloudinary = require('cloudinary').v2

// create new product
exports.createProduct = expressAsyncHandler(async (req, res) => {
    const { name, sku, category, quantity, price, description } = req.body;
    
    // validate input
    if (!name || !category || !quantity || !price || !description) {
        res.status(400);
        throw new Error("Please fill all product information...");
    }

    // manage file/image upload
    let fileData = {}
    if (req.file) {
        let uploadedFile;
        try {
            uploadedFile = await cloudinary.uploader.upload(req.file.path, {folder:"Stock_Mana_assets_v2", resource_type:"image"})
        } catch (error) {
            res.status(500)
            throw new Error("Failure to upload the product image")
        }
        fileData = {
            fileName :req.file.originalname,
            filePath :uploadedFile.secure_url,
            fileType :req.file.mimetype,
            fileSize :humanFileSize(req.file.size),
        }
     }
    // create product in db
    const product = await Product.create({
        userId: req.user._id,
        name,
        sku,
        category,
        quantity,
        price,
        description,
        imageUrl:fileData
    })

    res.status(201).json({
        success: true,
        message: "Product successfully added..",
        data: product
    })
})
 
// get all products
exports.getAllProduct = expressAsyncHandler(async (req, res) => { 
    const products = await Product.find({ userId: req.user.id }).sort("-createdAt")
    
    res.status(200).json({
        success: true,
        message: "all product successfully loaded",
        data:products
    })
});

// get single product
exports.getProduct = expressAsyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) { 
        res.status(404)
        throw new Error("Product Not Found!")
    }

    if (product.userId.toString() !== req.user._id.toString()) {
        
        res.status(401)
        throw new Error("You are not authorized to see the details of this product!")
     }

    res.status(200).json({
        success: true,
        message: "Product succesffully fetched",
        data:product
    })
 })

 //delete Product
exports.deleteProduct = expressAsyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id)

    if (!product) {
        res.status(404)
        throw new Error("No Product found to delete")
    }

    if (product.userId.toString() !== req.user._id.toString()) { 
        res.status(401)
        throw new Error("You are not authorized to do this activity!")
    }

    // delete product
    await product.remove()
    res.status(200).json({
        success: true,
        message:"Product has been removed"
    })
    
 })

 // delete many products
exports.deleteManyProduct = expressAsyncHandler(async (req, res) => {
    const { productIds } = req.body;
    
    // find validation of product id and user id
    const products = await Product.find({ _id: { $in: productIds }, userId: req.user._id })
    
    if (products.length !== productIds.length) {
        res.status(401)
        throw new Error("One or more of the specified product are not belong to you. cannot delete")
    }
    
    // delete the products
    const deletedProducts = await Product.deleteMany({ _id: { $in: productIds } })
    res.status(200).json({
        success: true,
        message: "Your selected products has been removed"
    })
     
})
 
// update product
exports.updateProduct = expressAsyncHandler(async (req, res) => {
    const { name, category, quantity, price, description } = req.body;

    const productId = req.params.id
        const product = await Product.findById(productId)

    if (!product) { 
        res.status(404)
        throw new Error("No product found!")
    }
    
    if (product.userId.toString() !== req.user._id.toString()) { 
        res.status(401)
        throw new Error("You are not authorized to do this activity!")
    }


        // manage file/image upload
        let fileData = {}
        if (req.file) {
            let uploadedFile;
            try {
                uploadedFile = await cloudinary.uploader.upload(req.file.path, {folder:"Stock_Mana_assets_v2", resource_type:"image"})
            } catch (error) {
                res.status(500)
                throw new Error("Failure to upload the product image")
            }
            fileData = {
                fileName :req.file.originalname,
                filePath :uploadedFile.secure_url,
                fileType :req.file.mimetype,
                fileSize :humanFileSize(req.file.size),
            }
         }

         // update product
    const updatedProduct = await Product.findByIdAndUpdate({_id:productId}, {
        name,
        category,
        quantity,
        price,
        description,
        imageUrl:Object.keys(fileData).length ===0 ? product.imageUrl :fileData
    }, {
        new: true,
        runValidators:true
    })
    
        res.status(200).json({
            success: true,
            message: "Product successfully added..",
            data: updatedProduct
        })
 })