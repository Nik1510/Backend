import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser";


const app = express()

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true // This option allows cookies and authorization headers to be sent with cross-origin requests.
    //  This is typically used when the client and server are on different domains 
    // and you want to include credentials (e.g., login tokens) in requests.

}))

// Every incoming request with Content-Type: application/json is parsed,
//  but the payload size is restricted to 20 KB.
app.use(express.json({limit:"20kb"}))


// uelencoded is :- data encoding format i.e. :- URL Encoding 
app.use(express.urlencoded({extended:true, limit:"20kb"})) 
// This limits the size of the incoming JSON payload to 20 KB.
//  If the request exceeds this limit, Express will throw a PayloadTooLargeError


// It allows files like HTML, CSS, JavaScript, images, fonts, etc., 
// located in the "public" folder to be directly accessed via the browser without needing a route defined in the server.

app.use(express.static("public"))

// This middleware parses cookies from incoming
//  requests and makes them available in req.cookies.
app.use(cookieParser())



export {app};