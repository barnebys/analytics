import axios from 'axios';

const { RECAPTCHA_SECRET_KEY } = process.env;

/**
 * Verify reCAPTCHA v3 token with Google
 * @param {string} token - The reCAPTCHA token from the client
 * @param {string} remoteip - The user's IP address (optional)
 * @returns {Promise<Object>} - Verification result with success status and score
 */
export async function verifyRecaptcha(token, remoteip = null) {
  if (!RECAPTCHA_SECRET_KEY) {
    throw new Error('RECAPTCHA_SECRET_KEY environment variable is not set');
  }

  if (!token) {
    return {
      success: false,
      score: 0,
      error: 'No reCAPTCHA token provided'
    };
  }

  try {
    const params = new URLSearchParams();
    params.append('secret', RECAPTCHA_SECRET_KEY);
    params.append('response', token);
    if (remoteip) {
      params.append('remoteip', remoteip);
    }

    const response = await axios.post(
      'https://www.google.com/recaptcha/api/siteverify',
      params,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        timeout: 5000 // 5 second timeout
      }
    );

    const { success, score, 'error-codes': errorCodes, action, hostname } = response.data;

    return {
      success,
      score: score || 0,
      action,
      hostname,
      errorCodes: errorCodes || [],
      error: !success ? `reCAPTCHA verification failed: ${errorCodes?.join(', ') || 'Unknown error'}` : null
    };
  } catch (error) {
    console.error('reCAPTCHA verification error:', error.message);
    return {
      success: false,
      score: 0,
      error: `reCAPTCHA verification request failed: ${error.message}`
    };
  }
}

/**
 * Check if reCAPTCHA score meets minimum threshold
 * @param {number} score - The reCAPTCHA score (0.0 to 1.0)
 * @param {number} threshold - Minimum acceptable score (default: 0.5)
 * @returns {boolean} - Whether the score meets the threshold
 */
export function isScoreAcceptable(score, threshold = 0.5) {
  return score >= threshold;
}
