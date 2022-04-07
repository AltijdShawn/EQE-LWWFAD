const db = require("quick.db");
const posts = new db.table("posts");

const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const path = require("path");

const app = (module.exports = express());
const server = require("http").Server(app);
const urlencodedParser = bodyParser.urlencoded({ extended: false });



app.enable("verbose errors");

if (app.settings.env === "production") app.disable("verbose errors");

app.use(morgan("dev"));

app.engine(".ejs", require("ejs").__express);
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");

function makeid(length) {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

function listEntries(selector, type) {
    let entries = [];
    selector.forEach(post => {
        let data = JSON.parse(post.data.replace(/'/gm, ''))
        if(type=="id") entries.push(`${post.ID}`);
        if(type=="name") entries.push(`${data.firstname} ${data.lastname}`);
        if(type=="firstname") entries.push(`${data.firstname}`);
        if(type=="lastname") entries.push(`${data.lastname}`);
        if(type=="email") entries.push(`${data.email}`);
        if(type=="country") entries.push(`${data.country}`);
    })
    return entries
}
function getDataByID(id) {
    let entry = posts.all().findIndex(post => post.ID == id);
    let data = JSON.parse(posts.all()[entry].data.replace(/'/gm, ''))
    return data;
}

app.get("/", async (req, res) => {
  res.render("index", {
    title: `form.io.web`,
    desc: `4 W385!73 f0r 57up!d 7h!n95`,
  });
});
app.post("/", urlencodedParser, async (req, res) => {
  const id = makeid(32);

  let firstname = req.body.firstname.toString();
  let lastname = req.body.lastname.toString();
  let subject = req.body.subject.toString();
  let country = req.body.country.toString();

//   db.push("post_ids", `\"${id}\"`);
  posts.set(id, {
    country: country,
    firstname: firstname,
    lastname: lastname,
    subject: subject,
  });

  console.log("Got body:", { id: id, post: await posts.get(id) });
  // res.sendStatus(200);
  res.redirect("/");
});
console.log(listEntries(posts.all(), "id"), listEntries(posts.all(), "name"))
app.get("/view", async (req, res) => {
  res.render("list", {
      idList: listEntries(posts.all(), "id"),
      nameList: listEntries(posts.all(), "name"),
      countryList: listEntries(posts.all(), "country"),
  });
});
app.get("/view/:id/json", async (req, res) => {
  const id = req.params.id;
  res.send({ id: id, post: posts.get(id) });
});
app.get("/view/:id", async (req, res) => {
    res.render("view", {
        data: getDataByID(req.params.id),
    });
  });
app.get("/apitest", async (req, res) => {
    res.render("testapi")
})

app.get("*", async (req, res) => {
  res.sendStatus("404");
});

var ipaddress = "0.0.0.0";
var serverport = 8000;
server.listen(serverport, ipaddress, async function () {
  await console.log("[DEBUG] Listening on " + ipaddress + ":" + serverport);
});
