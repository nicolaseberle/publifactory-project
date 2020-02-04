const servicePermissions = require('../services/permissions');

/**
 * Inject req.permissions: {read: Boolean, write: Boolean}
 */
async function permissions(req, res, next) {
	try {
		if (req.params.userId) {
			req.permissions = await servicePermissions({
				authId: req.decoded._id,
				userId: req.params.userId
			});
			return next();
		} else if (req.params.journalId) {
			req.permissions = await servicePermissions({
				authId: req.decoded._id,
				journalId: req.params.journalId
			});
			return next();
		}
		return next();
	} catch (error) {
		console.log('MIDL=>', error);
		return next(error);
	}
}

module.exports = permissions;
