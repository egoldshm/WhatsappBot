var search = require('youtube-search');

module.exports = youtube_searcher = async(string_to_search, func) =>
{
var opts = {
  maxResults: 10,
  key: 'AIzaSyCpB9_anlI7jpldmzo0TmQ-kFUrJ7YXLwA'
};
 
search(string_to_search, opts, func);
}