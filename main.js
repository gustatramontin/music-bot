const Discord = require("discord.js");
const client = new Discord.Client();

const DiscordCommands = require("@gtramontin/discord-commands");

/* 
It's a library made by be to make easier to make commands
the first parameters is the prefix,
more details in https://www.npmjs.com/package/@gtramontin/discord-commands
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

/**
 * Play the youtube video by its link
 * @param {string} link - Link of the youtube video 
 */
async function playSong(link, loop=false, msg) {
    console.log(link)
    dispatcher = connection.play(ytdl(link, { filter: "audioonly" }))

    const videoTitle = (await ytdl.getBasicInfo(link)).videoDetails.title

    if (loop)
        dispatcher.on("finish", () => playSong(link, true));

    msg.guild.me.setNickname(videoTitle.slice(0,32))
}
/**
 * Jump to the next or previous song in the playlist
 * @param {boolean} backwards - if true it will jump to previous
 */
function nextSong(backwards = false, msg) {
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

    dispatcher.on('finish', () => nextSong(false, msg))

    msg.guild.me.setNickname(playlist.items[playlist_index].title.slice(0,32))

}

function shuffledArray(arr) {
    const newArr = arr.slice()
    for (let i = newArr.length - 1; i > 0; i--) {
        const rand = Math.floor(Math.random() * (i + 1));
        [newArr[i], newArr[rand]] = [newArr[rand], newArr[i]];
    }
    return newArr
};

client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

bot.command("play", async (msg, query, option) => {
    /*
    the ifs are using regex to detect the type of the play
    if it's a link, a playlist or a search
    */
    if (msg.member.voice.channel) {
        connection = await msg.member.voice.channel.join();
        if (/https:\/\//i.test(query)) {
            if (/watch\?v=/i.test(query)) {
                if (option === "loop")
                    await playSong(query, loop=true, msg)
                else
                    await playSong(query, false, msg)

            } else if (/playlist/i.test(query)) {
                playlist = await ytpl(query);

                if (option == 'shuffle') {
                    playlist.items = shuffledArray(playlist.items)
                }

                await playSong(playlist.items[playlist_index].shortUrl, false, msg)
            
                dispatcher.on("finish", () => nextSong(false, msg));
            }
        } else {
            const searchResult = await search(query)
            const link = searchResult.url;

            msg.guild.me.setNickname(searchResult.title.slice(0, 32))


            if (option === "loop")
                await playSong(link, loop=true)
            else
                await playSong(link)
        }

    } else {
        msg.reply("Você tem que tar em um canal de voz!");
    }
});

bot.command("next", (msg) => {
    nextSong(false, msg);
});

bot.command("previous", (msg) => {
    nextSong(backwards = true, msg);
});

bot.command("stop", async (msg) => {
    if (dispatcher) {
        dispatcher.destroy();
    }

    msg.guild.me.setNickname('')
});

client.login(token);
