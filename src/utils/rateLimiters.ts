import rateLimit from "express-rate-limit";

const LoginLimiter = rateLimit({

    windowMs: 5 * 60 * 1000,
    max: 3,
    message: {
        success: false,
        message: "Too many requests. Please try again later."
    },
    standardHeaders: true,
    legacyHeaders: false
});

// const RegistartionLimiter = rateLimit({

//     windowMs: 24 * 60 * 60 * 1000,
//     max: 40,
//     message: {
//         success: false,
//         message: "Too many requests. Please try again later."
//     },
//     standardHeaders: true,
//     legacyHeaders: false
// });

const uploadLimiter = rateLimit({

    windowMs: 24 * 60 * 60 * 1000,
    max: 5,
    message: {
        success: false,
        message: "Too many requests. Please try again later."
    },
    standardHeaders: true,
    legacyHeaders: false
})

const logLimiter = rateLimit({

    windowMs: 1 * 60 * 1000,
    max: 250,
    message: {
        success: false,
        message: "Too many requests. Please try again later."
    },
    standardHeaders: true,
    legacyHeaders: false
})

const VerifyOTPLimiter = rateLimit({

    windowMs: 30 * 60 * 1000,
    max: 3,
    message: {
        success: false,
        message: "Too many OTP requests. Please try again later."
    },
    standardHeaders: true,
    legacyHeaders: false
})

const resendOTPLimiter = rateLimit({

    windowMs: 30 * 60 * 1000,
    max: 1,
    message: {
        success: false,
        message: "Too many Resend OTP requests. Please try again later."
    },
    standardHeaders: true,
    legacyHeaders: false
})

export { LoginLimiter, uploadLimiter, logLimiter, VerifyOTPLimiter, resendOTPLimiter }