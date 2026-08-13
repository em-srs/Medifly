const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const LOCAL_UPLOAD_DIR = path.join(__dirname, '..', 'uploads', 'prescriptions');
if (!fs.existsSync(LOCAL_UPLOAD_DIR)) {
  fs.mkdirSync(LOCAL_UPLOAD_DIR, { recursive: true });
}

let supabaseClient = null;
try {
  const { createClient } = require('@supabase/supabase-js');
  const supabaseUrl = process.env.SUPABASE_URL || (process.env.PGHOST ? `https://${process.env.PGHOST.split('.')[0]}.supabase.co` : null);
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  if (supabaseUrl && supabaseKey) {
    supabaseClient = createClient(supabaseUrl, supabaseKey);
  }
} catch (err) {
  console.log('Supabase client module notice:', err.message);
}

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Validates uploaded file MIME type and size
 */
const validateFile = (file) => {
  if (!file) {
    throw new Error('No file provided for upload');
  }
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    throw new Error('Unsupported file format. Only JPG, PNG, and PDF files are allowed.');
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File size exceeds the 10MB limit.');
  }
};

/**
 * Uploads file buffer to Supabase Storage (or fallback to local disk)
 * Path convention: prescriptions/{account_owner_id}/{family_member_id}/{filename}
 */
const uploadPrescriptionFile = async ({ file, accountOwnerId, familyMemberId }) => {
  validateFile(file);

  const ext = path.extname(file.originalname).toLowerCase() || (file.mimetype === 'application/pdf' ? '.pdf' : '.jpg');
  const timestamp = Date.now();
  const randomHash = crypto.randomBytes(6).toString('hex');
  const fileName = `${timestamp}_${randomHash}${ext}`;
  const keyPath = `prescriptions/${accountOwnerId}/${familyMemberId}/${fileName}`;

  // Try Supabase Storage first if client is configured
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient.storage
        .from('prescriptions')
        .upload(keyPath, file.buffer || fs.readFileSync(file.path), {
          contentType: file.mimetype,
          upsert: true,
        });

      if (!error && data) {
        return {
          keyPath,
          storageType: 'supabase',
          fileType: file.mimetype,
          fileSizeBytes: file.size,
        };
      } else {
        console.warn('Supabase storage upload returned error, using local fallback:', error?.message);
      }
    } catch (err) {
      console.warn('Supabase storage upload exception, using local fallback:', err.message);
    }
  }

  // Local storage fallback
  const localOwnerDir = path.join(LOCAL_UPLOAD_DIR, String(accountOwnerId), String(familyMemberId));
  if (!fs.existsSync(localOwnerDir)) {
    fs.mkdirSync(localOwnerDir, { recursive: true });
  }

  const localFilePath = path.join(localOwnerDir, fileName);
  if (file.buffer) {
    fs.writeFileSync(localFilePath, file.buffer);
  } else if (file.path) {
    fs.copyFileSync(file.path, localFilePath);
  }

  return {
    keyPath,
    storageType: 'local',
    localFilePath,
    fileType: file.mimetype,
    fileSizeBytes: file.size,
  };
};

/**
 * Generates a signed, short-lived URL (expires in 10 minutes)
 */
const getSignedFileUrl = async (prescription, requesterUserId, requesterRole) => {
  const expirySeconds = 600; // 10 minutes

  // If stored in Supabase Storage and client is ready
  if (supabaseClient && prescription.file_url && prescription.file_url.startsWith('prescriptions/')) {
    try {
      const { data, error } = await supabaseClient.storage
        .from('prescriptions')
        .createSignedUrl(prescription.file_url, expirySeconds);

      if (!error && data?.signedUrl) {
        return data.signedUrl;
      }
    } catch (err) {
      console.warn('Supabase signed URL error:', err.message);
    }
  }

  // Server-issued JWT token signed URL pointing to backend API endpoint
  const secret = process.env.JWT_SECRET || 'medifly_secret_key_2026';
  const fileToken = jwt.sign(
    {
      prescriptionId: prescription.id,
      familyMemberId: prescription.family_member_id,
      requesterUserId,
      requesterRole,
      keyPath: prescription.file_url,
    },
    secret,
    { expiresIn: '10m' }
  );

  const apiBase = process.env.VITE_API_URL || 'http://localhost:5000';
  return `${apiBase}/api/vault/prescriptions/${prescription.id}/file?token=${fileToken}`;
};

/**
 * Deletes file object from storage
 */
const deletePrescriptionFile = async (keyPath) => {
  if (!keyPath) return;

  if (supabaseClient && keyPath.startsWith('prescriptions/')) {
    try {
      await supabaseClient.storage.from('prescriptions').remove([keyPath]);
    } catch (err) {
      console.warn('Supabase storage delete error:', err.message);
    }
  }

  // Local storage cleanup
  try {
    const parts = keyPath.split('/');
    if (parts.length >= 4 && parts[0] === 'prescriptions') {
      const localFilePath = path.join(LOCAL_UPLOAD_DIR, parts[1], parts[2], parts[3]);
      if (fs.existsSync(localFilePath)) {
        fs.unlinkSync(localFilePath);
      }
    }
  } catch (err) {
    console.warn('Local file cleanup notice:', err.message);
  }
};

module.exports = {
  validateFile,
  uploadPrescriptionFile,
  getSignedFileUrl,
  deletePrescriptionFile,
  LOCAL_UPLOAD_DIR,
};
