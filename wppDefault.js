const wppconnect = require("@wppconnect-team/wppconnect");
const axios = require("axios");
const botpressURL = "http://localhost:3000/api/v1/bots/teste2/converse/b";

wppconnect
  .create()
  .then((client) => start(client))
  .catch((error) => console.log(error));

function start(client) {
  client.onMessage((message) => {
    axios
      .post(botpressURL, {
        type: "text",
        text: message.body,
      })
      .then(function (response) {
        responses = response.data.responses;
        responses.forEach((element) => {
          setTimeout(function () {
            client.sendText(message.from, element.text);
          }, 1000);
          console.log(element);
          client.sendText(message.from, element.text);
        });
        for (var i = 0; i < responses.length; i++) {
          console.log(responses[i].text);
          client.sendText(message.from, responses[i].text);
        }
        console.log(response.data.responses);
      });
    if (message.body === "Hello") {
      client
        .sendText(message.from, "OQ TU QUER COMIGO PÔ")
        .then((result) => {
          console.log("Result: ", result); //return object success
        })
        .catch((erro) => {
          console.error("Error when sending: ", erro); //return object error
        });
    }
  });
}
