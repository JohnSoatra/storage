type UserC = {
    id: string,
    username: string,
    email: string,
    
    fullname: string,
    phone_number: string,
    address: string,

    image_url: string|null,
    image_color: string,
    type: number,
}

type GetoneUserRouter = UserC|null;