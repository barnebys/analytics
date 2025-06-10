import { verifyRecaptcha, isScoreAcceptable } from '../../lib/recaptcha/verify';

/**
 * Test reCAPTCHA verification functionality
 */
export default async function testRecaptcha(req, res) {
  const { token, ip } = req.query;

  if (!token) {
    return res.status(400).json({
      error: 'Missing reCAPTCHA token parameter',
      usage: 'GET /api/test/recaptcha?token=YOUR_TOKEN&ip=CLIENT_IP'
    });
  }

  try {
    console.log('Testing reCAPTCHA verification...');
    console.log('Token:', token.substring(0, 20) + '...');
    console.log('IP:', ip || 'not provided');

    const result = await verifyRecaptcha(token, ip);
    
    const response = {
      timestamp: new Date().toISOString(),
      verification: {
        success: result.success,
        score: result.score,
        action: result.action,
        hostname: result.hostname,
        errorCodes: result.errorCodes,
        error: result.error
      },
      analysis: {
        isAcceptable: isScoreAcceptable(result.score),
        scoreInterpretation: getScoreInterpretation(result.score),
        recommendation: getRecommendation(result.score, result.success)
      },
      environment: {
        hasSecretKey: !!process.env.RECAPTCHA_SECRET_KEY,
        secretKeyLength: process.env.RECAPTCHA_SECRET_KEY ? process.env.RECAPTCHA_SECRET_KEY.length : 0
      }
    };

    console.log('reCAPTCHA test result:', JSON.stringify(response, null, 2));

    return res.status(200).json(response);
  } catch (error) {
    console.error('reCAPTCHA test error:', error);
    
    return res.status(500).json({
      error: 'reCAPTCHA test failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

function getScoreInterpretation(score) {
  if (score >= 0.9) return 'Very likely human';
  if (score >= 0.7) return 'Likely human';
  if (score >= 0.3) return 'Suspicious, needs review';
  return 'Very likely bot';
}

function getRecommendation(score, success) {
  if (!success) return 'Block or flag - verification failed';
  if (score >= 0.7) return 'Allow - good score';
  if (score >= 0.3) return 'Review - moderate score';
  return 'Block or flag - low score';
}
