const stripe = require('../../../../config/stripe');

async function unsubscribeSubscriptionPlan({ subscriptionId }) {
	try {
		// TODO check for prorate with freemium change
		const subscription = await stripe.subscriptions.del(subscriptionId, {
			// eslint-disable-next-line
			invoice_now: true,
			prorate: true
		});
		return subscription;
	} catch (error) {
		console.log('ERROR INCREMENT=>', error);
		throw error;
	}
}

module.exports = unsubscribeSubscriptionPlan;
