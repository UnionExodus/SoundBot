module.exports.run = async (loadedSounds, playFile) => { //export this code so that we can call it by other files
    var express = require("express")
    var app = express()

    var port = 3036

    app.get('/', (req, res) => { //listens to main webpage requests (localhost:port)
        if (loadedSounds.length == 0) return res.send("No sounds were found.") //No sounds in Sounds folder? Don't display buttons but show this message.
        else {
            res.write('<html>') //start with response by writing html
            res.write('<p>Discord Sound Board Bot</p>')
            res.write('<label for="channelid">Channel ID: </label>') //Display a label that is bound to the channelid element
            res.write('<input id="channelid"></input></br></br>') //Display input box with the id channelid so we can find it and attach the label to it

            loadedSounds.forEach((e, i) => { //get loadedSounds Array that was passed when running this exported code and run an iteration for each element in it
                //e: element (the value of our array element (sound name)), i: iteration (the number of this loop's iteration)
                res.write(`<a href="?sound=${i}&channelid=508006054043582495"><button id="${i}">${e}</button></a>`) //Display a button that redirects the user with query parameters with the text of our array's element (sound name)
                if (i + 1 == loadedSounds.length) { //check if this iteration is the last iteration
                    res.write('</html>') //end html stuff
                    res.end() } //send response
            }) } 

        if (Object.keys(req.query)[0] && loadedSounds.length != 0) { //check if this request contains query parameters (user clicked a button)
            if (req.query.channelid == "") return console.log("Can't play sound from webserver because channelid isn't specified!")

            playFile(req.query.sound, req.query.channelid) } //call function in Index.js that was passed when running this exported code and pass requested sound and channelid with it
    })

    app.use((req, res) => { //Show idk page thanks
        res.status(404).send("404: Page not Found.") });

    app.listen(port, () => { //Start the webserver and listen to the port specified above
        console.log('WebServer is turned on. Visit it on: localhost:' + port) });
}

//3urobeat