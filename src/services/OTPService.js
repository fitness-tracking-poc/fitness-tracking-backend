const crypto = require('crypto');

/**
 * OTP Service
 * Handles OTP generation, storage, and verification
 * Uses mock SMS for development
 */

class OTPService {
    /**
     * Generate a 6-digit OTP
     * @returns {string} 6-digit OTP
     */
    generateOTP() {
        // For development, always return "123456"
        if (process.env.NODE_ENV === 'development') {
            return '123456';
        }

        // For production, generate random 6-digit OTP
        return crypto.randomInt(100000, 999999).toString();
    }

    /**
     * Send OTP via SMS
     * @param {string} mobileNumber - Mobile number to send OTP to
     * @param {string} otp - OTP to send
     * @returns {Promise<boolean>} Success status
     */
    async sendOTP(mobileNumber, otp) {
        try {
            // Mock SMS service for development
            if (process.env.NODE_ENV === 'development') {
                console.log(`📱 [MOCK SMS] Sending OTP to ${mobileNumber}: ${otp}`);
                return true;
            }

            // TODO: Integrate real SMS service (Twilio, AWS SNS, etc.)
            // Example with Twilio:
            // const client = require('twilio')(accountSid, authToken);
            // await client.messages.create({
            //     body: `Your OTP is: ${otp}`,
            //     from: twilioNumber,
            //     to: mobileNumber
            // });

            return true;
        } catch (error) {
            console.error('Error sending OTP:', error);
            return false;
        }
    }

    /**
     * Verify OTP
     * @param {string} storedOTP - OTP stored in database
     * @param {Date} otpExpiry - OTP expiry time
     * @param {string} providedOTP - OTP provided by user
     * @returns {boolean} Verification status
     */
    verifyOTP(storedOTP, otpExpiry, providedOTP) {
        // Check if OTP has expired
        if (this.isOTPExpired(otpExpiry)) {
            return false;
        }

        // Check if OTP matches
        return storedOTP === providedOTP;
    }

    /**
     * Check if OTP has expired
     * @param {Date} otpExpiry - OTP expiry time
     * @returns {boolean} Expiration status
     */
    isOTPExpired(otpExpiry) {
        return new Date() > new Date(otpExpiry);
    }

    /**
     * Get OTP expiry time (10 minutes from now)
     * @returns {Date} Expiry time
     */
    getOTPExpiry() {
        const expiry = new Date();
        expiry.setMinutes(expiry.getMinutes() + 10); // OTP valid for 10 minutes
        return expiry;
    }
}

module.exports = new OTPService();
