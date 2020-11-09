const { decryptMedia } = require('@open-wa/wa-decrypt')
const fs = require('fs-extra')
//const axios = require('axios')
const moment = require('moment-timezone')
//const get = require('got')
var colors = require('colors');
const { exec } = require('child_process')
const { stdout } = require('process')
var validUrl = require('valid-url');

moment.tz.setDefault('Europe/Rome').locale('id')

module.exports = msgHandler = async (client, message) => {
    try {
        const { type, id, from, t, sender, isGroupMsg, chat, caption, isMedia, mimetype, quotedMsg, quotedMsgObj, mentionedJidList } = message
        let { body } = message
        const { name, formattedTitle } = chat
        let { pushname, verifiedName } = sender
        pushname = pushname || verifiedName
        const commands = caption || body || ''
		var withNoDigits = ""
        const command = commands.toLowerCase().split(' ')[0] || ''
        const time = moment(t * 1000).format('DD/MM HH:mm:ss')
        const uaOverride = 'WhatsApp/2.2029.4 Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36'
		if (isMedia && type === 'image') {
			console.log(moment().format("H:mm:ss").green+" Sticker "+message.from);
			client.reply(from, 'חכה בסבלנות למדבקה המגניבה שלך! היא בדרך!', id)
			const mediaData = await decryptMedia(message, uaOverride)
			console.log(moment().format("H:mm:ss").green+" רק רגע, אני מפענח את התצלום "+message.from);
			const imageBase64 = `data:${mimetype};base64,${mediaData.toString('base64')}`
			await client.sendImageAsSticker(from, imageBase64)
			console.log(moment().format("H:mm:ss").green+" מדבקה נשלחה "+message.from);
		}
		if (isMedia &&(mimetype === 'video/mp4' && message.duration < 10 || mimetype === 'image/gif' && message.duration < 10)) {
			const mediaData = await decryptMedia(message, uaOverride)
			console.log(moment().format("H:mm:ss").green+" מדבקה נשלחה "+message.from);
			client.reply(from, 'חכה בסבלנות למדבקה המגניבה שלך! היא בדרך!', id)
			const filename = `./media/input.${mimetype.split('/')[1]}`
			console.log(moment().format("H:mm:ss").green+" מפענח את הסרטון "+message.from);
			await fs.writeFileSync(filename, mediaData)
			console.log(moment().format("H:mm:ss").green+" וידאו נשמר "+message.from);
			await exec(`gify ${filename} ./media/output.gif --fps=30 --scale=240:240`, async function (error, stdout, stderr) {
				console.log(moment().format("H:mm:ss").green+" וידאו מומר לגיף "+message.from);
				const gif = await fs.readFileSync('./media/output.gif', { encoding: "base64" })
				await client.sendImageAsSticker(from, `data:image/gif;base64,${gif.toString('base64')}`)
				console.log(moment().format("H:mm:ss").green+" סטיקר נשלח "+message.from);
			})//
		}
		if(body.includes("צרף"))
		{
			let answer = await client.createGroup("קבוצה חדשה עם הבוט 🤩",message.from)
			client.setGroupDescription(answer.gid, `קבוצה חדשה של הבוט עם ${name + " "+ formattedTitle}` )
			client.sendText(answer.gid, JSON.stringify(answer))
		}
		if(validUrl.isUri(body))
		{
			console.log(moment().format("H:mm:ss").green + " Recvied Url!")
			await client.sendText(message.from, "רק רגע, הקובץ שלך בדרך...")
			let items = body.split("/")
			console.log(items[items.length - 1])
			client.sendFileFromUrl(message.from, body,decodeURIComponent(items[items.length - 1]), "הנה הקובץ שלך!").then((serialized) => {
				console.log(`sendFileFromUrl has serialized ${serialized}\n`);
			}, (err) => {
				console.log(`sendFileFromUrl has error ${err}\n`);
			});

		}
		if(command == '!guida' || command == "!help"){
			console.log(moment().format("H:m:ss").green+": Guida "+message.from);
			client.sendText(message.from,'Collegati al sito https://giphy.com/ \n\nScegli la gif da te preferita\n\nTieni premuto e clicca "Condividi" Se ti trovi su safari\nTieni premuto e clicca "immagine in altra scheda"  Se ti trovi su chrome\n\nPoi invia quel link');
			client.sendText(message.from,"https://youtu.be/aGc8Po8G0Bo  \n\n\nEcco a te una piccola videoguida per safari\n");
			client.sendText(message.from,"https://youtu.be/YBe_7KzvQ_g \n\n\nEcco a te una piccola videoguida per chrome\n");
			client.sendText(message.from,"Se invece vuoi uno sticker statico, manda una foto\n\nN.B. potrebbe prendere solo la parte centrale della foto");
			client.sendText(message.from,"Da oggi puoi anche inviare un video/gif ed esso diventerà uno sticker animato");

		}
    } catch (err) {
        console.log("error".red + " " + err)
        //client.kill().then(a => console.log(a))
    }
}
