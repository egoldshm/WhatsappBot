const { decryptMedia } = require('@open-wa/wa-decrypt');
const fs = require('fs-extra');
const moment = require('moment-timezone');
const { exec } = require('child_process');

async function sticker_creator(isMedia, type, message, client, from, id, uaOverride, mimetype) {
	if (isMedia && type === 'image') {
		console.log(moment().format("H:mm:ss").green + " Sticker " + message.from);
		client.reply(from, 'חכה בסבלנות למדבקה שלך! היא בדרך! ⏳', id);
		const mediaData = await decryptMedia(message, uaOverride);
		console.log(moment().format("H:mm:ss").green + " work on your image " + message.from);
		const imageBase64 = `data:${mimetype};base64,${mediaData.toString('base64')}`;
		await client.sendImageAsSticker(from, imageBase64);
		console.log(moment().format("H:mm:ss").green + " Sticker sended " + message.from);
	}
	if (isMedia && (mimetype === 'video/mp4' && message.duration < 10 || mimetype === 'image/gif' && message.duration < 10)) {
		const mediaData = await decryptMedia(message, uaOverride);
		console.log(moment().format("H:mm:ss").green + " Sticker sended " + message.from);
		client.reply(from, 'חכה בסבלנות למדבקת-סרטון שלך! היא בדרך! ⏳', id);
		const filename = `./media/input.${mimetype.split('/')[1]}`;
		console.log(moment().format("H:mm:ss").green + " work on your image " + message.from);
		await fs.writeFileSync(filename, mediaData);
		console.log(moment().format("H:mm:ss").green + " video saves " + message.from);
		await exec(`gify ${filename} ./media/output.gif --fps=30 --scale=240:240`, async function (error, stdout, stderr) {
			console.log(moment().format("H:mm:ss").green + " video converting to gif " + message.from);
			const gif = await fs.readFileSync('./media/output.gif', { encoding: "base64" });
			let asBase64 = gif.toString('base64');
			await client.sendImageAsSticker(from, `data:image/gif;base64,${asBase64}`).catch(err => {
				console.log("error".red + " " + err);
				client.sendText(from, "יש בעיה בגיף שלך 😬 תנסה לשלוח גיף אחר, או לקצר את הגיף שלך...");
			});
			console.log(moment().format("H:mm:ss").green + " Sticker sended " + message.from);
		});
	}
}
exports.sticker_creator = sticker_creator;
