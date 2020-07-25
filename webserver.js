module.exports.run = async (loadedSounds, playFile) => {
    var express = require("express")
    var app = express()

    var port = 3036

    app.get('/', (req, res) => {
        if (loadedSounds.length == 0) return res.send("No sounds were found.")
        else {
            res.write('<html>')
            res.write('<p>Discord Sound Board Bot</p>')
            res.write('<label>Channel ID: </label>')
            res.write('<input id="channelid"></input></br></br>')

            loadedSounds.forEach((e, i) => {
                res.write(`<a href="?sound=${i}&channelid=508006054043582495"><button id="${i}">${e}</button></a>`)
                if (i + 1 == loadedSounds.length) {
                    res.write('</html>')
                    res.end() }
            }) } 

        if (Object.keys(req.query)[0] && loadedSounds.length != 0) { 
            if (req.query.channelid == "") return console.log("Can't play sound from webserver because channelid isn't specified!")

            playFile(req.query.sound, req.query.channelid) }
    })

    app.use((req, res) => { //Show idk page thanks
        res.status(404).send("404: Page not Found.") });

    app.listen(port, () => {
        console.log('WebServer is turned on. Visit it on: localhost:' + port) });
}

//3urobeat: Reused code from my other project: https://github.com/HerrEurobeat/steam-comment-service-bot