const colors = require('colors');
const { create, Client } = require('@open-wa/wa-automate')
const msgHandler = require('./msgHndlr')
const options = require('./options')
const moment = require('moment-timezone');
const { on } = require('process');
const { register_info_about_users } = require("./register_info_about_users/register_info_about_users");
console.log("Start run code 'index.js'")
const start = async (client = new Client()) => {
        console.log('[SERVER] Server Started!')
        // Force it to keep the current session
        client.onStateChanged((state) => {
            console.log('[Client State]', state)
            if (state === 'CONFLICT' || state === 'UNLAUNCHED') client.forceRefocus()
        })
        // listening on message
        client.onMessage((async (message) => {
            client.getAmountOfLoadedMessages()
            .then((msg) => {
                if (msg >= 3000) {
                    client.cutMsgCache()
                }
            })
            msgHandler(client, message)
        }))

        client.onGlobalParicipantsChanged((async ({action, by, chat, who}) =>
        {
            console.log(`${moment().format("H:mm:ss").green} action:"${action}", by:"${by}", chat:"${chat}", who:"${who}"`)
        }))

        //כל כמה דקות - מוסיף לקובץ מידע על הזמינות של המשתמשים
        register_info_about_users(client);

        
        client.onAddedToGroup(((chat) => {
                client.leaveGroup(message.id)
        }))


        // listening on Incoming Call
        client.onIncomingCall(( async (call) => {
            await client.sendText(call.peerJid, 'נא לא להתקשר אלי 📞 נחסמת 😱')
            .then(() => client.contactBlock(call.peerJid))
        }))

        // עובר בתחילת ההרצה על כל ההודעות הישנות שלא נקראו - ומטפל בהם
        client.getAllUnreadMessages().then(messages => 
            {
                console.log(`Load all Unread messages (${messages.length})`)
                for(let message of messages)
                {
                    msgHandler(client, message)
                }
            })

    }

create('BarBar', options(true, start))
    .then(client => start(client))
    .catch((error) => console.log("ERROR in barBar ".red + error)).catch((error) => console.log("ERROR in index.js ".red + error))


