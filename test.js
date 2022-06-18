import { zh2pinyin, words2Pinyins } from "./pinyinConvert.js";
import fs from "fs"

//import {traditional2Simplified} from "./zhConvert.js"



let songs=[]


let path=`D:\\Desktop\\music`
let newPath=path
//fs.mkdir(newPath,()=>{
    fs.readdir(path,(err,files)=>{
        if(err){
            return console.log("目录不存在",err);
        }
        //console.log(files)
        songs=files
        songs.forEach(element => {
            let music=words2Pinyins(element,true).replace("ChenYiXun","").replace("Eason Chan","").replace("、","").replace(" - ","")
            
            //fs.copyFileSync(path+"/"+element,newPath+"/"+music)
            console.log(music)
        });
        
        
    })

    
//})









