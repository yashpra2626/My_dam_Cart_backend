const express =require('express');
const fileUpload =require('express-fileupload')
const bodyParser =require('body-parser');
const path=require('path');
const mongoose =require('mongoose');
const productRoute=require('../backend/routes/product-routes');
const usersRoute=require('../backend/routes/users-routes');
const cartRoutes=require('../backend/routes/cart-routes');
const app= express();
app.use(bodyParser.json());
app.use(fileUpload());
app.use('/uploads',express.static(path.join('uploads')));
app.use((req,res,next) =>{
   res.setHeader('Access-Control-Allow-Origin','*')
   res.setHeader('Access-Control-Allow-Headers','Origin,X-Requested-With,Content-Type,Accept,Authorization');
   res.setHeader('Access-Control-Allow-Methods','PATCH,POST,GET,DELETE');
   next();
});

app.use('/api/products',productRoute);
app.use('/api/users',usersRoute);
app.use('/api/cart',cartRoutes);

const url= `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.0cdng.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

mongoose
.connect(url)
.then(()=>{
app.listen(process.env.PORT  || 8000);
     console.log('Connection Success');

})
.catch((err)=>{
   console.log("Mongoose Database Error",err);
})

