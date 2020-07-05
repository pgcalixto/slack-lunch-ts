import * as restify from "restify"; // TODO: include @types/restify
import { beginLunch } from "./lib/lunch";

function lunch(req, res, next) { // TODO: define types
  beginLunch(); // TODO: await?

  res.send('ok!');

  next();
}

const server = restify.createServer();

server.post('/lunch', lunch);

server.listen(5000, function() {
  console.log('%s listening at %s', server.name, server.url);
});
