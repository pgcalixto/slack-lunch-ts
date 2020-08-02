import * as restify from "restify";
import * as errs from "restify-errors";
import { beginLunch } from "./lib/lunch";

async function lunch(
  req: restify.Request,
  res: restify.Response,
  next: restify.Next
) {
  try {
    await beginLunch();

    res.send("ok!");

    return next();
  } catch (err) {
    console.log(`Error: ${err}`);

    return next(new errs.InternalServerError("lunch failed!"));
  }
}

const PORT = process.env.PORT || 5000;

const server = restify.createServer();

server.post("/lunch", lunch);

server.listen(PORT, function () {
  console.log("%s listening at %s", server.name, server.url);
});
