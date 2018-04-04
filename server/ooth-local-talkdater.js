const { compareSync } = require('bcrypt-nodejs');

module.exports = function (oothLocal, onVerify) {
	return function ({
        name,
        registerPassportMethod,
        registerMethod,
        registerGetMethod,
        registerUniqueField,
        registerProfileField,
        getProfile,
        getUserByUniqueField,
        getUserById,
        getUserByFields,
        getUniqueField,
        updateUser,
        insertUser,
        requireLogged,
        requireNotLogged,
        requireNotRegistered,
        requireRegisteredWithThis
    }) {

  		oothLocal({
  			name,
	        registerPassportMethod,
	        registerMethod,
	        registerUniqueField,
	        registerProfileField,
	        getProfile,
	        getUserByUniqueField,
	        getUserById,
	        getUserByFields,
	        getUniqueField,
	        updateUser,
	        insertUser,
	        requireLogged,
	        requireNotLogged,
	        requireNotRegistered,
	        requireRegisteredWithThis
  		});

		registerGetMethod('verify', function (req, res) {
            
            const { userId, token } = req.query;

            if (!userId) {
                throw new Error('userId required.');
            }

            if (!token) {
                throw new Error('Verification token required.');
            }

            return getUserById(userId).then(user => {

                if (!user) {
                    throw new Error('User does not exist.');
                }

                if (!user[name] || !user[name].email) {
                    // No email to verify, but let's not leak this information
                    throw new Error('Verification token invalid, expired or already used.');
                }

                if (!compareSync(token, user[name].verificationToken)) {
                    throw new Error('Verification token invalid, expired or already used.');
                }

                if (!user[name].verificationTokenExpiresAt) {
                    throw new Error('Verification token invalid, expired or already used.');
                }

                if (new Date() >= user[name].verificationTokenExpiresAt) {
                    throw new Error('Verification token invalid, expired or already used.');
                }

                return updateUser(user._id, {
                    verified: true,
                    verificationToken: null
                }).then(() => {
                    return getUserById(user._id);
                }).then(user => {

                    if (onVerify) {
                        onVerify({
                            _id: user._id,
                            email: user[name].email
                        });
                    }

                    return res.send({
                        message: 'Email verified',
                        user: getProfile(user)
                    });
                });
            });
        });
	}
}