const testMiddleware = async (req, res, next) => {
    console.log("CRITICAL DEBUG: TEST MIDDLEWARE HIT");

    // Create a fake admin user result to bypass controller errors if this works
    req.result = { _id: "fake_admin_id", role: "admin" };

    next();
}
module.exports = testMiddleware;
