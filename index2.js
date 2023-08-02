const { default: Telegraf, Markup } = require("telegraf");
var firebase = require("firebase");
require("telegraf");

firebase.initializeApp({
  apiKey: "AIzaSyCgof5kcUj0QSt1JcsXPyoU9n_N3OO6wUg",
  authDomain: "saileshgamebot.firebaseapp.com",
  databaseURL: "https://saileshgamebot.firebaseio.com",
  projectId: "saileshgamebot",
  storageBucket: "saileshgamebot.appspot.com",
  messagingSenderId: "68015760808",
  appId: "1:68015760808:web:d4f49b37de0a8bd011e99d",
});

const bot = new Telegraf("1188029268:AAHzWrOAP70HRZFtBgvuogVA3EHsM7ugvNM");

var isGameStarted = false;
var joiningTime = false;
var drawTime = false;
var players = [];
var pot = 0;

bot.use(async (ctx, next) => {
  const start = new Date();
  await next();
  var user = ctx.message.from;
  switch (ctx.message.text) {
    case "/register":
      firebase
        .database()
        .ref("users")
        .once("value", (snapshot) => {
          if (snapshot.hasChild(user.id + "")) {
            ctx.reply(
              "Dear " + user.first_name + ",\nYou are already registered!!!"
            );
          } else {
            let newUser = {
              id: user.id,
              username: user.first_name,
              first_name: user.first_name,
              balance: 50,
              total_game_played: 0,
            };
            firebase.database().ref("users").child(user.id).set(newUser);
            ctx.reply(user.first_name + " registered successfully!!!");
          }
        });
      break;
    case "/me":
      firebase
        .database()
        .ref("users")
        .child(user.id.toString())
        .once("value", (snapshot) => {
          if (snapshot.exists()) {
            var me = snapshot.val();
            ctx.reply(
              "<b>Username</b> : " +
                me.username +
                "[" +
                me.first_name +
                "]" +
                "\n<b>Balance</b> : Rs. " +
                me.balance +
                "\n<b>Game Played</b> : " +
                me.total_game_played,
              { parse_mode: "HTML" }
            );
          } else {
            ctx.reply("You are not registered!!!");
          }
        });
      break;
    case "/players":
      firebase
        .database()
        .ref("users")
        .once("value", (snapshot) => {
          let playerList = "";
          for (var key in snapshot.val()) {
            playerList += snapshot.child(key).val().username + "\n";
          }
          ctx.reply(
            "<b>Player List [" +
              snapshot.numChildren() +
              "]</b><i>\n" +
              playerList +
              "</i>",
            {
              parse_mode: "HTML",
            }
          );
        });
      break;
    case "/command":
      ctx.reply(
        "<b>Command List</b>\n/register\n/me\n/withdraw\n/players\n/update username [new_username]",
        {
          parse_mode: "HTML",
        }
      );
      break;
    case "/start@saileshGameBot":
    case "/start":
      if (isGameStarted) {
        reply(ctx, "Game is already running...");
        return;
      } else {
        isGameStarted = true;
        joiningTime = true;
        ctx.reply(
          "<i>🎯Lucky Game has been started.🎯\nEntry fee. Rs.5\nWinner will take the pot money.\nType /join to join the game.\nStarts in 60 seconds.</i>",
          { parse_mode: "HTML" }
        );
        setTimeout(() => {
          handleGame(ctx);
          joiningTime = false;
        }, 60000);
      }
      break;
    case "/join@saileshGameBot":
    case "/join":
      firebase
        .database()
        .ref("users")
        .child(user.id.toString())
        .once("value", (snapshot) => {
          if (snapshot.exists()) {
            if (!isGameStarted) {
              reply(ctx, "Type /start to start the game.");
              return;
            }
            var joined = false;
            players.forEach((usr) => {
              if (usr.id == user.id) {
                reply(ctx, "You have already joined the game.");
                joined = true;
              }
            });
            if (joined) return;
            firebase
              .database()
              .ref("users")
              .child(user.id.toString())
              .once("value", (snapshot) => {
                if (snapshot.exists()) {
                  var me = snapshot.val();
                  if (me.balance < 5) {
                    reply(
                      ctx,
                      "🙈You do not have sufficient balance to join the game."
                    );
                  } else {
                    firebase
                      .database()
                      .ref("users")
                      .child(user.id.toString())
                      .child("balance")
                      .set(parseInt(me.balance) - 5);
                    firebase
                      .database()
                      .ref("users")
                      .child(user.id.toString())
                      .child("total_game_played")
                      .set(parseInt(me.total_game_played) + 1);
                    me.balance = me.balance - 5;
                    ctx.reply(`${user.first_name} joined the game.👍`);
                    players.push(me);
                    pot = pot + 5;
                  }
                }
              });
          } else {
            replyBot(ctx, "You are not registered!!!");
          }
        });

      break;
  }

  if (ctx.message.text.startsWith("/update username ")) {
    const username = ctx.message.text.split("/update username ")[1];
    firebase
      .database()
      .ref("users")
      .child(user.id.toString())
      .child("username")
      .set(username);
    ctx.reply("Username has been updated.[<b>" + user.first_name + "</b>]✅", {
      parse_mode: "HTML",
    });
  }

  if (ctx.message.text.startsWith("/withdraw")) {
    return;
    const amount = ctx.message.text.split("/withdraw ")[1];
    var pattern = /^\d+$/;
    if (pattern.test(amount)) {
      firebase
        .database()
        .ref("users")
        .child(user.id.toString())
        .once("value", (snapshot) => {
          if (snapshot.exists()) {
            var me = snapshot.val();
            if (me.balance < amount) {
              reply(ctx, "You donot have sufficient balance.✖️");
            } else if (parseInt(me.balance) + parseInt(amount) < 50) {
              reply(
                ctx,
                "Minimum balance to withdraw is Rs.50\nYou don't have sufficent balance.[<b>" +
                  user.first_name +
                  "</b>]✖️"
              );
            }
          } else {
            reply(ctx, "You are not registered!!!");
          }
        });
    } else {
      ctx.reply("Please specify a valid amount.");
    }
  }

  function reply(ctx, message) {
    ctx.reply("<i>" + message + "</i> [<b>" + user.first_name + "</b>]", {
      parse_mode: "HTML",
    });
  }
  function replyBot(ctx, message) {
    ctx.reply("<i>" + message + "</i>", {
      parse_mode: "HTML",
    });
  }
  function handleGame(ctx) {
    if (players.length == 0) {
      replyBot(ctx, "🙀No player joined the game. Game will dismiss.");
      isGameStarted = false;
    } else {
      let randNum = randomNum(1, players.length);
      const usr = players[randNum - 1];
      replyBot(
        ctx,
        "🎉Congratulation🎉\n<b>" +
          usr.first_name +
          " won Rs. " +
          parseInt((pot / 100) * 80) +
          "</b>\n\nType /start to start a new game."
      );
      firebase
        .database()
        .ref("users")
        .child(usr.id.toString())
        .child("balance")
        .set(parseInt(usr.balance) + parseInt((pot / 100) * 80));
      isGameStarted = false;
      pot = 0;
      players = [];
    }
  }

  function randomNum(min, max) {
    // min and max included
    return Math.floor(Math.random() * (max - min + min) + min);
  }
});

bot.launch();
