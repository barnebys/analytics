# Google reCAPTCHA v3 Integration

This document describes the integration of Google reCAPTCHA v3 with the analytics tracking system to help prevent bot traffic and improve data quality.

## Overview

The analytics system now supports Google reCAPTCHA v3 integration, which:
- Verifies user interactions before storing data in BigQuery
- Stores reCAPTCHA scores and verification status alongside tracking data
- Provides bot detection capabilities without interrupting user experience
- Maintains backward compatibility with existing tracking implementations

## Program Flow

### Before reCAPTCHA Integration
```
Client Request → URL Parsing → Session Management → Data Collection → BigQuery Storage
```

### After reCAPTCHA Integration
```
Client Request → URL Parsing → reCAPTCHA Verification → Session Management → Data Collection → BigQuery Storage
                                        ↓
                               reCAPTCHA Score & Status Added to Data
```

## Setup Instructions

### 1. Google reCAPTCHA Configuration

1. Visit [Google reCAPTCHA Console](https://www.google.com/recaptcha/admin)
2. Create a new reCAPTCHA v3 site
3. Note down your **Site Key** and **Secret Key**

### 2. Server Configuration

Add the reCAPTCHA secret key to your environment variables:

```bash
# .env file
RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key_here
```

### 3. Client-Side Implementation

Include the reCAPTCHA v3 script in your HTML:

```html
<script src="https://www.google.com/recaptcha/api.js?render=YOUR_SITE_KEY"></script>
```

Generate reCAPTCHA tokens before making tracking requests:

```javascript
async function getRecaptchaToken(action = 'analytics') {
    try {
        const token = await grecaptcha.execute('YOUR_SITE_KEY', { action });
        return token;
    } catch (error) {
        console.error('reCAPTCHA error:', error);
        return null;
    }
}

// Use the token in your tracking URL
const recaptchaToken = await getRecaptchaToken('click');
const trackingUrl = `https://analytics-staging.barnebys.net/?k=click&p=29&recaptcha_token=${recaptchaToken}&...`;
```

## URL Parameters

The system accepts reCAPTCHA tokens via these URL parameters:
- `recaptcha_token` - Custom parameter for reCAPTCHA token
- `g_recaptcha_response` - Standard Google reCAPTCHA parameter

Example tracking URL:
```
https://analytics-staging.barnebys.net/?k=click&p=29&d1=sv_SE&d2=1&recaptcha_token=03AGdBq26...
```

## BigQuery Schema Changes

Two new fields have been added to all tracking tables:

| Field Name | Type | Description |
|------------|------|-------------|
| `recaptchaScore` | FLOAT | reCAPTCHA score (0.0 to 1.0, higher = more human-like) |
| `recaptchaSuccess` | BOOLEAN | Whether reCAPTCHA verification succeeded |

### Score Interpretation
- **0.9 - 1.0**: Very likely human
- **0.7 - 0.9**: Likely human  
- **0.3 - 0.7**: Suspicious, needs review
- **0.0 - 0.3**: Very likely bot

## Error Handling

The system gracefully handles various scenarios:

### Missing reCAPTCHA Token
- **Behavior**: Request is processed normally
- **BigQuery Values**: `recaptchaScore: 0`, `recaptchaSuccess: false`
- **Logging**: Warning logged about missing token

### Invalid reCAPTCHA Token
- **Behavior**: Request is processed normally
- **BigQuery Values**: `recaptchaScore: 0`, `recaptchaSuccess: false`
- **Logging**: Warning logged about verification failure

### reCAPTCHA Service Unavailable
- **Behavior**: Request is processed normally
- **BigQuery Values**: `recaptchaScore: 0`, `recaptchaSuccess: false`
- **Logging**: Error logged about service unavailability

## Configuration Options

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `RECAPTCHA_SECRET_KEY` | Yes | Google reCAPTCHA v3 secret key |

### reCAPTCHA Verification Settings

The verification service includes:
- **Timeout**: 5 seconds for reCAPTCHA API calls
- **IP Validation**: Optional IP address verification
- **Error Handling**: Comprehensive error reporting

## Monitoring and Analytics

### Useful BigQuery Queries

**Check reCAPTCHA verification rates:**
```sql
SELECT 
  DATE(timestamp) as date,
  COUNT(*) as total_requests,
  SUM(CASE WHEN recaptchaSuccess THEN 1 ELSE 0 END) as successful_verifications,
  AVG(recaptchaScore) as avg_score
FROM `your_project.your_dataset.click`
WHERE timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 7 DAY)
GROUP BY date
ORDER BY date DESC
```

**Identify potential bot traffic:**
```sql
SELECT 
  clientIP,
  COUNT(*) as request_count,
  AVG(recaptchaScore) as avg_score,
  SUM(CASE WHEN recaptchaSuccess THEN 1 ELSE 0 END) as successful_verifications
FROM `your_project.your_dataset.click`
WHERE timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 1 DAY)
  AND recaptchaScore < 0.3
GROUP BY clientIP
HAVING request_count > 10
ORDER BY request_count DESC
```

## Testing

### Local Testing
1. Set up reCAPTCHA test keys (provided by Google for localhost)
2. Use the example HTML file: `examples/recaptcha-integration.html`
3. Monitor server logs for reCAPTCHA verification messages

### Production Testing
1. Use real reCAPTCHA keys
2. Monitor BigQuery for reCAPTCHA score distribution
3. Set up alerts for unusual score patterns

## Security Considerations

1. **Secret Key Protection**: Never expose the reCAPTCHA secret key in client-side code
2. **Score Thresholds**: Adjust score thresholds based on your traffic patterns
3. **Rate Limiting**: Consider implementing rate limiting for low-score requests
4. **Monitoring**: Set up alerts for unusual reCAPTCHA patterns

## Backward Compatibility

The integration maintains full backward compatibility:
- Existing tracking URLs work without modification
- Missing reCAPTCHA tokens are handled gracefully
- All existing URL parameters continue to function
- BigQuery schema is extended, not modified

## Troubleshooting

### Common Issues

**reCAPTCHA verification always fails:**
- Check that `RECAPTCHA_SECRET_KEY` is correctly set
- Verify the secret key matches your site configuration
- Ensure the client is using the correct site key

**Low reCAPTCHA scores:**
- Check if the site key and domain are correctly configured
- Verify that reCAPTCHA is loaded before generating tokens
- Consider the user interaction patterns on your site

**Missing reCAPTCHA data in BigQuery:**
- Verify that the schema includes the new fields
- Check server logs for reCAPTCHA verification errors
- Ensure the client is sending the reCAPTCHA token parameter

### Debug Logging

Enable debug logging by checking server console output for:
- `reCAPTCHA verification failed:` - Token verification issues
- `No reCAPTCHA token provided` - Missing token warnings
- `reCAPTCHA verification error:` - Service communication errors

## Performance Impact

The reCAPTCHA integration adds minimal overhead:
- **Client-side**: ~100ms for token generation
- **Server-side**: ~200-500ms for verification API call
- **Storage**: 16 additional bytes per record (2 new fields)

The verification is performed asynchronously and doesn't block the tracking response.
