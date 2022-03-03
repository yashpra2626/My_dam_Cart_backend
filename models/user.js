const mongoose =require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const userSchema =new mongoose.Schema({
    name:{type: String, required: true},
    email:{type: String, required: true, unique:true},
    password:{type: String, required: true, minlength:6 },
    image:{type: String, required: true},
    cart:[{type: mongoose.Types.ObjectId, ref:"Product",required: true}],
    products:[{type: mongoose.Types.ObjectId , ref:"Product",required: true}],
})
userSchema.plugin(uniqueValidator);
module.exports= mongoose.model('User',userSchema);