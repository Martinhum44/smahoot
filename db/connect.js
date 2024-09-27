const MONGOOSE = require("mongoose")

async function connect(url) {
    return MONGOOSE.connect(url,{
        useNewUrlParser:true,
        useCreateIndex:true,
        useFindAndModify:false,
        useUnifiedTopology:true
    })
}
  
module.exports = connect