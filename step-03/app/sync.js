/**
 * Copyright 2016 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

 function syncArticles() {
 	clients.matchAll({includeUncontrolled: true, type: 'window'}).then( clients => {
 		clients.forEach( client => {
 			var anchorLocation = client.url.indexOf('#');
 			var anchorName = client.url.slice(anchorLocation + 1);
 			if (anchorLocation != -1) {
 				fetch('https://www.reddit.com/r/' + anchorName + '.json').then( response => {
 					return response.json();
 				}).then( json => {
 					caches.open('articles').then( cache => {
 						json.data.children.forEach( child => {
 							if (child.data.domain == ('self.' + anchorName)) {
 								var jsonUrl = child.data.url.slice(0, -1) + '.json';
 								var req = new Request(jsonUrl, {mode: 'cors'});
 								cache.add(req);
 							}
 						})
 					})
 				})
 			}
 		})
	}).catch( err => {
		console.log("Didn't work. Here's what happened: " + err);
	})
 }

function syncTitles(subreddit) {
	var req = new Request('https://www.reddit.com/r/' + subreddit + '.json', {mode: 'cors'});
	caches.open('titles').then( cache => {
		cache.add(req)
	})
}

function syncSubreddits() {
	var req = new Request('https://www.reddit.com/api/subreddits_by_topic.json?query=javascript', {mode: 'cors'});
	caches.open('subreddits').then( cache => {
		cache.add(req).then( () => {
			cache.match(req).then( res => {
				res.json().then( json => {
					json.forEach( child => {
						syncTitles(child['name']);
					})
				})
			})
		} )
	})
}

 self.addEventListener('sync', function(event) {
 	if (event.tag == 'articles') {
		syncArticles();
 	} else if (event.tag == 'subreddits') {
 		syncSubreddits();
 	}
 });

