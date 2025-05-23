const asyncHandler = (requestHandler) => {
    Promise
    .then(requestHandler(req,res,next))
    .catch((error)=>{next(error)})
}

const asyncHandlerTryCatch = (requestHandler) => async (req,res,next) =>{
    try {
        await requestHandler(req,res,next)
    } catch (error) {
        res.status(error.code).json({
            status: false,
            message: error.message
        })
    }
}

export {asyncHandler,asyncHandlerTryCatch}