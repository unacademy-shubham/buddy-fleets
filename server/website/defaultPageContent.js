const section = (id, type, order, data, variant = 'default') => ({
  id,
  type,
  enabled: true,
  order,
  variant,
  data,
});

const item = (id, values) => ({ id, ...values });

export const DEFAULT_PAGE_CONTENT = {
  home: {
    schemaVersion: 1,
    sections: [
      section('home-hero', 'hero', 10, {
        eyebrow: 'YOUR FLEETS ONE OPERATING SYSTEM',
        heading: 'Cloud based intellectual Fleets management system',
        subheading: '',
        description: 'Buddy Fleets is a cloud-based fleet management software for transport businesses to manage vehicles, drivers, trips, dispatch, LR/Bilty, expenses, diesel, maintenance, compliance, documents and fleet reports from one platform.',
        primaryCta: { label: 'Start Free Trial', href: '/signup' },
        secondaryCta: { label: 'View Features', href: '/features' },
        imageUrl: '/images/truck-640.webp',
        imageAlt: 'Commercial transport truck representing transport operations',
        trustItems: ['Fleet Management', 'Transport Operations', 'Finance & Compliance'],
      }, 'home-split'),
      section('home-highlights', 'highlights', 20, {
        eyebrow: '',
        heading: '',
        description: '',
        items: [
          item('home-highlight-fleet', { title: 'Fleet Operations', description: 'Vehicles, drivers, trips and dispatch workflows.', icon: 'truck', number: '01' }),
          item('home-highlight-finance', { title: 'Finance', description: 'Expenses, diesel, advances and settlements.', icon: 'wallet-cards', number: '02' }),
          item('home-highlight-compliance', { title: 'Compliance', description: 'Documents, renewals and operational alerts.', icon: 'shield-check', number: '03' }),
          item('home-highlight-maintenance', { title: 'Maintenance', description: 'Workshop, tyres, spares and service records.', icon: 'wrench', number: '04' }),
        ],
      }, 'compact-cards'),
      section('home-intro', 'rich-text', 30, {
        eyebrow: 'One connected ecosystem',
        heading: 'Your transport business. One workspace.',
        body: 'Reduce dependence on scattered registers, spreadsheets, messages and disconnected records. Buddy Fleets gives your team one structured operational layer for day-to-day fleet management.',
      }, 'split-intro'),
      section('home-core', 'feature-grid', 40, {
        eyebrow: 'Core capabilities',
        heading: 'Built for everyday transport operations.',
        description: '',
        items: [
          item('home-core-1', { number: '01', title: 'Transport Operations', description: 'Manage LR/Bilty, consignments, trip allocation, vehicle assignment, driver assignment and delivery workflows from one connected system.', icon: 'truck', category: 'Operations', accent: 'cyan', imageUrl: '/images/truck-640.webp', imageAlt: 'Commercial transport truck representing transport operations' }),
          item('home-core-2', { number: '02', title: 'Workshop, Tyres & Spares', description: 'Maintain workshop jobs, service records, tyre lifecycle, spare parts and vehicle maintenance information in one place.', icon: 'wrench', category: 'Maintenance', accent: 'blue', imageUrl: '/images/workshop-560.webp', imageAlt: 'Vehicle workshop representing maintenance operations' }),
          item('home-core-3', { number: '03', title: 'Expenses & Transport Finance', description: 'Organize trip expenses, diesel, driver advances, party records, invoices and settlements with cleaner financial workflows.', icon: 'receipt-text', category: 'Finance', accent: 'emerald', imageUrl: '/images/finance-560.webp', imageAlt: 'Financial records representing transport finance workflows' }),
        ],
      }, 'media-cards'),
      section('home-workflow', 'workflow', 50, {
        eyebrow: 'End-to-end workflow',
        heading: 'From booking to settlement. Everything stays connected.',
        description: '',
        items: [
          item('home-workflow-1', { step: '01', title: 'Booking', description: 'Create LR/Bilty and consignment details.', icon: 'file-text' }),
          item('home-workflow-2', { step: '02', title: 'Dispatch', description: 'Assign the required vehicle and driver.', icon: 'truck' }),
          item('home-workflow-3', { step: '03', title: 'Trip Updates', description: 'Keep trip information and operational progress organized.', icon: 'clipboard-check' }),
          item('home-workflow-4', { step: '04', title: 'Delivery', description: 'Record delivery status and ePOD information.', icon: 'package-check' }),
          item('home-workflow-5', { step: '05', title: 'Settlement', description: 'Close the trip and complete financial records.', icon: 'wallet-cards' }),
        ],
      }, 'horizontal-steps'),
      section('home-overview', 'highlights', 60, {
        eyebrow: 'Operations overview',
        heading: 'Keep important fleet information easier to review.',
        description: 'Review operational records such as trips, vehicles, expenses, deliveries, maintenance and pending actions without relying on multiple disconnected registers.',
        items: [
          item('home-overview-1', { title: 'Trip & LR/Bilty', description: '', icon: 'file-text', number: '01' }),
          item('home-overview-2', { title: 'Vehicles & Drivers', description: '', icon: 'truck', number: '02' }),
          item('home-overview-3', { title: 'Expenses & Diesel', description: '', icon: 'fuel', number: '03' }),
          item('home-overview-4', { title: 'Maintenance & Alerts', description: '', icon: 'bell', number: '04' }),
        ],
      }, 'overview'),
      section('home-benefits', 'benefits', 70, {
        eyebrow: 'Why Buddy Fleets',
        heading: 'Built around real fleet workflows.',
        description: '',
        items: [
          item('home-benefit-1', { number: '01', title: 'Controlled Fleet Records', description: 'Keep vehicle, driver, party and operational records inside one organized platform.', icon: 'shield-check' }),
          item('home-benefit-2', { number: '02', title: 'Simpler Daily Operations', description: 'Reduce repetitive manual work and give your transport team a clearer workflow.', icon: 'badge-check' }),
          item('home-benefit-3', { number: '03', title: 'Role-Based Access', description: 'Give owners, managers, accountants and operators access based on their responsibilities.', icon: 'users' }),
        ],
      }, 'three-cards'),
      section('home-cta', 'cta', 80, {
        eyebrow: 'Ready to modernize?',
        heading: 'Your fleet deserves simpler technology.',
        description: 'Bring daily transport operations together with Buddy Fleets and build a cleaner, more organized fleet workflow.',
        primaryCta: { label: 'Get Started', href: '/signup' },
        secondaryCta: { label: 'View Features', href: '/features' },
      }, 'panel'),
    ],
  },

  features: {
    schemaVersion: 1,
    sections: [
      section('features-hero', 'hero', 10, {
        eyebrow: 'Buddy Fleets Features',
        heading: 'Everything your fleet needs. One platform.',
        subheading: '',
        description: 'Buddy Fleets brings fleet records, trips, LR/Bilty, dispatch, expenses, diesel, maintenance, compliance and settlements into one connected transport operations workspace.',
        primaryCta: { label: 'Start Free Trial', href: '/signup' },
        secondaryCta: { label: 'Contact Us', href: '/contact-us' },
        imageUrl: '',
        imageAlt: '',
        trustItems: [],
      }, 'product'),
      section('features-intro', 'rich-text', 20, {
        eyebrow: 'Built for transport businesses',
        heading: 'Everything has a place. Nothing scattered.',
        body: 'From dispatch and documentation to finance, maintenance and compliance, Buddy Fleets is designed to give transport teams one clearer operational layer instead of multiple disconnected systems and records.',
      }, 'split-intro'),
      section('features-modules', 'feature-grid', 30, {
        eyebrow: 'Platform capabilities',
        heading: 'Built around fleet workflows.',
        description: '',
        items: [
          item('feature-01', { number: '01', title: 'Dashboard & Reports', description: 'Review important fleet, trip, finance, maintenance and compliance information from one organized operational workspace.', category: 'Overview', icon: 'gauge', accent: 'cyan', imageUrl: '', imageAlt: '' }),
          item('feature-02', { number: '02', title: 'Vehicle & Driver Records', description: 'Maintain structured records for vehicles and drivers, including documents, assignments and operational history.', category: 'Fleet', icon: 'truck', accent: 'blue', imageUrl: '', imageAlt: '' }),
          item('feature-03', { number: '03', title: 'LR / Bilty / Consignment Records', description: 'Create and organize LR, Bilty and consignment information while keeping shipment records connected with transport operations.', category: 'Documentation', icon: 'file-text', accent: 'violet', imageUrl: '', imageAlt: '' }),
          item('feature-04', { number: '04', title: 'Duty & Dispatch Allocation', description: 'Assign vehicles and drivers to trips through a structured dispatch workflow designed to reduce operational confusion.', category: 'Operations', icon: 'clipboard-check', accent: 'cyan', imageUrl: '', imageAlt: '' }),
          item('feature-05', { number: '05', title: 'ePOD & Delivery Records', description: 'Maintain delivery status and electronic proof of delivery records connected with the relevant trip and consignment.', category: 'Delivery', icon: 'package-check', accent: 'emerald', imageUrl: '', imageAlt: '' }),
          item('feature-06', { number: '06', title: 'Expenses & Earnings', description: 'Organize transport expenses and earnings so finance teams can maintain cleaner operational financial records.', category: 'Finance', icon: 'receipt-text', accent: 'violet', imageUrl: '', imageAlt: '' }),
          item('feature-07', { number: '07', title: 'Diesel & Fuel Records', description: 'Maintain vehicle and trip-wise diesel or fuel entries and keep consumption-related records connected with operations.', category: 'Finance', icon: 'fuel', accent: 'blue', imageUrl: '', imageAlt: '' }),
          item('feature-08', { number: '08', title: 'Driver Advances & Payments', description: 'Manage driver advances, trip payments, deductions, balances and settlement records through one structured workflow.', category: 'Finance', icon: 'wallet-cards', accent: 'cyan', imageUrl: '', imageAlt: '' }),
          item('feature-09', { number: '09', title: 'Invoices & Settlements', description: 'Organize customer invoices, transport settlements and related financial records in one centralized workflow.', category: 'Finance', icon: 'receipt-text', accent: 'violet', imageUrl: '', imageAlt: '' }),
          item('feature-10', { number: '10', title: 'Party Records & Ledgers', description: 'Maintain customer, vendor and transport-party records with organized financial and operational references.', category: 'Finance', icon: 'landmark', accent: 'blue', imageUrl: '', imageAlt: '' }),
          item('feature-11', { number: '11', title: 'Document & Compliance Alerts', description: 'Keep expiry dates, permits, insurance and other important fleet-document information easier to review and follow up.', category: 'Compliance', icon: 'bell', accent: 'emerald', imageUrl: '', imageAlt: '' }),
          item('feature-12', { number: '12', title: 'Workshop & Maintenance', description: 'Maintain workshop jobs, service records, preventive maintenance information and vehicle service history.', category: 'Maintenance', icon: 'wrench', accent: 'cyan', imageUrl: '', imageAlt: '' }),
          item('feature-13', { number: '13', title: 'Tyre Management', description: 'Track tyre inventory, fitment, rotation, replacement and lifecycle records for better maintenance control.', category: 'Maintenance', icon: 'badge-check', accent: 'violet', imageUrl: '', imageAlt: '' }),
          item('feature-14', { number: '14', title: 'Spare Parts Management', description: 'Organize spare-parts inventory, purchases, usage and workshop consumption to maintain clearer stock records.', category: 'Workshop', icon: 'package-check', accent: 'blue', imageUrl: '', imageAlt: '' }),
          item('feature-15', { number: '15', title: 'Challan Records', description: 'Maintain traffic challan, penalty, payment-status and vehicle-wise compliance records inside the same platform.', category: 'Compliance', icon: 'file-text', accent: 'violet', imageUrl: '', imageAlt: '' }),
          item('feature-16', { number: '16', title: 'Trip & Route Planning', description: 'Organize trip routes and important planning information before assigning vehicles, drivers and operational resources.', category: 'Planning', icon: 'route', accent: 'cyan', imageUrl: '', imageAlt: '' }),
          item('feature-17', { number: '17', title: 'Role & Site Access', description: 'Give owners, managers, accountants and operators access according to their responsibilities and assigned work scope.', category: 'Access', icon: 'shield-check', accent: 'emerald', imageUrl: '', imageAlt: '' }),
        ],
      }, 'module-grid'),
      section('features-groups', 'highlights', 40, {
        eyebrow: 'Connected platform',
        heading: 'Core operating areas stay organized.',
        description: '',
        items: [
          item('feature-group-fleet', { title: 'Fleet Operations', description: 'Vehicles, drivers, trips, dispatch and transport documentation.', icon: 'truck', number: '01' }),
          item('feature-group-finance', { title: 'Finance', description: 'Expenses, diesel, advances, invoices and settlements.', icon: 'wallet-cards', number: '02' }),
          item('feature-group-compliance', { title: 'Compliance', description: 'Documents, alerts, challans and important fleet records.', icon: 'shield-check', number: '03' }),
          item('feature-group-maintenance', { title: 'Maintenance', description: 'Workshop, tyres, spares and service-related records.', icon: 'wrench', number: '04' }),
        ],
      }, 'compact-cards'),
      section('features-workflow', 'workflow', 50, {
        eyebrow: 'Connected workflow',
        heading: 'One workflow across transport operations.',
        description: '',
        items: [
          item('feature-workflow-1', { step: '01', title: 'Booking & LR', description: 'Start with shipment and consignment records.', icon: 'file-text' }),
          item('feature-workflow-2', { step: '02', title: 'Dispatch', description: 'Assign vehicles and drivers to operations.', icon: 'truck' }),
          item('feature-workflow-3', { step: '03', title: 'Delivery', description: 'Maintain delivery and ePOD records.', icon: 'package-check' }),
          item('feature-workflow-4', { step: '04', title: 'Settlement', description: 'Complete expenses, invoices and settlements.', icon: 'wallet-cards' }),
        ],
      }, 'horizontal-steps'),
      section('features-audience', 'highlights', 60, {
        eyebrow: 'Designed for Indian transport operations',
        heading: 'Built for teams that manage fleets every day.',
        description: '',
        items: [
          item('feature-audience-1', { title: 'Transport Companies', description: '', icon: 'badge-check', number: '01' }),
          item('feature-audience-2', { title: 'Fleet Owners', description: '', icon: 'badge-check', number: '02' }),
          item('feature-audience-3', { title: 'Logistics Companies', description: '', icon: 'badge-check', number: '03' }),
          item('feature-audience-4', { title: 'Fleet Operators', description: '', icon: 'badge-check', number: '04' }),
        ],
      }, 'audience'),
      section('features-cta', 'cta', 70, {
        eyebrow: 'Ready to get started?',
        heading: 'Bring your fleet operations into one platform.',
        description: 'Start with Buddy Fleets and create a cleaner, more organized workflow for your transport business.',
        primaryCta: { label: 'Get Started', href: '/signup' },
        secondaryCta: { label: 'Contact Us', href: '/contact-us' },
      }, 'panel'),
    ],
  },

  pricing: {
    schemaVersion: 1,
    sections: [
      section('pricing-hero', 'hero', 10, {
        eyebrow: 'Buddy Fleets Pricing',
        heading: 'Choose the plan that moves with your fleet.',
        subheading: '',
        description: 'Compare all four Buddy Fleets plans, choose your subscription duration and instantly see the total price, effective monthly cost and savings.',
        primaryCta: { label: '', href: '' },
        secondaryCta: { label: '', href: '' },
        imageUrl: '',
        imageAlt: '',
        trustItems: [],
      }, 'centered'),
      section('pricing-plans', 'pricing', 20, {
        eyebrow: 'Plans',
        heading: 'Choose the right operating plan.',
        description: 'Duration can be selected independently for each plan so you can compare total pricing, effective monthly value and applicable savings.',
        items: [
          item('pricing-launch', { name: 'Launch', tagline: 'Essential fleet control for getting started.', fleet: '1–10 Vehicles', users: '2 Users', sites: '1 Site', badge: '', price1: '7000', price3: '19500', price6: '36000', price12: '66000', features: ['1–10 Vehicles','2 Users','1 Site','Vehicle & Driver Records','Vehicle & Driver Documents','Document Expiry Alerts','Expenses & Fuel Records','Maintenance Records','Dashboard & Reports'] }),
          item('pricing-accelerate', { name: 'Accelerate', tagline: 'Smarter operations for growing fleets.', fleet: '11–50 Vehicles', users: '5 Users', sites: '2 Sites', badge: '', price1: '13000', price3: '37500', price6: '72000', price12: '132000', features: ['11–50 Vehicles','5 Users','2 Sites','Everything in Launch','Expenses & Earnings','Driver Advances & Payments','Workshop & Maintenance','Duty & Dispatch Allocation','Dashboard & Reports'] }),
          item('pricing-scale', { name: 'Scale', tagline: 'Connected control for larger fleet operations.', fleet: '51–200 Vehicles', users: '10 Users', sites: '3 Sites', badge: 'MOST POPULAR', price1: '22000', price3: '63000', price6: '120000', price12: '216000', features: ['51–200 Vehicles','10 Users','3 Sites','Everything in Accelerate','LR / Bilty / Consignment Records','ePOD & Delivery Records','Invoices & Settlements','Party Records & Ledgers','Role & Site Access'] }),
          item('pricing-apex', { name: 'Apex', tagline: 'Complete operational coverage for large fleets.', fleet: '201+ Vehicles', users: '20 Users', sites: '4 Sites', badge: '', price1: '30000', price3: '87000', price6: '168000', price12: '324000', features: ['201+ Vehicles','20 Users','4 Sites','Everything in Scale','Trip & Route Planning','Challan Records','Tyre Management','Spare Parts Management','Document & Compliance Alerts'] }),
        ],
      }, 'plans'),
      section('pricing-cta', 'cta', 30, {
        eyebrow: 'Start with Buddy Fleets',
        heading: 'Not sure which plan fits your fleet?',
        description: 'Start your 5-day free trial or speak with us to understand which plan best matches your operations.',
        primaryCta: { label: 'Start 5-Day Free Trial', href: '/signup' },
        secondaryCta: { label: 'Contact Us', href: '/contact-us' },
      }, 'panel'),
    ],
  },

  about: {
    schemaVersion: 1,
    sections: [
      section('about-hero', 'hero', 10, {
        eyebrow: 'A Product of Buddy Computers',
        heading: 'From technology solutions to fleet intelligence.',
        subheading: 'Fleet Operations Intelligence Platform',
        description: 'Buddy Fleets is a Fleet Operations Intelligence Platform created for Indian transport businesses with a simple philosophy — technology should make operations easier, clearer and more manageable.',
        primaryCta: { label: 'Explore Buddy Fleets', href: '/features' },
        secondaryCta: { label: 'Contact Us', href: '/contact-us' },
        imageUrl: '',
        imageAlt: '',
        trustItems: [],
      }, 'about'),
      section('about-story', 'rich-text', 20, {
        eyebrow: 'Where the Story Begins',
        heading: 'Buddy Computers came first.',
        body: 'Buddy Computers began with a practical approach to technology — solving real computer, technical and digital problems without making technology unnecessarily difficult.\n\nFrom PC and laptop repair, hardware and custom PC solutions to networking, IT support, websites and creative digital services, the focus remains simple: understand the problem clearly and provide a solution that actually helps.\n\nThat practical technology-first thinking became the foundation for Buddy Fleets — bringing the same approach into transport and fleet operations.',
      }, 'story'),
      section('about-why', 'highlights', 30, {
        eyebrow: 'Why Buddy Fleets Exists',
        heading: 'Transport software should make transport easier.',
        description: 'Businesses adopt software to reduce work and improve clarity. But traditional ERP and transport systems can sometimes become difficult to navigate, difficult to understand and difficult to use in everyday operations.',
        items: [
          item('about-problem', { title: 'Complexity became normal.', description: 'More screens, more menus and more options do not automatically create better operations. Software can become another task for the team instead of becoming a tool that supports the team.', icon: 'alert-triangle', number: 'The Problem' }),
          item('about-approach', { title: 'Start from zero. Keep it clear.', description: 'Buddy Fleets was created from the ground up around one practical idea: technology should reduce operational confusion, not add another layer of complexity. Every workflow should have a clear purpose.', icon: 'badge-check', number: 'Our Approach' }),
        ],
      }, 'contrast'),
      section('about-mission', 'rich-text', 40, {
        eyebrow: 'Our Mission',
        heading: 'Build practical fleet technology for real transport operations.',
        body: 'Buddy Fleets is designed to make everyday transport work easier to understand, easier to organize and easier to manage.',
      }, 'mission'),
      section('about-audience', 'feature-grid', 50, {
        eyebrow: 'Who We Serve',
        heading: 'Built for businesses that keep India moving.',
        description: "Buddy Fleets is focused on businesses and operators working every day across India's transport and fleet ecosystem.",
        items: [
          item('about-audience-1', { number: '01', title: 'Transport Companies', description: 'Bring fleet, transport and everyday operational activities into a cleaner digital working environment.', icon: 'truck', category: '', accent: 'cyan', imageUrl: '', imageAlt: '' }),
          item('about-audience-2', { number: '02', title: 'Fleet Owners', description: 'Organize vehicles, drivers, documents, expenses and routine fleet activity more clearly.', icon: 'users', category: '', accent: 'blue', imageUrl: '', imageAlt: '' }),
          item('about-audience-3', { number: '03', title: 'Logistics Companies', description: 'Support fast-moving logistics workflows with structured information and better operational clarity.', icon: 'package-check', category: '', accent: 'violet', imageUrl: '', imageAlt: '' }),
          item('about-audience-4', { number: '04', title: 'Fleet Operators', description: 'Manage everyday fleet work without turning routine operations into complicated software processes.', icon: 'clipboard-check', category: '', accent: 'emerald', imageUrl: '', imageAlt: '' }),
        ],
      }, 'audience'),
      section('about-philosophy', 'benefits', 60, {
        eyebrow: 'How We Think',
        heading: 'Useful technology should feel natural.',
        description: 'Buddy Fleets is guided by practical product thinking. The goal is not to add software for the sake of software — it is to make everyday transport work easier to manage.',
        items: [
          item('about-philosophy-1', { number: '01', title: 'Less Complexity', description: 'Clear workflows matter more than overloaded screens, unnecessary controls and difficult software processes.', icon: 'badge-check' }),
          item('about-philosophy-2', { number: '02', title: 'Operational Clarity', description: 'Fleet information should be organized so teams can understand what is happening and act with greater confidence.', icon: 'gauge' }),
          item('about-philosophy-3', { number: '03', title: 'Connected Operations', description: 'Vehicles, drivers, documents, expenses, maintenance, dispatch and transport activity should work together in one connected environment.', icon: 'route' }),
        ],
      }, 'three-cards'),
      section('about-founders', 'feature-grid', 70, {
        eyebrow: 'People Behind Buddy Fleets',
        heading: 'Two founders. One clear direction.',
        description: 'Technology, product thinking, business operations and customer understanding come together behind Buddy Fleets.',
        items: [
          item('about-founder-shubham', { number: 'SJ', title: 'Shubham Jangir', description: 'Founder & Developer — Leading the technical direction of Buddy Fleets, including product architecture, platform development, system design and the technology behind the complete Buddy Fleets experience. Email: jangirshubham72@gmail.com · Instagram: @happiest_banda', icon: 'users', category: 'Founder & Developer', accent: 'cyan', imageUrl: 'https://drive.google.com/thumbnail?id=12_mss3NpN7WSjurHGS0eGyPMXMb_J2of&sz=w800', imageAlt: 'Shubham Jangir - Founder & Developer' }),
          item('about-founder-navin', { number: 'NS', title: 'Navin Sharma', description: 'Founder — Focused on Operations, Business Development, Sales & Product — understanding market requirements, building customer relationships, developing business opportunities and contributing to the product and commercial direction of Buddy Fleets. Email: navin4338@gmail.com · Instagram: @navin.sharma', icon: 'users', category: 'Founder', accent: 'blue', imageUrl: '', imageAlt: 'Navin Sharma - Founder' }),
        ],
      }, 'founders'),
      section('about-cta', 'cta', 80, {
        eyebrow: 'Move Forward with Buddy Fleets',
        heading: 'Give your transport operations a clearer way to work.',
        description: 'Explore Buddy Fleets with a 5-day free trial or connect with us to learn more about the platform.',
        primaryCta: { label: 'Start 5-Day Free Trial', href: '/signup' },
        secondaryCta: { label: 'Contact Us', href: '/contact-us' },
      }, 'panel'),
    ],
  },

  'contact-us': {
    schemaVersion: 1,
    sections: [
      section('contact-hero', 'hero', 10, {
        eyebrow: 'Contact Buddy Fleets',
        heading: "Let's talk about your fleet operations.",
        subheading: '',
        description: 'Have a question about Buddy Fleets, your trial, product capabilities or working with us? Send your enquiry and connect directly with the people behind the platform.',
        primaryCta: { label: '', href: '' },
        secondaryCta: { label: '', href: '' },
        imageUrl: '',
        imageAlt: '',
        trustItems: [],
      }, 'centered'),
      section('contact-form', 'contact', 20, {
        eyebrow: 'Get in touch',
        heading: 'Send your enquiry',
        description: 'The live contact page keeps the existing secure enquiry form and contact-person data source. This CMS section controls the surrounding content while application submission behavior remains in code.',
        formTitle: 'Contact Buddy Fleets',
        formDescription: '',
      }, 'enquiry-form'),
      section('contact-enquiry-types', 'highlights', 30, {
        eyebrow: "We're Here to Help",
        heading: 'Start the right conversation.',
        description: "Whether you're exploring Buddy Fleets for the first time or want to discuss your transport operations, you can reach us directly.",
        items: [
          item('contact-type-1', { number: '01', title: 'Product Enquiries', description: 'Understand Buddy Fleets and how the platform approaches fleet operations.', icon: 'message-circle' }),
          item('contact-type-2', { number: '02', title: '5-Day Free Trial', description: 'Questions related to starting or understanding your Buddy Fleets trial.', icon: 'badge-check' }),
          item('contact-type-3', { number: '03', title: 'Sales & Business', description: 'Discuss product requirements, commercial conversations and business opportunities.', icon: 'users' }),
          item('contact-type-4', { number: '04', title: 'Technical Questions', description: 'Connect for platform, account or other technical Buddy Fleets enquiries.', icon: 'wrench' }),
        ],
      }, 'four-cards'),
      section('contact-cta', 'cta', 40, {
        eyebrow: 'Ready to Get Started?',
        heading: 'Experience a simpler approach to fleet operations.',
        description: 'Start your 5-day free trial and explore Buddy Fleets.',
        primaryCta: { label: 'Start 5-Day Free Trial', href: '/signup' },
        secondaryCta: { label: '', href: '' },
      }, 'panel'),
    ],
  },
};

export function getDefaultPageContent(pageKey) {
  const content = DEFAULT_PAGE_CONTENT[pageKey];
  return content ? JSON.parse(JSON.stringify(content)) : null;
}
