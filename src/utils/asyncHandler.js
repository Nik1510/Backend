// there are two to handle this process 
// i.) Try - catch process 
// ii.) promise 

const asyncHandler = (requestHandler)=>{
    Promise.resolve(requestHandler(req,res,next)).catch((err)=>
    next(err)) 
}

 

export {asyncHandler}

/*
// const asyncHandler =()=>{}
// const asyncHandler =(fn)=>{()=>()}
// const asyncHandler =(func) =>(async)=>{}

    // after combining all three function we get higher order function 
    // in down we have used a higher-order function in JavaScript.


const asyncHandler =(fn)=> async(req,res,next)=>{
    try {
        await fn(req,res,next)
    } catch (error) {
        res.status(err.code|| 500).json({
            success:false,
            message:err.message
        })
    }
}
*/
