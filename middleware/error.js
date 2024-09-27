class OurErrorVersion extends Error{
    constructor(msg, statusCode){
        super(msg)
        this.statusCode = statusCode
    }
}  
   
function createCustomError(msg, statusCode){
    return new OurErrorVersion(msg,statusCode)
}

module.exports = {OurErrorVersion, createCustomError}