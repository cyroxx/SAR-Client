var program = require('commander');
var cradle = require('cradle');
var nano = require('nano');

 program
  .option('-u, --url <url>', 'DB URL')
  .option('-d, --database <database>', 'Database')
  .action(function() {

  
        var connection = nano(program.url),
        db = connection.use(program.database),
        updated_docs = []
        errors = [];

        db.list({}, function(err, body) {
          if (!err) {

            console.log('start deleting docs from '+program.database);
            body.rows.forEach(function(doc) {


              db.insert({ _id: doc.id, _rev: doc.value.rev, "_deleted": true}, function(err, body) {
                if (!err)
                  console.log('deleted: '+doc.id)
                else{
                  console.log(err)
                }

              })
              
            });
          }else{
            console.log(err);
          }
        });

        console.log(db);
    console.log('url: %s database: %s',
        program.url, program.database);
  })
  .parse(process.argv);
