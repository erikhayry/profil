export function isDiff(obj1: any, obj2: any): Boolean{
    if(!Boolean(obj1) && !Boolean(obj2)){
        return false
    }
    return JSON.stringify(obj1) !== JSON.stringify(obj2)
}