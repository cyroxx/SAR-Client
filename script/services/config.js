module.exports = {
db_remote_url:'',
db_username:'',
db_password:'',

// imap data for inreach mail gateway
inreach_mail_username:'',
inreach_mail_password:'',
inreach_mail_host:'',
inreach_sender_mail:'',


// imap data for iridium mail gateway
iridium_mail_username:'', //username of iridium gateway imap
iridium_mail_password:'',
iridium_mail_host:'',
iridium_sender_mail:'', //from header field for sent mails

sw_air_gateway_send_warships_to:'', //mail adresses to which spottet warships will be sent
sw_air_gateway_send_cases_to:'', //mail adresses to which spottet cases will be sent
gateway_cc:'', //cc for all sent mails


//smtp for outgoing mails, use with gmail
sender_mail_username:'',
sender_mail_password:'',

//enable/disable mail forwading of cases, warships  
send_mails:false
}

