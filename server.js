require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const mongoose = require('mongoose');
mongoose.set('strictQuery',false)
const cors = require('cors')
const userRoutes = require('./routes/userRoutes')
const productRoutes = require('./routes/productRoutes')
const contactUsRoutes = require('./routes/contactUsRoutes')
const errorMiddleware = require('./middlewares/errorMiddleware')
const cookieParser = require('cookie-parser')
const path = require('path')

//  Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors({
  origin: ["http://localhost:3000","https://stock-mana-app-v2.vercel.app/"],
  credentials:true
}))

// file upload middleware
app.use('/uploads', express.static(path.join(__dirname,"uploads")))

// endpoint route middleware
app.use("/api/users",userRoutes)
app.use("/api/products",productRoutes)
app.use("/api/contact-us",contactUsRoutes)

//  Routes
app.get("/", (req, res) => {
    res.send("Home page")
 })

// custom error handler
app.use(errorMiddleware)

const PORT = process.env.PORT || 5000;

//   connect to mongo db and setup server
mongoose.connect(process.env.MONGO_URI).then(() => {
    console.log("MongoDB connected")
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(error => {
    console.error(error)
 })
