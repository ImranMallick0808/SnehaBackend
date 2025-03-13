 //create token and saving in cookie

 const sendToken=(admin,statusCode,res)=>{
    const token =admin.getJWTToken();

    const options={
        expires:new Date(
            Date.now()+process.env.COOKIE_EXPIRE * 24*60*60*1000
        ),
        httpOnly:true,
       secure: process.env.NODE_ENV === 'production', // Set secure flag in production (ensure you're using HTTPS in production)
    sameSite: 'None',
    };
    res.status(statusCode).cookie("token",token,options).json({
        success:true,
        admin,
        token,
        name: admin.name,  
    role: admin.role
    })
 };
 module.exports=sendToken;
