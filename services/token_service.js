const jwt = require('jsonwebtoken');
const Refresh = require('../models/Refreshmodel');


class TokenService {

    generateTokens(payload) {
        const accessToken = jwt.sign(payload, "accesstoken", {
            expiresIn: '1y'
        });

        const refreshToken = jwt.sign(payload, "refreshtoken", {
            expiresIn: '1y'
        })

        return { accessToken, refreshToken };
    }



    async storeRefreshToken(token, userId) {
        try {
            await Refresh.create({
                token,
                userId
            })
        }
        catch (exc) {
            console.log(exc.message);
        }
    }



    async verifyRefreshToken(refreshToken) {
        try {
            return jwt.verify(refreshToken, "refreshtoken")
        }
        catch (exc) {
            res.json(exc.message);
        }
    }



    async findRefreshToken( userId, refreshToken){
        const token = await Refresh.findOne({userId : userId, token : refreshToken});
        return token
    }
    

    
    async updateRefreshToken( userId, refreshToken){
        await Refresh.updateOne({userId : userId}, {token : refreshToken});
    }



    async deleteToken(refreshToken){
        await Refresh.deleteOne({ token : refreshToken });
    }

}


module.exports = new TokenService();