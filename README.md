# OuranBot
Personal discord bot, messy as hell.
Currently working on offering a proper discord music bot as lot of good bot has been taken down by youtube. It allows to host your own personal bot (using VPS or your own PC if you have decent connection) so you won't have to use "cheap" bot that would have some glitchy music.

# Warning
Require NodeJS 16.0.0 or higher (Discord.js requirement)

# How to use
First need to install dependencies using :

`npm install`

Then you need to specify your `token`, `client_id` and `youtube_key` in a new file `./config/secret.json` (that you need to create).

./config/secret.json :
```json
{
  "token": "<your_token>",
  "client_id": "<your_client_id>",
  "youtube_key": "<your_youtube_api_key>"
}
```

Then you can start it in dev mode using `npm run start:dev` (it will use nodemon to hot reload on file change) or alternatively compile using `npm run build` and then start compiled version with `node ./bin/index.js` when you start it will something like :

```
1.run 2.register :
  > 
```

It will be changed, but right now if you input `1` you'll run the bot and if you input `2` it will take all commands that has been created and register it in your bot application as slash commands. (required to make your commands usable).
