const { Request } = require('../model');
const { Billing } = require('../../billing/model');
const {
	emailEditorTemplate,
	emailEditorApproval
} = require('../../../config/emailing');
const serviceRole = require('../../roles/services');
const { ApiError } = require('../../../config/error');
const Email = require('../../email/email.controller');
const Journal = require('../../journal/journal.model');
const User = require('../../user/user.model');

async function create({ reviewer, ...request }, authId, billingId) {
	const billing = await Billing.findById(billingId);
	if (!billing) throw new ApiError('BILLING_NOT_FOUND');
	const journal = await Journal.findById(request.journal);
	const user = await User.findById(authId);
	if (!user) throw new ApiError('USER_NOT_FOUND');

	const email = new Email(user.email);

	const newRequest = new Request({
		reviewer,
		user: authId,
		...request
	});
	billing.requests.push(newRequest._id);
<<<<<<< HEAD

	await newRequest
		.populate({
			path: 'user',
			select: 'name firstname lastname role roles email'
		})
		.populate({ path: 'journal' })
		.execPopulate();

	// journal use
	if (journal) {
		const userRole = await serviceRole.journalGetRole({
			journalId: journal._id,
			userId: authId
		});
		// user not in journal => 'a_e' or 'editor'
		if (!userRole) {
			const editorRole = await serviceRole.journalGetRole({
				journalId: journal._id,
=======
	if(editor.journal) {
		const userRole = await serviceRole.journalGetRole({
			journalId: editor.journal,
			userId: authId
		});
		await newRequest.populate('editor.journal').execPopulate();
		if (!userRole) {
			const editorRole = await serviceRole.journalGetRole({
				journalId: editor.journal,
>>>>>>> dev
				right: 'editor'
			});
			newRequest.history.push({
				status: 'approval',
				date: new Date().toUTCString()
			});
			const emailEditor = new Email(editorRole.id_user.email);
			emailEditor.sendEmail({
<<<<<<< HEAD
				subject: `A potential associate editor of ${newRequest.journal.title}'s Journal`,
				html: emailEditorApproval(newRequest, authId)
			});
=======
				subject: `A potential associate editor of ${newRequest.editor.journal.title}'s Journal`,
				html: emailEditorApproval(newRequest, authId)
			});
		} else {
			newRequest.history.push({
				status: 'pending',
				data: new Date().toUTCString()
			});
>>>>>>> dev
		}
	} else {
		newRequest.history.push({
			status: 'pending',
			data: new Date().toUTCString()
		});
	}
	await newRequest.save();
	await billing.save();
	if (user.email) {
		email.sendEmail({
			subject: 'Copy of your reviewing request',
			html: emailEditorTemplate.summary(newRequest)
		});
	}
	return newRequest.toObject();
}

module.exports = create;
