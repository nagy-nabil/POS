import {File} from "formidable"
import {FileTypeGurd} from "./types.js"
import fs from "fs/promises"
export async function saveAvatar(file:File|File[] , name:string):Promise<string|undefined>{
    try{
    if(FileTypeGurd(file)){
        const len = file.length;
        for(let i=1;i<len;++i){
            try{
                await fs.unlink(file[i].filepath)
            }catch(err){
                if (err instanceof Error)
                    console.log(err.message)
            }
        }
        file=file[0] //now the file always File not File[]
        
    }
    let extension!:string;
    if(file.originalFilename !== null) {
        let wordsSplit=file.originalFilename.split('.').pop()
        if(wordsSplit!==undefined){
        extension = wordsSplit}
    }else if(file.mimetype !== null){
        let wordsSplit=file.mimetype.split('/').pop()
        if(wordsSplit!==undefined){
        extension = wordsSplit}
    }else{
        extension="jpg";
    }
    if(!isFileValid(extension as string)) return undefined
    const filePath= `public/${name}.${extension}`
    await fs.rename(`${file.filepath}`,filePath)
    return filePath
    }catch(err){
        if(err instanceof Error){
            console.log(err.message)
            return undefined;
        }
        else{
            return undefined
        }
        }
}
function isFileValid (extension:string):boolean {
    interface Types {
        [k:string]:boolean
    }
    const validTypes:Types={
        "jpg":true,
        "jpeg":true,
        "png":true,
    }
    if (!validTypes[extension]) {
        return false;
    }
    return true;
};