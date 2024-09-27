module.exports = (req, res) => {
    console.log(__dirname.slice(__dirname.length-11,__dirname.length)+"/nf.html")
    res.status(404).sendFile(__dirname.slice(0,__dirname.length-11)+"/nf.html")
}        