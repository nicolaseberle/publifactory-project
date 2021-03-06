const { Request } = require('../model');

async function read(requestId) {
	const request = await Request.findById(requestId)
		.populate({
			path: 'user',
			select: 'name firstname lastname role roles email'
		})
		.populate({ path: 'journal' });
	if (!request) throw new Error('REQUEST_NOT_FOUND');
	return request;
}

module.exports = read;
