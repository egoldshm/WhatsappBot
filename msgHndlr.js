//const axios = require('axios')
const { decryptMedia } = require('@open-wa/wa-decrypt');
const moment = require('moment-timezone')
const validUrl = require('valid-url');
const youtube_downloader = require('./youtube_modules/youtube_downloader')
const youtube_searcher = require('./youtube_modules/youtube_search');
const { get_calendars_data, search_name_sefaria, search_in_sefaria} = require('./private_modules/sefaria');
const constants = require("./string_constants")
moment.tz.setDefault('Europe/Rome').locale('id')
const colors = require('colors');
const { brotliDecompress } = require('zlib');
const { sticker_creator } = require("./private_modules/sticker_creator");

module.exports = msgHandler = async (client, message) => {
	try {
		const { type, id, from, t, sender, isGroupMsg, chat, caption, isMedia, mimetype, quotedMsg, quotedMsgObj, mentionedJidList } = message
		let { body } = message
		const { name, formattedTitle } = chat
		let { pushname, verifiedName } = sender
		pushname = pushname || verifiedName || ""
		const commands = caption || body || ''
		var withNoDigits = ""
		const command = commands.toLowerCase().split(' ')[0] || ''
		const time = moment(t * 1000).format('DD/MM HH:mm:ss')
		const uaOverride = 'WhatsApp/2.2029.4 Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36'
		console.log(moment().format("H:mm:ss").green + " " + pushname.split("").reverse().join("") + " " + from)
		console.log((mimetype?message.mimetype.yellow:body.split("").reverse().join("").yellow))
		await sticker_creator(isMedia, type, message, client, from, id, uaOverride, mimetype);
		if(type == "sticker")
		{
			const mediaData = await decryptMedia(message, uaOverride);
			console.log(moment().format("H:mm:ss").green + " work on your sticker " + message.from);
			const imageBase64 = `data:${mimetype};base64,${mediaData.toString('base64')}`;
			await client.sendImage(from, imageBase64);
		}
		if(!body)
			return

		if (constants.HELLO_ASK.some((item) => body.includes(item))) {
			client.sendText(from, constants.WELCOME_1_MESSAGE)
		}

		if (constants.MENU_ASK.some((item) => body.includes(item))) {
			client.sendText(from, constants.MENU)
		}

		if(body.includes(constants.AUDIO_YOUTUBE))
		{
			

		}
		if (validUrl.isUri(body)) {
			if (body.includes("www.youtube.com/watch?v=") || body.includes("youtu.be")) {
				console.log(moment().format("H:mm:ss").green + " Recvied youtube Url!")
				client.sendText(message.from, "הסרטון שלך מיוטיוב בדרך 📹 סבלנות, זה צפוי לקחת זמן.. ⏳ זה הסרטון ששלחת 👇")
				client.sendYoutubeLink(message.from, body)
				youtube_downloader(body, client, message.from, message.id).catch((error) => {
					client.sendText(message.from, "אוי, נתקלתי בבעיה! 😵 זה הבעיה: " + error)
					console.log(`youtube_downloader has error ${error}\n`);
				})
			}
			else {
				console.log(moment().format("H:mm:ss").green + " Recvied Url!")
				client.sendText(message.from, "רק רגע, הקובץ שלך בדרך, נא להמתין בסבלנות - זה עלול לקחת זמן ⏳")
				let items = body.split("/")
				console.log(items[items.length - 1])
				client.sendFileFromUrl(message.from, body, decodeURIComponent(items[items.length - 1]), "הנה הקובץ שלך!").then((serialized) => {
					console.log(`sendFileFromUrl has serialized ${serialized}\n`);
				}, (err) => {
					console.log(`sendFileFromUrl has error ${err}\n`);
					client.sendText(message.from, "אוי! 😱 יש בעיה בלינק ששלחת לי, לא הצלחתי להוריד אותו, אתה בטוח שיש שם קובץ? או לפחות איזשהו דף שאפשר להוריד? תנסה משהו אחר... ")
				});
			}

		}

		//אם זה נראה כמו לינק - אבל לא עבר את הבדיקה הקודמת
		else if (body.split(".").length > 1 && body.split(" ").length == 1) {
			await client.sendText(message.from, constants.NO_VALID_LINK)

		}

		if (body.includes(constants.TODAY_ASK)) {
			get_calendars_data(error => {
				throw ("ERROR in get_calendars_data " + error)
			}, (result) => {
				let text_to_send = "*איזה לימוד יומי יש היום?*😇\n"
				for (let item of result.calendar_items) {
					text_to_send += `${item.order}. *${item.title.he}*: ${item.displayValue.he}\nקישור: https://www.sefaria.org/${item.url}\n`
				}
				client.sendText(message.from, text_to_send)
			})
		}

		//אם המשתמש רוצה לקבל מידע על ספר
		if (body.includes(constants.SEFARIA_BOOK) && !body.includes(constants.SEFARIA_TEXT)) {
			const string_to_search = body.replace(constants.SEFARIA_BOOK, "").replace("\n", "").trim()

			search_name_sefaria(string_to_search, error => {
				throw ("ERROR in get_calendars_data " + error)
			}, (result) => {
				let text_to_send = "*מה מצאתי שמתאים לחיפוש שלך?*😇\n"
				if (result.is_ref)
					text_to_send += `\n*https://www.sefaria.org/${encodeURIComponent(result.url)}*\n`
				if (result.type == "Person")
					text_to_send += `\n*קרא עליו:* \n*https://www.sefaria.org/person/${encodeURIComponent(result.key)}*\n\n`
				if (result.type == "TocCategory") {
					text_to_send += "\n*https://www.sefaria.org/texts"
					for (let k of result.key)
						text_to_send += "/" + encodeURIComponent(k)
					text_to_send += "*\n"
				}
				for (let item of result.completion_objects) {
					if (item.type == "ref")
						text_to_send += `*${item.title}*:\nhttps://www.sefaria.org/${encodeURIComponent(item.key)}\n`
				}
				if(result.completion_objects)
					client.sendText(message.from, text_to_send)
				else
					client.sendText(message.from, constants.SEFARIA_NOT_FOUND)
			})
		}
		if (body.includes(constants.SEFARIA_TEXT)) {
			const string_to_search = body.replace(constants.SEFARIA_TEXT, "").replace("\n", "").trim()
			search_in_sefaria(string_to_search, error => {
				client.sendText(message.from, "לא הצלחתי למצוא את מה שחיפשת, תנסה לחפש במילים אחרות. 😞 \n זה השגיאה שקיבלתי 👇 \n" + error)
			},
			(result) =>
			{
				if(result.error)
				{
					client.sendText(from, constants.SEFARIA_NOT_FOUND)
				}
				else
				{
					client.sendText(from, `הנה מה שמצאתי לך מספריא 😇👇\n\n*${result.heRef}*\n${result.he.join("\n")}`)
				}
			})
		}

		if (body.includes(constants.YOUTUBE_DOWNLOAD)) {
			const string_to_search = body.replace(constants.YOUTUBE_DOWNLOAD, "").replace("\n", "").trim()
			youtube_searcher(string_to_search, (error, answer) => {
				if (error) {
					console.log(`youtube_searcher has error ${error}`)
					throw error
				}
				else {
					text_to_send = `*🔍 תוצאות עבור החיפוש שלך ("${string_to_search}") 📺*\n\n`
					for (let i in answer) {
						text_to_send += `(${i + 1})
*כותרת:* ${answer[i].title}
*תיאור:* ${answer[i].description}
*קישור:* ${answer[i].link}

`
					}
					client.sendText(message.from, text_to_send)
				}
			}
			)
		}
		if(body.includes("שריאל"))
		{
			client.sendStickerfromUrl(from, "https://www.h-i-h.co.il/wp-content/uploads/2017/04/dai-lakibush-web.png");
		}

		if (body.includes("איציק")) {
			client.sendText(from, "וואלה, איציק הזה יותר מגניב 🤖😇")
		}

		if (body.includes("קרס")) {
			client.sendText(from, "לא-לא, אני לגמרי באוויר, מוזמנים להשתמש בי חופשי 😇🆙")
			client.setPresence(true)
		}
		if(body.includes("תפיל"))
		{
			client.setPresence(false)
		}


	}
	catch (err) {
		console.log("error".red + " " + err)
		client.sendText(message.from, `אוי 😞 נתקלתי בבעיה בניסיון לטפל בבקשה שלך, אם זה ממש מעניין אותך - זה התקלה שקיבלתי
${err}

*דרך אגב, לידיעתך, לא נהוג להציג את השגיאות למשתמש, אל תעשה את זה בפרוייקטים שלך 🙃*`)
		//client.kill().then(a => console.log(a))
	}
}

