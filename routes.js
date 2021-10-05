const express=require("express");
const router=express.Router();

const mongojs=require("mongojs");
const db=mongojs("travel",["records"]);

const bodyParse=require("body-parser");

const {body,param,validationResult}=require("express-validator");

router.use(bodyParse.urlencoded({extended:false}));
router.use(bodyParse.json());

router.get("/records",function(req,res){
    const options=req.query;

    const sort=options.sort||{};
    const filter=options.filter||{};
    const limit=parseInt(options.limit)||10;
    const page=parseInt(options.page)||1;
    const skip=(page-1)*limit;

    for(i in sort){
        sort[i]=parseInt(sort[i]);
    }

    db.records.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit,function(err,data){
            if(err){
                return res.sendStatus(500);
            }else{
                return res.status(200).json({
                    meta:{
                        skip,
                        limit,
                        sort,
                        filter,
                        page,
                        total:data.length
                    },
                    data
                });
            }
        });
});

router.post("/records",[
    body("name").not().isEmpty(),
    body("from").not().isEmpty(),
    body("to").not().isEmpty(),
],function(req,res){
    const errors=validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()});
    }
    db.records.insert(req.body,function(err,data){
        if(err){
            res.status(500);
        }
        const _id=data._id;
        res.append("Location","/records/"+_id);
        return res.status(201).json({meta:{_id},data});
    });
});

router.put("/records/:id",[
    param("id").isMongoId(),
],function(req,res){
    const _id=req.params.id;
    const errors=validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()});
    }
    db.records.count({
        _id:mongojs.ObjectId(_id)
    },function(err,count){
        if(count){
            const record={
                _id:mongojs.ObjectId(_id),
                ...req.body
            };

            db.records.save(record,function(err,data){
                return res.status(200).json({
                    meta:{_id},data
                });
            });
        }else{
            db.records.save(req.body,function(err,data){
                return res.status(201).json({
                    meta:{_id:data._id},data
                });
            });
        }
    });
});

router.patch("/records/:id",[
    param("id").isMongoId(),
],function(req,res){
    const _id=req.params.id;
    const errors=validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()});
    }
    db.records.count({
        _id:mongojs.ObjectId(_id)
    },function(err,count){
        if(count){
            const record={
                _id:mongojs.ObjectId(_id),
                ...req.body
            };

            db.records.save(record,function(err,data){
                return res.status(200).json({
                    meta:{_id},data
                });
            });
        }else{
            return res.status(404).json({
                meta:{msg:"ID "+ _id+" Not Found"}
            });
        }
    });
});

router.delete("/records/:id",function(req,res){
    const _id=req.params.id;

    db.records.count({
        _id:mongojs.ObjectId(_id)
    },function(err,count){
        if(count){
            db.records.remove({
                _id:mongojs.ObjectId(_id)
            },function(err,data){
                return res.sendStatus(204);
            });
        }else{
            return res.status(404).json({
                meta:{msg:"ID "+ _id+" Not Found"}
            });
        }
    });
});

module.exports=router;