//gurd to know if the file is File[]
export function FileTypeGurd(file) {
    if (file.length !== undefined)
        return true;
    else
        return false;
}
