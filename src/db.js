import mongoose from "mongoose";
import config from "../src/config/config.js"

mongoose.connect(config.mongoSessions, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.once("open", () => {
  console.log, "Conectado a la base de datos";
});
mongoose.connection.on("error", (err) => {
  console.log(err);
});

export default mongoose.connection;
