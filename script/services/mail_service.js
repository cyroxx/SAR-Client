var MailListener = require("mail-listener2");
var PouchDB = require('pouchdb');
var dJSON = require('dirty-json');
var config = require('./config.js');
//mail address of inreach service

var mail_service = new function(){

  this.init = function(){

    this.initDBs();

    var self = this;

    /*this.initMailListener({
      imap_username:config.inreach_mail_username,
      imap_password:config.inreach_mail_password,
      imap_host:config.inreach_mail_host,

      mail_callback:function(mail, seqno, attributes){
        
        self.inreachMailCallback(mail, seqno, attributes);

      }
    });*/

    this.initMailListener({
      imap_username:config.iridium_mail_username,
      imap_password:config.iridium_mail_password,
      imap_host:config.iridium_mail_host,

      mail_callback:function(mail, seqno, attributes){
        self.iridiumMailCallback(mail, seqno, attributes);
      }
    });

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
  this.initMailListener = function(listener_config){
    var self = this;
    var mailListener = new MailListener({
      
      username: listener_config.imap_username,
      password: listener_config.imap_password,
      host: listener_config.imap_host,

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

      listener_config.mail_callback(mail, seqno, attributes);

    });

  }
  this.inreachMailCallback= function(mail, seqno, attributes){

        var self = this;

        // do something with mail object including attachments
        if(mail.headers.from.indexOf(config.inreach_sender_mail)>-1){

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

          console.log(lat,lon,boat_status);
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
  }
  this.iridiumMailCallback = function(mail, seqno, attributes){
    /*
        Example Mail From Iridium looks like:
        {'LAT': 44.68960805,
        'LON': 11.96087307,
        'DATE/TIME': "2017-04-10 13:41:33",
        'Ship Type': "woodboat small",
        'Status': "not moving",
        'Conditions': "people in water",
        'Additional Comments': "case 27"}


        {id: 1004,
        lat: 35.88603922,
        lon: 14.521798,
        timestamp: "2017-04-11 22:29:30",
        ship_type: "woodboat big",
        engine_running: "not moving",
        status: "people in water",
        additional_comments: ""}

        -- 
        Diese Nachricht wurde von meinem Android-Mobiltelefon.
        */

        var self = this;

        if(mail.headers.from.indexOf(config.iridium_sender_mail)>-1){

          //get json string from mail (remove everything from '--')
          var json_string = mail.text.substring(0, mail.text.indexOf('--')).trim();

          //parse jsoon using dirty json ('LAT;')
          dJSON.parse(json_string).then(function (case_obj) {

              //console.log(case_obj);
              console.log(case_obj);
              //case_obj.Conditions.replace(/\b\w/g, function(l){ return l.toUpperCase() });
              var boat_status = case_obj.status.toUpperCase()
              var boat_status_array = ['','UNKNOWN','GOOD','BAD','SINKING','PEOPLE IN WATER'];
              var boat_type_array =   ['','RUBBER','WOOD','STEEL','OTHER'];

              var lat = case_obj.lat;
              var lon = case_obj.lon;
              var engine_working = case_obj.engine_running == 'moving' ? true:false;
              

              var warship = false;


              switch(case_obj['ship_type']){
                case'woodboat small':
                  var boat_type = boat_type_array.indexOf('WOOD');
                  var peopleCount = 100
                break;
                case'woodboat big':
                  var boat_type = boat_type_array.indexOf('WOOD');
                  var peopleCount = 600
                break;
                case'rubberboat':
                  var boat_type = boat_type_array.indexOf('RUBBER');
                  var peopleCount = 100
                break;
                case'big WarShip':
                  warship = true;
                break;
                case'middle WarShip':
                  warship = true;
                break;
                case'middle WarShip':
                  warship = true;
                break;
              }

              var boat_id = 'PLANE';
              var case_id = new Date().toISOString()+"-reportedBy-"+boat_id;
              
              if(boat_status_array.indexOf(boat_status)==-1)
                boat_status = 'UNKNOWN';

              if(!lat||!lon||boat_status_array.indexOf(boat_status)==-1){
                console.log('something went wrong')
              }else{
              
                self.generateMails(case_obj);

                self.casesDB.put({
                  "_id": case_id,
                  "state": boat_status_array.indexOf(boat_status),
                  "boatType": boat_type,
                  "engineWorking": engine_working,
                  "peopleCount": peopleCount
                }).then(function (response) {
                  // handle response
                              self.positionsDB.put({
                                "_id": new Date().toISOString()+"-locationOf-"+boat_id,
                                "latitude": lat,
                                "longitude": lon,
                                "heading": "0",
                                "origin": "Iridium",
                                "type": "case_location",
                                "itemId": case_id
                              }).then(function (response) {
                                // handle response
                                console.log('CASE '+case_id+' added to DB')
                                console.log(response);
                              }).catch(function (err) {
                                console.log(err);
                              });
                }).catch(function (err) {
                  console.log(err);
                });
              
              }

          }); //djson parse end

        }else{
          console.log('Mail is not from gateway sender');
        }

  }
  this.sendMail = function (address, title, text_plain,text_html, callback){


      var nodemailer = require('nodemailer');
      var smtpTransport = require("nodemailer-smtp-transport");

      // create reusable transporter object using SMTP transport
      var transporter = nodemailer.createTransport(smtpTransport({
          service: 'gmail',
          auth: {
              user: config.sender_mail_username,
              pass: config.sender_mail_password
          }}
      ));

      // NB! No need to recreate the transporter object. You can use
      // the same transporter object for all e-mails

      // setup e-mail data with unicode symbols
      var mailOptions = {
          from: 'Sea-Watch Air <seawatch.air@gmail.com', // sender address
          to: address, // list of receivers
          subject: title, // Subject line
          text: text_plain, // plaintext body
          html: text_html // html body
      };

      // send mail with defined transport object
      transporter.sendMail(mailOptions, function(error, info){
          if(error){
              return console.log(error);
          }
          console.log('Message sent: ' + info.response);

      });



  },
  this.generateMails = function(case_obj){
    var text = 'Dear officer in charge,<br>\n the Sea-Watch aircraft just found a boat in distress. Here are the informations:<br><br>\n\n';
    for(var i in case_obj){
       text += i+' : '+case_obj[i]+"<br>\n";
    }
    text += '<br><br>\n\nThanks for your cooperation,<br>\nThe Sea-Watch Team.<br>\nPlease Note:<br>\nThis email is generated automatically by the Sea-Watch-App operational System.';

    this.sendMail('test@mail.com', 'New Distress Case', text.replace('<br>',''),text);


  }

}

/*
Dear officer in charge,

the Sea-Watch aircraft just found a boat in distress. Here are the informations:

For any questions regarding this case or the aircraft mission please contact the aircraft via 881631010516@msg.iridium.com
or our backoffice airborneoperations@sea-watch.org. 

Thanks for your cooperation,
The Sea-Watch Team.

Please Note:
This email is generated automatically by the Sea-Watch-App operational System.
*/

mail_service.init();