import { Client, GatewayIntentBits } from 'discord.js'

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN
const MY_DISCORD_USER_ID = process.env.MY_DISCORD_USER_ID

export const handler = async (_event: any, _context: any) => {
  if (!DISCORD_BOT_TOKEN || !MY_DISCORD_USER_ID) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error:
          'Missing DISCORD_BOT_TOKEN or MY_DISCORD_USER_ID in env variables',
      }),
    }
  }

  const client = new Client({
    intents: [
      GatewayIntentBits.DirectMessages,
      GatewayIntentBits.Guilds,
      GatewayIntentBits.MessageContent,
    ],
  })

  return new Promise((resolve) => {
    client.once('ready', async () => {
      try {
        const user = await client.users.fetch(MY_DISCORD_USER_ID)
        await user.send(
          '📬 Hello from Netlify function (TypeScript, no extra typings)!'
        )
        client.destroy()

        resolve({
          statusCode: 200,
          body: JSON.stringify({ success: true, message: 'DM sent!' }),
        })
      } catch (err: any) {
        client.destroy()
        resolve({
          statusCode: 500,
          body: JSON.stringify({
            success: false,
            error: err.message || 'Unknown error sending DM',
          }),
        })
      }
    })

    client.login(DISCORD_BOT_TOKEN)
  })
}
