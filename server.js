const express = require("express");
const app = express();
const server = require("http").Server(app);
app.set("view engine", "ejs");
app.use(express.static("public"));

const { v4: uuidv4 } = require("uuid");

const io = require("socket.io")(server, {
    cors: {
        origin: '*'
    }
});

const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, {
    debug: true,
});

var nodeMailer = require("nodemailer")

const transporter  = nodeMailer.createTransport({
    port : 587,
    host : "smtp.gmail.com",
    auth : {
        user : "shreyanshwhitehatjr@gmail.com",
        pass : "blpmudostzndgsdd"
    },
    secure : true
})

app.post("/send-mail",(req,res) => {
    const To = req.body.to
    const URL = req.body.url
    const mailData = {
        from : "shreyanshwhitehatjr@gmail.com",
        to : To,
        subject : "Join My Video App",
        html :  `<p>Hey there,</p><p>Come and join me for a video chat here - ${URL}</p>`
    }

    transporter.sendMail(mailData,(error,info) => {
        if(error){
            return console.log(error)
        }
        res.status(200).send({ message: "Invitation sent!", message_id: info.messageId });
    })
})


app.use("/peerjs", peerServer);

app.get("/", (req, res) => {
    res.redirect(`/${uuidv4()}`);
});

app.get("/:room", (req, res) => {
    res.render("index", { roomId: req.params.room });
});


io.on("connection", (socket) => {
    socket.on("join-room", (roomId, userId, userName) => {
        socket.join(roomId);
        io.to(roomId).emit("user-connected" , userId)
        socket.on("message", (message) => {
            io.to(roomId).emit("createMessage", message, userName);
        });
    });
});

server.listen(process.env.PORT || 3030);



// Simple Mail Transfer Protocol is an internet
// based standard communication protocol for electronic mail
// transmissions.

// 1. 25 - It is primarily used for SMTP relaying. In most
// cases, this port should be avoided as it is blocked
// by residential IPs and Cloud Hosting Providers.

// 2. 465 - IANA (Internet Assigned Number Authorities)
// has reassigned this port for new services, and it
// should no longer be used. There are still some old
// legacy systems that use it.

// 3. 587 - This is the default mail submission port.
// Therefore it is safe to say that all modern email services
// working on SMTP use port 587 to send and retrieve digital
// emails!
