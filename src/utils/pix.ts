/**
 * Utility to generate official Banco Central do Brasil (BCB) BR Code / Pix Copy and Paste payload
 * and visual QR Code URL.
 */

function formatEmv(id: string, value: string): string {
  const len = value.length.toString().padStart(2, '0');
  return `${id}${len}${value}`;
}

function calculateCrc16(payload: string): string {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

function sanitizeText(text: string, maxLength = 25): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9 ]/g, '')
    .trim()
    .slice(0, maxLength)
    .toUpperCase();
}

export interface PixPayloadParams {
  key: string;
  keyType?: 'cpf' | 'cnpj' | 'email' | 'phone' | 'random';
  receiverName?: string;
  receiverCity?: string;
  amount?: number | string;
  txId?: string;
  description?: string;
}

export function generatePixPayload({
  key,
  keyType = 'email',
  receiverName = 'ALX GARAGE',
  receiverCity = 'SAO PAULO',
  amount = '14.90',
  txId = '***',
  description = 'Adesao VIP ALX'
}: PixPayloadParams): string {
  if (!key) return '';

  let cleanKey = key.trim();
  if (keyType === 'phone' || keyType === 'cpf' || keyType === 'cnpj') {
    cleanKey = cleanKey.replace(/\D/g, '');
    if (keyType === 'phone' && !cleanKey.startsWith('55') && cleanKey.length >= 10) {
      cleanKey = `+55${cleanKey}`;
    } else if (keyType === 'phone' && !cleanKey.startsWith('+')) {
      cleanKey = `+${cleanKey}`;
    }
  }

  // 00: Payload Format Indicator
  const p00 = formatEmv('00', '01');

  // 26: Merchant Account Information - Pix
  const gui = formatEmv('00', 'br.gov.bcb.pix');
  const chave = formatEmv('01', cleanKey);
  const infoAdicional = description ? formatEmv('02', sanitizeText(description, 30)) : '';
  const p26 = formatEmv('26', `${gui}${chave}${infoAdicional}`);

  // 52: Merchant Category Code
  const p52 = formatEmv('52', '0000');

  // 53: Transaction Currency (986 = BRL)
  const p53 = formatEmv('53', '986');

  // 54: Transaction Amount
  let amountStr = '';
  if (amount) {
    const num = typeof amount === 'string' ? parseFloat(amount.replace(',', '.')) : amount;
    if (!isNaN(num) && num > 0) {
      amountStr = formatEmv('54', num.toFixed(2));
    }
  }

  // 58: Country Code
  const p58 = formatEmv('58', 'BR');

  // 59: Merchant Name
  const cleanName = sanitizeText(receiverName || 'ALX VIP', 25) || 'ALX VIP';
  const p59 = formatEmv('59', cleanName);

  // 60: Merchant City
  const cleanCity = sanitizeText(receiverCity || 'SAO PAULO', 15) || 'SAO PAULO';
  const p60 = formatEmv('60', cleanCity);

  // 62: Additional Data Field (TxID)
  const cleanTxId = sanitizeText(txId || '***', 25) || '***';
  const txTag = formatEmv('05', cleanTxId);
  const p62 = formatEmv('62', txTag);

  // Assemble before CRC16
  const rawPayload = `${p00}${p26}${p52}${p53}${amountStr}${p58}${p59}${p60}${p62}6304`;

  // 63: CRC16
  const checksum = calculateCrc16(rawPayload);

  return `${rawPayload}${checksum}`;
}

export function getPixQrCodeUrl(payload: string, size = 300): string {
  if (!payload) return '';
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(payload)}&margin=10`;
}
