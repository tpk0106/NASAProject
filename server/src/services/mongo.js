const mongoose = require("mongoose");

const MONGO_URL = process.env.MONGO_URL;

mongoose.connection.on("open", () => {
  console.log("momgoDb Connection ready");
});

mongoose.connection.on("error", (err) => {
  console.error("Error", err);
});

async function mongoConnect() {
  await mongoose.connect(MONGO_URL, {
    // useNewUrlParser, useUnifiedTopology is a deprecated option:
    // useNewUrlParser,useUnifiedTopology has no
    // effect since Node.js Driver version 4.0.0 and will be removed
    // in the next major version
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
    // Errror MongoParseError: options usefindandmodify,
    // usecreateindex are not supported
    // useFindAndModify: false,
    // useCreateIndex: true,
  });
}

async function mongoDisconnect() {
  await mongoose.disconnect();
}

module.exports = {
  mongoConnect,
  mongoDisconnect,
};
