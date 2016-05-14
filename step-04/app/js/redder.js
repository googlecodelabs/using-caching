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

var navEl = document.querySelector('.mdl-navigation');
var contentEl = document.querySelector('.page-content');
var articleEl = document.querySelector('.article-content');


function createFullElement(elementName, attributeData) {
  var newElement = document.createElement(elementName);
  for (attr in attributeData) {
    var newAttribute = document.createAttribute(attr)
    newAttribute.value = attributeData[attr]
    newElement.setAttributeNode(newAttribute);
  }

  return newElement;
}

function fetchArticle(url) {
  var req = new Request(url, {mode: 'cors'});      
  fetch(req).then(res => {
    res.json().then( json => {
      var post = json[0];
      // var comments = json[1];
      var articleDiv = document.createElement('div');
      post.data.children.forEach( child => {
        var heading = document.createElement('h3');
        var title = document.createTextNode(child.data.title);
        heading.appendChild(title);
        articleDiv.appendChild(heading);

        var authorParagraph = document.createElement('p');
        var author = document.createTextNode("by " + child.data.author);
        authorParagraph.appendChild(author);
        articleDiv.appendChild(authorParagraph)

        articleParagraph = document.createElement('p');
        var article = document.createTextNode(child.data.selftext);
        articleParagraph.appendChild(article);
        articleDiv.appendChild(articleParagraph);

        var link = createFullElement('a', {
          'href': child.data.url,
          'target': '_blank'
        });
        var linkText = document.createTextNode("View on Reddit ==>")
        link.appendChild(linkText);
        var linkParagraph = document.createElement('p');
        linkParagraph.appendChild(link);
        articleDiv.appendChild(linkParagraph);
      });
      if (articleEl.hasChildNodes()) {
        while (articleEl.firstChild) {
          articleEl.removeChild(articleEl.firstChild);
        }
      }
      articleEl.appendChild(articleDiv);
    })
  })
}

function fetchTopics(url) {
  if (url) {
    fetch('https://www.reddit.com/r/' + url + '.json').then( response => {
      return response.json();
    }).then( json => {
      var articleList = createFullElement('ul', {
        'class': 'demo-list-three mdl-list'
      });

      for (var i = 0; i < json.data.children.length; i++) {
        //Make the enclosing list item.
        var articleItem = createFullElement('li', {
          'class': 'mdl-list__item mdl-list__item--three-line'
        });

        //Make the primary content span.
        var primarySpan = createFullElement('span', {
          'class': 'mdl-list__item-primary-content'
        });

        //Make the article link.
        var anImage = createFullElement('i', {
          'class': 'material-icons mdl-list__item-avatar'
        });

        var someText = document.createTextNode('person');
        anImage.appendChild(someText);
        primarySpan.appendChild(anImage);

        var linkSpan = document.createElement('span');

        //ToDo: Add indicator for whether article will load here or in a new tab.
        var contentLink = createFullElement('a', {
          'href': json.data.children[i].data.url
        })
        contentLink.addEventListener('click', e => {
          e.preventDefault();
          if (e.target.href.indexOf('www.reddit.com') > -1) {
            fetchArticle(e.target.href.slice(0, -1) + '.json');
          } else {
            window.open(e.target.href, '_blank');
          }
        });

        var linkText = document.createTextNode(json.data.children[i].data.title);
        contentLink.appendChild(linkText);
        linkSpan.appendChild(contentLink);
        primarySpan.appendChild(linkSpan);

        //Make the subtitle line.
        var subtitleSpan = createFullElement('span', {
          'class': 'mdl-list__item-sub-title'
        })
        var aBreak = document.createElement('br');
        subtitleSpan.appendChild(aBreak);

        var subtitleText = document.createTextNode(json.data.children[i].data.author + ' — ' + json.data.children[i].data.num_comments + ' comments');
        subtitleSpan.appendChild(subtitleText);
        primarySpan.appendChild(subtitleSpan);
        articleItem.appendChild(primarySpan);
        articleList.appendChild(articleItem);
      };
      if (contentEl.hasChildNodes) {
        contentEl.removeChild(contentEl.firstChild);
      }
      contentEl.appendChild(articleList);
    });
  }
}

function fetchSubreddits() {
  var subredditsByTopicUrl = 'https://www.reddit.com/api/subreddits_by_topic.json?query=javascript';
  fetch(subredditsByTopicUrl).then( response => {
    return response.json();
  }).then( json => {
    for (var k = 0; k < json.length; k++) {
      var linkEl = createFullElement('a', {
        'class': 'mdl-navigation__link',
        'href': '#' + json[k].name
      });

      var linkText = document.createTextNode(json[k].name);
      linkEl.appendChild(linkText);
      var linkNode = navEl.appendChild(linkEl);

      linkNode.addEventListener('click', e => {
        fetchTopics(e.target.firstChild.nodeValue);
        navigator.serviceWorker.ready.then( reg => {
          return reg.sync.register('articles');
        })
      });
    }
  }).catch( ex => {
    console.log('Parsing failed: ', ex);
  });
}

function getReddit() {
  fetchSubreddits();
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then( reg => {
      return reg.sync.register('subreddits');
    });
  }
  var anchorLocation = window.location.href.indexOf('#');
  if (anchorLocation != -1) {
    fetchTopics(window.location.href.slice(anchorLocation + 1));
  }
}