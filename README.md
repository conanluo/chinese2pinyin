### 一、出现问题
人在美国,开的车没有中文显示,导致听歌时候不知道那个是什么名字,于是我想写一个`electron+vue`的一个程序,转化我的音乐文件为拼音.

### 中文转拼音字典
```
let dict={
    "a": "\u554a\u963f\u9515",
    "ai": "\u57c3\u6328\u54ce\u5509\u54c0...",
    "an": "\u978d\u6c28\u5b89\u4ffa\u6309\u6697...",
    ...
    ...
}
```

以这种形式把拼音对应的中文放在一起.然后得到这样的一个数据字典.

### 进行翻译
因为字典采用的是unicode编码,所以console.log("\u554a"),后台直接输入"啊"
换句话说就是"\u554a"=="啊" 是true.
根据这个,我们只需要遍历这个字典就可以了.
假如陈奕迅的《孤勇者》那么我们编译出来就是guyongzhe,可是这样的话就不太直观,所以要不驼峰命名法,要不空格隔开每个字.由于我不知道我车的中控能显示的效果,于是我2种方式我都写了.

```
//首先先为每一个字开头大写,把String的原型扩展一下,添加一个方法方便使用
String.prototype.firstUpperCase = function(){
    return this.replace(/\b(\w)(\w*)/g, function($0, $1, $2) {
        return $1.toUpperCase() + $2.toLowerCase();
    });
}

/**
 * @param {string} zh : 输入的文字,
 * @param {boolean} isCapitalFirstLetter : 是否首字母大写,默认全部小写  
 * @return {string} 返回转义后的拼音
 */
export function zh2pinyin(zh,isCapitalFirstLetter){
    let py="";
    for(let val in dict){
        if(dict[val].indexOf(zh)!=-1){
            py=isCapitalFirstLetter?val.firstUpperCase():val;
         break;
        }
     }
    return py==""?zh:py;
};

```

`zh2pinyin(zh,isCapitalFirstLetter)` 只是单个文字转换,我们还需要将整个歌名转换.

```
/**
 * @param {string} words 一串需要转换的文字
 * @param {boolean} isNoSpace 是否有空格, 默认每个拼音之间都有空格,如果没有空格则会用驼峰命名法
 * @returns {string} 返回转移后的拼音
 */
export function words2Pinyins(words,isNoSpace){
    let space=isNoSpace?"":" ";

    let pinyins="";
    let wordsArr=words.split("")
    wordsArr.forEach(word=>{//遍历每个字,进行转义拼凑.
        let sp=space //每个字后面空格
        if(/^[0-9a-zA-Z\s+\.\`\']/.test(word)) sp="" //是否是英文数字,或者" . " ,是的话不需要空格.
        pinyins+=zh2pinyin(word,isNoSpace)+sp 
    })
    return pinyins
}
```

万事俱备,可以用了.

### 繁体字转换简体字
等等 ~ ~ ~啥??还有问题?
是的,因为中文有简体繁体字,某些特殊渠道拿到的歌也许是繁体的.于是我还需要写一写方法转换

因为繁体字,简体字,基本是一一对应的,所以我们不需要用对象方式的字典,我们只需要一个个将有繁体字的排成一个字符串,分别写成简体繁体2个字符串.我这里就把这两个字符串再打包再一个数组里面.
```
let dictionarys = [
    '锕皑蔼碍爱嗳....',
	'錒皚藹礙愛噯....'
]
```

为了以后可以复用这个方法,我把繁简呼唤的方法写出来
```
/**
 * @param {string} word 输入文字
 * @param {boolean} isS2T 是否简体转换繁体
 * @return {string} 返回翻译后的文字
 */

function zhConvert(word,isS2T){
    let wordsPool=isS2T?dictionarys[0]:dictionarys[1]   // 原始字库
    let convertPool=isS2T?dictionarys[1]:dictionarys[0] // 转义字库
    let converted=word
    if(wordsPool.indexOf(word)!=-1){//判断word 是不是在原始字库里面,是的话进行转义
        converted=convertPool.charAt(wordsPool.indexOf(word))
    }
    return converted
}
```
为了方便使用我单独暴露2个函数,分别繁体转简体,和简体转繁体
```
/**
 * @param {string} word 输入文字
 * @return {string} 返回翻译后的文字
 */
function simplified2Traditional(word){
    return zhConvert(word,true)
}
/**
 * @param {string} word 输入文字
 * @return {string} 返回翻译后的文字
 */
function traditional2Simplified(word){
    return zhConvert(word)
}
export {simplified2Traditional,traditional2Simplified}
```
最后别忘记把zh2pinyin函数修改,因为拼音字典都是简体,所以直接将繁体转简体

```
/**
 * @param {string} zh : 输入的文字,
 * @param {boolean} isCapitalFirstLetter : 是否首字母大写,默认全部小写  
 * @return {string} 返回转义后的拼音
 */
export function zh2pinyin(zh,isCapitalFirstLetter){
    let py=zh;
    let zh2=traditional2Simplified(zh, true)//将繁体字转换简体字
    for(let val in dict){ //查找文字进行遍历,查找对应的拼音
        if(dict[val].indexOf(zh2)!=-1){         
            py=isCapitalFirstLetter? val.firstUpperCase(): val;
         break
        }
     }
    return py;
};

```
自此完成汉字转拼音的函数


### 二、修改文件
做完拼音转换,那么就开始转换我们的音乐文件的信息了.当然转换信息,我们需要复制文件,毕竟我们的文件是要放在车里的.

```
import { words2Pinyins } from "./pinyinConvert.js";
import fs from "fs"

let songs=[]

let path="d:\\desktop\\music" //待转换的文件夹
let newPath=paht+"_new"   //转换后的文件,以复制形式修改文件,避免污染源文件.
fs.mkdir(newPath,()=>{
    fs.readdir(path,(err,files)=>{
        if(err){
            return console.log("目录不存在",err);
        }
        songs=files
        songs.forEach(element => {
            let music=words2Pinyins(element,true)
			fs.copyFileSync(path+"/"+element,newPath+"/"+music)
            console.log(music)
        });
    })
})
```
轻轻松松解决文件名字修改,收工

### 三、出现错误
本以为写一个这么简单的东西就可以解决显示问题,结果还是太年轻了.只因为吃了不懂得音乐文件的信息的亏.
播放器显示音乐文件的信息,并不是文件名来显示.我这个只是简简单单修改文件名,对于那些音乐信息(tags信息)完全没有的文件,这个写法还可以凑合用.问题是,大部分音乐文件都不会什么都没.所以注定这个写法失败.

而这些文件信息,存在于音乐文件最后那堆字符串里面.以二进制形式.还有很多模式,什么id3,id4 之类的.

于是我爬网找一些有没相关的api,我在[npm.io](https://npm.io) 上找到2个模块.于是开整.

其中一个是[node-id3](https://npm.io/package/node-id3)
另一个是jsmediatags

最后我选择的是node-id3
```
npm i node-id3 --save
```

最后是
```
import {  words2Pinyins } from "./pinyinConvert.js";
import ID3 from "node-id3"
import fs from "fs"

let songs=[]

let path=`d:\\desktop\\music`
let newPath=path+"_new"
//path=newPath
fs.mkdir(newPath,()=>{
    fs.readdir(path,(err,files)=>{
        if(err){
            return console.log("目录不存在",err);
        }
        //console.log(files)
        songs=files
        songs.forEach(element => {
            let music=words2Pinyins(element,true)
            fs.copyFileSync(path+"/"+element,newPath+"/"+music)
            console.log(music.replace(".mp3","").replace(".MP3",""))
            let tags={//修改的信息,我这里写死了,因为我不想多余信息影响界面.根据自己需要修改.                
	    	title:music.replace(".mp3","").replace(".MP3",""),
                artist:"Eason Chan",
                album:"1"
            }
	    console.log(ID3.write(tags,newPath+"\\"+music))
        });
    })

    //console.log(ID3)
})
```

搞掂,就看看能不能显示了.,所有东西都准备好,下一章就开始制作桌面应用,




