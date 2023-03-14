const sendToken = async (user, statusCode, req, res) => {
  const token = user.getJwtToken();

  // options for cokkie
  const cookieOptions = {
    httpOnly: true,
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),

    // only in production
    secure: true,
    sameSite: "none",
  };

  var origin = req.headers.origin;
  res.setHeader("Referrer-Policy", "origin-when-cross-origin");
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, DELETE, PUT, PATCH"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    [
      "Authorization",
      "Content-Type",
      "membership-id",
      "account-id",
      "X-Requested-With",
      "Accept",
      "Origin",
    ].join(",")
  );
  res.setHeader(
    "Access-Control-Expose-Headers",
    "x-pagination, Content-Length"
  );

  return res.cookie("token", token, cookieOptions).status(statusCode).json({
    success: true,
    user: user,
    token: token,
  });
};

export default sendToken;
