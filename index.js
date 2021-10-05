const express=require("express");
const app= express();
const routes=require("./routes");
const routes2=require("./routes2");
const cors=require("cors");

app.use("/api",routes);
app.use("/api",routes2);
app.use(cors({
    origin:["http://a.com","http://b.com"],
    methods:["GET","POST"],
    allowedHeaders:["Authorization","Content-Type"]
}));

app.listen(8000,function(){
    console.log("Server Running At Port 8000...");
});