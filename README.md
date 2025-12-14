
## Warning

This project is not affiliated, associated, authorized, endorsed by, or in any way officially connected with WhatsApp or any of its subsidiaries. The official WhatsApp website is at whatsapp.com.

The maintainers of ye-bail do not support the use of this application to violate WhatsApp's Terms of Service. We emphasize personal responsibility for users to use fairly and responsibly.

Use wisely. Avoid spam. Do not use excessive automation.

## Installation

### Stable Version (Recommended)

```bash
npm i github:yemobyte/ye-bail
```

### Edge Version (Latest Features)

```bash
npm i github:yemobyte/ye-bail
```

or

```bash
yarn add github:yemobyte/ye-bail
```

### Import in Code

```javascript
const { default: makeWASocket } = require("ye-bail")
import makeWASocket from "ye-bail"
```

## Quick Start

### Basic Example

```javascript
const { default: makeWASocket, DisconnectReason, useMultiFileAuthState } = require('ye-bail')
const { Boom } = require('@hapi/boom')

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_ye_bail')
    
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true,
        browser: ['ye-bail', 'Desktop', '3.0']
    })

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update
        if(connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut
            console.log('Connection closed due to ', lastDisconnect.error, ', reconnecting ', shouldReconnect)
            if(shouldReconnect) {
                connectToWhatsApp()
            }
        } else if(connection === 'open') {
            console.log('Successfully connected to WhatsApp!')
        }
    })

    sock.ev.on('messages.upsert', async ({ messages }) => {
        for (const m of messages) {
            if (!m.message) continue
            
            console.log('New message:', JSON.stringify(m, undefined, 2))
            
            await sock.sendMessage(m.key.remoteJid!, { 
                text: 'Hello! I am a WhatsApp bot using ye-bail' 
            })
        }
    })

    sock.ev.on('creds.update', saveCreds)
}

connectToWhatsApp()
```

## Table of Contents

Disclaimer: This documentation is still in beta, so there may be errors or inconsistencies.

## Account Connection

WhatsApp provides a multi-device API that allows ye-bail to authenticate as a secondary WhatsApp client via QR code or pairing code.

### Connect with QR Code

> [!TIP]  
> Adjust browser name using the `Browsers` constant. See available configurations below.

```javascript
const { default: makeWASocket, Browsers } = require("ye-bail")

const sock = makeWASocket({
    browser: Browsers.ubuntu('My App'),
    printQRInTerminal: true
})
```

After successful connection, QR code will appear in terminal. Scan with WhatsApp on your phone to login.

### Connect with Pairing Code

> [!IMPORTANT]  
> Pairing code is not part of Mobile API. This allows WhatsApp Web connection without QR code, but only one device. See [WhatsApp FAQ](https://faq.whatsapp.com/).

Phone number must be without `+`, `()`, or `-`, and include country code.

```javascript
const { default: makeWASocket } = require("ye-bail")

const sock = makeWASocket({
    printQRInTerminal: false
})

if (!sock.authState.creds.registered) {
    const number = '6299999999999'
    const code = await sock.requestPairingCode(number)
    console.log('Pairing Code:', code)
}
```

### Receive Full History

1. Set `syncFullHistory` to `true`.
2. By default, ye-bail uses Chrome configuration. For desktop-like connection (for more message history), use:

```javascript
const { default: makeWASocket, Browsers } = require("ye-bail")

const sock = makeWASocket({
    browser: Browsers.macOS('Desktop'),
    syncFullHistory: true
})
```

## Important Socket Configuration Notes

### Group Metadata Caching (Recommended)

For group usage, implement group metadata caching:

```javascript
const { default: makeWASocket } = require("ye-bail")
const NodeCache = require('node-cache')

const groupCache = new NodeCache({ stdTTL: 5 * 60, useClones: false })

const sock = makeWASocket({
    cachedGroupMetadata: async (jid) => groupCache.get(jid)
})

sock.ev.on('groups.update', async ([event]) => {
    const metadata = await sock.groupMetadata(event.id)
    groupCache.set(event.id, metadata)
})

sock.ev.on('group-participants.update', async (event) => {
    const metadata = await sock.groupMetadata(event.id)
    groupCache.set(event.id, metadata)
})
```

### Fix Retry System & Poll Vote Decryption

Improve message sending and poll vote decryption with store:

```javascript
const sock = makeWASocket({
    getMessage: async (key) => await getMessageFromStore(key)
})
```

### Receive Notifications in WhatsApp App

Disable online status to receive notifications:

```javascript
const sock = makeWASocket({
    markOnlineOnConnect: false
})
```

## Save Auth Info

Avoid repeated QR code scanning by saving credentials:

```javascript
const makeWASocket = require("ye-bail").default
const { useMultiFileAuthState } = require("ye-bail")

async function connect() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_ye_bail')
    const sock = makeWASocket({ auth: state })
    sock.ev.on('creds.update', saveCreds)
}

connect()
```

> [!IMPORTANT]  
> `useMultiFileAuthState` saves auth status in folder. For production, use SQL/No-SQL database and manage key updates carefully.

## Newsletter Support

ye-bail supports WhatsApp Newsletter (Channel) features. Use `makeNewsletterSocket` to access newsletter functionality.

### Connect with Newsletter Socket

```javascript
const { makeNewsletterSocket, useMultiFileAuthState } = require('ye-bail')

async function connect() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_ye_bail')
    const sock = makeNewsletterSocket({
        auth: state,
        printQRInTerminal: true
    })
    
    sock.ev.on('creds.update', saveCreds)
}

connect()
```

### Newsletter Functions

```javascript
const newsletterJid = '120363423175289826@newsletter'

await sock.newsletterFollow(newsletterJid)
await sock.newsletterUnfollow(newsletterJid)
await sock.newsletterMute(newsletterJid)
await sock.newsletterUnmute(newsletterJid)

const metadata = await sock.newsletterMetadata('INVITE', '0029Vb7MpjO9RZAXcgJe0n0W')
const allSubscribed = await sock.newsletterFetchAllSubscribe()

await sock.newsletterCreate('My Newsletter', 'Description', 'ALL')
await sock.newsletterUpdateName(newsletterJid, 'New Name')
await sock.newsletterUpdateDescription(newsletterJid, 'New Description')
await sock.newsletterUpdatePicture(newsletterJid, { url: './image.jpg' })
await sock.newsletterReactionMode(newsletterJid, 'ALL')

const messages = await sock.newsletterFetchMessages('jid', newsletterJid, 10, 100)
const messagesWithSince = await sock.newsletterFetchMessages('invite', '0029Vb7MpjO9RZAXcgJe0n0W', 10, 100, Date.now())
const updates = await sock.newsletterFetchUpdates(newsletterJid, 10, 100, 0)

await sock.newsletterPromote(newsletterJid, 'user_lid')
await sock.newsletterDemote(newsletterJid, 'user_lid')
const adminCount = await sock.newsletterAdminCount(newsletterJid)
const subscribers = await sock.newsletterSubscribers(newsletterJid)

await sock.newsletterReactMessage(newsletterJid, 'server_id', '👍')
await sock.newsletterDelete(newsletterJid)
await sock.newsletterChangeOwner(newsletterJid, 'user_lid')

const channelInfo = await sock.newsletterId('https://whatsapp.com/channel/0029Vb7MpjO9RZAXcgJe0n0W')
console.log(channelInfo)
```

### Check WhatsApp Account

Check if a WhatsApp account is banned or needs official WhatsApp:

```javascript
const result = await sock.checkWhatsApp('6281234567890')
const data = JSON.parse(result)
console.log('Is Banned:', data.isBanned)
console.log('Need Official WA:', data.isNeedOfficialWa)
```

### Group Status Message

Send group status message (group story) to groups:

```javascript
await sock.sendMessage(jid, {
    groupStatusMessage: {
        text: "Hello World"
    }
})

await sock.sendMessage(jid, {
    groupStatusMessage: {
        image: { url: './image.jpg' },
        caption: 'Status dengan gambar'
    }
})

await sock.sendMessage(jid, {
    groupStatusMessage: {
        video: { url: './video.mp4' },
        caption: 'Status dengan video'
    }
})
```

## Send Messages

Send all types of messages with one function.

### Text Message

```javascript
await sock.sendMessage(jid, { text: 'hello world' })
```

### Text Message with AI Icon

```javascript
await sock.sendMessage(jid, { text: 'Hello World', ai: true })
```

### Quoted Message

```javascript
await sock.sendMessage(jid, { text: 'hello world' }, { quoted: message })
```

### Media Messages

```javascript
await sock.sendMessage(jid, { 
    image: { url: './image.png' },
    caption: 'hello world'
})
```

### Buttons Message

Send messages with interactive buttons for quick replies:

```javascript
await sock.sendMessage(jid, {
    text: 'Choose an option:',
    footer: 'Footer text here',
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

### Buttons Flow Message

Send native flow messages with advanced button interactions:

```javascript
await sock.sendMessage(jid, {
    interactiveMessage: {
        body: { text: 'Message body' },
        footer: { text: 'Footer text' },
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
                    name: 'single_select',
                    buttonParamsJson: JSON.stringify({
                        title: 'Select Option',
                        sections: [
                            {
                                title: 'Section 1',
                                rows: [
                                    {
                                        title: 'Option 1',
                                        description: 'Description 1',
                                        id: 'option_1'
                                    }
                                ]
                            }
                        ]
                    })
                }
            ],
            messageParamsJson: JSON.stringify({
                limited_time_offer: {
                    text: 'Limited offer!',
                    url: 'https://example.com',
                    expiration_time: Date.now() + 3600000
                }
            })
        }
    }
})
```

### Interactive Buttons Message

<details>
<summary style="font-weight: bold; cursor: pointer; padding: 8px; border-bottom: 1px solid #eee; margin-bottom: 5px;">Show Example</summary>
<div style="padding: 10px 15px; background: #f9f9f9; border: 1px solid #eee; border-top: none; border-radius: 0 0 5px 5px;">

```javascript
await sock.sendMessage(
    jid,
    {
        text: 'This is an Interactive message!',
        title: 'Hiii',
        subtitle: 'There is a subtitle', 
        footer: 'Hello World!',
        interactiveButtons: [
            {
                name: 'quick_reply',
                buttonParamsJson: JSON.stringify({
                    display_text: 'Click Me!',
                    id: 'your_id'
                })
            },
            {
                name: 'cta_url',
                buttonParamsJson: JSON.stringify({
                    display_text: 'Follow Me',
                    url: 'https://whatsapp.com/channel/0029Vag9VSI2ZjCocqa2lB1y',
                    merchant_url: 'https://whatsapp.com/channel/0029Vag9VSI2ZjCocqa2lB1y'
                })
            },
            {
                name: 'cta_copy',
                buttonParamsJson: JSON.stringify({
                    display_text: 'Click Me!',
                    copy_code: 'https://whatsapp.com/channel/0029Vag9VSI2ZjCocqa2lB1y'
                })
            },
            {
                name: 'cta_call',
                buttonParamsJson: JSON.stringify({
                    display_text: 'Call Me!',
                    phone_number: '6299999999999'
                })
            },
            {
                name: 'cta_catalog',
                buttonParamsJson: JSON.stringify({
                    business_phone_number: '6299999999999'
                })
            },
            {
                name: 'cta_reminder',
                buttonParamsJson: JSON.stringify({
                    display_text: 'Set Reminder'
                })
            },
            {
                name: 'cta_cancel_reminder',
                buttonParamsJson: JSON.stringify({
                    display_text: 'Cancel Reminder'
                })
            },
            {
                name: 'address_message',
                buttonParamsJson: JSON.stringify({
                    display_text: 'Send Address'
                })
            },
            {
                name: 'send_location',
                buttonParamsJson: JSON.stringify({
                    display_text: 'Send Location'
                })
            },
            {
                name: 'open_webview',
                buttonParamsJson: JSON.stringify({
                    title: 'Follow Me!',
                    link: {
                        in_app_webview: true,
                        url: 'https://whatsapp.com/channel/0029Vag9VSI2ZjCocqa2lB1y'
                    }
                })
            },
            {
               name: 'mpm',
               buttonParamsJson: JSON.stringify({
                  product_id: '8816262248471474'
               })
            },
            {
               name: 'wa_payment_transaction_details',
               buttonParamsJson: JSON.stringify({
                  transaction_id: '12345848'
               })
            },
            {
               name: 'automated_greeting_message_view_catalog',
               buttonParamsJson: JSON.stringify({
                   business_phone_number: '6299999999999', 
                   catalog_product_id: '12345'
               })
            },
            {
                name: 'galaxy_message', 
                buttonParamsJson: JSON.stringify({
                  mode: 'published', 
                    flow_message_version: '3', 
                    flow_token: '1:1307913409923914:293680f87029f5a13d1ec5e35e718af3',
                    flow_id: '1307913409923914',
                    flow_cta: 'I Love Plana >\\<', 
                    flow_action: 'navigate', 
                    flow_action_payload: {
                      screen: 'QUESTION_ONE',
                        params: {
                          user_id: '123456789', 
                            referral: 'campaign_xyz'
                        }
                    }, 
                    flow_metadata: {
                      flow_json_version: '201', 
                        data_api_protocol: 'v2', 
                        flow_name: 'Lead Qualification [en]',
                        data_api_version: 'v2', 
                        categories: ['Lead Generation', 'Sales']
                   }
                }) 
            }, 
            {
                name: 'single_select',
                buttonParamsJson: JSON.stringify({
                    title: 'Click Me!',
                    sections: [
                        {
                            title: 'Title 1',
                            highlight_label: 'Highlight label 1',
                            rows: [
                                {
                                    header: 'Header 1',
                                    title: 'Title 1',
                                    description: 'Description 1',
                                    id: 'Id 1'
                                },
                                {
                                    header: 'Header 2',
                                    title: 'Title 2',
                                    description: 'Description 2',
                                    id: 'Id 2'
                                }
                            ]
                        }
                    ]
                })
            }
        ]
    }
)
```

</div>
</details>

### Interactive Buttons with Image

<details>
<summary style="font-weight: bold; cursor: pointer; padding: 8px; border-bottom: 1px solid #eee; margin-bottom: 5px;">Show Example</summary>
<div style="padding: 10px 15px; background: #f9f9f9; border: 1px solid #eee; border-top: none; border-radius: 0 0 5px 5px;">


```javascript
await sock.sendMessage(
    jid, 
    {
       image: { 
          url: 'https://example.jpg' 
       },
       caption: 'Body',
       title: 'Title',
       subtitle: 'Subtitle', 
       footer: 'Footer',
       interactiveButtons: [
           {
               name: 'quick_reply',
               buttonParamsJson: JSON.stringify({
                   display_text: 'DisplayText',
                   id: 'ID1'
               })
           }
       ], 
       hasMediaAttachment: true
    }
)
```

</div>
</details>

### Interactive Buttons with Video

<details>
<summary style="font-weight: bold; cursor: pointer; padding: 8px; border-bottom: 1px solid #eee; margin-bottom: 5px;">Show Example</summary>
<div style="padding: 10px 15px; background: #f9f9f9; border: 1px solid #eee; border-top: none; border-radius: 0 0 5px 5px;">


```javascript
await sock.sendMessage(
    jid, 
    {
        video: { 
          url: 'https://example.mp4' 
       },
       caption: 'Body',
       title: 'Title', 
       subtitle: 'Subtitle', 
       footer: 'Footer',
       interactiveButtons: [
           {
               name: 'quick_reply',
               buttonParamsJson: JSON.stringify({
                   display_text: 'DisplayText',
                   id: 'ID1'
               })
           }
       ], 
       hasMediaAttachment: true
    }
)
```

</div>
</details>

### Interactive Buttons with Document

<details>
<summary style="font-weight: bold; cursor: pointer; padding: 8px; border-bottom: 1px solid #eee; margin-bottom: 5px;">Show Example</summary>
<div style="padding: 10px 15px; background: #f9f9f9; border: 1px solid #eee; border-top: none; border-radius: 0 0 5px 5px;">


```javascript
await sock.sendMessage(
    jid, 
    {
        document: { 
          url: 'https://example.pdf' 
       }, 
       mimetype: 'application/pdf', 
       caption: 'Body',
       title: 'Title',
       subtitle: 'Subtitle', 
       footer: 'Footer',
       interactiveButtons: [
           {
               name: 'quick_reply',
               buttonParamsJson: JSON.stringify({
                   display_text: 'DisplayText',
                   id: 'ID1'
               })
           }
       ], 
       hasMediaAttachment: true
    }
)
```

</div>
</details>

### Interactive Buttons with Location

<details>
<summary style="font-weight: bold; cursor: pointer; padding: 8px; border-bottom: 1px solid #eee; margin-bottom: 5px;">Show Example</summary>
<div style="padding: 10px 15px; background: #f9f9f9; border: 1px solid #eee; border-top: none; border-radius: 0 0 5px 5px;">


```javascript
await sock.sendMessage(
    jid, 
    {
        location: { 
          degreesLatitude: -0,
          degreesLongitude: 0,
          name: 'Hi'
       },
       caption: 'Body',
       title: 'Title', 
       subtitle: 'Subtitle', 
       footer: 'Footer',
       interactiveButtons: [
           {
               name: 'quick_reply',
               buttonParamsJson: JSON.stringify({
                   display_text: 'DisplayText',
                   id: 'ID1'
               })
           }
       ], 
       hasMediaAttachment: true
    }
)
```

</div>
</details>

### Interactive Buttons with Product

<details>
<summary style="font-weight: bold; cursor: pointer; padding: 8px; border-bottom: 1px solid #eee; margin-bottom: 5px;">Show Example</summary>
<div style="padding: 10px 15px; background: #f9f9f9; border: 1px solid #eee; border-top: none; border-radius: 0 0 5px 5px;">


```javascript
await sock.sendMessage(
    jid,
    {
        product: {
            productImage: { 
               url: 'https://example.jpg'
            },
            productId: '836xxx',
            title: 'Title',
            description: 'Description',
            currencyCode: 'IDR',
            priceAmount1000: '283xxx',
            retailerId: 'Retailer Name',
            url: 'https://example.com',
            productImageCount: 1
        },
        businessOwnerJid: '6299999999999@s.whatsapp.net',
        caption: 'Body',
        title: 'Title', 
        subtitle: 'Subtitle', 
        footer: 'Footer',
        interactiveButtons: [
            {
                name: 'quick_reply',
                buttonParamsJson: JSON.stringify({
                    display_text: 'DisplayText',
                    id: 'ID1'
                })
            }
        ], 
        hasMediaAttachment: true
    }
)
```

</div>
</details>

### Newsletter Subscribers

Get list of subscribers for a newsletter:

<details>
<summary style="font-weight: bold; cursor: pointer; padding: 8px; border-bottom: 1px solid #eee; margin-bottom: 5px;">Show Example</summary>
<div style="padding: 10px 15px; background: #f9f9f9; border: 1px solid #eee; border-top: none; border-radius: 0 0 5px 5px;">

```javascript
const subscribers = await sock.newsletterSubscribers('120363423175289826@newsletter')
console.log('Subscribers:', subscribers)
```

</div>
</details>

### Newsletter Fetch Messages

Fetch messages from a newsletter:

<details>
<summary style="font-weight: bold; cursor: pointer; padding: 8px; border-bottom: 1px solid #eee; margin-bottom: 5px;">Show Example</summary>
<div style="padding: 10px 15px; background: #f9f9f9; border: 1px solid #eee; border-top: none; border-radius: 0 0 5px 5px;">

```javascript
const messages = await sock.newsletterFetchMessages('invite', '0029Vb7MpjO9RZAXcgJe0n0W', 10, '100')
const messagesWithSince = await sock.newsletterFetchMessages('invite', '0029Vb7MpjO9RZAXcgJe0n0W', 10, '100', Date.now())
console.log('Messages:', messages)
```

</div>
</details>

### Newsletter Fetch Updates

Fetch updates from a newsletter:

<details>
<summary style="font-weight: bold; cursor: pointer; padding: 8px; border-bottom: 1px solid #eee; margin-bottom: 5px;">Show Example</summary>
<div style="padding: 10px 15px; background: #f9f9f9; border: 1px solid #eee; border-top: none; border-radius: 0 0 5px 5px;">

```javascript
const updates = await sock.newsletterFetchUpdates('120363423175289826@newsletter', 10, '100', '0')
console.log('Updates:', updates)
```

</div>
</details>

### Newsletter React Message

React to a newsletter message:

<details>
<summary style="font-weight: bold; cursor: pointer; padding: 8px; border-bottom: 1px solid #eee; margin-bottom: 5px;">Show Example</summary>
<div style="padding: 10px 15px; background: #f9f9f9; border: 1px solid #eee; border-top: none; border-radius: 0 0 5px 5px;">

```javascript
await sock.newsletterReactMessage('120363423175289826@newsletter', '123456789', '👍')
```

</div>
</details>

### Buttons Message

Send a message with buttons:

<details>
<summary style="font-weight: bold; cursor: pointer; padding: 8px; border-bottom: 1px solid #eee; margin-bottom: 5px;">Show Example</summary>
<div style="padding: 10px 15px; background: #f9f9f9; border: 1px solid #eee; border-top: none; border-radius: 0 0 5px 5px;">

```javascript
const buttons = [
    { buttonId: 'id1', buttonText: { displayText: 'Button 1' }, type: 1 },
    { buttonId: 'id2', buttonText: { displayText: 'Button 2' }, type: 1 }
]

const buttonMessage = {
    text: "Hi it's button message",
    footer: 'Hello World',
    buttons,
    headerType: 1
}

await sock.sendMessage(jid, buttonMessage, { quoted: null })
```

</div>
</details>

### Buttons Message with Media

Send buttons message with image header:

<details>
<summary style="font-weight: bold; cursor: pointer; padding: 8px; border-bottom: 1px solid #eee; margin-bottom: 5px;">Show Example</summary>
<div style="padding: 10px 15px; background: #f9f9f9; border: 1px solid #eee; border-top: none; border-radius: 0 0 5px 5px;">

```javascript
const buttons = [
    { buttonId: 'id1', buttonText: { displayText: 'Button 1' }, type: 1 },
    { buttonId: 'id2', buttonText: { displayText: 'Button 2' }, type: 1 }
]

const buttonMessage = {
    image: { url: "https://example.com/abcd.jpg" },
    caption: "Hi it's button message with image",
    footer: 'Hello World',
    buttons,
    headerType: 1
}

await sock.sendMessage(jid, buttonMessage, { quoted: null })
```

</div>
</details>

### Buttons Message with Video

Send buttons message with video header:

<details>
<summary style="font-weight: bold; cursor: pointer; padding: 8px; border-bottom: 1px solid #eee; margin-bottom: 5px;">Show Example</summary>
<div style="padding: 10px 15px; background: #f9f9f9; border: 1px solid #eee; border-top: none; border-radius: 0 0 5px 5px;">

```javascript
const buttons = [
    { buttonId: 'id1', buttonText: { displayText: 'Button 1' }, type: 1 },
    { buttonId: 'id2', buttonText: { displayText: 'Button 2' }, type: 1 }
]

const buttonMessage = {
    video: { url: "https://example.com/abcd.mp4" },
    caption: "Hi it's button message with video",
    footer: 'Hello World',
    buttons,
    headerType: 1
}

await sock.sendMessage(jid, buttonMessage, { quoted: null })
```

</div>
</details>

### Product Message with Buttons

Send product message with interactive buttons:

<details>
<summary style="font-weight: bold; cursor: pointer; padding: 8px; border-bottom: 1px solid #eee; margin-bottom: 5px;">Show Example</summary>
<div style="padding: 10px 15px; background: #f9f9f9; border: 1px solid #eee; border-top: none; border-radius: 0 0 5px 5px;">

```javascript
await sock.sendMessage(jid, {
    product: {
        productImage: { url: 'https://example.com/product.jpg' },
        productId: '123456',
        title: 'Product Name',
        description: 'Product Description',
        currencyCode: 'IDR',
        priceAmount1000: 100000,
        retailerId: 'Retailer Name',
        url: 'https://example.com/product',
        productImageCount: 1
    },
    businessOwnerJid: '6281234567890@s.whatsapp.net',
    caption: 'Check out this product!',
    title: 'Product Title',
    subtitle: 'Product Subtitle',
    footer: 'Footer',
    interactiveButtons: [
        {
            name: 'quick_reply',
            buttonParamsJson: JSON.stringify({
                display_text: 'Buy Now',
                id: 'buy_now'
            })
        }
    ],
    hasMediaAttachment: true
})
```

</div>
</details>

### Request Payment Message

Send a payment request:

<details>
<summary style="font-weight: bold; cursor: pointer; padding: 8px; border-bottom: 1px solid #eee; margin-bottom: 5px;">Show Example</summary>
<div style="padding: 10px 15px; background: #f9f9f9; border: 1px solid #eee; border-top: none; border-radius: 0 0 5px 5px;">

```javascript
await sock.sendMessage(jid, {
    requestPayment: {
        amount: 100000,
        currency: 'IDR',
        from: '6281234567890@s.whatsapp.net',
        expiry: Date.now() + 3600000,
        note: 'Payment for product',
        sticker: { url: 'https://example.com/sticker.webp' }
    }
})
```

</div>
</details>

### Event Message

Send an event message:

<details>
<summary style="font-weight: bold; cursor: pointer; padding: 8px; border-bottom: 1px solid #eee; margin-bottom: 5px;">Show Example</summary>
<div style="padding: 10px 15px; background: #f9f9f9; border: 1px solid #eee; border-top: none; border-radius: 0 0 5px 5px;">

```javascript
const crypto = require('crypto')

await sock.sendMessage(jid, {
    event: {
        name: 'Event Name',
        locationName: 'Event Location',
        startTime: Math.floor(Date.now() / 1000),
        messageSecret: crypto.randomBytes(32)
    }
})
```

</div>
</details>

### Album Message

Send multiple images as an album:

<details>
<summary style="font-weight: bold; cursor: pointer; padding: 8px; border-bottom: 1px solid #eee; margin-bottom: 5px;">Show Example</summary>
<div style="padding: 10px 15px; background: #f9f9f9; border: 1px solid #eee; border-top: none; border-radius: 0 0 5px 5px;">

```javascript
await sock.sendMessage(jid, {
    album: [
        { image: { url: 'https://example.com/image1.jpg' }, caption: 'Image 1' },
        { image: { url: 'https://example.com/image2.jpg' }, caption: 'Image 2' },
        { image: { url: 'https://example.com/image3.jpg' }, caption: 'Image 3' }
    ]
}, { quoted: m })
```

</div>
</details>

### Poll Result Message

Display poll results with vote counts:

<details>
<summary style="font-weight: bold; cursor: pointer; padding: 8px; border-bottom: 1px solid #eee; margin-bottom: 5px;">Show Example</summary>
<div style="padding: 10px 15px; background: #f9f9f9; border: 1px solid #eee; border-top: none; border-radius: 0 0 5px 5px;">

```javascript
await sock.sendMessage(jid, {
    pollResult: {
        name: 'Poll Question',
        values: [
            ['Option 1', '100'],
            ['Option 2', '50'],
            ['Option 3', '25']
        ]
    }
}, { quoted: m })
```

</div>
</details>

### Interactive Message with Native Flow

Send interactive messages with advanced native flow features:

<details>
<summary style="font-weight: bold; cursor: pointer; padding: 8px; border-bottom: 1px solid #eee; margin-bottom: 5px;">Show Example</summary>
<div style="padding: 10px 15px; background: #f9f9f9; border: 1px solid #eee; border-top: none; border-radius: 0 0 5px 5px;">

```javascript
await sock.sendMessage(jid, {
    text: 'Interactive Message with Native Flow',
    title: 'Title',
    subtitle: 'Subtitle',
    footer: 'Footer',
    interactiveButtons: [
        {
            name: 'single_select',
            buttonParamsJson: JSON.stringify({
                title: 'Select Option',
                sections: [
                    {
                        title: 'Section 1',
                        highlight_label: 'Highlight',
                        rows: [
                            {
                                header: 'Header 1',
                                title: 'Title 1',
                                description: 'Description 1',
                                id: 'option_1'
                            },
                            {
                                header: 'Header 2',
                                title: 'Title 2',
                                description: 'Description 2',
                                id: 'option_2'
                            }
                        ]
                    }
                ]
            })
        },
        {
            name: 'cta_copy',
            buttonParamsJson: JSON.stringify({
                display_text: 'Copy Code',
                id: 'copy_123',
                copy_code: 'ABC123XYZ'
            })
        },
        {
            name: 'cta_url',
            buttonParamsJson: JSON.stringify({
                display_text: 'Open Link',
                url: 'https://example.com',
                merchant_url: 'https://example.com'
            })
        }
    ]
}, { quoted: m })
```

</div>
</details>

### Interactive Message with Limited Time Offer

Send interactive message with limited time offer feature:

<details>
<summary style="font-weight: bold; cursor: pointer; padding: 8px; border-bottom: 1px solid #eee; margin-bottom: 5px;">Show Example</summary>
<div style="padding: 10px 15px; background: #f9f9f9; border: 1px solid #eee; border-top: none; border-radius: 0 0 5px 5px;">

```javascript
await sock.sendMessage(jid, {
    text: 'Limited Time Offer!',
    title: 'Special Offer',
    subtitle: 'Get 50% off',
    footer: 'Valid until tomorrow',
    interactiveButtons: [
        {
            name: 'quick_reply',
            buttonParamsJson: JSON.stringify({
                display_text: 'Claim Now',
                id: 'claim_offer'
            })
        }
    ],
    contextInfo: {
        externalAdReply: {
            title: 'Limited Offer',
            body: '50% Discount',
            thumbnailUrl: 'https://example.com/thumb.jpg',
            sourceUrl: 'https://example.com',
            mediaType: 1,
            renderLargerThumbnail: true
        }
    }
}, { quoted: m })
```

</div>
</details>

### Send Message with Progress Bar

Send message with progress indicator:

<details>
<summary style="font-weight: bold; cursor: pointer; padding: 8px; border-bottom: 1px solid #eee; margin-bottom: 5px;">Show Example</summary>
<div style="padding: 10px 15px; background: #f9f9f9; border: 1px solid #eee; border-top: none; border-radius: 0 0 5px 5px;">

```javascript
await sock.sendMessage(jid, {
    text: 'Processing...\n[████████░░] 80%',
    footer: 'Please wait'
}, { quoted: m })
```

</div>
</details>

### Send Message with Custom Thumbnail

Send message with custom thumbnail and link preview:

<details>
<summary style="font-weight: bold; cursor: pointer; padding: 8px; border-bottom: 1px solid #eee; margin-bottom: 5px;">Show Example</summary>
<div style="padding: 10px 15px; background: #f9f9f9; border: 1px solid #eee; border-top: none; border-radius: 0 0 5px 5px;">

```javascript
await sock.sendMessage(jid, {
    text: 'Check out this link!',
    contextInfo: {
        externalAdReply: {
            title: 'Website Title',
            body: 'Website Description',
            thumbnailUrl: 'https://example.com/thumbnail.jpg',
            sourceUrl: 'https://example.com',
            mediaType: 1,
            renderLargerThumbnail: true
        }
    }
}, { quoted: m })
```

</div>
</details>

### Send PTV (Picture in Picture Video)

Send picture-in-picture video message:

<details>
<summary style="font-weight: bold; cursor: pointer; padding: 8px; border-bottom: 1px solid #eee; margin-bottom: 5px;">Show Example</summary>
<div style="padding: 10px 15px; background: #f9f9f9; border: 1px solid #eee; border-top: none; border-radius: 0 0 5px 5px;">

```javascript
await sock.sendMessage(jid, {
    ptv: { url: 'https://example.com/video.mp4' },
    caption: 'PTV Message'
}, { quoted: m })
```

</div>
</details>

### Send Contact Message

Send contact card:

<details>
<summary style="font-weight: bold; cursor: pointer; padding: 8px; border-bottom: 1px solid #eee; margin-bottom: 5px;">Show Example</summary>
<div style="padding: 10px 15px; background: #f9f9f9; border: 1px solid #eee; border-top: none; border-radius: 0 0 5px 5px;">

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
TEL;type=CELL;type=VOICE:+1234567890
END:VCARD`
            }
        ]
    }
}, { quoted: m })
```

</div>
</details>

### Send Location Message

Send location with coordinates:

<details>
<summary style="font-weight: bold; cursor: pointer; padding: 8px; border-bottom: 1px solid #eee; margin-bottom: 5px;">Show Example</summary>
<div style="padding: 10px 15px; background: #f9f9f9; border: 1px solid #eee; border-top: none; border-radius: 0 0 5px 5px;">

```javascript
await sock.sendMessage(jid, {
    location: {
        degreesLatitude: -6.2088,
        degreesLongitude: 106.8456,
        name: 'Jakarta, Indonesia'
    }
}, { quoted: m })
```

</div>
</details>

### Send Sticker Message

Send sticker:

<details>
<summary style="font-weight: bold; cursor: pointer; padding: 8px; border-bottom: 1px solid #eee; margin-bottom: 5px;">Show Example</summary>
<div style="padding: 10px 15px; background: #f9f9f9; border: 1px solid #eee; border-top: none; border-radius: 0 0 5px 5px;">

```javascript
await sock.sendMessage(jid, {
    sticker: { url: 'https://example.com/sticker.webp' }
}, { quoted: m })
```

</div>
</details>

### Send Audio Message

Send audio message:

<details>
<summary style="font-weight: bold; cursor: pointer; padding: 8px; border-bottom: 1px solid #eee; margin-bottom: 5px;">Show Example</summary>
<div style="padding: 10px 15px; background: #f9f9f9; border: 1px solid #eee; border-top: none; border-radius: 0 0 5px 5px;">

```javascript
await sock.sendMessage(jid, {
    audio: { url: 'https://example.com/audio.mp3' },
    mimetype: 'audio/mp4',
    ptt: false
}, { quoted: m })
```

</div>
</details>

### Send Document Message

Send document file:

<details>
<summary style="font-weight: bold; cursor: pointer; padding: 8px; border-bottom: 1px solid #eee; margin-bottom: 5px;">Show Example</summary>
<div style="padding: 10px 15px; background: #f9f9f9; border: 1px solid #eee; border-top: none; border-radius: 0 0 5px 5px;">

```javascript
await sock.sendMessage(jid, {
    document: { url: 'https://example.com/document.pdf' },
    mimetype: 'application/pdf',
    fileName: 'document.pdf',
    caption: 'Document file'
}, { quoted: m })
```

</div>
</details>

### Send View Once Message

Send view once (disappearing) message:

<details>
<summary style="font-weight: bold; cursor: pointer; padding: 8px; border-bottom: 1px solid #eee; margin-bottom: 5px;">Show Example</summary>
<div style="padding: 10px 15px; background: #f9f9f9; border: 1px solid #eee; border-top: none; border-radius: 0 0 5px 5px;">

```javascript
await sock.sendMessage(jid, {
    viewOnce: true,
    image: { url: 'https://example.com/image.jpg' },
    caption: 'This message will disappear after viewing'
}, { quoted: m })
```

</div>
</details>

For more examples and detailed documentation, see the full documentation in the repository.

## License

Distributed under the GPL-3.0 License. See [LICENSE](LICENSE) for more information.

---

<div align="center">
  Forked and modified by yemobyte.  
  ye-bail - Modern WhatsApp Web API
</div>
