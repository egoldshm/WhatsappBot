const fs = require('fs');
let FILE_NAME = 'data.csv'
module.exports = rowAppender = async (data_to_add) =>
{
    fs.appendFile(FILE_NAME, "\n" + data_to_add, 'utf8', function (err) {
        if (err) 
        {
            fs.writeFile(FILE_NAME, data_to_add, 'utf8', function (err) { console.log("Error ".red + err)})
        }
        
        // console.log('Saved!');
      });
      
}