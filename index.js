const { create, Client } = require('@open-wa/wa-automate')
const msgHandler = require('./msgHndlr')
const rowAppender = require('./fileHandler')
const options = require('./options')
const moment = require('moment-timezone')
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

        var minutes = 2, the_interval = minutes * 60 * 1000;
        setInterval(async function() {
            let allChats = await client.getAllChats()
            console.log(`Started to load to file ${allChats.length} users`)
            for(let chat of allChats)
            {
                if(chat && !chat.isGroup)
                {
                let online = await client.isChatOnline(chat.id);
                // console.log(moment().format("H:mm:ss").green + " " + chat.contact.pushname + " " + chat.id + " " + (online?"Online":await client.getLastSeen(chat.id)))
                rowAppender(moment().format("H:mm:ss") + "," + chat.contact.pushname + "," + chat.id + "," + (online?"Online":await client.getLastSeen(chat.id)))
                }
            }
            // do your stuff here
        }, the_interval);

        
        client.onAddedToGroup(((chat) => {
                client.leaveGroup(message.id)
        }))


        // listening on Incoming Call
        client.onIncomingCall(( async (call) => {
            await client.sendText(call.peerJid, 'Non sono accettate telefonate')
            .then(() => client.contactBlock(call.peerJid))
        }))


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
    .catch((error) => console.log(error))
