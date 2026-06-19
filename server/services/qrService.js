const QRCode = require('qrcode');

/**
 * Generate a QR code data URL for claim verification
 * @param {Object} claimData - Claim details to encode
 * @returns {Promise<string>} Base64 data URL of QR code
 */
const generateClaimQR = async (claimData) => {
  try {
    const payload = JSON.stringify({
      claimId: claimData.claimId,
      itemId: claimData.itemId,
      claimantId: claimData.claimantId,
      timestamp: new Date().toISOString(),
      type: 'findit_claim_verification',
    });

    const qrDataUrl = await QRCode.toDataURL(payload, {
      width: 300,
      margin: 2,
      color: {
        dark: '#6366f1',
        light: '#0f172a',
      },
    });

    return qrDataUrl;
  } catch (error) {
    console.error('QR generation error:', error.message);
    return null;
  }
};

module.exports = { generateClaimQR };
