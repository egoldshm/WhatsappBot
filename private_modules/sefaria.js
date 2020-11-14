const https = require('https')
// const colors = require("colors")  //for colors in console

/*
פונקציה שמחזירה מספריא מידע לגבי הלימוד היומי בכל יום.
מקבלת:
error: callback with 1 parmeter for error case.
answer: callback with 1 parmeter for succeed case.
*/
async function get_calendars_data(error, answer) {
  const options = {
    hostname: 'www.sefaria.org',
    port: 443,
    path: '/api/calendars',
    method: 'GET',
    json: true

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

/*
פונקציה שמקבלת שם של ספר או של רב ומחזירה את המידע לגביו מספריא.
מקבלת:
name: name for search.
error: callback with 1 parmeter for error case.
answer: callback with 1 parmeter for succeed case.
*/
async function search_name_sefaria(name, error, answer) {
  const options = {
    hostname: 'www.sefaria.org',
    port: 443,
    path: '/api/name/' + encodeURIComponent(name),
    method: 'GET',
    json: true

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

/*
פונקציה שמקבל מקור של טקסט - ומחזירה את התוכן של מספריא
מקבלת:
text: text for search.
error: callback with 1 parmeter for error case.
answer: callback with 1 parmeter for succeed case.
*/
 
async function search_in_sefaria(text, error, answer) {
  let options = {
    hostname: 'www.sefaria.org',
    port: 443,
    path: '/api/texts/' + encodeURIComponent(text),
    method: 'GET',
    json: true

  }
  const req = https.request(options, res => {
    if (res.statusCode == 301) {
      options.path = res.headers.location
      const req1 = https.request(options, res => {
        let rawData = '';
        res.on('data', (chunk) => { rawData += chunk; });
        res.on('end', () => {
          const result = JSON.parse(rawData)
          answer(result)
        })
      })
      req1.on('error', error)
      req1.end()


    }
    else {
      let rawData = '';
      res.on('data', (chunk) => { rawData += chunk; });
      res.on('end', () => {
        const result = JSON.parse(rawData)
        answer(result)

      })
    }
  })
  req.on('error', error)
  req.end()
}

module.exports = { get_calendars_data: get_calendars_data, search_name_sefaria: search_name_sefaria, search_in_sefaria: search_in_sefaria}