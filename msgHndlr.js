const { decryptMedia } = require('@open-wa/wa-decrypt')
const fs = require('fs-extra')
//const axios = require('axios')
const moment = require('moment-timezone')
//const get = require('got')
const { exec } = require('child_process')
const validUrl = require('valid-url');
const youtube_downloader = require('./youtube_downloader')
const youtube_searcher = require('./youtube_search');
const { get_calendars_data, search_name_sefaria } = require('./sefaria');
const constants = require("./string_constants")
moment.tz.setDefault('Europe/Rome').locale('id')

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
		if (isMedia && type === 'image') {
			console.log(moment().format("H:mm:ss").green + " Sticker " + message.from);
			client.reply(from, 'חכה בסבלנות למדבקה המגניבה שלך! היא בדרך!', id)
			const mediaData = await decryptMedia(message, uaOverride)
			console.log(moment().format("H:mm:ss").green + " רק רגע, אני מפענח את התצלום " + message.from);
			const imageBase64 = `data:${mimetype};base64,${mediaData.toString('base64')}`
			await client.sendImageAsSticker(from, imageBase64)
			console.log(moment().format("H:mm:ss").green + " מדבקה נשלחה " + message.from);
		}
		if (isMedia && (mimetype === 'video/mp4' && message.duration < 10 || mimetype === 'image/gif' && message.duration < 10)) {
			const mediaData = await decryptMedia(message, uaOverride)
			console.log(moment().format("H:mm:ss").green + " מדבקה נשלחה " + message.from);
			client.reply(from, 'חכה בסבלנות למדבקה המגניבה שלך! היא בדרך!', id)
			const filename = `./media/input.${mimetype.split('/')[1]}`
			console.log(moment().format("H:mm:ss").green + " מפענח את הסרטון " + message.from);
			await fs.writeFileSync(filename, mediaData)
			console.log(moment().format("H:mm:ss").green + " וידאו נשמר " + message.from);
			await exec(`gify ${filename} ./media/output.gif --fps=30 --scale=240:240`, async function (error, stdout, stderr) {
				console.log(moment().format("H:mm:ss").green + " וידאו מומר לגיף " + message.from);
				const gif = await fs.readFileSync('./media/output.gif', { encoding: "base64" })
				let asBase64 = gif.toString('base64')
				await client.sendImageAsSticker(from, `data:image/gif;base64,${asBase64}`).catch(err => {
					console.log("error".red + " " + err)
					client.sendText(from, "יש בעיה בגיף שלך 😬 תנסה לשלוח גיף אחר, או לקצר את הגיף שלך...")
				})
				console.log(moment().format("H:mm:ss").green + " סטיקר נשלח " + message.from);
			})//
		}
		if (body.includes("היי") || body.includes("שלום")) {
			client.sendText(from, "היי, מוזמן לשלוח 'תפריט' או 'עזרה' כדי לבדוק מה אני יודע לעשות 😉")
		}
		if (body.includes("איציק")) {
			client.sendText(from, "וואלה, איציק הזה יותר מגניב 🤖😇")
		}
		if (body.includes("עזרה") || body.includes("תפריט")) {
			client.sendText(from, "🌟 שלח לי תמונה, סרטון או גיף - ואני אשלח לך בחזרה סטיקר.\n\n" +
				"🌟 שלח לי לינק לקובץ באינטרנט (או סתם אפילו דף html) - והוא אשלח לך אותו כקובץ.\n\n" +
				"🌟 שלח לי לינק לסרטון ביוטיוב - ואני אוריד ואשלח לך אותו.")
		}
		if (body.includes("קרס")) {
			client.sendText(from, "לא-לא, אני לגמרי באוויר, מוזמנים להשתמש בי חופשי 😇🆙")
		}
		if (body.includes("צרף")) {
			client.createGroup(`קבוצה - לבד - ${pushname}`, message.from).then(
				async (answer) => {
					const gid = answer.gid._serialized
					console.log(gid)
					// await client.sendText(gid, "תהנה בקבוצה שלך! 😇 אני ביניכם כמו צמח בר")
					client.promoteParticipant(gid, from).then((su) => {
						if (su) client.leaveGroup(gid).catch((err) => console.log("ERROR in leaveGroup".red + err))
						else console.log("False in leaveGroup".red + su)
					}).catch((err) => console.log("ERROR in promoteParticipant ".red + err))
				}
			).catch((err) => console.log("ERROR ".red + err));
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
		else if (body.split(".").length > 1 && body.split(" ").length == 1) {
			await client.sendText(message.from, "רגע, התכוונת לשלוח לי לינק? תשלח בבקשה עם http:// או https:// בתחילת הלינק - כדי שאזהה אותו כלינק...")

		}
		if (body.includes("היום")) {
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
		if (body.includes("ספריא")) {
			const string_to_search = body.replace("ספריא", "").replace("\n", "").trim()

			search_name_sefaria(string_to_search, error => {
				throw ("ERROR in get_calendars_data " + error)
			}, (result) => {
				let text_to_send = "*מה מצאתי שמתאים לחיפוש שלך?*😇\n"
				console.log(result)
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
				client.sendText(message.from, text_to_send)
			})
		}

		if (body.includes(constants.YOUTUBE_DOWNLOAD)) {
			const string_to_search = body.replace("ביוטיוב", "").replace("\n", "").trim()
			youtube_searcher(string_to_search, (error, answer) => {
				if (error) {
					console.log(`string_to_search has error ${err}\n`);
					client.sendText(message.from, "אוי, נתקלתי בבעיה! 😵 זו הבעיה: \n" + error)
				}
				else {
					text_to_send = `*🔍 תוצאות עבור החיפוש שלך ("${string_to_search}") 📺*\n\n`
					for (let i in answer) {
						text_to_send += `(${i})
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
	}
	catch (err) {
		console.log("error".red + " " + err)
		client.sendText(message.from, `אוי 😞 נתקלתי בבעיה בניסיון לטפל בבקשה שלך, אם זה ממש מעניין אותך - זה התקלה שקיבלתי
${err}

"*דרך אגב, לידיעתך, לא נהוג להציג את השגיאות למשתמש, אל תעשה את זה בפרוייקטים שלך 🙃*`)
		//client.kill().then(a => console.log(a))
	}
}
