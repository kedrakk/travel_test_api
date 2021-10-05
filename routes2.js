const express=require("express");
const router=express.Router();

const jwt=require("jsonwebtoken");
const secret="horse battery staple";

const users=[
    {username:"Alice",password:"password",role:"admin"},
    {username:"Bob",password:"password",role:"user"},
];

router.post("/login",function(req,res){
    const {username,password}=req.body;

    const user=users.find(function(u){
        return u.username===username&&u.password===password;
    });

    //if(auth){
        jwt.sign(user,secret,{
            expiresIn:"1h"
        },function(err,token){
            return res.status(200).json({token});
        });
    // }else{
    //     return res.sendStatus(401);
    // }
});

function auth(req,res,next){
    const authHeader=req.headers["authorization"];
    if(!authHeader) return res.sendStatus(401);

    const [type,token]=authHeader.split(" ");

    if(type!=="Bearer") return res.sendStatus(401);
    jwt.verify(token,secret,function(err,data){
        if(err) return res.sendStatus(401);
        else next();
    })
}

function onlyAdmin(req,res,next){
    const [type,token]=req.headers["authorization"].split("");
    jwt.verify(token,secret,function(err,user){
        if(user.role==="admin") next();
        else return res.status(403);
    });
    next();
}

router.get("/users",auth,function(req,res){
    return res.status(200).json({data:"All Users"});
});

router.get("/admin",auth,onlyAdmin,function(req,res){
    return res.status(200).json({data:"All Admins"});
});

module.exports=router;