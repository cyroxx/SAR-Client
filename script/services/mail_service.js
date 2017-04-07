var MailListener = require("mail-listener2");
var PouchDB = require('pouchdb');
var config = require('./config.js');

//mail address of inreach service
var filtered_mail_addr = 'some@mail.com';

var mail_service = new function(){

  this.init = function(){
    this.initDBs();
    this.initMailListener();
  }
  this.initDBs = function(){

      var dbConfig = {
        auth: {
          username: config.db_username,
          password: config.db_password
        }
      };

      this.casesDB = new PouchDB(config.db_remote_url+'/cases', dbConfig);
      this.positionsDB = new PouchDB(config.db_remote_url+'/locations', dbConfig);
  }
  this.initInreachMailListener = function(){
    var self = this;
    var mailListener = new MailListener({
      
      username: config.mail_username,
      password: config.mail_password,
      host: config.mail_host,

      port: 993, // imap port
      tls: true,
      connTimeout: 10000, // Default by node-imap
      authTimeout: 5000, // Default by node-imap,
      debug: console.log, // Or your custom function with only one incoming argument. Default: null
      tlsOptions: { rejectUnauthorized: false },
      mailbox: "INBOX", // mailbox to monitor
      searchFilter: ["UNSEEN"], // the search filter being used after an IDLE notification has been retrieved
      markSeen: false, // all fetched email willbe marked as seen and not fetched next time
      fetchUnreadOnStart: true, // use it only if you want to get all unread email on lib start. Default is `false`,
      mailParserOptions: {streamAttachments: true}, // options to be passed to mailParser lib.
      attachments: true, // download attachments as they are encountered to the project directory
      attachmentOptions: { directory: "attachments/" } // specify a download directory for attachments
    });

    mailListener.start(); // start listening

    // stop listening
    //mailListener.stop();

    mailListener.on("server:connected", function(){
      console.log("imapConnected");
    });

    mailListener.on("server:disconnected", function(){
      console.log("imapDisconnected");
    });

    mailListener.on("error", function(err){
      console.log(err);
    });

    mailListener.on("mail", function(mail, seqno, attributes){
      // do something with mail object including attachments

      if(mail.headers.from.indexOf(filtered_mail_addr)>-1){

        /*
        An example message would look like:
        Refugee-Boat found – Status: GOOD

        View the location or send a reply to {{NAME STRING}}

        Iuventa Jugend Rettet e.V. sent this message from: Lat 52.367857 Lon 9.651468

        Do not reply directly to this message.

        This message was sent to you using the inReach two-way satellite communicator with GPS. To learn more, visit http://explore.garmin.com/inreach 
        */

        //console.log("emailParsed", mail.text);

        //find text between defined strings and remove whitespaces
        var boat_status = mail.text.substring( mail.text.indexOf('Refugee-Boat found – Status:') + 28,
                                       mail.text.indexOf('View the location')).trim();

        var lat = mail.text.substring( mail.text.indexOf('Lat') + 3,
                                       mail.text.indexOf('Lon')).trim();

        var lon = mail.text.substring( mail.text.indexOf('Lon') + 3,
                                       mail.text.indexOf('Do not reply')).trim();

        var boat_id = 'IUV';

        var case_id = new Date().toISOString()+"-reportedBy-"+boat_id;

        var boat_status_array = ['','UNKNOWN','GOOD','BAD','SINKING','PEOPLE IN WATER'];

        if(!lat||!lon||boat_status_array.indexOf(boat_status)==-1){
          console.log('something went wrong')
        }else{
        
          self.casesDB.put({
            "_id": case_id,
            "state": boat_status_array.indexOf(boat_status)
          }).then(function (response) {
            // handle response
                        self.positionsDB.put({
                          "_id": new Date().toISOString()+"-locationOf-"+boat_id,
                          "latitude": lat,
                          "longitude": lon,
                          "heading": "0",
                          "origin": "INREACH",
                          "type": "case_location",
                          "itemId": case_id
                        }).then(function (response) {
                          // handle response
                          console.log(response);
                        }).catch(function (err) {
                          console.log(err);
                        });
          }).catch(function (err) {
            console.log(err);
          });
        
        }

        

        console.log(boat_status,lat,lon);
      }

      // mail processing code goes here
    });

  }
}

mail_service.init();