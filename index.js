const { default: axios } = require("axios");
const { default: Telegraf, Markup } = require("telegraf");
require("telegraf");

const bot = new Telegraf("1188029268:AAHzWrOAP70HRZFtBgvuogVA3EHsM7ugvNM");


bot.hears('usman', ctx => {
    const from = ctx.update.message.from;
    axios.get("http://usmanbypass.top//key.php?ID=short", {
        headers: {
            "Host": "usmanbypass.top",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.5790.110 Safari/537.36",
            "Referer": "https://up4cash.com/7ShNWieE"
        }
    }).then(response => {
        var data = response.data;
        const key = "USMAN" + beT(data, " >USMAN", "</p>");
        bot.telegram.sendMessage(ctx.chat.id, "Dear " + from.first_name + ",\nYour USMAN Key is " + key, {
        })
    });
});

bot.hears('daku', ctx => {
    const from = ctx.update.message.from;
    axios.get("http://dakukey076.atwebpages.com/redirectkey076.php", {
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.5790.110 Safari/537.36",
        },
        maxRedirects: 0,
        validateStatus: null,
    }).then(response => {
        const cookie = "PHPSESSID" + beT(response.headers + "", "PHPSESSID", ";") + ";";
        axios.get("http://dakukey076.atwebpages.com/free_key.php", {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.5790.110 Safari/537.36",
                "Cookie": cookie
            }
        }).then(response => {
            const key = beT(response.data, " value= ", " required>");
            bot.telegram.sendMessage(ctx.chat.id, "Dear " + from.first_name + ",\nYour DAKU Key is " + key, {
            })
        });
    });
})


function beT(source, first, last) {
    return source.split(first)[1].split(last)[0];
}
bot.launch()