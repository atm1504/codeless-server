const Uidai = require("./../models/uidai");
module.exports = (req, res, next) => {
    const access_token = req.body.access_token;
    Uidai.findById(access_token)
        .then(user => {
        if (!user) {
            return res.status("402").json({ mess: "Unauthorized access" })
        }
            next();
        }).catch(err => {
        return res.status("402").json({ mess: "Unauthorized access" })
    })
}