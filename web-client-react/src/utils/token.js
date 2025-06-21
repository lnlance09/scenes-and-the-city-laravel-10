import { jwtDecode } from "jwt-decode"
const secretKey = import.meta.env.VITE_API_JWT_SECRET

/*
export const parseJwt = () => {
    let localData = false
    jwt.verify(localStorage.getItem("jwtToken"), secretKey, (err, decoded) => {
        if (decoded) {
            localData = {}
            localData = decoded.data
        }
    })
    return localData
}
*/

/*
export const setToken = (data) => {
    const token = jwt.sign({ data }, secret, {
        expiresIn: 60 * 60 * 5
    })
    localStorage.setItem("jwtToken", token)
    return token
}
*/
