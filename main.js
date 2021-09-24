const Discord = require("discord.js");
const client = new Discord.Client();

const DiscordCommands = require("@gtramontin/discord-commands");

/* 
It's a library made by be to make easier to make commands
the first parameters is the prefix,
more details in
*/
const bot = new DiscordCommands.bot("!", client, {
    acceptBot: false,
    quotesAsOneArg: true,
});

const ytdl = require("ytdl-core");
const ytpl = require("ytpl");
const search = require("./search.js");

const { token } = require("./config.json");
var playlist = false;
var playlist_index = 0;
var dispatcher = false;
var connection = false;

function nextSong(backwards = false) {
    /* 
    Play the next(or previous) song in the playlist 
    */
    if (playlist === false) return;

    if (!backwards) {
        playlist_index += 1;
    } else if (playlist_index > 0) {
        playlist_index -= 1;
    }

    if (playlist_index == 101) {
        dispatcher.destroy();
        playlist = false;
        return;
    }

    dispatcher = connection.play(
        ytdl(playlist.items[playlist_index].shortUrl, {
            filter: "audioonly",
        })
    );
}

client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

bot.command("play", async (msg, query) => {
    /*
    the ifs are using regex to detect the type of the play
    if it's a link, a playlist or a search
    */
    if (msg.member.voice.channel) {
        connection = await msg.member.voice.channel.join();
        if (/https:\/\//i.test(query)) {
            if (/watch\?v=/i.test(query)) {
                dispatcher = connection.play(
                    ytdl(query, { filter: "audioonly" })
                );
            } else if (/playlist/i.test(query)) {
                playlist = await ytpl(query);
                dispatcher = connection.play(
                    ytdl(playlist.items[playlist_index].shortUrl, {
                        filter: "audioonly",
                    })
                );

                dispatcher.on("finish", nextSong);
            }
        } else {
            const link = await search(query);
            dispatcher = connection.play(ytdl(link, { filter: "audioonly" }));
        }

        dispatcher.setVolume(0.4);
    } else {
        msg.reply("Você tem que tar em um canal de voz!");
    }
});

bot.command("next", (msg) => {
    nextSong();
});

bot.command("previous", (msg) => {
    nextSong(backwards=true)
});

bot.command("stop", async (msg) => {
    if (dispatcher) {
        dispatcher.destroy();
    }
});

client.login(token);
