import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Stripe from 'stripe';
import { User, UserPlan } from '../users/entities/user.entity';

@Injectable()
export class BillingService {
  private stripe: Stripe;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {
    this.stripe = new Stripe(
      this.configService.get<string>('STRIPE_SECRET_KEY') || 'sk_test_dummy',
    );
  }

  async createCheckoutSession(userId: string, userEmail: string): Promise<{ url: string }> {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Пользователь не найден');

    let customerId = user.stripeCustomerId;

    if (!customerId) {
      const customer = await this.stripe.customers.create({
        email: userEmail,
        metadata: { userId },
      });
      customerId = customer.id;
      await this.usersRepo.update(userId, { stripeCustomerId: customerId });
    }

    const session = await this.stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{
        price: this.configService.get('STRIPE_PRO_PRICE_ID'),
        quantity: 1,
      }],
      success_url: `${this.configService.get('APP_URL')}/app/settings?upgraded=true`,
      cancel_url: `${this.configService.get('APP_URL')}/pricing`,
      metadata: { userId },
    });

    return { url: session.url! };
  }

  async createPortalSession(userId: string): Promise<{ url: string }> {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user?.stripeCustomerId) throw new NotFoundException('Нет Stripe аккаунта');

    const session = await this.stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${this.configService.get('APP_URL')}/app/settings`,
    });

    return { url: session.url };
  }

  async handleWebhook(payload: Buffer, signature: string): Promise<void> {
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        this.configService.get('STRIPE_WEBHOOK_SECRET') || '',
      );
    } catch {
      throw new Error('Webhook signature verification failed');
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        if (userId) {
          await this.usersRepo.update(userId, { plan: UserPlan.PRO });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customer = await this.stripe.customers.retrieve(
          subscription.customer as string,
        ) as Stripe.Customer;
        const userId = customer.metadata?.userId;
        if (userId) {
          await this.usersRepo.update(userId, { plan: UserPlan.FREE });
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        const customer = await this.stripe.customers.retrieve(customerId) as Stripe.Customer;
        const userId = customer.metadata?.userId;
        if (userId) {
          await this.usersRepo.update(userId, { plan: UserPlan.FREE });
        }
        break;
      }
    }
  }
}