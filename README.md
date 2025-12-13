
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
# or
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

<details>
<summary style="font-weight: bold; cursor: pointer; padding: 8px; border-bottom: 1px solid #eee; margin-bottom: 5px;">Show AI Icon Example</summary>
<div style="padding: 10px 15px; background: #f9f9f9; border: 1px solid #eee; border-top: none; border-radius: 0 0 5px 5px;">

```javascript
await sock.sendMessage(jid, { text: "Hello World", ai: true });
```

</div>
</details>

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

For more examples and detailed documentation, see the full documentation in the repository.

## License

Distributed under the GPL-3.0 License. See [LICENSE](LICENSE) for more information.

---

<div align="center">
  Forked and modified by yemobyte.  
  ye-bail - Modern WhatsApp Web API
</div>
