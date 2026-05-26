//here we create a wrapper function which we can use multiple times 


const asyncHandler=(requestHandler)=>
    (req,res,next)=>{
        Promise.resolve(requestHandler(req,res,next)).catch((err)=>next(err))
    }


export {asyncHandler}



    //one of the methods 

//    //steps of asyncHandler
// // const asyncHandler=()=>{};
// // const asyncHandler=(fn)=>{()=>{}}
// // const asyncHandler=(fn)=>()=>{}

// const asyncHandler=(fn)=>async(req,res,next)=>{
//  try {
//     await fn(req,res,next)
//  } catch (error) {
//     res.status(error.code || 500 ).json({
//         sucess:false,
//         message:error.message
//     })
//  }
// }