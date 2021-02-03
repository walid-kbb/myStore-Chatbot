require("dotenv").config();
import request from "request";

const MY_VERIFY_TOKEN = process.env.MY_VERIFY_TOKEN;
console.log(MY_VERIFY_TOKEN);
let test= (req,res)=>{

    return res.send("myStore chatBot by Walid KEBBAB");
}

let getWebHook=(req,res)=>{
// Mon token de verification.
    let VERIFY_TOKEN = MY_VERIFY_TOKEN;

    // Les paramètres de la requête
    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];

    // Vérifie si un token et un mode se trouvent dans la chaîne de requête de la demande
    if (mode && token) {

        // Vérifie que le mode et le token envoyés sont corrects
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {

            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);

        } else {
            // Répond avec «403» si les tokens de vérification ne correspondent pas
            res.sendStatus(403);
        }
    }

}

let postWebHook=(req,res)=>{
    let body = req.body;

    // Vérifie qu'il s'agit d'un événement issu d'un abonnement à une page
    if (body.object === 'page') {
  
      // Itère sur chaque entrée - il peut y avoir plusieurs lots
      body.entry.forEach(function(entry) {
  
          // Obtient le corps de l'événement webhook
  let webhook_event = entry.messaging[0];
  console.log(webhook_event);


          // Obtenez le PSID de l'expéditeur
          let sender_psid = webhook_event.sender.id;
          console.log('Sender PSID: ' + sender_psid);

          // Vérifiez si l'événement est un message ou une publication et
          // transmettre l'événement à la fonction de gestionnaire appropriée
          if (webhook_event.message) {
              handleMessage(sender_psid, webhook_event.message);
          } else if (webhook_event.postback) {
              handlePostback(sender_psid, webhook_event.postback);
          }
  
      });
  
      // Renvoie une réponse «200 OK» à toutes les demandes
      res.status(200).send('EVENT_RECEIVED');
    } else {
      // Renvoie un '404 Not Found' si l'événement ne provient pas d'un abonnement à une page
      res.sendStatus(404);
    }

}

// Gère les événements post-back
function handlePostback(sender_psid, received_postback) {
    let response;
    
    
    let payload = received_postback.payload;
  
    // Définir la réponse en fonction de la charge utile de publication
    if (payload === 'yes') {
      response = { "text": "Thanks!" }
    } else if (payload === 'no') {
      response = { "text": "Oops, try sending another image." }
    }
    // Envoyez le message pour accuser réception de la publication
    callSendAPI(sender_psid, response);
  }

// Gère les événements de messages
function handleMessage(sender_psid, received_message) {

    let response;
  
    // Vérifiez si le message contient du texte
    if (received_message.text) {    
        if (received_message.text==="Comment vas-tu ?"){
            response = {
                "attachment": {
                  "type": "template",
                  "payload": {
                    "template_type": "generic",
                    "elements": [{
                      "title": "Trés bien et vous ?",
                      "subtitle": "appuyez sur le bouton pour répondre",
                      "buttons": [
                        {
                          "type": "postback",
                          "title": "Je vais bien,merci",
                          "payload": "Je vais bien,merci",
                        },
                        {
                          "type": "postback",
                          "title": "Non, ça ne va pas",
                          "payload": "Non, ça ne va pas",
                        }
                      ],
                    }]
                }
                }
             }
        }else{
            response = {
                "text": `${received_message.text}`
              }
        }
      // Créer la charge utile pour un message texte de base
     
    } else if (received_message.attachments) {
  
        // Obtient l'URL de la pièce jointe au message
        let attachment_url = received_message.attachments[0].payload.url;
        response = {
            "text": `Je ne sais pas traiter ce type de demande`
          }
      } 
    
    // Envoie le message de réponse
    callSendAPI(sender_psid, response);    
  }

// Envoie des messages de réponse via l'API d'envoi
function callSendAPI(sender_psid, response) {
    // Construire le corps du message
    let request_body = {
      "recipient": {
        "id": sender_psid
      },
      "message": response
    }
  
    // Envoyez la requête HTTP à la plateforme Messenger
    request({
      "uri": "https://graph.facebook.com/v9.0/me/messages",
      "qs": { "access_token": process.env.PAGE_ACCESS_TOKEN },
      "method": "POST",
      "json": request_body
    }, (err, res, body) => {
      if (!err) {
        console.log('message sent!')
      } else {
        console.error("Unable to send message:" + err);
      }
    }); 
  }
module.exports={test:test,
    getWebHook:getWebHook,
    postWebHook:postWebHook,
                }