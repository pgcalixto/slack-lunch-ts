import * as restify from "restify"; // TODO: include @types/restify
import { beginLunch } from "./lib/lunch";

async function lunch(req, res, next) { // TODO: define types
  await beginLunch();

  res.send('ok!');

  next();
}

const PORT = process.env.PORT || 5000;

const server = restify.createServer();

server.post('/lunch', lunch);

server.listen(PORT, function() {
  console.log('%s listening at %s', server.name, server.url);
});
