module.exports = (req, res) => {
    console.log(req.url)
    res.status(404).sendFile(__dirname.slice(0,__dirname.length-11)+"/nf.html")
}        