import {  words2Pinyins } from "./pinyinConvert.js";
import ID3 from "node-id3"
import fs from "fs"



let songs=[]


let path=`D:\\Users\\music\\eason`
let newPath=path+"_new"

fs.readFile(path+"\\Folder.jpg",(errImg,imgData)=>{
    if(errImg) throw errImg;
    



    fs.mkdir(newPath,()=>{
        fs.readdir(path,(err,files)=>{
            if(err){
                return console.log("目录不存在",err);
            }
            //console.log(files)
            songs=files
            songs.forEach(element => {
                let music=words2Pinyins(element,true).replace(/([^a-zA-Z0-9\s\.])+/g,"").replace("ChenYiXun","").replace("Eason","").replace(" Chan","")
                music=music.replace("Official MV","").replace("  "," ").replace(/^([\s]+)/,"").replace(/^([0][0-4][0-9][\s]+)/,"")
                
                fs.copyFileSync(path+"/"+element,newPath+"/"+music)
                //console.log(music.replace(".mp3","").replace(".MP3",""))
                let {image,raw} = ID3.read(path+"\\陈奕迅 - Hippie.mp3")
                image.imageBuffer=imgData;
                raw.APIC.imageBuffer=imgData
                let tags={
                    title:music.replace(".mp3","").replace(".MP3",""),
                    artist:"Eason Chan",
                    //APIC: ".\\Folder.jpg",
                    image,
                    raw
                    
                }
                if(music.split(".")[1]=="mp3"||music.split(".")[1]=="MP3"){
                    console.log(ID3.update(tags,newPath+"\\"+music))
                
                    //console.log(ID3.read(path+"\\"+"陈奕迅 - Hippie.mp3"))
                    //console.log(ID3.read(path+"\\"+"陈奕迅 - Hippie.mp3").image.imageBuffer.toString())
                }
            });
            
        })

        //console.log(ID3)
    })

})







