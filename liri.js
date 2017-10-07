var fs = require('fs');
var Keys = require('./keys.js');

var Twitter = require('twitter');
var twitter = new Twitter(Keys.Twitter);

var Spotify = require('node-spotify-api');
var spotify = new Spotify(Keys.Spotify);

var request = require('request');
var args = process.argv.slice(2); //Remove "node" and "liri.js" from array

//Process command line arguments
processArgs(args);

function processArgs(args) {
	if (args.length === 0) {
		error();
	} else if (args[0] === 'my-tweets') {
		myTweets();
	} else if (args[0] === 'spotify-this-song') {
		if (args.length <= 1) {
			args.push("The Sign");
		}
		spotifyThisSong(args[1]);
	} else if (args[0] === 'movie-this') {
		if (args.length <= 1) {
			args.push('Mr. Nobody');
		}
		movieThis(args[1]);
	} else if (args[0] === 'do-what-it-says') {
		doWhatItSays();
	} else {
		error();
	}
}

function myTweets() {
	//Show last 20 tweets
	twitter.get('statuses/user_timeline', {
		count: 20
	}, function (error, tweet, response) {
		if (error) {
			throw error;
		}
		for (var i = 0; i < tweet.length; i++) {
			console.log("Posted:", tweet[i].created_at);
			console.log("Tweet:", tweet[i].text);
			console.log();
		}
	});
}

function spotifyThisSong(name) {
	//Show info about song from Spotify
	spotify.search({
		type: 'track',
		query: name,
		limit: 1
	}, function (error, data) {
		if (error) {
			throw error;
		}
		var tracks = data.tracks.items;
		if (tracks.length > 0) {
			var track = tracks[0]; //Get first track
			//Get all artist names from artists object
			var artists = track.artists.map(function (artist) {
				return artist.name;
			});
			console.log("Artist(s):", artists.join(", "));
			console.log("Title:", track.name);
			console.log("Preview:", track.external_urls.spotify);
			console.log("Album:", track.album.name);
		} else {
			console.log("No Song name found:", name);
		}
	});
}

function movieThis(name) {
	//Show info about movie from OMDB
	request("http://www.omdbapi.com/?type=movie&plot=short&r=json&tomatoes=true&t=" + name + "&apikey=" + Keys.OMDb, function (error, response, body) {
		if (error || response.statusCode !== 200) {
			throw error || "Error Response: " + response.statusCode + " " + response.statusText;
		}
		var movie = JSON.parse(body);
		console.log("Title:", movie.Title);
		console.log("Year:", movie.Year);
		console.log("IMDB Rating:", movie.imdbRating);
		console.log("Rotten Tomatoes Rating:", movie.tomatoRating);
		console.log("Country:", movie.Country);
		console.log("Language:", movie.Language);
		console.log("Plot:", movie.Plot);
		console.log("Actors:", movie.Actors);
	});
}

function doWhatItSays() {
	//Load file and process as command line arguments
	fs.readFile('./random.txt', 'utf-8', (error, data) => {
		if (error) {
			throw error;
		}
		//Find the comma in the command
		var index = data.indexOf(',');
		var command = [];
		if (index === -1) {
			command.push(data);
		} else {
			command.push(data.substring(0, index));
			command.push(data.substring(index + 1));
		}
		//Execute command
		processArgs(command);
	});
}

function error() {
	console.log("Please pass one of the following commands:\nmy-tweets\nspotify-this-song\nmovie-this\ndo-what-it-says");
}
