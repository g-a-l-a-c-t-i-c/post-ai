# Post AI Pricing

## Plans

### Free

- **Storage:** 500MB
- **Queries:** 10,000/day
- **Audit retention:** 30 days
- **Support:** Community

### Pro — $39/month

- **Storage:** 10GB
- **Queries:** 100,000/day
- **Audit retention:** 7 years
- **Support:** Email (24h response)
- **Extras:** Priority migrations, usage analytics

### Enterprise — Contact Sales

- **Storage:** Unlimited
- **Queries:** Unlimited
- **Audit retention:** Custom (regulatory compliance)
- **Support:** Dedicated SLA, 1h response
- **Extras:** Dedicated instance, custom Hyperdrive config, SSO/SAML, on-call support

## Implementation Notes

- Billing integration: Stripe (planned)
- Usage metering: per-query counter via Cloudflare Analytics Engine
- Overage handling: soft limit with email alerts, hard limit after 2x threshold
- Upgrade/downgrade: prorated, effective immediately
