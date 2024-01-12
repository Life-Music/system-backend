import EnvVars from '@src/constants/EnvVars';
import Stripe from 'stripe';

const stripe = new Stripe(EnvVars.Stripe.SK);

export default stripe;