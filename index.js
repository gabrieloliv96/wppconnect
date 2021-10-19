// Import the packages we need
const dialogflow = require('@google-cloud/dialogflow');
const wppconnect = require('@wppconnect-team/wppconnect');
require('dotenv').config();

// Your credentials
const CREDENTIALS = JSON.parse(process.env.CREDENTIALS);

// Your google dialogflow project-id
const PROJECID = CREDENTIALS.project_id;

// Configuration for the client
const CONFIGURATION = {
    credentials: {
        private_key: CREDENTIALS['private_key'],
        client_email: CREDENTIALS['client_email']
    }
}

// Create a new session
const sessionClient = new dialogflow.SessionsClient(CONFIGURATION);

// Detect intent method
const detectIntent = async (languageCode, queryText, sessionId) => {

    let sessionPath = sessionClient.projectAgentSessionPath(PROJECID, sessionId);

    // The text query request.
    let request = {
        session: sessionPath,
        queryInput: {
            text: {
                // The query to send to the dialogflow agent
                text: queryText,
                // The language used by the client (en-US)
                languageCode: languageCode,
            },
        },
    };

    // Send request and log result
    const responses = await sessionClient.detectIntent(request);
    const result = responses[0].queryResult;

    return result.fulfillmentText
}

wppconnect
    .create()
    .then((client) => start(client))
    .catch((error) => console.log(error));


function start(client) {
    // console.log(client)

    client.onMessage((message) => {

        if (message.type != "chat"){ 
            client.sendText(message.from, "No compreendo.")
        }
        else {

            console.log("Recebe:")

            console.log(message)

            if (message.isGroupMsg == false) {
                result = detectIntent('pt', message.body, message.from)

                // console.log("Isso não é um grupo.")
                // console.log(message.body)

                result.then(response => {

                    // console.log(JSON.parse(response))
                    try {
                        resposta = JSON.parse(response)

                    } catch {
                        resposta = response

                    }

                    console.log("Envia:",resposta[5])
                    console.log("Result", response)

                    try {
                        if (resposta[0].substring(0, 5) == "https") {
                            // client.sendText(message.from, response)

                            console.log("Entrou no https")

                            client.sendFile(
                                message.from,
                                resposta[0],
                                'boletoCabemce',
                                'Boleto Cabemce'
                            )
                                .then((result) => {
                                    // Verifica se existem boletos vencidos
                                    if (resposta[2] != null) {
                                        console.log("Boletos atrasados")

                                        client.sendText(
                                            message.from,
                                            resposta[2]
                                        ).then(
                                            client.sendText(message.from, resposta[1])
                                        )
                                            .then((result) => {
                                                console.log('Result: ', result); //return object success
                                                client.sendText(message.from, resposta[3])
                                            })

                                            ;
                                    } else {
                                        console.log("não tem boleto vencido")
                                        client.sendText(
                                            message.from,
                                            resposta[1]
                                        );
                                    }
                                }).then((result) => {
                                    // Novo boleto
                                    client.sendText(message.from, resposta[4])
                                })
                                .catch((erro) => {
                                    console.error('Error when sending: ', erro); //return object error
                                });

                        } else {
                            client.sendText(message.from, response)
                        }

                    } catch {
                        console.log(resposta[1])
                        client.sendText(message.from, resposta[1])
                    }

                });

            }
        }
    });

}
