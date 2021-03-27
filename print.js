#!/usr/bin/env node

var http = require('http');
var rp 	= require('request-promise');
const $ = require('cheerio');

const [node_path, file_path, arg1, arg2] = process.argv

if(arg1 == "" || arg1 == undefined) {
	console.log("Please Enter IMDB URL");
	return;
}

if(arg2 == "" || arg2 == undefined) {
	console.log("How much records you want to fetch?");
	return;
}

var site_url = "https://www.imdb.com";
var movies = [];

url = arg1;
count = arg2;

rp(url)
  .then(function(html){

	var movies_list = $('.lister-list', html).html();

	for(var k = 1; k < count+1; k++)
	{
		var first_point = movies_list.indexOf('<span name="rk" data-value="'+k+'"></span>');
		var last_point  = movies_list.indexOf('data-recordmetrics="true"></div>', first_point);
		var charlength 	= last_point - first_point;
		var movie_html  = movies_list.substr(first_point, charlength);
		
		var moview_text = $(movie_html).text();
		var moview_arr  = moview_text.split("(");
		var movie_str   = moview_arr[0].trim();
		var movie_name 	= movie_str.substring(3);

		var other_detail 		= moview_arr[1].split(")");
		var movie_release_year 	= other_detail[0];

		var movie_extra_data 	= other_detail[1].trim();
		var extra_data_arr 		= movie_extra_data.split(" ");
		var imdb_rating 		= extra_data_arr[0].trim();

		var movie_details_link = site_url + $('a', movie_html)[0].attribs.href;

		var duration = "";
		var genre 	 = "";

		var mov_details 			= {};
		mov_details.movie_name 		= movie_name.trim();
		mov_details.release_year 	= movie_release_year;
		mov_details.imdb_rating 	= imdb_rating;
		mov_details.duration 		= duration;
		mov_details.genre 			= genre;

		movies.push(mov_details);

		scrap_detail_link(k, movie_details_link);
		
		if(k == count) {
			break;	
		}
	}
  })
  .catch(function(err){
    	console.log(err);
  });

function scrap_detail_link(index, scrap_url)
{
	rp(scrap_url).then(function(details_html)
	{
	  	setTimeout(function(){ }, 2000);

		var details_list = $(".title_wrapper .subtext", details_html).text();
		var details_arr  = details_list.split("|");

		var duration     = details_arr[1].trim();
		var genre 		 = details_arr[2].trim();
		genre			 = genre.replace(/(\r\n|\n|\r)/gm, "");

		movies[index-1].duration = duration;
		movies[index-1].genre = genre;

		if(index == count) {
			console.log(JSON.stringify(movies));
		}
	
	}).catch(function(err){
		console.log(err);
		});   
}

console.log('Please wait, we are fetching data...');
