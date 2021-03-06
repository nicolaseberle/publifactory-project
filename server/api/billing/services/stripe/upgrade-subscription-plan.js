const stripe = require('../../../../config/stripe');

async function upgradeSubscriptionPlan({
	subscriptionId,
	paymentMethodId,
	premiumPlanId
}) {
	try {
		const subscription = await stripe.subscriptions.retrieve(subscriptionId);
		const updatedSubscription = await stripe.subscriptions.update(
			subscription.id,
			{
				cancel_at_period_end: false, // eslint-disable-line
				default_payment_method: paymentMethodId, // eslint-disable-line
				proration_behavior: 'none', // eslint-disable-line
				billing_cycle_anchor: 'now', // eslint-disable-line
				items: [
					{
						id: subscription.items.data[0].id,
						plan: premiumPlanId
					}
				]
			}
		);
		return updatedSubscription;
	} catch (error) {
		console.log('ERROR INCREMENT=>', error);
		throw error;
	}
}

module.exports = upgradeSubscriptionPlan;
