const express = require('express');
const app = express();
const path = require('path');
const bodyParser= require('body-parser');
const mongoose = require('mongoose');
//to make same case of word if user input whatever 
const _=require('lodash');

const viewpath = path.join(__dirname, './view');

app.set('view engine' , 'ejs');
app.set('views' ,viewpath);

app.use(bodyParser.urlencoded({ extended: true}));
//this link is from mongo server 
//this is used to host the mongodb cloud aws
mongoose.connect('mongodb+srv://Niroj:Thapa123@cluster0.fvkah.mongodb.net/route');

const listSchema = {
    name:String
}

const listTile=mongoose.model('item', listSchema);

const item1=new listTile({
    name:'niro'
})
const item2=new listTile({
    name:'thapa'
})
const item3=new listTile({
    name:'neo'
})

const defaultvalue=[item1,item2,item3]

//creating another schema object
const fileSchema ={
    name:String,
    item:[listSchema]
}
 const meroList=mongoose.model('list', fileSchema);


app.get('/', function(req, res){

    listTile.find({},function(err,founditem){
        if(founditem.length===0)
        {
            listTile.insertMany(defaultvalue,function(err){
                if(err){
                console.log(err)
                }
                else
                {
                    console.log('inserted all items');
                }
                res.redirect('/');
            })
        }else{
            res.render('profile',{title:'Hello Nepal',items:founditem})
        }

    })
})
//add items  in db
app.post('/add', function(req, res){
    const text=req.body.nayaText;
    const title=req.body.title;
    console.log(text);
    const addedItem=new listTile({
        name: text
    });
    if(title==='Hello Nepal')
    {
    addedItem.save();
    res.redirect('/');
    }else{
        //added into the customename's file 
        meroList.findOne({name:title},function(err,founditem){
            founditem.item.push(addedItem);
            founditem.save();
            res.redirect('/'+title);
        })
    }
})
//to delet if checkedOut
app.post('/delete',function(req,res){
    const idval = req.body.cbox;
    const titleName=req.body.titleName;
    console.log("title:"+titleName);
    console.log(idval);
    /*
    listTile.deleteOne({_id:idval},function(err){
        if(err){
            console.log(err);
        }else{
            console.log('deleted one item');
        }
        res.redirect('/');
    })
    */
   //we can delete like this way too
   if(titleName=='Hello Nepal'){
   listTile.findByIdAndRemove(idval,function(err){
       if(!err){
           console.log('successfully deleted one item');
           res.redirect('/');
       }
   })
}
else
{
    //to delete (pull) and update item of listitems 
    //this is to delet items particular item of merolist items
    //imp this
    meroList.findOneAndUpdate({name:titleName},{$pull:{item:{_id:idval}}},function(err){
        if(!err){
            res.redirect('/'+titleName);
        }
    })
}
})
//this is to route dynamically route
app.get('/:hamrotitle',function(req, res){
    //to make unique case of word use lodash
    //capitalize make all word first is upper and rest of them are lower
    const customName= _.capitalize(req.params.hamrotitle);

   // console.log(customName);
    meroList.findOne({name:customName},function(err,founditem){
        if(!err){
            if(!founditem){

            console.log('does not exist this customName');
            //creating new list and insert
            const list=new meroList({
                name: customName,
                item:defaultvalue
                })
              list.save();
             
              console.log('new customName added');
              //to immediately route into the newly added 
               res.redirect('/'+customName);
            }else{
                console.log('already exist this customName');
                //let's route the existing page acc to custom name
                res.render('profile',{title:founditem.name,items:founditem.item});
            }
        }
    })
   
})

//for heroku details
let port=process.env.PORT;
if(port==null||port==''){
    port=2350;
}
app.listen(port, function(){
 console.log('listening on port 2350');
})