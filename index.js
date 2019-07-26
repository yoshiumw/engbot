const Discord = require('discord.js');
const { prefix, token, mov_key, riot_key } = require('./config.json');
const client = new Discord.Client();
const fs = require('fs')
const axios = require('axios');
let cheerio = require('cheerio')

client.once('ready', () =>{
    console.log('ReADY')
    client.user.setActivity("~help"); 
})

client.on('message', message => {

    if (message.author.bot) return;

    if (!message.content.startsWith(prefix)) return

    console.log(message.content)

    var tokens = message.content.split(' ')

    if(message.content.startsWith(`${prefix}help`)){
        message.channel.send("The commands that are available are: ```uwu, random, rank, movie, recommend, cast, director```")
        return
    }

    if(message.content.startsWith(`${prefix}pancake`)){
        message.channel.send("**PANCAKE BOT SUCKS**")
        return
    }
    
    if(message.content.startsWith(`${prefix}uwu`)){
        //replace r with w
        //replace 'the' with 'de'
        //replace l with w
        //replace 'you' with 'yuw'
        //replace th with d
        if(tokens.length < 2){
            message.channel.send("The correct usage of this command is: ```~uwu (message)``` uwu")
        } else {
            var str = ""
            for(var k = 1; k < tokens.length; k++){
                str += tokens[k] + " " 
            }
            str = str.toLowerCase();

            str = str.replace(/with/gi,"wif");
            str = str.replace(/you/gi,"yuw");
            str = str.replace(/to/gi,"two");
            str = str.replace(/it/gi,"iwt");
            str = str.replace(/is/gi,"iws");
            str = str.replace(/r/gi,"w");
            str = str.replace(/l/gi,"w");
            str = str.replace(/th/gi,"d");
            str = str.replace(/uwu/gi, "**uwu**")
            
            message.channel.send(str + "**uwu**")
        }
        return
    }

    if(message.content.startsWith(`${prefix}random`)){
        fs.readFile('random.txt', 'utf-8', (err, data) => {
            if (err) throw err;
            var lines = data.split('\n')
            var ret = lines[Math.floor(Math.random() * lines.length)];
            message.channel.send(ret)
        })
        return
    }

    if(message.content.startsWith(`${prefix}rank`)){
        //source of data from Riot Games API

        var rank_images = {bronze: "https://i.imgur.com/HvxwGJf.png", challenger: "https://i.imgur.com/MiTQa19.png", diamond: "https://i.imgur.com/bOMBA1x.png", gold: "https://i.imgur.com/snwSOU5.png", grandmaster: "https://i.imgur.com/wCn5mg7.png", iron: "https://i.imgur.com/DitUGy3.png", master: "https://i.imgur.com/FChlRF0.png", platinum: "https://i.imgur.com/u0v3seS.png", silver: "https://i.imgur.com/oDqCBZw.png"}

        if (tokens.length < 2) {
            message.channel.send("The correct usage of this command is: ```~rank (summoner name)``` **uwu**")
        } else {
            var query = ""
            for(var k = 1; k< tokens.length; k++){
                if (k+1 == tokens.length){
                    query += tokens[k]
                } else {
                    query += tokens[k] + "%20"
                }
            }

            axios.get('https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/' + query + '?api_key=' +  riot_key).then(function (response) {
                //console.log(response)
                //message.channel.send("Valid summoner")
                var id = response.data.id
                axios.get('https://na1.api.riotgames.com/lol/league/v4/entries/by-summoner/' + id + '?api_key=' + riot_key).then(function (response) {
                    //console.log(response)
                    for (var k=0; k<response.data.length; k++){
                        if(response.data[k].queueType == "RANKED_TFT"){
                            var ret = "**"  + response.data[k].summonerName + "** is currently **" + response.data[k].tier + response.data[k].rank + " (" + response.data[k].leaguePoints + "lp)**"
                            message.channel.send(ret, {files: [rank_images[(response.data[k].tier).toLowerCase()]]})
                            return
                        }
                    }
                    
                    
                }).catch(function (error) {
                    console.log(error)
                    message.channel.send("Sorry an error has occurred when fetching the ranked data of " + query)
                });
            }).catch(function (error) {
                message.channel.send("Sorry, " + query + " is not a valid summoner.")
            });
        }
    return
    }

    //Returns information about a movie a user queries about.
    if(message.content.startsWith(`${prefix}movie`)){
        //Uses TMDB API
        if(tokens.length < 2){
            message.channel.send("The correct usage of this command is: ```~movie (movie name)``` **uwu**")
        } else {
            var query = ""
            console.log("tokens" + tokens)
            for(var k = 1; k< tokens.length; k++){
                if (k+1 == tokens.length){
                    query += tokens[k]
                } else {
                    query += tokens[k] + "+"
                }
            }
            console.log(query)
            axios.get('https://api.themoviedb.org/3/search/movie?api_key='+ mov_key +'&query=' + query).then(function (response) {
                if(response.data.results[0] != undefined){
                    var m = "__**" + response.data.results[0].title + " (" + response.data.results[0].release_date.substring(0,4)  +")**__\n*" + parseFloat(response.data.results[0].vote_average)*10 + "/100 (TMDB)*\n\n**Synopsis:**\n```" + response.data.results[0].overview + "```\n"
                    //to get poster image: 
                    message.channel.send(m, {files: ["https://image.tmdb.org/t/p/w600_and_h900_bestv2" + response.data.results[0].poster_path]})
                } else {
                    message.channel.send("Sorry this movie does not exist. **uwu**")
                }
                
            }).catch(function (error) {
                console.log(error);
            });
        }
    }

    //Returns recommendations based on queried movie.
    if(message.content.startsWith(`${prefix}recommend`)){
        //Uses TMDB API
        if(tokens.length < 2){
            message.channel.send("The correct usage of this command is: ```~recommend (movie name)``` **uwu**")
        } else {
            var query = ""
            console.log("tokens" + tokens)
            for(var k = 1; k< tokens.length; k++){
                if (k+1 == tokens.length){
                    query += tokens[k]
                } else {
                    query += tokens[k] + "+"
                }
            }

            var id = -1
            var msg = "```fix\n"
            //get movie id
            axios.get('https://api.themoviedb.org/3/search/movie?api_key='+ mov_key +'&query=' + query).then(function (response) {
                if(response.data.results[0] != undefined){
                    //use movie id to get recommendations
                    var img = "https://image.tmdb.org/t/p/w600_and_h900_bestv2" + response.data.results[0].backdrop_path
                    axios.get('https://api.themoviedb.org/3/movie/'+ response.data.results[0].id + '/recommendations?api_key='+ mov_key+'&language=en-US&page=1').then(function (response) {
                        if(response.data.results[0] != undefined){
                            for(var k=0; k<5; k++){
                                msg += (response.data.results[k].title) + "\n"
                            }
                            msg += "```"
                            message.channel.send("I recommend:\n" + msg, {files : [img]})
                        } else {
                            message.channel.send("Oops, I don't know any recommendations for this movie.")
                        }
                    }).catch(function (error) {
                        console.log(error);
                    });
                
                } else {
                    message.channel.send("Sorry queried movie does not exist. **uwu**")
                }
            }).catch(function (error) {
                console.log(error);
            });
        }
    }

    //Returns the top 5 cast members who starred in queried movie.
    if(message.content.startsWith(`${prefix}cast`)){
        //Uses TMDB API
        if(tokens.length < 2){
            message.channel.send("The correct usage of this command is: ```~recommend (movie name)``` **uwu**")
        } else {
            var query = ""
            console.log("tokens" + tokens)
            for(var k = 1; k< tokens.length; k++){
                if (k+1 == tokens.length){
                    query += tokens[k]
                } else {
                    query += tokens[k] + "+"
                }
            }

            var id = -1
            var msg = "```fix\n"
            //get movie id
            axios.get('https://api.themoviedb.org/3/search/movie?api_key='+ mov_key +'&query=' + query).then(function (response) {
                if(response.data.results[0] != undefined){
                    //use movie id to get recommendations
                    var title = response.data.results[0].title + ' (' + response.data.results[0].release_date.substring(0,4) + ')'
                    axios.get('https://api.themoviedb.org/3/movie/'+ response.data.results[0].id+'/credits?api_key=' + mov_key).then(function (response) {
                        for(var k = 0; k<6; k++){
                            msg += response.data.cast[k].name + ' as ' + response.data.cast[k].character + '\n'
                        }
                        var img = "https://image.tmdb.org/t/p/w600_and_h900_bestv2" + response.data.cast[0].profile_path
                        msg += "```"
                        message.channel.send("**" + title + "** starred:\n" + msg, {files : [img]})
                    }).catch(function (error) {
                        console.log(error);
                    });
                
                } else {
                    message.channel.send("Sorry queried movie does not exist. **uwu**")
                }
            }).catch(function (error) {
                console.log(error);
            });
        }
    }

    //Returns 5 movies directed by the director of the queried movie. 
    if(message.content.startsWith(`${prefix}director`)){
        //Uses TMDB API
        if(tokens.length < 2){
            message.channel.send("The correct usage of this command is: ```~director (movie name)``` **uwu**")
        } else {
            var query = ""
            console.log("tokens" + tokens)
            for(var k = 1; k< tokens.length; k++){
                if (k+1 == tokens.length){
                    query += tokens[k]
                } else {
                    query += tokens[k] + "+"
                }
            }

            var id = -1
            var msg = ""
            //get movie id
            axios.get('https://api.themoviedb.org/3/search/movie?api_key='+ mov_key +'&query=' + query).then(function (response) {
                if(response.data.results[0] != undefined){
                    //use movie id to get recommendations
                    var title = response.data.results[0].title + ' (' + response.data.results[0].release_date.substring(0,4) + ')'
                    var d_id = -1
                    var img = "https://image.tmdb.org/t/p/w600_and_h900_bestv2"
                    axios.get('https://api.themoviedb.org/3/movie/'+ response.data.results[0].id+'/credits?api_key=' + mov_key).then(function (response) {
                        for(var k = 0; k<response.data.crew.length; k++){
                            if(response.data.crew[k].job == 'Director'){
                                msg += '**' + response.data.crew[k].name + '** directed __' + title + '__ and also:\n'
                                d_id = response.data.crew[k].id
                                img += response.data.crew[k].profile_path
                                break
                            }
                        }
                        axios.get('https://api.themoviedb.org/3/person/' + d_id +'/movie_credits?api_key='+mov_key+'&language=en-US').then(function (response) {
                            var count = 0
                            msg += "```fix\n"
                            for(var k = 0; k<response.data.crew.length; k++){
                                if (count == 5){
                                    break
                                }
                                if(response.data.crew[k].job == 'Director'){
                                    msg += response.data.crew[k].title + '\n'
                                    count++;
                                }
                            }
                            msg += "```"
                            message.channel.send(msg, {files : [img]})
                        }).catch(function (error) {
                            console.log(error);
                        });
                    }).catch(function (error) {
                        console.log(error);
                    });
                
                } else {
                    message.channel.send("Sorry queried movie does not exist. **uwu**")
                }
            }).catch(function (error) {
                console.log(error);
            });
        }
    }

    //Now playing (in Canada)
    if(message.content.startsWith(`${prefix}showing`)){
        //Uses TMDB API
        if(tokens.length > 1){
            message.channel.send("The correct usage of this command is: ```~showing (region)``` **uwu**")
        } else {
            axios.get('https://api.themoviedb.org/3/movie/now_playing?api_key=' + mov_key + '&language=en-US&page=1').then(function (response) {
                console.log(response)
                if(response.data.results[0] != undefined){
                    console.log(response.data.results)
                    var m = "__Movies Currently Showing:__ \n"
                    for(var k=0; k< response.data.results.length; k++){
                        m += "**" + response.data.results[k].title + "** (" + response.data.results[k].release_date.substring(5) + ")\n"
                    }
                    message.channel.send(m, {files: ["https://image.tmdb.org/t/p/w600_and_h900_bestv2" + response.data.results[0].poster_path]})
                } else {
                    message.channel.send("Sorry, couldn't find any showings. **uwu**")
                }
                
            }).catch(function (error) {
                console.log(error);
            });
        }
    }

})

client.login(token);