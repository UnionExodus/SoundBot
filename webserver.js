const logger       = require('output-logger')

module.exports.run = async (bot, playFile) => { //export this code so that we can call it by other files
    var config = require("./config.json")
    var express = require("express")
    var app = express()

    var port = 3036
    lastchannel = "" //will rember last selected channel and pre-select it

    var lastvisit = {}

    app.get('/', (req, res) => { //listens to main webpage requests (localhost:port)
        //Log IP of visitor
        let ip = String(req.headers['x-forwarded-for'] || req.connection.remoteAddress).replace("::ffff:", "")

        if (new Date() - lastvisit[ip] > 150000 || !lastvisit[ip]) logger('info', "Webserver New Visitor from IP " + ip) //only log if last visit is older than 2.5 minutes (or first time)
        lastvisit[ip] = new Date()

        if (bot.loadedSounds.length == 0) return res.send("No sounds were found.") //No sounds in Sounds folder? Don't display buttons but show this message.
        else {
            /* ------------- Display labels and Channel selector ------------- */
            res.write(`
                <html>
                    <title>SoundBot WebUI</title>
                    <p>Discord Sound Board Bot</p>

                    <form id="channeltableform" action="/play" method="get">
                        <div>
                            <label>Select your Channel: </label>
                            <select name="channelid">
                                <optgroup label="Select Channel">
            `)

            bot.voice.connections.forEach((e, i) => {
                if (e.channel.id == lastchannel) res.write(`<option value="${e.channel.id}" selected="selected">${e.channel.name}</option>`) //pre-select last selected channel
                    else res.write(`<option value="${e.channel.id}">${e.channel.name}</option>`)
            })

            res.write(`
                        </optgroup>
                    </select>
                    <label> (Not listed? Remember to write ${config.prefix}join to summon the bot into your channel!)</label>
                </div>
                <div2>
            `)

            /* ------------- Display buttons for each sound ------------- */
            bot.loadedSounds.forEach((e, i) => { //get loadedSounds Array that was passed when running this exported code and run an iteration for each element in it
                res.write(`<button name="sound" id="${i}" value="${i}">${e}</button>`) //Display a button that redirects the user with query parameters with the text of our array's element (sound name)
                if (i + 1 == bot.loadedSounds.length) { //check if this iteration is the last iteration
                    res.write(`
                                </form>
                            </div2>
                        </html>`) //end html stuff

                    res.end() } //send response
            }) }
    })

    app.get('/play', (req, res) => {
        //Query parameters "channelid" and "sound" come from the form's action that transmits the option and button value

        if (Object.keys(req.query).length == 2 && loadedSounds.length != 0) { //check if this request contains query parameters (user clicked a button)
            playFile(req.query.sound, req.query.channelid) //call function in Index.js that was passed when running this exported code and pass requested sound and channelid with it
            lastchannel = req.query.channelid
            res.redirect("/") //redirect back to remove query parameters from URL
        } else {
            res.send("You are missing an argument! Have you selected a channel? <a href='/'><button>Go back</button></a>")
        }
    })

    app.use((req, res) => { //Show idk page thanks
        res.status(404).send("404: Page not Found.") });

    app.listen(port, () => { //Start the webserver and listen to the port specified above
        logger('info', 'WebServer is turned on. Visit it on: localhost:' + port) });
}

//3urobeat