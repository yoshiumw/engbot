const Discord = require('discord.js');
const { prefix, token } = require('./config.json');
const client = new Discord.Client();
const fs = require('fs')
const axios = require('axios');
let cheerio = require('cheerio')

client.once('ready', () =>{
    console.log('ReADY')
    client.user.setActivity("!e help"); 
})

client.on('message', message => {
    console.log(message.content)
    var tokens = message.content.split(' ')

    if(message.content.startsWith(`${prefix}help`)){
        message.channel.send("The commands that are available are: ```uwu, random, rank```")
    }
    
    if(message.content.startsWith(`${prefix}uwu`)){
        message.channel.send("hi my name is daniel uwu")
    }

    if(message.content.startsWith(`${prefix}random`)){
        fs.readFile('random.txt', 'utf-8', (err, data) => {
            if (err) throw err;
            var lines = data.split('\n')
            var ret = lines[Math.floor(Math.random() * lines.length)];
            message.channel.send(ret)
        })
    }

    if(message.content.startsWith(`${prefix}rank`)){
        if(tokens.length < 3){
            message.channel.send("The correct usage of this command is: !e rank (summoner name). uwu")
        } else {
            var url = "https://lolchess.gg/profile/na/" + tokens[2]
            
            axios.get(url).then(response => {
                const $ = cheerio.load(response.data);
                if(($('#search-not-found').html() == null)){
                    if($('.no_tft_record').html() == null){
                        var rank = $('.profile__tier__summary__tier').text()
                        var lp = $('.profile__tier__summary__lp').text()
                        message.channel.send(tokens[2] + " is currently: " + rank + " (" + lp +"). uwu")
                    } else {
                        message.channel.send("Summoner has not played TFT yet. uwu")
                    }
                } else {
                    message.channel.send("Summoner does not exist. uwu")
                }  
            }).catch(error => {
                console.log(error);
            })
        }
    }
})

client.login(token);