// src/modules/policies/policiesData.js
export const POLICIES_DATA = {
  terms: {
    id: 'terms',
    title: 'Terms & Conditions',
    headerBadge: 'RewardPlanners Legal Policy',
    intro:
      'These Terms & Conditions govern the use of the RewardPlanners platform operated by Maa Pranaam Pro Planner Private Limited. By accessing or using RewardPlanners, users agree to comply with these Terms & Conditions.\n\nRewardPlanners may provide employee engagement programs, reward systems, marketplace services, payment-related services, and government assistance-related features through the platform.',
    disclaimer:
      'RewardPlanners is a private platform and is not affiliated with any government authority unless explicitly stated.',
    sections: [
      {
        num: 1,
        title: 'Acceptance of Terms',
        text: 'By accessing, registering, or using RewardPlanners, users acknowledge and agree to these Terms & Conditions and related policies published by the platform.',
      },
      {
        num: 2,
        title: 'User Eligibility',
        text: 'Users must be at least 18 years old and legally capable of entering into binding agreements to use the platform and related services.',
      },
      {
        num: 3,
        title: 'Services',
        intro: 'RewardPlanners may provide:',
        items: [
          'Employee engagement activities',
          'Reward and incentive programs',
          'Marketplace product redemption',
          'Digital and physical reward fulfillment',
          'Payment and BBPS-related services',
          'Government document assistance services',
          'Wellness and participation-based activities',
        ],
        note: 'Certain services or modules may still be under development and may not be available to all users.',
      },
      {
        num: 4,
        title: 'Account Security',
        items: [
          'Users are responsible for maintaining the confidentiality of account credentials, passwords, OTPs, and login information.',
          'Users are responsible for all activities performed using their account.',
        ],
      },
      {
        num: 5,
        title: 'User Responsibilities',
        items: [
          'Provide accurate and updated information',
          'Use the platform lawfully',
          'Avoid fraudulent, abusive, or misleading activities',
          'Maintain confidentiality of account credentials',
          'Comply with applicable laws and regulations',
        ],
      },
      {
        num: 6,
        title: 'Payments & Billing',
        items: [
          'Payments processed through third-party payment gateways, banking systems, or service providers are subject to respective provider policies and banking regulations.',
          'Applicable taxes, charges, convenience fees, or processing fees may apply depending on services used.',
        ],
      },
      {
        num: 7,
        title: 'BBPS Services',
        items: [
          'RewardPlanners may provide BBPS-related and bill payment-related services through authorized payment partners and providers.',
          'RewardPlanners shall not be responsible for delays, failures, or disruptions caused by banks, billers, payment gateways, telecom providers, or third-party systems.',
          'Certain payment or BBPS-related services may still be under development and may not be available to all users.',
        ],
      },
      {
        num: 8,
        title: 'Government Services Disclaimer',
        items: [
          'RewardPlanners may assist users with document processing, application assistance, or related support services.',
          'RewardPlanners is a private platform and does not represent or claim affiliation with any government authority unless explicitly stated.',
        ],
      },
      {
        num: 9,
        title: 'Rewards & Marketplace',
        intro: 'Reward points, coins, vouchers, incentives, or promotional benefits may be subject to:',
        items: [
          'Expiry periods',
          'Availability limitations',
          'Seller or partner conditions',
          'Redemption eligibility rules',
          'Campaign-specific restrictions',
        ],
        note: 'Marketplace product availability, pricing, and redemption options may change without prior notice.',
      },
      {
        num: 10,
        title: 'Acceptable Use',
        intro: 'Users must not:',
        items: [
          'Use the platform for illegal purposes',
          'Attempt unauthorized access to systems or accounts',
          'Engage in scraping, spamming, or abusive activity',
          'Upload malicious software or harmful content',
          'Misuse rewards, payments, or promotional systems',
        ],
      },
      {
        num: 11,
        title: 'Intellectual Property',
        text: 'All platform content including branding, software, graphics, logos, designs, trademarks, and related intellectual property remain the exclusive property of RewardPlanners or respective licensors.',
      },
      {
        num: 12,
        title: 'Limitation of Liability',
        items: [
          'RewardPlanners and its operators shall not be liable for indirect, incidental, consequential, special, or punitive damages arising from platform usage, third-party services, payment failures, delivery delays, or service interruptions.',
          'Services are provided on an “as available” and “as is” basis subject to applicable laws.',
        ],
      },
      {
        num: 13,
        title: 'Termination',
        text: 'RewardPlanners reserves the right to suspend, restrict, or terminate user accounts violating these Terms & Conditions, applicable laws, or platform policies.',
      },
      {
        num: 14,
        title: 'Changes to Terms',
        text: 'RewardPlanners may update or modify these Terms & Conditions periodically. Continued usage of the platform after updates constitutes acceptance of revised terms.',
      },
      {
        num: 15,
        title: 'Contact Information',
        intro: 'For support or legal queries:',
        contact: {
          email: 'info@rewardplanners.com',
          company: 'Maa Pranaam Pro Planner Private Limited',
        },
      },
    ],
  },
  privacy: {
    id: 'privacy',
    path: '/privacy-policy',
    title: 'Privacy Policy',
    headerBadge: 'RewardPlanners Legal Policy',
    intro:
      'RewardPlanners (“we”, “our”, or “us”) is operated by Maa Pranaam Pro Planner Private Limited. This Privacy Policy explains how we collect, use, process, store, and protect user data while using the RewardPlanners mobile application, website, and related services.\n\nRewardPlanners provides employee engagement services, wellness activities, fitness-based rewards, marketplace features, BBPS bill payment services, government document assistance services, and digital reward redemption services.\n\nRewardPlanners may collect health and fitness-related information such as step count and activity data when users voluntarily enable fitness tracking permissions through Google Fit, Health Connect, or supported fitness integrations.',
    disclaimer:
      'RewardPlanners is a private platform and is not affiliated with any government authority unless explicitly stated.',
    sections: [
      {
        num: 1,
        title: 'Information We Collect',
        subsections: [
          {
            subtitle: 'Personal Information',
            items: [
              'Full name',
              'Email address',
              'Phone number',
              'Date of birth',
              'Organization or employer details',
              'Address information',
              'Profile information',
            ],
          },
          {
            subtitle: 'Technical Information',
            items: [
              'IP address',
              'Device type and model',
              'Operating system version',
              'Device identifiers',
              'Browser type',
              'Application usage logs',
              'Network information',
            ],
          },
          {
            subtitle: 'Health & Fitness Information',
            items: [
              'Daily step count',
              'Walking activity data',
              'Fitness activity information',
              'Wellness challenge participation',
              'Activity tracking information obtained through Google Fit, Health Connect, or supported integrations',
            ],
          },
          {
            subtitle: 'Rewards & Marketplace Information',
            items: [
              'Reward points and coins earned',
              'Reward redemption history',
              'Marketplace purchases',
              'Order details',
              'Shipping information',
            ],
          },
          {
            subtitle: 'Payment & Transaction Information',
            items: [
              'Payment transaction references',
              'BBPS bill payment information',
              'Billing details',
              'Transaction status',
            ],
          },
          {
            subtitle: 'Government Service Information',
            items: [
              'Documents uploaded by users',
              'KYC verification information',
              'Government form details submitted by users',
            ],
          },
        ],
      },
      {
        num: 2,
        title: 'Purpose of Data Collection',
        items: [
          'Account registration and authentication',
          'Employee engagement participation',
          'Step tracking and activity monitoring',
          'Fitness reward and coin calculation',
          'Reward redemption processing',
          'Wellness challenge participation',
          'Marketplace order fulfillment',
          'BBPS bill payment processing',
          'Government document assistance services',
          'Fraud detection and prevention',
          'Customer support',
          'Analytics and platform improvements',
          'Legal and compliance requirements',
        ],
      },
      {
        num: 3,
        title: 'Health Data & Fitness Permissions',
        intro:
          'RewardPlanners may collect and process health and fitness-related data such as step count, walking activity, and fitness activity information when users voluntarily grant fitness permissions through Google Fit, Health Connect, Android fitness APIs, or supported fitness integrations.\n\nThis health and fitness data is collected solely for:',
        items: [
          'Step tracking functionality',
          'Wellness and employee engagement programs',
          'Fitness challenge participation',
          'Coin and reward calculations based on physical activity',
          'Activity-based achievements and leaderboard features',
          'Providing fitness-related app functionality requested by users',
        ],
        paragraphs: [
          'RewardPlanners accesses only the minimum necessary health and fitness data required for app functionality.',
          'RewardPlanners does not sell health or fitness data to advertisers, data brokers, or third parties. Health and fitness data is not used for advertising purposes.',
          'Users may disable or revoke Google Fit, Health Connect, activity recognition, or fitness permissions at any time through their device settings or connected provider settings.',
          'Health and fitness data is securely transmitted using encrypted communication channels.',
        ],
      },
      {
        num: 4,
        title: 'Payments & BBPS Services',
        items: [
          'RewardPlanners may process payments using authorized third-party payment gateways and BBPS service providers.',
          'Certain payment or BBPS-related features may still be under development and may not be available to all users.',
          'UPI, cards, net banking, and supported payment methods may be used.',
          'Payment data is processed securely through encrypted channels.',
          'We do not store complete card or banking credentials on our servers.',
          'Transaction processing timelines may depend on banking networks and payment providers.',
          'Failed transactions may be reversed according to banking partner timelines.',
        ],
      },
      {
        num: 5,
        title: 'Government Document Services',
        items: [
          'Users may voluntarily upload documents for assistance with government-related services and application processing.',
          'Uploaded documents are securely stored.',
          'Access is restricted to authorized personnel only.',
          'Documents are retained only as necessary for service fulfillment or legal compliance.',
          'Users are responsible for submitting accurate information.',
        ],
      },
      {
        num: 6,
        title: 'Data Sharing',
        intro: 'We do not sell personal information or health data. Data may be shared only with:',
        items: [
          'Cloud infrastructure providers',
          'Analytics providers',
          'Payment gateways and banking partners',
          'BBPS processing partners',
          'Government or legal authorities when required by law',
          'Logistics and delivery providers for marketplace orders',
        ],
      },
      {
        num: 7,
        title: 'Data Security',
        items: [
          'HTTPS / TLS encrypted communication',
          'Secure cloud infrastructure',
          'Restricted employee access controls',
          'Monitoring against suspicious activity',
          'Periodic security reviews',
        ],
      },
      {
        num: 8,
        title: 'User Rights',
        intro: 'Users may request:',
        items: [
          'Access to personal data',
          'Correction of inaccurate information',
          'Account deletion',
          'Withdrawal of consent where applicable',
          'Deletion of uploaded documents subject to legal obligations',
          'Revocation of fitness and health permissions',
        ],
      },
      {
        num: 9,
        title: 'Data Retention',
        paragraphs: [
          'User information is retained only as long as necessary to provide services, maintain legal compliance, resolve disputes, and enforce agreements.',
          'Data retention periods may vary depending on the type of service and applicable legal requirements.',
        ],
      },
      {
        num: 10,
        title: "Children's Privacy",
        text: 'RewardPlanners services are intended only for users above 18 years of age.',
      },
      {
        num: 11,
        title: 'Google Play Data Safety',
        intro: 'RewardPlanners collects limited data necessary for:',
        items: [
          'Account functionality',
          'Fitness reward calculation',
          'Step tracking features',
          'Marketplace services',
          'Bill payment services',
          'Platform security and fraud prevention',
        ],
        table: {
          headers: ['Data Type', 'Collected', 'Shared'],
          rows: [
            ['Personal Information', 'Yes', 'No'],
            ['Health & Fitness Data', 'Yes', 'No'],
            ['Step Count & Activity Data', 'Yes', 'No'],
            ['Device/App IDs', 'Yes', 'Yes*'],
            ['Payment Information', 'Yes', 'Yes*'],
            ['Reward Transactions', 'Yes', 'No'],
            ['Government Documents', 'Yes', 'No'],
          ],
        },
        tableFootnote:
          '*Shared only with authorized technical infrastructure, payment, analytics, or compliance providers.',
      },
      {
        num: 12,
        title: 'Contact Information',
        intro: 'For privacy-related concerns, account deletion requests, or support queries:',
        contact: {
          email: 'info@rewardplanners.com',
          company: 'Maa Pranaam Pro Planner Private Limited',
        },
      },
    ],
  },
  shipping: {
    id: 'shipping',
    path: '/shipping-delivery-policy',
    title: 'Shipping & Delivery Policy',
    headerBadge: 'RewardPlanners Policy',
    intro:
      'RewardPlanners may provide shipping and delivery services for eligible marketplace products, rewards, and redemption items.',
    sections: [
      {
        num: 1,
        title: 'Order Processing',
        text: 'Orders are processed after successful confirmation, verification, and payment authorization where applicable.',
      },
      {
        num: 2,
        title: 'Delivery Timeline',
        text: 'Physical products are generally delivered within 5–15 business days depending on location, seller availability, logistics conditions, and serviceability.',
      },
      {
        num: 3,
        title: 'Shipping Partners',
        text: 'RewardPlanners may use third-party logistics, courier, and delivery service providers for order fulfillment and shipment handling.',
      },
      {
        num: 4,
        title: 'Delivery Delays',
        text: 'Delivery delays caused by weather conditions, logistics disruptions, strikes, public holidays, natural events, or force majeure circumstances may occur and are beyond our reasonable control.',
      },
      {
        num: 5,
        title: 'Incorrect Address',
        text: 'Users are responsible for providing complete and accurate shipping information. RewardPlanners shall not be responsible for delays or failed deliveries caused by incorrect address details.',
      },
      {
        num: 6,
        title: 'Tracking Information',
        text: 'Tracking details may be shared with users where tracking services are available through logistics providers.',
      },
      {
        num: 7,
        title: 'Non-Delivery',
        text: 'If an order cannot be delivered due to repeated failed delivery attempts, incorrect address details, or recipient unavailability, the order may be returned or cancelled according to applicable seller or logistics policies.',
      },
      {
        num: 8,
        title: 'Contact Information',
        intro: 'For shipping or delivery-related support:',
        contact: {
          email: 'info@rewardplanners.com',
          company: 'Maa Pranaam Pro Planner Private Limited',
        },
      },
    ],
  },
  refund: {
    id: 'refund',
    path: '/refund-cancellation-policy',
    title: 'Refund & Cancellation Policy',
    headerBadge: 'RewardPlanners Policy',
    intro:
      'Refunds, reversals, and cancellations may vary depending on the type of product, reward, payment, or service used through RewardPlanners.',
    sections: [
      {
        num: 1,
        title: 'General Policy',
        text: 'Refunds and cancellations are processed according to the type of product or service purchased, redeemed, or accessed through RewardPlanners.',
      },
      {
        num: 2,
        title: 'Marketplace Products',
        items: [
          'Physical products may be eligible for replacement or refund if received damaged, defective, or incorrect.',
          'Refund or replacement requests should generally be raised within 7 days of delivery.',
          'Products redeemed using reward points, coins, vouchers, or promotional benefits may not be eligible for refunds.',
          'Approval of refunds or replacements may depend on seller verification and product inspection.',
        ],
      },
      {
        num: 3,
        title: 'Digital Services',
        text: 'Digital services, subscriptions, convenience fees, processing fees, and government document-related processing charges are generally non-refundable once processing has started.',
      },
      {
        num: 4,
        title: 'BBPS & Payment Services',
        items: [
          'RewardPlanners may provide BBPS-related and payment-related services through authorized partners and providers.',
          'Successful bill payments or completed payment transactions generally cannot be cancelled once processed.',
          'Failed, pending, or unsuccessful transactions may be automatically reversed according to banking or payment provider timelines.',
          'Refund timelines may vary depending on banking systems, payment gateways, billers, or service providers.',
          'Certain BBPS or payment-related features may still be under development and may not be available to all users.',
        ],
      },
      {
        num: 5,
        title: 'Order Cancellation',
        items: [
          'Orders may only be cancelled before shipment, dispatch, processing, or service initiation begins.',
          'Once processing or shipment has started, cancellation requests may not be accepted.',
        ],
      },
      {
        num: 6,
        title: 'Non-Refundable Situations',
        items: [
          'Incorrect information submitted by users',
          'Failure to provide required documents',
          'User-side technical or payment issues',
          'Completed digital processing services',
          'Expired offers, rewards, or redemption campaigns',
        ],
      },
      {
        num: 7,
        title: 'Contact Information',
        intro: 'For refund, cancellation, or payment-related support:',
        contact: {
          email: 'info@rewardplanners.com',
          company: 'Maa Pranaam Pro Planner Private Limited',
        },
      },
    ],
  },
  support: {
    id: 'support',
    path: '/support-policy',
    title: 'Support Policy',
    headerBadge: 'RewardPlanners Legal Policy',
    intro:
      'RewardPlanners is committed to providing reliable and timely support services for all users of the platform.',
    sections: [
      {
        num: 1,
        title: 'Support Services',
        text: 'We provide support for account access issues, rewards and redemption concerns, technical problems, dashboard issues, and general platform-related assistance.',
      },
      {
        num: 2,
        title: 'Support Availability',
        text: 'Support services are available during standard business hours from Monday to Friday, 9:00 AM to 6:00 PM IST.',
      },
      {
        num: 3,
        title: 'Response Time',
        text: 'Our team aims to respond to support requests within 24–48 business hours depending on the nature and priority of the issue.',
      },
      {
        num: 4,
        title: 'User Responsibility',
        text: 'Users are responsible for providing accurate account information and detailed issue descriptions to help us investigate and resolve concerns efficiently.',
      },
      {
        num: 5,
        title: 'Service Limitations',
        text: 'RewardPlanners shall not be responsible for issues caused by third-party services, internet failures, unauthorized access, or unsupported devices and browsers.',
      },
      {
        num: 6,
        title: 'Maintenance & Downtime',
        text: 'Scheduled maintenance or system updates may occasionally cause temporary service interruptions. We will make reasonable efforts to notify users in advance whenever possible.',
      },
      {
        num: 7,
        title: 'Contact Information',
        intro: 'For support-related assistance:',
        contact: {
          email: 'info@rewardplanners.com',
          phone: '+91-8660583751',
          company: 'Maa Pranaam Pro Planner Private Limited',
        },
      },
    ],
  },
};

export const POLICIES_LIST = [
  { id: 'terms', label: 'Terms & Conditions', path: '/terms' },
  { id: 'privacy', label: 'Privacy Policy', path: '/privacy-policy' },
  { id: 'shipping', label: 'Shipping & Delivery Policy', path: '/shipping-delivery-policy' },
  { id: 'refund', label: 'Refund & Cancellation Policy', path: '/refund-cancellation-policy' },
  { id: 'support', label: 'Support & Grievance Policy', path: '/support-policy' },
];
