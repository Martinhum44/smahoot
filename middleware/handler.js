const {OurErrorVersion} = require("./error")

module.exports = (error, req, res, next)=>{
    if(error instanceof OurErrorVersion){
        return res.status(error.statusCode).json({msg: error.message, success: false })
    }
    res.status(500).json({msg: "something went wrong", error:error.message, success: false})
}                                      