import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { motion } from 'framer-motion';
import { Check, Zap, Crown, ShieldCheck, CreditCard, Loader2 } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const Billing = () => {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processingPlan, setProcessingPlan] = useState(null);
  const { addToast } = useToast();
  const user = api.getUser();

  useEffect(() => {
    const loadSubscription = async () => {
      try {
        const data = await api.getSubscriptionStatus(user.id);
        setSubscription(data);
      } catch (err) {
        console.error('Error loading subscription:', err);
      } finally {
        setLoading(false);
      }
    };
    if (user) loadSubscription();
  }, [user]);

  const handleUpgrade = async (plan, amount) => {
    setProcessingPlan(plan);
    try {
      // 1. Create Order on Backend
      const order = await api.createRazorpayOrder(user.id, plan, amount);
      
      // 2. Open Razorpay Checkout
      const options = {
        key: 'rzp_test_qUmhUFElBiSNIs', // Public Key
        amount: order.amount,
        currency: order.currency,
        name: "TaskFlow Pro",
        description: `Upgrade to ${plan} Plan`,
        image: "https://cdn-icons-png.flaticon.com/512/3665/3665923.png",
        order_id: order.id,
        handler: async (response) => {
          try {
            // 3. Verify Payment on Backend
            const verification = await api.verifyRazorpayPayment({
              ...response,
              userId: user.id
            });
            
            if (verification.success) {
              setSubscription(verification.sub);
              addToast(`Welcome to ${plan}! Your features are now unlocked. ✨`, 'success');
            }
          } catch (err) {
            addToast('Payment verification failed. Please contact support.', 'error');
          } finally {
            setProcessingPlan(null);
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: {
          color: "#6C5CE7",
        },
        modal: {
          ondismiss: () => setProcessingPlan(null)
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
      
    } catch (err) {
      addToast('Failed to initialize payment', 'error');
      setProcessingPlan(null);
    }
  };

  const plans = [
    {
      name: 'Free',
      price: '$0',
      amount: 0,
      description: 'Ideal for individuals and small side projects.',
      features: ['Up to 3 Projects', '10 Tasks per Project', 'Basic Analytics', 'Community Support'],
      buttonText: 'Current Plan',
      isCurrent: subscription?.plan === 'Free',
      icon: <Zap size={24} className="text-secondary" />,
    },
    {
      name: 'Pro',
      price: '₹1499',
      amount: 1499,
      description: 'Best for professional teams and growing startups.',
      features: ['Unlimited Projects', 'Unlimited Tasks', 'Advanced AI Assistant', 'Priority Support', 'Custom Tags', 'Real-time Analytics'],
      buttonText: 'Upgrade to Pro',
      isCurrent: subscription?.plan === 'Pro',
      featured: true,
      icon: <Crown size={24} style={{ color: '#FDCB6E' }} />,
    },
    {
      name: 'Enterprise',
      price: '₹4999',
      amount: 4999,
      description: 'Custom solutions for large scale organizations.',
      features: ['Everything in Pro', 'Custom Integrations', 'SLA Guarantee', 'Dedicated Account Manager', 'Advanced Security', 'Self-hosting options'],
      buttonText: 'Contact Sales',
      isCurrent: subscription?.plan === 'Enterprise',
      icon: <ShieldCheck size={24} style={{ color: '#00B894' }} />,
    }
  ];

  if (loading) return <div className="loading-overlay"><div className="spinner"></div></div>;

  return (
    <div className="billing-container p-2xl">
      <div className="page-header mb-3xl">
        <div>
          <h2>Billing & Subscription</h2>
          <p className="page-header-subtitle">Manage your plan and billing preferences</p>
        </div>
        {subscription?.status === 'active' && (
          <div className="badge badge-success flex items-center gap-xs px-md py-sm">
            <Check size={14} /> Active {subscription.plan} Subscription
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2xl">
        {plans.map((plan, idx) => (
          <motion.div 
            key={plan.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`chart-card relative flex flex-col ${plan.featured ? 'border-accent shadow-glow' : ''}`}
            style={{ padding: 'var(--space-2xl)', background: plan.featured ? 'rgba(108, 92, 231, 0.05)' : 'var(--bg-glass)' }}
          >
            {plan.featured && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-accent-primary text-white text-xs font-bold px-md py-xs rounded-full">
                MOST POPULAR
              </div>
            )}
            
            <div className="flex justify-between items-start mb-xl">
              <div>
                <div className="flex items-center gap-sm mb-xs">
                  {plan.icon}
                  <h3 className="font-bold text-lg">{plan.name}</h3>
                </div>
                <p className="text-secondary text-xs">{plan.description}</p>
              </div>
            </div>

            <div className="mb-2xl">
              <span className="text-3xl font-bold">{plan.price}</span>
              <span className="text-secondary ml-xs">/month</span>
            </div>

            <div className="flex-1 mb-2xl">
              <p className="font-semibold text-xs mb-md uppercase tracking-wider text-tertiary">What's Included:</p>
              <ul className="flex flex-col gap-sm">
                {plan.features.map(feat => (
                  <li key={feat} className="flex items-start gap-sm text-sm">
                    <Check size={16} className="text-success mt-xs shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button 
              className={`btn w-full btn-lg ${plan.isCurrent ? 'btn-neutral' : plan.featured ? 'btn-primary' : 'btn-outline'}`}
              disabled={plan.isCurrent || (processingPlan === plan.name) || plan.name === 'Enterprise'}
              onClick={() => handleUpgrade(plan.name, plan.amount)}
            >
              {processingPlan === plan.name ? (
                <div className="flex items-center justify-center gap-sm">
                  <Loader2 className="animate-spin" size={20} />
                  Processing...
                </div>
              ) : plan.isCurrent ? 'Current Plan' : plan.buttonText}
            </button>
          </motion.div>
        ))}
      </div>

      <div className="mt-3xl chart-card p-2xl">
        <div className="flex items-center gap-xl">
          <div className="stat-card-icon" style={{ width: '56px', height: '56px', fontSize: '1.5rem', background: 'var(--bg-glass-strong)' }}>
            <CreditCard />
          </div>
          <div className="flex-1">
            <h4 className="font-bold mb-xs">Payment Method</h4>
            <p className="text-secondary text-sm">Update your credit card and billing address.</p>
          </div>
          <button className="btn btn-outline">Manage Methods</button>
        </div>
      </div>
    </div>
  );
};

export default Billing;
