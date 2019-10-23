const FS=require('fs');
const PATH=require('path');
module.exports=function(app) {
  const log=[];

  FS.writeFileSync(PATH.join(__dirname,'./LOG.txt'),'','utf8');
  global.LOG=function(m) {
    if (m===null)
      m='null';
    else if (m===undefined)
      m='undefined';
    
    log.push(m);
    FS.writeFileSync(PATH.join(__dirname,'./LOG.txt'), log.join("\r\n"), 'utf8')
  }
  const server=require('./server/index.js');

  server(app);
}