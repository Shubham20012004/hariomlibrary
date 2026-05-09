// backend/src/models/User.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto'); // Required for password reset token

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
    password: {
      type: String,
      minlength: 6,
      select: false, // Don't send password in responses by default
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true, // Creates a unique index but allows multiple null values
    },
    role: {
      type: String,
      enum: ['student', 'admin'],
      default: 'student',
    },
    fees: {
      status: {
        type: String,
        enum: ['unpaid', 'paid', 'overdue', 'waived'],
        default: 'unpaid',
      },
      amount: {
        type: Number,
        default: 0,
        min: 0,
      },
      method: {
        type: String,
        enum: ['Cash', 'Online', 'UPI', 'Card', 'Bank Transfer', 'Other'],
        default: 'Cash',
      },
      lastUpdated: {
        type: Date,
        default: Date.now,
      },
    },
    // Fields for password reset functionality
    passwordResetToken: {
      type: String,
    },
    passwordResetExpires: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// ✅ Custom validation: Ensure either password or googleId is present
UserSchema.pre('validate', function (next) {
  const hasPassword = typeof this.password === 'string' && this.password.trim().length > 0;
  const hasGoogleId = typeof this.googleId === 'string' && this.googleId.trim().length > 0;

  if (!hasPassword && !hasGoogleId) {
    this.invalidate('password', 'Either password or googleId is required.');
    this.invalidate('googleId', 'Either googleId or password is required.');
  }

  next();
});

// ✅ Hash password before save (only when modified)
UserSchema.pre('save', async function (next) {
  // Only hash the password if it has been modified (or is new) and is not empty
  if (this.isModified('password') && typeof this.password === 'string' && this.password.length > 0) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

// ✅ Method to compare entered password with hashed password
UserSchema.methods.matchPassword = async function (enteredPassword) {
  // If the user signed up with Google, they won't have a password
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

// ✅ Method to generate a signed JWT
UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, {
    expiresIn: '1h', // Or your preferred expiration time
  });
};

// ✅ Method to generate and hash a password reset token
UserSchema.methods.getPasswordResetToken = function () {
    // Generate the token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash the token and set it to the passwordResetToken field
    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // Set the expiration time (e.g., 10 minutes from now)
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    // Return the UN-hashed token (this is what gets sent in the email)
    return resetToken;
};


module.exports = mongoose.model('User', UserSchema);
