const { createProduct, getAllProduct, getProduct, deleteProduct, deleteManyProduct, updateProduct, updateProductSold } = require('../controllers/productControllers');
const protectRoute = require('../middlewares/authMiddleware');
const { upload } = require('../utils/fileUpload');


const router = require('express').Router();

router.post("/", protectRoute, upload.single("imageUrl"), createProduct);
router.get("/",protectRoute, getAllProduct)
router.get("/:id", protectRoute, getProduct)
router.delete("/:id", protectRoute, deleteProduct) // delete only one product
router.delete("/", protectRoute, deleteManyProduct) // delete many product
router.patch("/:id", protectRoute, upload.single("imageUrl"),updateProduct)
router.patch("/update-sold/:id", protectRoute,updateProductSold)


module.exports = router;