const crypto = require('crypto');
const bcrypt = require('bcrypt');

require('dotenv').config();


// const smsSid = process.env.SMS_SID;
// const smsAuthToken = process.env.SMS_AUTH_TOKEN;
// const twilio = require('twilio')(smsSid, smsAuthToken);



// make it more secure in future - add validity timing
class OtpService {

    async generateOtp() {
        return crypto.randomInt(5000, 9000);
    }

    async hashOtp(otp) {
        let temp = otp.toString();

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(temp, salt);
        return hash;
    }

// otp service not working
    // async sendOtp(phone, otp) {
    //     return await twilio.messages.create({
    //         to: phone,
    //         from: process.env.MY_NUM,
    //         body: `Your Talkpod verification code is ${otp}`
    //     })
    // }


    async verifyOtp(otp, hash) {
        return await bcrypt.compare(otp, hash) 
    }
}




module.exports = new OtpService();