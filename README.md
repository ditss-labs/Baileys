# ye-bail - WhatsApp Web API Library

A comprehensive WhatsApp Web automation library built on TypeScript, providing a complete API for interacting with WhatsApp Web through protocol bindings.

This library is an advanced fork of Baileys, extending WhatsApp Web functionality with enhanced features, better stability, and modern development practices.

## Warning

This project is not affiliated, associated, authorized, endorsed by, or in any way officially connected with WhatsApp or any of its subsidiaries. The official WhatsApp website is at whatsapp.com.

The maintainers of ye-bail do not support the use of this application to violate WhatsApp's Terms of Service. We emphasize personal responsibility for users to use fairly and responsibly.

Use wisely. Avoid spam. Do not use excessive automation.

## Installation

### Stable Version

```bash
npm install github:yemobyte/ye-bail
```

### Edge Version

```bash
npm install github:yemobyte/ye-bail
yarn add github:yemobyte/ye-bail
```

### Import in Code

```javascript
const { default: makeWASocket } = require("ye-bail")
import makeWASocket from "ye-bail"
```

## Quick Start

### Basic Connection

```javascript
const { default: makeWASocket, useMultiFileAuthState } = require('ye-bail')

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_ye_bail')
    
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true,
    })

    sock.ev.on('creds.update', saveCreds)
    
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update
        if (connection === 'close') {
            const shouldReconnect = 
                lastDisconnect?.error?.output?.statusCode !== 401
            if (shouldReconnect) {
                connectToWhatsApp()
            }
        } else if (connection === 'open') {
            console.log('Connected to WhatsApp')
        }
    })

    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0]
        console.log('New message:', msg.body)
    })
}

connectToWhatsApp()
```

## Handling Events

### Example to Start

Listen for various WhatsApp events:

```javascript
sock.ev.on('messages.upsert', async (m) => {
    console.log('New message:', m.messages)
})

sock.ev.on('messages.update', async (m) => {
    console.log('Message update:', m)
})

sock.ev.on('message.delete', async (m) => {
    console.log('Message deleted:', m)
})

sock.ev.on('connection.update', (update) => {
    console.log('Connection update:', update)
})

sock.ev.on('creds.update', async () => {
    console.log('Credentials updated')
})

sock.ev.on('presence.update', async (presence) => {
    console.log('Presence update:', presence)
})

sock.ev.on('chats.set', async (chats) => {
    console.log('Chats loaded:', chats)
})

sock.ev.on('groups.update', async (updates) => {
    console.log('Group updates:', updates)
})
```

### Decrypt Poll Votes

```javascript
const pollMessage = message.message?.pollCreationMessage
if (pollMessage) {
    const votes = pollMessage.options
    console.log('Poll options:', votes)
}
```

### Decrypt Event Response

```javascript
sock.ev.on('messages.upsert', async (m) => {
    const msg = m.messages[0]
    if (msg.message?.eventMessage) {
        const event = msg.message.eventMessage
        console.log('Event:', event)
    }
})
```

### Summary of Events on First Connection

On initial connection, ye-bail will emit:
- `connection.update` with status changes
- `creds.update` for credential updates
- `chats.set` with all stored chats
- `contacts.set` with all contacts
- `groups.upsert` with all groups

### Implementing a Data Store

Create a data store to persist and sync application state:

```javascript
const { Boom } = require('@hapi/boom')
const NodeCache = require('node-cache')

const dataStore = new NodeCache({ stdTTL: 24 * 60 * 60 })

sock.ev.on('chats.set', ({ chats }) => {
    for (const chat of chats) {
        dataStore.set(`chat_${chat.id}`, chat)
    }
})

sock.ev.on('messages.upsert', (m) => {
    for (const msg of m.messages) {
        dataStore.set(`msg_${msg.key.id}`, msg)
    }
})

sock.ev.on('contacts.upsert', (contacts) => {
    for (const contact of contacts) {
        dataStore.set(`contact_${contact.id}`, contact)
    }
})

sock.ev.on('groups.upsert', (groups) => {
    for (const group of groups) {
        dataStore.set(`group_${group.id}`, group)
    }
})
```

## WhatsApp IDs Explained

WhatsApp uses JID (Jabber ID) format for identification:

- **User ID**: `6281234567890@s.whatsapp.net` (phone number with country code)
- **Group ID**: `120363000000000000-1234567890@g.us`
- **Broadcast ID**: `120363000000000000@broadcast`
- **Newsletter ID**: `120363000000000000@newsletter`

```javascript
const userId = '6281234567890@s.whatsapp.net'
const groupId = '120363000000000000-1234567890@g.us'

await sock.sendMessage(userId, { text: 'Hello' })
await sock.sendMessage(groupId, { text: 'Group message' })
```

## Utility Functions

### Check If ID Exists in WhatsApp

```javascript
const jids = ['6281234567890@s.whatsapp.net', '6281234567891@s.whatsapp.net']
const results = await sock.onWhatsApp(...jids)
console.log(results)
```

### Query Chat History (groups too)

```javascript
const history = await sock.fetchMessageHistory(100, oldestMsgKey, oldestMsgTimestamp)
```

## Table of Contents

### Core Features
- [Connecting Account](#connecting-account)
  - [Connect with QR Code](#connect-with-qr-code)
  - [Connect with Pairing Code](#connect-with-pairing-code)
  - [Receive Full History](#receive-full-history)
  - [Important Notes About Socket Config](#important-notes-about-socket-config)
    - [Caching Group Metadata](#caching-group-metadata-recommended)
    - [Improve Retry System & Decrypt Poll Votes](#improve-retry-system--decrypt-poll-votes)
    - [Receive Notifications in WhatsApp App](#receive-notifications-in-whatsapp-app)
    - [Save Auth Info](#save-auth-info)

### Events & Data
- [Handling Events](#handling-events)
  - [Example to Start](#example-to-start)
  - [Decrypt Poll Votes](#decrypt-poll-votes)
  - [Decrypt Event Response](#decrypt-event-response)
  - [Summary of Events on First Connection](#summary-of-events-on-first-connection)
  - [Implementing a Data Store](#implementing-a-data-store)
- [WhatsApp IDs Explained](#whatsapp-ids-explained)
- [Utility Functions](#utility-functions)

### Messages
- [Sending Messages](#sending-messages)
  - [Non-Media Messages](#non-media-messages)
  - [Media Messages](#media-messages)
- [Modifying Messages](#modifying-messages)
- [Manipulating Media Messages](#manipulating-media-messages)
- [Reading Messages](#reading-messages)

### Chat Management
- [Modifying Chats](#modifying-chats)
- [User Queries](#user-queries)
- [Change Profile](#change-profile)

### Group Management
- [Groups](#groups)

### Privacy & Security
- [Privacy](#privacy)

### Special Features
- [Broadcast Lists & Stories](#broadcast-lists--stories)
- [Newsletter Support](#newsletter-support)
- [Custom Functionality](#custom-functionality)

## Connecting Account

### Connect with QR Code

```javascript
const { default: makeWASocket, Browsers } = require("ye-bail")

const sock = makeWASocket({
    browser: Browsers.ubuntu('My App'),
    printQRInTerminal: true
})
```

### Connect with Pairing Code

Phone number format: `6299999999999` (no +, (), or -)

```javascript
const sock = makeWASocket({
    printQRInTerminal: false
})

if (!sock.authState.creds.registered) {
    const code = await sock.requestPairingCode('6299999999999')
    console.log('Pairing Code:', code)
}
```

### Custom Pairing Code

```javascript
const pairingCode = await sock.requestPairingCode('6299999999999', 'YEMOBYTE')
console.log('Custom Pairing Code:', pairingCode)
```

### Receive Full History

```javascript
const { default: makeWASocket, Browsers } = require("ye-bail")

const sock = makeWASocket({
    browser: Browsers.macOS('Desktop'),
    syncFullHistory: true
})
```

## Important Notes About Socket Config

### Caching Group Metadata (Recommended)

```javascript
const NodeCache = require('node-cache')
const groupCache = new NodeCache({ stdTTL: 5 * 60 })

const sock = makeWASocket({
    cachedGroupMetadata: async (jid) => groupCache.get(jid)
})

sock.ev.on('groups.update', async ([event]) => {
    const metadata = await sock.groupMetadata(event.id)
    groupCache.set(event.id, metadata)
})
```

### Improve Retry System & Decrypt Poll Votes

Use `fetchMessageHistory` for better message recovery and handling poll decryption:

```javascript
const history = await sock.fetchMessageHistory(100, oldestMsgKey, oldestMsgTimestamp)
```

### Receive Notifications in WhatsApp App

```javascript
const sock = makeWASocket({
    markOnlineOnConnect: false
})
```

### Save Auth Info

```javascript
const { useMultiFileAuthState } = require('ye-bail')

const { state, saveCreds } = await useMultiFileAuthState('auth_info_ye_bail')

const sock = makeWASocket({ auth: state })

sock.ev.on('creds.update', saveCreds)
```

## Sending Messages

### Non-Media Messages

#### Text Message

```javascript
await sock.sendMessage(jid, { text: 'Hello World' })
```

#### Text with AI Icon

```javascript
await sock.sendMessage(jid, { text: 'Hello World', ai: true })
```

#### Quote Message

```javascript
await sock.sendMessage(jid, { text: 'Reply' }, { quoted: message })
```

#### Mention User

```javascript
const mention = '6281234567890@s.whatsapp.net'
await sock.sendMessage(jid, { 
    text: `Hello @${mention.split('@')[0]}`,
    mentions: [mention]
})
```

#### Forward Messages

```javascript
await sock.sendMessage(jid, { forward: message })
```

#### Location Message

```javascript
await sock.sendMessage(jid, {
    location: {
        degreesLatitude: -6.2088,
        degreesLongitude: 106.8456,
        name: 'Jakarta, Indonesia'
    }
})
```

#### Live Location Message

```javascript
await sock.sendMessage(jid, {
    liveLocationMessage: {
        degreesLatitude: -6.2088,
        degreesLongitude: 106.8456,
        accuracyInMeters: 100,
        speedInMps: 0,
        degreesClockwiseFromMagneticNorth: 0,
        caption: 'Current Location',
        sequenceNumber: 0,
        timeOffset: 0
    }
})
```

#### Contact Message

```javascript
await sock.sendMessage(jid, {
    contacts: {
        displayName: 'John Doe',
        contacts: [
            {
                displayName: 'John Doe',
                vcard: `BEGIN:VCARD
VERSION:3.0
FN:John Doe
TEL:+1234567890
END:VCARD`
            }
        ]
    }
})
```

#### Reaction Message

```javascript
await sock.sendMessage(jid, {
    react: {
        text: '👍',
        key: messageKey
    }
})
```

#### Pin Message

```javascript
await sock.sendMessage(jid, {
    pin: {
        key: messageKey,
        type: 1
    }
})
```

#### Keep Message

```javascript
await sock.sendMessage(jid, {
    keep: {
        key: messageKey,
        value: true
    }
})
```

#### Poll Message

```javascript
await sock.sendMessage(jid, {
    poll: {
        name: 'What is your favorite color?',
        values: ['Red', 'Blue', 'Green'],
        selectableCount: 1
    }
})
```

#### Poll Result Message

```javascript
await sock.sendMessage(jid, {
    pollResult: {
        name: 'Poll Question',
        values: [
            ['Option 1', '100'],
            ['Option 2', '50']
        ]
    }
})
```

#### Call Message

```javascript
await sock.sendMessage(jid, {
    call: {
        isVideo: false,
        callId: 'call_123'
    }
})
```

#### Event Message

```javascript
const crypto = require('crypto')

await sock.sendMessage(jid, {
    event: {
        name: 'Event Name',
        locationName: 'Location',
        startTime: Math.floor(Date.now() / 1000),
        messageSecret: crypto.randomBytes(32)
    }
})
```

#### Order Message

```javascript
await sock.sendMessage(jid, {
    order: {
        itemCount: 2,
        status: 'pending',
        surface: 'CATALOG',
        orderTitle: 'My Order',
        message: 'Order #12345'
    }
})
```

#### Product Message

```javascript
await sock.sendMessage(jid, {
    product: {
        productImage: { url: 'https://example.com/product.jpg' },
        productId: '123456',
        title: 'Product Name',
        description: 'Description',
        currencyCode: 'IDR',
        priceAmount1000: '100000',
        retailerId: 'Retailer',
        url: 'https://example.com'
    },
    businessOwnerJid: '6299999999999@s.whatsapp.net',
    caption: 'Check this product'
})
```

#### Payment Message

```javascript
await sock.sendMessage(jid, {
    requestPayment: {
        amount: 100000,
        currency: 'IDR',
        from: '6281234567890@s.whatsapp.net',
        expiry: Date.now() + 3600000,
        note: 'Payment for product'
    }
})
```

#### Payment Invite Message

```javascript
await sock.sendMessage(jid, {
    paymentInviteMessage: {
        serviceType: 'PAYMENT',
        expiryTimestamp: Date.now() + 3600000
    }
})
```

#### Admin Invite Message

```javascript
await sock.sendMessage(jid, {
    adminInviteMessage: {
        groupJid: groupId,
        inviteCode: inviteCode,
        inviteExpiration: Date.now() + 604800000
    }
})
```

#### Group Invite Message

```javascript
await sock.sendMessage(jid, {
    groupInviteMessage: {
        groupJid: groupId,
        inviteCode: inviteCode,
        inviteExpiration: Date.now() + 604800000,
        groupName: 'Group Name'
    }
})
```

#### Sticker Pack Message

```javascript
await sock.sendMessage(jid, {
    stickerPack: {
        name: 'Pack Name',
        publisher: 'Publisher',
        description: 'Description',
        cover: Buffer.from([...]),
        stickers: [
            {
                sticker: { url: 'https://example.com/sticker.webp' },
                emojis: ['❤', '😍']
            }
        ]
    }
})
```

#### Share Phone Number Message

```javascript
await sock.sendMessage(jid, {
    sharePhoneNumber: {
        displayName: 'John Doe',
        phoneNumber: '+1234567890'
    }
})
```

#### Request Phone Number Message

```javascript
await sock.sendMessage(jid, {
    requestPhoneNumber: {
        text: 'Please share your phone number'
    }
})
```

#### Buttons Reply Message

```javascript
await sock.sendMessage(jid, {
    text: 'Which option?',
    footer: 'Select one',
    buttons: [
        {
            buttonId: 'id1',
            buttonText: { displayText: 'Option 1' },
            type: 1
        },
        {
            buttonId: 'id2',
            buttonText: { displayText: 'Option 2' },
            type: 1
        }
    ]
})
```

#### Buttons List Message

```javascript
await sock.sendMessage(jid, {
    text: 'Select an option',
    footer: 'Choose wisely',
    title: 'Options',
    buttonText: 'View',
    sections: [
        {
            title: 'Section 1',
            rows: [
                {
                    title: 'Option 1',
                    description: 'Description 1',
                    rowId: 'option_1'
                },
                {
                    title: 'Option 2',
                    description: 'Description 2',
                    rowId: 'option_2'
                }
            ]
        }
    ]
})
```

#### Buttons Product List Message

```javascript
await sock.sendMessage(jid, {
    text: 'Products',
    productListMessage: {
        title: 'Catalog',
        products: ['product_id_1', 'product_id_2']
    }
})
```

#### Buttons Cards Message

```javascript
await sock.sendMessage(jid, {
    text: 'Card Message',
    title: 'Title',
    cards: [
        {
            image: { url: 'https://example.com/image.jpg' },
            title: 'Card Title',
            body: 'Card Body',
            footer: 'Card Footer',
            buttons: [
                {
                    name: 'quick_reply',
                    buttonParamsJson: JSON.stringify({
                        display_text: 'Reply',
                        id: 'id1'
                    })
                }
            ]
        }
    ]
})
```

#### Buttons Template Message

```javascript
await sock.sendMessage(jid, {
    text: 'Template message',
    footer: 'Footer',
    templateButtons: [
        {
            index: 1,
            urlButton: {
                displayText: 'Visit',
                url: 'https://example.com'
            }
        },
        {
            index: 2,
            callButton: {
                displayText: 'Call',
                phoneNumber: '+628123456789'
            }
        },
        {
            index: 3,
            quickReplyButton: {
                displayText: 'Reply',
                id: 'reply_id'
            }
        }
    ]
})
```

#### Buttons Interactive Message

```javascript
await sock.sendMessage(jid, {
    interactiveMessage: {
        body: { text: 'Message body' },
        footer: { text: 'Footer' },
        nativeFlowMessage: {
            buttons: [
                {
                    name: 'quick_reply',
                    buttonParamsJson: JSON.stringify({
                        display_text: 'Quick Reply',
                        id: 'reply_id'
                    })
                },
                {
                    name: 'cta_url',
                    buttonParamsJson: JSON.stringify({
                        display_text: 'Open Link',
                        url: 'https://example.com'
                    })
                }
            ]
        }
    }
})
```

#### Buttons Interactive Message PIX

```javascript
await sock.sendMessage(jid, {
    interactiveMessage: {
        body: { text: 'Payment via PIX' },
        nativeFlowMessage: {
            buttons: [
                {
                    name: 'pix',
                    buttonParamsJson: JSON.stringify({
                        display_text: 'Pay with PIX',
                        pix_key: 'your_pix_key'
                    })
                }
            ]
        }
    }
})
```

#### Buttons Interactive Message PAY

```javascript
await sock.sendMessage(jid, {
    interactiveMessage: {
        body: { text: 'Secure Payment' },
        nativeFlowMessage: {
            buttons: [
                {
                    name: 'payment',
                    buttonParamsJson: JSON.stringify({
                        display_text: 'Pay Now',
                        currency: 'USD',
                        amount: '100'
                    })
                }
            ]
        }
    }
})
```

#### Status Mentions Message

```javascript
await sock.sendMessage(jid, {
    statusMentions: {
        text: 'Check my status',
        mentions: ['6281234567890@s.whatsapp.net']
    }
})
```

#### Shop Message

```javascript
await sock.sendMessage(jid, {
    shop: {
        title: 'My Shop',
        description: 'Shop description',
        products: []
    }
})
```

#### Collection Message

```javascript
await sock.sendMessage(jid, {
    collection: {
        name: 'Collection Name',
        products: []
    }
})
```

#### AI Icon Feature

```javascript
await sock.sendMessage(jid, { 
    text: 'AI generated message',
    ai: true
})
```

#### Sending with Link Preview

```javascript
await sock.sendMessage(jid, {
    text: 'Check this link: https://example.com',
    linkPreview: true
})
```

### Media Messages

#### Gif Message

```javascript
await sock.sendMessage(jid, {
    video: { url: './video.gif' },
    caption: 'GIF message',
    gifPlayback: true
})
```

#### Video Message

```javascript
await sock.sendMessage(jid, {
    video: { url: './video.mp4' },
    caption: 'Video'
})
```

#### Audio Message

```javascript
await sock.sendMessage(jid, {
    audio: { url: './audio.mp3' },
    mimetype: 'audio/mp4',
    ptt: false
})
```

#### Image Message

```javascript
await sock.sendMessage(jid, {
    image: { url: './image.png' },
    caption: 'Photo'
})
```

#### Album Message

```javascript
await sock.sendMessage(jid, {
    album: [
        { image: { url: 'https://example.com/image1.jpg' }, caption: 'Image 1' },
        { image: { url: 'https://example.com/image2.jpg' }, caption: 'Image 2' }
    ]
})
```

#### PTV Video Message

```javascript
await sock.sendMessage(jid, {
    ptvMessage: {
        video: { url: './video.mp4' },
        caption: 'View Once Video'
    }
})
```

#### ViewOnce Message

```javascript
await sock.sendMessage(jid, {
    viewOnce: true,
    image: { url: 'https://example.com/image.jpg' },
    caption: 'Disappears after viewing'
})
```

## Newsletter Support

### Connect

```javascript
const { makeNewsletterSocket, useMultiFileAuthState } = require('ye-bail')

async function connect() {
    const { state, saveCreds } = await useMultiFileAuthState('auth')
    const sock = makeNewsletterSocket({
        auth: state,
        printQRInTerminal: true
    })
    sock.ev.on('creds.update', saveCreds)
}
```

### Newsletter Functions

```javascript
const jid = '120363423175289826@newsletter'

await sock.newsletterFollow(jid)
await sock.newsletterUnfollow(jid)
await sock.newsletterMute(jid)
await sock.newsletterUnmute(jid)

const metadata = await sock.newsletterMetadata('INVITE', '0029Vb7MpjO9RZAXcgJe0n0W')
const messages = await sock.newsletterFetchMessages('jid', jid, 10, 100)
const updates = await sock.newsletterFetchUpdates(jid, 10, 100, 0)

await sock.newsletterCreate('Newsletter', 'Description', 'ALL')
await sock.newsletterUpdateName(jid, 'New Name')
await sock.newsletterUpdatePicture(jid, { url: './image.jpg' })

await sock.newsletterPromote(jid, 'user_lid')
await sock.newsletterDemote(jid, 'user_lid')
await sock.newsletterReactMessage(jid, 'server_id', '👍')
await sock.newsletterDelete(jid)
```

## Modifying Messages

### Delete Messages (for everyone)

```javascript
await sock.sendMessage(jid, {
    delete: messageKey
})
```

### Edit Messages

```javascript
await sock.sendMessage(jid, {
    edit: messageKey,
    text: 'Edited message text'
})
```

## Manipulating Media Messages

### Thumbnail in Media Messages

```javascript
const fs = require('fs')
const jimp = require('jimp')

const image = await jimp.read('./image.jpg')
const thumbnail = await image.resize(100, 100).getBuffer('image/jpeg')

await sock.sendMessage(jid, {
    image: { url: './image.jpg' },
    jpegThumbnail: thumbnail,
    caption: 'Photo with thumbnail'
})
```

### Downloading Media Messages

```javascript
const { downloadContentFromMessage } = require('ye-bail')

const mediaMessage = message.message?.imageMessage
if (mediaMessage) {
    const stream = await downloadContentFromMessage(mediaMessage, 'image')
    const chunks = []
    stream.on('data', chunk => chunks.push(chunk))
    stream.on('end', () => {
        const buffer = Buffer.concat(chunks)
        require('fs').writeFileSync('./downloaded.jpg', buffer)
    })
}
```

### Re-upload Media Message to WhatsApp

```javascript
const { generateWAMessageContent } = require('ye-bail')

const mediaContent = await generateWAMessageContent({
    image: { url: './image.jpg' }
}, {
    upload: sock.waUploadToServer
})

await sock.sendMessage(jid, mediaContent)
```

## Reading Messages

### Reading Messages

```javascript
await sock.readMessages([messageKey])
```

### Update Presence

```javascript
await sock.sendPresenceUpdate('available', jid)
await sock.sendPresenceUpdate('unavailable', jid)
await sock.sendPresenceUpdate('typing', jid)
```

## Modifying Chats

### Archive a Chat

```javascript
await sock.chatModify({
    archive: true,
    noChange: false
}, jid)
```

### Mute/Unmute a Chat

```javascript
await sock.chatModify({
    mute: 8 * 60 * 60 * 1000
}, jid)

await sock.chatModify({
    mute: null
}, jid)
```

### Mark a Chat Read/Unread

```javascript
await sock.chatModify({
    markRead: true
}, jid)

await sock.chatModify({
    markRead: false
}, jid)
```

### Delete a Message for Me

```javascript
await sock.chatModify({
    deleteMediaMessage: messageKey
}, jid)
```

### Delete a Chat

```javascript
await sock.chatModify({
    delete: true
}, jid)
```

### Star/Unstar a Message

```javascript
await sock.chatModify({
    star: messageKey
}, jid)

await sock.chatModify({
    unstar: messageKey
}, jid)
```

### Disappearing Messages

```javascript
await sock.groupToggleEphemeral(groupJid, 24 * 60 * 60)
```

### Clear Messages

```javascript
await sock.chatModify({
    clearChat: true
}, jid)
```

## User Queries

### Check If ID Exists in WhatsApp

```javascript
const jids = ['6281234567890@s.whatsapp.net', '6281234567891@s.whatsapp.net']
const onWhatsApp = await sock.onWhatsApp(...jids)
console.log(onWhatsApp)
```

### Fetch Status

```javascript
const statuses = await sock.fetchStatus('6281234567890@s.whatsapp.net')
console.log(statuses)
```

### Fetch Profile Picture (groups too)

```javascript
const pic = await sock.profilePictureUrl(jid)
console.log(pic)
```

### Fetch Business Profile

```javascript
const businessProfile = await sock.getBusinessProfile(jid)
console.log(businessProfile)
```

### Fetch Someone's Presence (if they're typing or online)

```javascript
await sock.presenceSubscribe(jid)

sock.ev.on('presence.update', (presence) => {
    console.log(presence)
})
```

## Change Profile

### Change Profile Status

```javascript
await sock.updateProfileStatus('I am online now!')
```

### Change Profile Name

```javascript
await sock.updateProfileName('New Name')
```

### Change Display Picture (groups too)

```javascript
await sock.updateProfilePicture(jid, { url: './image.jpg' })
```

### Remove display picture (groups too)

```javascript
await sock.removeProfilePicture(jid)
```

## Groups

### Create a Group

```javascript
const group = await sock.groupCreate('Group Name', [
    '6281234567890@s.whatsapp.net',
    '6281234567891@s.whatsapp.net'
])
```

### Add/Remove or Demote/Promote

```javascript
await sock.groupParticipantsUpdate(groupJid, ['6281234567890@s.whatsapp.net'], 'add')
await sock.groupParticipantsUpdate(groupJid, ['6281234567890@s.whatsapp.net'], 'remove')
await sock.groupParticipantsUpdate(groupJid, ['6281234567890@s.whatsapp.net'], 'promote')
await sock.groupParticipantsUpdate(groupJid, ['6281234567890@s.whatsapp.net'], 'demote')
```

### Change Subject (name)

```javascript
await sock.groupUpdateSubject(groupJid, 'New Group Name')
```

### Change Description

```javascript
await sock.groupUpdateDescription(groupJid, 'Group Description')
```

### Change Settings

```javascript
await sock.groupSettingUpdate(groupJid, 'announcement')
await sock.groupSettingUpdate(groupJid, 'not_announcement')
await sock.groupSettingUpdate(groupJid, 'locked')
await sock.groupSettingUpdate(groupJid, 'unlocked')
```

### Leave a Group

```javascript
await sock.groupLeave(groupJid)
```

### Get Invite Code

```javascript
const code = await sock.groupInviteCode(groupJid)
console.log(code)
```

### Revoke Invite Code

```javascript
await sock.groupRevokeInvite(groupJid)
```

### Join Using Invitation Code

```javascript
const groupId = await sock.groupAcceptInvite('INVITE_CODE')
```

### Get Group Info by Invite Code

```javascript
const groupInfo = await sock.groupGetInviteInfo('INVITE_CODE')
```

### Query Metadata (participants, name, description...)

```javascript
const metadata = await sock.groupMetadata(groupJid)
console.log(metadata.subject)
console.log(metadata.participants)
console.log(metadata.desc)
```

### Join using groupInviteMessage

```javascript
sock.ev.on('messages.upsert', async (m) => {
    const msg = m.messages[0]
    if (msg.message?.groupInviteMessage) {
        const inviteMessage = msg.message.groupInviteMessage
        const groupId = await sock.groupAcceptInvite(inviteMessage.inviteCode)
    }
})
```

### Get Request Join List

```javascript
const requestList = await sock.groupRequestParticipantsList(groupJid)
```

### Approve/Reject Request Join

```javascript
await sock.groupRequestParticipantsUpdate(groupJid, ['6281234567890@s.whatsapp.net'], 'approve')
await sock.groupRequestParticipantsUpdate(groupJid, ['6281234567890@s.whatsapp.net'], 'reject')
```

### Get All Participating Groups Metadata

```javascript
const allGroups = await sock.groupFetchAllParticipating()
```

### Toggle Ephemeral

```javascript
await sock.groupToggleEphemeral(groupJid, 24 * 60 * 60)
```

### Change Add Mode

```javascript
await sock.groupMemberAddMode(groupJid, 'all')
await sock.groupMemberAddMode(groupJid, 'admin_add')
```

## Privacy

### Block/Unblock User

```javascript
await sock.updateBlockStatus(jid, 'block')
await sock.updateBlockStatus(jid, 'unblock')
```

### Get Privacy Settings

```javascript
const settings = await sock.fetchPrivacySettings(true)
console.log(settings)
```

### Get BlockList

```javascript
const blocklist = await sock.fetchBlocklist()
```

### Update LastSeen Privacy

```javascript
await sock.updateLastSeenPrivacy('all')
await sock.updateLastSeenPrivacy('contacts')
await sock.updateLastSeenPrivacy('contact_blacklist')
await sock.updateLastSeenPrivacy('none')
```

### Update Online Privacy

```javascript
await sock.updateOnlinePrivacy('all')
```

### Update Profile Picture Privacy

```javascript
await sock.updateProfilePicturePrivacy('all')
```

### Update Status Privacy

```javascript
await sock.updateStatusPrivacy('all')
```

### Update Read Receipts Privacy

```javascript
await sock.updateReadReceiptsPrivacy('all')
```

### Update Groups Add Privacy

```javascript
await sock.updateGroupsAddPrivacy('all')
```

### Update Default Disappearing Mode

```javascript
const modes = {
    remove: 0,
    '24h': 86400,
    '7d': 604800,
    '90d': 7776000
}

await sock.updateDefaultDisappearingMode(modes['24h'])
```

## Broadcast Lists & Stories

### Send Broadcast & Stories

```javascript
const broadcastList = [
    '6281234567890@s.whatsapp.net',
    '6281234567891@s.whatsapp.net'
]

await sock.sendMessage('status@broadcast', {
    text: 'This is a status'
})

for (const jid of broadcastList) {
    await sock.sendMessage(jid, {
        text: 'Broadcast message'
    })
}
```

### Query a Broadcast List's Recipients & Name

```javascript
sock.ev.on('chats.upsert', (chats) => {
    for (const chat of chats) {
        if (chat.id.includes('broadcast')) {
            console.log('Broadcast:', chat)
        }
    }
})
```

## Custom Functionality

### Enabling Debug Level in Baileys Logs

```javascript
const { default: makeWASocket, logger: P } = require('ye-bail')

const sock = makeWASocket({
    logger: P({ level: 'debug' })
})
```

### How WhatsApp Communicate With Us

WhatsApp uses WebSocket to communicate with clients through a binary protocol:

1. **Connection**: Client connects to WhatsApp servers via WebSocket
2. **Authentication**: Client authenticates using stored credentials or QR code
3. **Frame Format**: Messages are sent as binary frames with specific structure
4. **Events**: Server sends events for messages, presence, and other updates

### Register a Callback for WebSocket Events

```javascript
sock.ws.on('CB:message', (node) => {
    console.log('Message node:', node)
})

sock.ws.on('CB:notification', (node) => {
    console.log('Notification node:', node)
})

sock.ws.on('CB:presence', (node) => {
    console.log('Presence node:', node)
})

sock.ws.on('CB:ack', (node) => {
    console.log('Acknowledgement node:', node)
})
```

## License

Distributed under the GPL-3.0 License. See [LICENSE](LICENSE) for more information.

---

Forked and modified by yemobyte.  
ye-bail - Modern WhatsApp Web API
