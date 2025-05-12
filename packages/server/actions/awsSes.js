const { 
    SESClient, 
    SendEmailCommand, 
    SESServiceException 
} = require("@aws-sdk/client-ses");
const Handlebars = require("handlebars");
const { getActionObject } = require("../workflow");

/** --------------------------------------------------------------------
 *  1.  Map raw AWS error names → our buckets + retry hints
 *  ------------------------------------------------------------------ */
const RETRYABLE = new Set([
    "ThrottlingException",          // exceeded sending rate :contentReference[oaicite:0]{index=0}
    "TooManyRequestsException",     // HTTP 429        :contentReference[oaicite:1]{index=1}
    "InternalFailure",
    "ServiceUnavailableException",
  ]);
  
  const CONFIG_ERR = new Set([
    "MailFromDomainNotVerifiedException",        // MX record not readable :contentReference[oaicite:2]{index=2}
    "MessageRejected",                           // bad content / un-verified addr :contentReference[oaicite:3]{index=3}
    "SendingPausedException",                    // account paused               :contentReference[oaicite:4]{index=4}
    "AccountSuspendedException",                 // permanently blocked          :contentReference[oaicite:5]{index=5}
    "ConfigurationSetDoesNotExistException",     // bad config-set               :contentReference[oaicite:6]{index=6}
    "LimitExceededException",                    // daily sending cap            :contentReference[oaicite:7]{index=7}
  ]);
  
/**
 * @typedef {"retryable" | "config" | "fatal"} SesErrorKind
 */

class SesSendError extends Error {
    /**
     * @param {SesErrorKind} kind
     * @param {string} message
     * @param {ServiceException} cause
     */
    constructor(kind, message, cause) {
      super(message);
      this.name = "SesSendError";
      this.kind = kind;
      this.cause = cause;
      this.requestId = cause?.$metadata?.requestId;
      this.status = cause?.$metadata?.httpStatusCode;
    }
}

/** Convierte cualquier ServiceException en SesSendError */
function classify(err) {
    const { name } = err;
    if (RETRYABLE.has(name)) return new SesSendError("retryable", err.message, err);
    if (CONFIG_ERR.has(name)) return new SesSendError("config", err.message, err);
    return new SesSendError("fatal", err.message, err); // desconocido → no reintentar
}

module.exports = async function sendEmail(workflowName, requestBody) {

    const awsSesObj = getActionObject(workflowName, "awsSes");

    const sesClient = new SESClient({
        region: "eu-north-1", // replace with your SES region
        maxAttempts: 5,
        credentials: {
          accessKeyId: awsSesObj.accessKey,     // Store in environment variables
          secretAccessKey: awsSesObj.secretKey,
        },
    });

    const templateHtml = Handlebars.compile(awsSesObj.emailHtmlTemplate.toString());
    const bodyHtml = templateHtml(requestBody);

    const params = {
        Source: awsSesObj.verifiedSourceEmail,
        Destination: {
            ToAddresses: awsSesObj.destinationEmails, // [...] array of emails
        },
        Message: {
            Subject: {
                Data: awsSesObj.emailSubject,
                Charset: 'UTF-8'
            },
            Body: {
                Html: {
                    Data: bodyHtml
                }
                /** 
                Text: { 
                    Data: "This is a test message sent using AWS SES and Node.js",
                },
                */
            },
        },
    };

    try {
        const command = new SendEmailCommand(params);
        const response = await sesClient.send(command);
        console.log("Email sent successfully", response);
        return response;
    } catch (error) {
        console.error("Error sending email", error);
        if (error instanceof SESServiceException) {
            const handled = classify(error);
            console.error("Ses send failed", 
                {
                    kind: handled.kind,
                    code: e.name,
                    requestId: handled.requestId,
                    status: handled.status,
                    retryable: handled.kind === "retryable",
                }
            );
            throw handled; // Our AWS error
        }
        throw error; // Unknown error (no AWS)
    }
}