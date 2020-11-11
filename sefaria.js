const https = require('https')

async function get_calendars_data(error, answer)
{
const options = {
    hostname: 'www.sefaria.org',
    port: 443,
    path: '/api/calendars',
    method: 'GET',
    json:true

  }
  const req = https.request(options, res => {
    let rawData = '';
    res.on('data', (chunk) => { rawData += chunk; });
    res.on('end', () => {
      const result = JSON.parse(rawData)
      answer(result)
    })  
  })
  req.on('error', error)
  
  req.end()
  
  
}

async function search_name_sefaria(name, error, answer)
{
const options = {
    hostname: 'www.sefaria.org',
    port: 443,
    path: '/api/name/' + encodeURIComponent(name),
    method: 'GET',
    json:true

  }
  const req = https.request(options, res => {
    let rawData = '';
    res.on('data', (chunk) => { rawData += chunk; });
    res.on('end', () => {
      const result = JSON.parse(rawData)
      answer(result)
    })  
  })
  req.on('error', error)
  
  req.end()

}


async function search_in_sefaria(text, error, answer)
{
  const data = JSON.stringify({
    text: encodeURIComponent(text),
    analyzer: "standard"
      })
  
  const options = {
    hostname: 'www.sefaria.org',
    port: 443,
    path: '/api/search/text/_search',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json, ',
      'Content-Length': data.length
    },  
    json:true
  }
  
  const req = https.request(options, res => {
    let rawData = '';
    res.on('data', (chunk) => { rawData += chunk;});
    res.on('end', () => {
      console.log(rawData)
      const result = JSON.parse(rawData)
      answer(result)
    })})
  req.write(data)
  req.on('error', error)
  req.end()

}
module.exports = {get_calendars_data: get_calendars_data, search_name_sefaria:search_name_sefaria}