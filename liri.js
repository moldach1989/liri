const request = require('request');
const Twitter = require('twitter');
const Spotify = require('node-spotify-api');
const keys = require('./keys.js');
const fs = require('fs');
const arg = process.argv;
let arg2 = arg[2];
let song1 = arg[3];
let song2 = '';
let rating;
let counter = 1;
let interval;

const client = new Twitter({
  consumer_key: keys.consumer_key,
  consumer_secret: keys.consumer_secret,
  access_token_key: keys.access_token_key,
  access_token_secret: keys.access_token_secret
});

function returnTweets() {
	let twitterParams = {
		id: 924750740664569900,
		screen_name: 'test_acc1979',
		count: 20,
		trim_user: true		
	}
	let twitterText = '\nCommand: ' + arg2 + '\n';
	client.get( 'statuses/user_timeline', twitterParams, ( error, tweets, response ) => {
		if ( error ) throw error;
		console.log(`Here is a list of the most recent tweets from user name @${twitterParams.screen_name}`);
		for ( let i = tweets.length-1; i >= 0; i-- ) {
			console.log(`Tweet number ${i+1}: "${tweets[i].text}"`);
			twitterText += '\nTweet number ' + (i+1) + ': "' + tweets[i].text + '"\n';
		}
		twitterText+='\n\n\n';
		fs.appendFile('log.txt', twitterText, (error) => {
			if ( error ) throw error;
		});
	});
}

//hyperbolic praise function
function postTweets () {
	interval = setInterval(() => {
		let postParams = {
			status: '{setInterval Gushing praise tweet '+ counter +'}'
		}
		client.post('statuses/update', postParams, ( error, tweet, response ) => {
			if ( error ) throw error;
			console.log('New tweet posted');
		});
		counter ++
		if ( counter = 9 ) {
			clearInterval(interval)
		}
	}, 1000*5);
}

function concatArguments() {
	let string = '';
	if ( arg.length > 4 ) {
		for ( let i = 3; i < arg.length; i++ ) {
			string += arg[i] + ' ';
		}
		return string;
	}
}

function returnSpotify() {
	let spotify = new Spotify({
		id: 'c9c223814f0b4098b18dfdb92caff31f',
		secret: 'b8f57e670581440380bba8780a402e3f'
	});
 	song1 = concatArguments() || arg[3];
	if ( song1 === undefined ) {
 		song1 = 'gangsta\'s paradise';
 	}
 	let songTitle = song2 || song1;
 	let queryObj = {
		type: 'track', 
		query: songTitle,
		limit: 1
 	}
	spotify.search( queryObj, ( error, data ) => {
		if ( error ) throw error;
		let track = data.tracks.items[0];
		if (typeof track !== 'undefined') {
			console.log(`The artist's name is: "${track.artists[0].name}"`)
			console.log('===================');
			console.log(`The song's name is: "${track.name}"`);
			console.log('===================');
			console.log(`A link to the preview: "${track.preview_url}"`);
			console.log('===================');
			console.log(`This song comes from the album: "${track.album.name}"`);
					// text for log.txt
		let spotifyText = `\nCommand: ${arg2}\n\nThe artist's name is: "${track.artists[0].name}"\n
The song's name is: "${track.name}"\n
A link to the preview: "${track.preview_url}"\n
This song comes from the album: "${track.album.name}"\n\n\n\n`;
		fs.appendFile('log.txt', spotifyText, function(err) {
			if ( error ) throw error;	
		});
		} else {
			console.log('I couldn\'t find that song.  Please try again.');
		}
		

	});
}

function returnOMDB() {
	let title = concatArguments() || arg[3];
	let queryURL = `https://www.omdbapi.com/?t=${title}&tomatoes=true&y=&plot=short&apikey=40e9cece`
	request(queryURL, ( error, response, body ) => {
		if ( error ) throw error;
		let movie = JSON.parse( body );
		let tomato = movie.Ratings.find( item => item.Source === 'Rotten Tomatoes' );
		console.log(`The title is: "${movie.Title}"`);
		console.log('===================');		
		console.log(`Year released: "${movie.Year}"`);
		console.log('===================');

		typeof movie.imdbRating !== 'undefined' ? rating = movie.imdbRating : rating = 'Unrated';
		console.log(`The IMDB rating is: "${movie.imdbRating}"`);
		console.log('===================');

		typeof tomato !== 'undefined' ? rating = tomato.Value : rating = 'Unrated';
		console.log(`The Rotten Tomatoes rating is: "${rating}"`);
		console.log('===================');

		console.log(`The movie was produced in the country: "${movie.Country}"`);
		console.log('===================');
		console.log(`The language the movie is in: "${movie.Language}"`);
		console.log('===================');
		console.log(`Plot summary: "${movie.Plot}"`);
		console.log('===================');
		console.log(`List of actors: "${movie.Actors}"`);

		//text for log.txt
		let omdbText = `\nCommand: ${arg2}\n\nThe title is: "${movie.Title}"\n
Year released: "${movie.Year}"\n
The IMDB rating is: "${movie.imdbRating}"\n
The Rotten Tomatoes rating is: "${rating}"\n
The movie was produced in the country: "${movie.Country}"\n
The movie was produced in the country: "${movie.Country}"\n
The language the movie is in: "${movie.Language}"\n
Plot summary: "${movie.Plot}"\n
List of actors: "${movie.Actors}"\n\n\n\n`;

		fs.appendFile( 'log.txt', omdbText, ( error ) => {
			if ( error ) throw error;
		});
	});
}

function doWhatItSays() {
	fs.readFile('random.txt', 'utf8', ( error, data ) => {
		if ( error ) throw error;
		let songArr = data.split(','); 
		song2 = songArr[1].trim();
		returnSpotify();
	});
}

let command = {
	'my-tweets': returnTweets,
	'spotify-this-song': returnSpotify,
	'movie-this': returnOMDB,
	'do-what-it-says': doWhatItSays
}
typeof command[arg2] !== 'undefined' ? command[arg2]() : console.log('I don\'t understand that input.  Please try again.');
// postTweets();