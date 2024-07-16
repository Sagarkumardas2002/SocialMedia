import { atom } from "recoil";

const userAtom = atom({
    key: 'username',
    default: JSON.parse(localStorage.getItem('user-threads'))
})

export default userAtom;