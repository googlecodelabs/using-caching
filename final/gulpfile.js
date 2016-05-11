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

 'use strict';

var gulp = require('gulp');
var path = require('path');
var swPrecache = require('sw-precache');

gulp.task('make-service-worker', function(callback) {
	var rootDir = 'app';

	swPrecache.write(path.join(rootDir, 'serviceworker.js'), {
		staticFileGlobs: [rootDir + '/**/*.{html,css,png,jpg,gif}',
		                  rootDir + '/js/*.js'],
		stripPrefix: rootDir,
		importScripts: ['config.js', 'sync.js'],
		navigateFallback: 'message.html',
		runtimeCaching: [
		{
			urlPattern: /https:\/\/www\.reddit\.com\/api\/subreddits_by_topic.json?query=javascript/,
			handler: 'cacheOnly',
			options: {
				cache: {
					name: 'subreddits'
				}
			}
		},
		{
			urlPattern: /https:\/\/www\.reddit\.com\/r\/\w{1,255}\.json/,
			handler: 'networkFirst',
			options: {
				cache: {
					name: 'titles'
				}
			}
		},
		{
			urlPattern: /https:\/\/www\.reddit\.com\/r\/javascript\/comments\/\w{6}\/[\w]{0,255}\.json/,
			handler: 'cacheFirst',
			options: {
			  	cache: {
			     	name: 'articles'
			    }
			  }
		}],
		verbose: true
	}, callback);
});