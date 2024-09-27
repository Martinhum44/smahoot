const aMONGOOSE = require("mongoose")

const taskSchema = new aMONGOOSE.Schema({
    name:{
        type:String,
        required:[true,"must provide name"],
        minlength:[1,"name must be at least 1 character long"],
        maxlength:[20,"name cannot be longer than 20 characters"]
    },  
    description:{    
        type:String,
        required:false,
        minlength:[1,"description must be at least 1 character long"],
        maxlength:[250,"name cannot be longer than 20 characters"]
    },  
    completed:{
        type:Boolean,
        default:false
    },   
})

const accountSchema = new aMONGOOSE.Schema({
    number:{
        type:String,
        required:[true,"must provide number"],
        minlength:[4,"number must be at least 4 characters long"],
        maxlength:[20,"number cannot be longer than 20 characters"]
    },
    tasks:{
        type:[Object], 
        default:[]
    }   
}) 
 
module.exports = {task:aMONGOOSE.model("Task",taskSchema),account:aMONGOOSE.model("Account",accountSchema)}