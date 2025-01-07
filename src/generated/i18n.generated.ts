/* DO NOT EDIT, file generated by nestjs-i18n */

/* eslint-disable */
/* prettier-ignore */
import { Path } from "nestjs-i18n";
/* prettier-ignore */
export type I18nTranslations = {
    "auth": {
        "userNotFound": string;
        "userWithGoogleAuth": string;
        "userWithEmailNotVerified": string;
        "userWithoutGoogleAuth": string;
        "userWithoutPassword": string;
        "userRoleNotFound": string;
        "emailInUse": string;
        "emailRequired": string;
        "invalidPassword": string;
        "invalidToken": {
            "one": string;
            "other": string;
        };
        "login": {
            "success": string;
        };
        "logout": {
            "success": string;
        };
        "refreshTokens": {
            "success": string;
        };
        "register": {
            "success": string;
        };
        "verifyEmail": {
            "success": string;
        };
        "forgotPassword": {
            "pendingRequest": string;
            "success": string;
        };
        "resetPassword": {
            "noRequestFound": string;
            "success": string;
        };
        "googleLogin": {
            "success": string;
        };
    };
    "guards": {
        "jwt": {
            "invalid": string;
        };
        "roles": {
            "forbidden": string;
        };
    };
    "mails": {
        "emailVerification": {
            "subject": string;
            "html": {
                "header": {
                    "title": string;
                };
                "body": {
                    "greeting": string;
                    "content": string;
                    "button": string;
                    "link": string;
                };
                "footer": {
                    "content": string;
                    "signature": string;
                };
            };
        };
        "resetPassword": {
            "subject": string;
            "html": {
                "header": {
                    "title": string;
                };
                "body": {
                    "greeting": string;
                    "content": string;
                    "button": string;
                    "link": string;
                };
                "footer": {
                    "content": string;
                    "signature": string;
                };
            };
        };
    };
    "users": {
        "findOne": {
            "notFound": string;
        };
        "delete": {
            "success": string;
        };
        "update": {
            "noData": string;
            "usernameInUse": string;
            "noChanges": string;
            "success": string;
        };
        "updatePicture": {
            "success": string;
        };
        "deletePicture": {
            "notFound": string;
            "success": string;
        };
    };
    "validations": {
        "ALPHA": string;
        "ALPHANUMERIC": string;
        "ARRAY": string;
        "ASCII": string;
        "BIC_SWIFT": string;
        "BOOLEAN_STRING": string;
        "BOOLEAN": string;
        "BTC_ADDRESS": string;
        "CREDIT_CARD": string;
        "CURRENCY": string;
        "DATA_URI": string;
        "DATE": string;
        "DECIMAL": string;
        "EMAIL": string;
        "ENUM": string;
        "EXACT_DATE": string;
        "EXACT_LENGTH": string;
        "EXACT_NUMBER": string;
        "FIREBASE_PUSH_ID": string;
        "FULL_WIDTH": string;
        "HALF_WIDTH": string;
        "HASH_TYPE": string;
        "HEX_COLOR": string;
        "HEX_NUMBER": string;
        "HSL_COLOR": string;
        "IDENTITY_CARD": string;
        "INTEGER": string;
        "ISO_8601_DATE": string;
        "ISO31661_ALPHA2": string;
        "ISO31661_ALPHA3": string;
        "ISSN": string;
        "JSON_STRING": string;
        "JWT_STRING": string;
        "LATITUDE": string;
        "LENGTH": string;
        "LONGITUDE": string;
        "LOWERCASE_STRING": string;
        "MAC_ADDRESS": string;
        "MATCH_REGEX": string;
        "MAX_DATE": string;
        "MAX_LENGTH": string;
        "MAX_NUMBER": string;
        "MIME_TYPE": string;
        "MIN_DATE": string;
        "MIN_LENGTH": string;
        "MIN_NUMBER": string;
        "MONGODB_ID": string;
        "MULTIBYTE": string;
        "NEGATIVE": string;
        "NOT_EMPTY": string;
        "NOT_GREATER_THAN": string;
        "NOT_LESS_THAN": string;
        "NUMBER": string;
        "NUMERIC": string;
        "OBJECT": string;
        "OCTAL_NUMBER": string;
        "PASSPORT_NUMBER": string;
        "PHONE_NUMBER": string;
        "PORT": string;
        "POSITIVE": string;
        "POSTAL_CODE": string;
        "SEMVER": string;
        "STRING": string;
        "SURROGATE_PAIRS": string;
        "UPPERCASE_STRING": string;
        "URL": string;
    };
};
/* prettier-ignore */
export type I18nPath = Path<I18nTranslations>;
