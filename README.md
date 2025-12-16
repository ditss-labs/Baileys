# ye-bail - WhatsApp Web API Library

A comprehensive WhatsApp Web automation library built on TypeScript, providing a complete API for interacting with WhatsApp Web through protocol bindings.

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

## Table of Contents

- [Account Connection](#account-connection)
- [Send Messages](#send-messages)
- [Newsletter Support](#newsletter-support)
- [Privacy Settings](#privacy-settings)
- [Group Management](#group-management)
- [Custom Functionality](#custom-functionality)

## Account Connection

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

## Important Configuration

### Group Metadata Caching

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

### Receive Notifications in WhatsApp App

```javascript
const sock = makeWASocket({
    markOnlineOnConnect: false
})
```

## Send Messages

### Text Message

```javascript
await sock.sendMessage(jid, { text: 'Hello World' })
```

### Text with AI Icon

```javascript
await sock.sendMessage(jid, { text: 'Hello World', ai: true })
```

### Quoted Message

```javascript
await sock.sendMessage(jid, { text: 'Reply' }, { quoted: message })
```

### Media Messages

**Image:**
```javascript
await sock.sendMessage(jid, {
    image: { url: './image.png' },
    caption: 'Photo'
})
```

**Video:**
```javascript
await sock.sendMessage(jid, {
    video: { url: './video.mp4' },
    caption: 'Video'
})
```

**Audio:**
```javascript
await sock.sendMessage(jid, {
    audio: { url: './audio.mp3' },
    mimetype: 'audio/mp4',
    ptt: false
})
```

**Document:**
```javascript
await sock.sendMessage(jid, {
    document: { url: './document.pdf' },
    mimetype: 'application/pdf',
    fileName: 'document.pdf'
})
```

**Sticker:**
```javascript
await sock.sendMessage(jid, {
    sticker: { url: './sticker.webp' }
})
```

### Interactive Buttons

```javascript
await sock.sendMessage(jid, {
    text: 'Choose an option:',
    footer: 'Footer text',
    buttons: [
        {
            buttonId: 'id1',
            buttonText: { displayText: 'Button 1' },
            type: 1
        },
        {
            buttonId: 'id2',
            buttonText: { displayText: 'Button 2' },
            type: 1
        }
    ]
})
```

### Button List Message

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

### Native Flow Buttons

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

### Interactive Buttons (Advanced)

```javascript
await sock.sendMessage(jid, {
    text: 'Interactive message',
    title: 'Title',
    subtitle: 'Subtitle',
    footer: 'Footer',
    interactiveButtons: [
        {
            name: 'quick_reply',
            buttonParamsJson: JSON.stringify({
                display_text: 'Reply',
                id: 'reply_id'
            })
        },
        {
            name: 'cta_url',
            buttonParamsJson: JSON.stringify({
                display_text: 'Visit',
                url: 'https://example.com'
            })
        },
        {
            name: 'cta_copy',
            buttonParamsJson: JSON.stringify({
                display_text: 'Copy',
                copy_code: 'CODE123'
            })
        }
    ]
})
```

### Button Cards

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

### Product Message

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

### Template Buttons

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

### Contact Message

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

### Location Message

```javascript
await sock.sendMessage(jid, {
    location: {
        degreesLatitude: -6.2088,
        degreesLongitude: 106.8456,
        name: 'Jakarta, Indonesia'
    }
})
```

### Album Message

```javascript
await sock.sendMessage(jid, {
    album: [
        { image: { url: 'https://example.com/image1.jpg' }, caption: 'Image 1' },
        { image: { url: 'https://example.com/image2.jpg' }, caption: 'Image 2' }
    ]
})
```

### Poll Result Message

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

### View Once Message

```javascript
await sock.sendMessage(jid, {
    viewOnce: true,
    image: { url: 'https://example.com/image.jpg' },
    caption: 'Disappears after viewing'
})
```

### Order Message

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

### Payment Request

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

### Event Message

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

### Sticker Pack

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

### Group Status Message

```javascript
await sock.sendMessage(jid, {
    groupStatusMessage: {
        text: "Hello World"
    }
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

## Privacy Settings

### Block/Unblock

```javascript
await sock.updateBlockStatus(jid, 'block')
await sock.updateBlockStatus(jid, 'unblock')
```

### Get Settings

```javascript
const settings = await sock.fetchPrivacySettings(true)
const blocklist = await sock.fetchBlocklist()
```

### Update Privacy Options

```javascript
await sock.updateLastSeenPrivacy('all')
await sock.updateOnlinePrivacy('all')
await sock.updateProfilePicturePrivacy('all')
await sock.updateStatusPrivacy('all')
await sock.updateReadReceiptsPrivacy('all')
await sock.updateGroupsAddPrivacy('all')
```

Options: `'all'`, `'contacts'`, `'contact_blacklist'`, `'none'`

### Disappearing Messages

```javascript
const modes = {
    remove: 0,
    '24h': 86400,
    '7d': 604800,
    '90d': 7776000
}

await sock.updateDefaultDisappearingMode(modes['24h'])
```

## Group Management

### Get Group Info

```javascript
const metadata = await sock.groupMetadata(groupJid)
console.log(metadata.subject)
console.log(metadata.participants)
```

### Create Group

```javascript
const group = await sock.groupCreate('Group Name', [
    '6281234567890@s.whatsapp.net',
    '6281234567891@s.whatsapp.net'
])
```

### Update Group

```javascript
await sock.groupUpdateSubject(groupJid, 'New Name')
await sock.groupUpdateDescription(groupJid, 'Description')
await sock.groupUpdatePicture(groupJid, { url: './image.jpg' })
```

### Manage Members

```javascript
await sock.groupParticipantsUpdate(groupJid, ['6281234567890@s.whatsapp.net'], 'add')
await sock.groupParticipantsUpdate(groupJid, ['6281234567890@s.whatsapp.net'], 'remove')
await sock.groupParticipantsUpdate(groupJid, ['6281234567890@s.whatsapp.net'], 'promote')
await sock.groupParticipantsUpdate(groupJid, ['6281234567890@s.whatsapp.net'], 'demote')
```

### Group Settings

```javascript
await sock.groupSettingUpdate(groupJid, 'announcement')
await sock.groupSettingUpdate(groupJid, 'not_announcement')
await sock.groupSettingUpdate(groupJid, 'locked')
await sock.groupSettingUpdate(groupJid, 'unlocked')
```

## Custom Functionality

### Debug Logging

```javascript
const { default: makeWASocket, logger: P } = require('ye-bail')

const sock = makeWASocket({
    logger: P({ level: 'debug' })
})
```

### WebSocket Events

```javascript
sock.ws.on('CB:message', (node) => {
    console.log('Message:', node)
})

sock.ws.on('CB:notification', (node) => {
    console.log('Notification:', node)
})

sock.ws.on('CB:presence', (node) => {
    console.log('Presence:', node)
})
```

### WhatsApp Protocol

Frame structure:
```javascript
{
    tag: 'message',
    attrs: { id: '...' },
    content: [ ... ]
}
```

Common tags: `message`, `ib`, `ack`, `presence`, `notification`

## License

Distributed under the GPL-3.0 License. See [LICENSE](LICENSE) for more information.

---

Forked and modified by yemobyte.  
ye-bail - Modern WhatsApp Web API
