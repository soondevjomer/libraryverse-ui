export interface Profile {
    name:string,
    username:string,
    email:string,

    image?:string|File,
    imageThumbnail?:string|File,
    address?:string,
    contactNumber?:string
}

export interface CheckRequest {
    request:string,
    current?:string,
}