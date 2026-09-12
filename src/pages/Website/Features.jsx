import React from 'react';
import { Link } from 'react-router-dom';

import {
  BadgeCheck,
  Bell,
  Building2,
  ClipboardCheck,
  FileCheck2,
  FileText,
  Fuel,
  Gauge,
  IndianRupee,
  Landmark,
  PackageCheck,
  ReceiptText,
  Route,
  ShieldCheck,
  Truck,
  Users,
  WalletCards,
  Warehouse,
  Wrench,
} from 'lucide-react';

/* =========================================================
   APPROVED BUDDY FLEETS MODULES

   IMPORTANT:
   Keep aligned with actual / planned product scope.

   Do not add:
   - Real-time GPS tracking claims
   - Automated toll tracking claims
   - Unit economics claims
   - QR tracking claims
========================================================= */

const FEATURES = [
  {
    id: 1,
    title: 'Dashboard & Reports',
    description:
      'Review important fleet, trip, finance, maintenance and compliance information from one organized operational workspace.',
    category: 'Overview',
    icon: Gauge,
    accent: 'cyan',
  },
  {
    id: 2,
    title: 'Vehicle & Driver Records',
    description:
      'Maintain structured records for vehicles and drivers, including documents, assignments and operational history.',
    category: 'Fleet',
    icon: Truck,
    accent: 'blue',
  },
  {
    id: 3,
    title: 'LR / Bilty / Consignment Records',
    description:
      'Create and organize LR, Bilty and consignment information while keeping shipment records connected with transport operations.',
    category: 'Documentation',
    icon: FileText,
    accent: 'violet',
  },
  {
    id: 4,
    title: 'Duty & Dispatch Allocation',
    description:
      'Assign vehicles and drivers to trips through a structured dispatch workflow designed to reduce operational confusion.',
    category: 'Operations',
    icon: ClipboardCheck,
    accent: 'cyan',
  },
  {
    id: 5,
    title: 'ePOD & Delivery Records',
    description:
      'Maintain delivery status and electronic proof of delivery records connected with the relevant trip and consignment.',
    category: 'Delivery',
    icon: PackageCheck,
    accent: 'emerald',
  },
  {
    id: 6,
    title: 'Expenses & Earnings',
    description:
      'Organize transport expenses and earnings so finance teams can maintain cleaner operational financial records.',
    category: 'Finance',
    icon: IndianRupee,
    accent: 'violet',
  },
  {
    id: 7,
    title: 'Diesel & Fuel Records',
    description:
      'Maintain vehicle and trip-wise diesel or fuel entries and keep consumption-related records connected with operations.',
    category: 'Finance',
    icon: Fuel,
    accent: 'blue',
  },
  {
    id: 8,
    title: 'Driver Advances & Payments',
    description:
      'Manage driver advances, trip payments, deductions, balances and settlement records through one structured workflow.',
    category: 'Finance',
    icon: WalletCards,
    accent: 'cyan',
  },
  {
    id: 9,
    title: 'Invoices & Settlements',
    description:
      'Organize customer invoices, transport settlements and related financial records in one centralized workflow.',
    category: 'Finance',
    icon: ReceiptText,
    accent: 'violet',
  },
  {
    id: 10,
    title: 'Party Records & Ledgers',
    description:
      'Maintain customer, vendor and transport-party records with organized financial and operational references.',
    category: 'Finance',
    icon: Landmark,
    accent: 'blue',
  },
  {
    id: 11,
    title: 'Document & Compliance Alerts',
    description:
      'Keep expiry dates, permits, insurance and other important fleet-document information easier to review and follow up.',
    category: 'Compliance',
    icon: Bell,
    accent: 'emerald',
  },
  {
    id: 12,
    title: 'Workshop & Maintenance',
    description:
      'Maintain workshop jobs, service records, preventive maintenance information and vehicle service history.',
    category: 'Maintenance',
    icon: Wrench,
    accent: 'cyan',
  },
  {
    id: 13,
    title: 'Tyre Management',
    description:
      'Track tyre inventory, fitment, rotation, replacement and lifecycle records for better maintenance control.',
    category: 'Maintenance',
    icon: BadgeCheck,
    accent: 'violet',
  },
  {
    id: 14,
    title: 'Spare Parts Management',
    description:
      'Organize spare-parts inventory, purchases, usage and workshop consumption to maintain clearer stock records.',
    category: 'Workshop',
    icon: Warehouse,
    accent: 'blue',
  },
  {
    id: 15,
    title: 'Challan Records',
    description:
      'Maintain traffic challan, penalty, payment-status and vehicle-wise compliance records inside the same platform.',
    category: 'Compliance',
    icon: FileCheck2,
    accent: 'violet',
  },
  {
    id: 16,
    title: 'Trip & Route Planning',
    description:
      'Organize trip routes and important planning information before assigning vehicles, drivers and operational resources.',
    category: 'Planning',
    icon: Route,
    accent: 'cyan',
  },
  {
    id: 17,
    title: 'Role & Site Access',
    description:
      'Give owners, managers, accountants and operators access according to their responsibilities and assigned work scope.',
    category: 'Access',
    icon: ShieldCheck,
    accent: 'emerald',
  },
];

/* =========================================================
   FEATURE GROUPS
========================================================= */

const FEATURE_GROUPS = [
  {
    title: 'Fleet Operations',
    description:
      'Vehicles, drivers, trips, dispatch and transport documentation.',
    icon: Truck,
  },
  {
    title: 'Finance',
    description:
      'Expenses, diesel, advances, invoices and settlements.',
    icon: WalletCards,
  },
  {
    title: 'Compliance',
    description:
      'Documents, alerts, challans and important fleet records.',
    icon: ShieldCheck,
  },
  {
    title: 'Maintenance',
    description:
      'Workshop, tyres, spares and service-related records.',
    icon: Wrench,
  },
];

/* =========================================================
   CONNECTED WORKFLOW
========================================================= */

const CONNECTED_WORKFLOW = [
  {
    number: '01',
    title: 'Booking & LR',
    text:
      'Start with shipment and consignment records.',
    icon: FileText,
  },
  {
    number: '02',
    title: 'Dispatch',
    text:
      'Assign vehicles and drivers to operations.',
    icon: Truck,
  },
  {
    number: '03',
    title: 'Delivery',
    text:
      'Maintain delivery and ePOD records.',
    icon: PackageCheck,
  },
  {
    number: '04',
    title: 'Settlement',
    text:
      'Complete expenses, invoices and settlements.',
    icon: WalletCards,
  },
];

/* =========================================================
   TARGET USERS
========================================================= */

const TARGET_USERS = [
  'Transport Companies',
  'Fleet Owners',
  'Logistics Companies',
  'Fleet Operators',
];

/* =========================================================
   ACCENT CONFIG
========================================================= */

const ACCENTS = {
  cyan: {
    icon:
      'border-cyan-500/20 bg-cyan-500/[0.08] text-cyan-500',
    tag:
      'border-cyan-500/20 bg-cyan-500/[0.07] text-cyan-500',
    glow:
      'bg-cyan-500/[0.08]',
  },

  blue: {
    icon:
      'border-blue-500/20 bg-blue-500/[0.08] text-blue-500',
    tag:
      'border-blue-500/20 bg-blue-500/[0.07] text-blue-500',
    glow:
      'bg-blue-500/[0.07]',
  },

  violet: {
    icon:
      'border-violet-500/20 bg-violet-500/[0.08] text-violet-500',
    tag:
      'border-violet-500/20 bg-violet-500/[0.07] text-violet-500',
    glow:
      'bg-violet-500/[0.07]',
  },

  emerald: {
    icon:
      'border-emerald-500/20 bg-emerald-500/[0.08] text-emerald-500',
    tag:
      'border-emerald-500/20 bg-emerald-500/[0.07] text-emerald-500',
    glow:
      'bg-emerald-500/[0.07]',
  },
};

/* =========================================================
   FEATURE CARD
========================================================= */

function FeatureCard({
  feature,
  index,
}) {
  const Icon =
    feature.icon;

  const accent =
    ACCENTS[feature.accent] ||
    ACCENTS.cyan;

  return (
    <article
      className="
        group
        relative
        h-full
        overflow-hidden
        rounded-[22px]
        border
        border-[color:var(--bf-border)]
        bg-[var(--bf-surface)]
        p-5
        shadow-sm
        transition
        duration-200
        hover:-translate-y-0.5
        hover:border-cyan-400/25
      "
    >
      {/* SUBTLE HOVER GLOW */}

      <div
        aria-hidden="true"
        className={`
          pointer-events-none
          absolute
          -right-14
          -top-14
          h-36
          w-36
          rounded-full
          opacity-0
          blur-3xl
          transition-opacity
          duration-300
          group-hover:opacity-100
          ${accent.glow}
        `}
      />

      <div className="relative">

        {/* TOP */}

        <div
          className="
            flex
            items-start
            justify-between
            gap-3
          "
        >
          <div
            className={`
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-xl
              border
              ${accent.icon}
            `}
          >
            <Icon
              size={18}
              aria-hidden="true"
            />
          </div>

          <span
            className={`
              rounded-full
              border
              px-2.5
              py-1
              text-[8px]
              font-bold
              uppercase
              tracking-[0.12em]
              ${accent.tag}
            `}
          >
            {feature.category}
          </span>
        </div>

        {/* NUMBER */}

        <p
          className="
            mt-4
            font-mono
            text-[9px]
            font-semibold
            text-[color:var(--bf-text-muted)]
          "
        >
          {String(
            index + 1
          ).padStart(
            2,
            '0'
          )}
        </p>

        {/* CONTENT */}

        <h3
          className="
            mt-2
            text-lg
            font-black
            leading-tight
            text-[color:var(--bf-text-primary)]
          "
        >
          {feature.title}
        </h3>

        <p
          className="
            mt-2.5
            text-sm
            leading-6
            text-[color:var(--bf-text-secondary)]
          "
        >
          {feature.description}
        </p>
      </div>
    </article>
  );
}

/* =========================================================
   FEATURES PAGE
========================================================= */

export default function Features() {
  return (
    <div
      className="
        relative
        isolate
        overflow-hidden
        bg-[var(--bf-page-bg)]
        text-[color:var(--bf-text-primary)]
        transition-colors
        duration-300
      "
    >
      {/* =====================================================
          GLOBAL BACKGROUND
      ===================================================== */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          -z-10
          overflow-hidden
        "
      >
        <div
          className="
            absolute
            inset-0
            bg-[var(--bf-page-bg)]
          "
        />

        {/* GRID */}

        <div
          className="
            absolute
            inset-0
            opacity-[0.04]
          "
          style={{
            backgroundImage:
              'linear-gradient(rgba(100,116,139,0.28) 1px, transparent 1px), linear-gradient(90deg, rgba(100,116,139,0.28) 1px, transparent 1px)',
            backgroundSize:
              '72px 72px',
          }}
        />

        {/* STATIC GLOWS */}

        <div
          className="
            absolute
            -left-40
            top-20
            h-[420px]
            w-[420px]
            rounded-full
            bg-cyan-500/[0.07]
            blur-[120px]
          "
        />

        <div
          className="
            absolute
            -right-40
            top-[32rem]
            h-[450px]
            w-[450px]
            rounded-full
            bg-blue-500/[0.06]
            blur-[130px]
          "
        />

        <div
          className="
            absolute
            bottom-[8%]
            left-[35%]
            h-[360px]
            w-[360px]
            rounded-full
            bg-emerald-500/[0.04]
            blur-[110px]
          "
        />
      </div>

      {/* =====================================================
          HERO
      ===================================================== */}

      <section
        className="
          relative
          px-5
          pb-8
          pt-8
          sm:px-8
          sm:pb-10
          sm:pt-10
          lg:px-12
          lg:pb-12
          lg:pt-12
        "
      >
        <div
          className="
            relative
            mx-auto
            w-full
            max-w-7xl
          "
        >
          <div
            className="
              grid
              items-center
              gap-8
              lg:grid-cols-[1fr_0.92fr]
              lg:gap-12
            "
          >
            {/* =================================================
                HERO LEFT
            ================================================= */}

            <div>

              {/* BADGE */}

              <div
                className="
                  mb-4
                  inline-flex
                  items-center
                  gap-3
                  rounded-full
                  border
                  border-cyan-400/25
                  bg-cyan-400/[0.07]
                  px-4
                  py-2
                  backdrop-blur-xl
                "
              >
                <span
                  aria-hidden="true"
                  className="
                    h-2
                    w-2
                    rounded-full
                    bg-cyan-400
                    shadow-[0_0_12px_rgba(34,211,238,0.5)]
                  "
                />

                <span
                  className="
                    text-[9px]
                    font-black
                    uppercase
                    tracking-[0.18em]
                    text-cyan-500
                    sm:text-[10px]
                  "
                >
                  Buddy Fleets Features
                </span>
              </div>

              {/* TITLE */}

              <h1
                className="
                  max-w-[720px]
                  text-[clamp(2.15rem,4.4vw,3.7rem)]
                  font-black
                  leading-[1.03]
                  tracking-[-0.03em]
                "
              >
                <span
                  className="
                    bg-gradient-to-r
                    from-[#12BFF2]
                    via-[#078EE5]
                    to-[#0AA23B]
                    bg-clip-text
                    text-transparent
                  "
                >
                  Everything your fleet needs.
                </span>

                <br />

                <span
                  className="
                    bg-gradient-to-r
                    from-[#12BFF2]
                    via-[#078EE5]
                    to-[#0AA23B]
                    bg-clip-text
                    text-transparent
                  "
                >
                  One platform.
                </span>
              </h1>

              {/* DESCRIPTION */}

              <p
                className="
                  mt-4
                  max-w-2xl
                  text-sm
                  leading-7
                  text-[color:var(--bf-text-secondary)]
                  sm:text-base
                "
              >
                Buddy Fleets brings fleet records, trips,
                LR/Bilty, dispatch, expenses, diesel,
                maintenance, compliance and settlements
                into one connected transport operations
                workspace.
              </p>

              {/* CTA */}

              <div
                className="
                  mt-5
                  flex
                  flex-col
                  gap-3
                  sm:flex-row
                "
              >
                <Link
                  to="/signup"
                  className="
                    inline-flex
                    min-h-11
                    items-center
                    justify-center
                    rounded-xl
                    bg-gradient-to-r
                    from-[#12BFF2]
                    via-[#078EE5]
                    to-[#0AA23B]
                    px-6
                    py-3
                    text-sm
                    font-black
                    text-white
                    shadow-lg
                    shadow-blue-500/10
                    transition
                    duration-200
                    hover:-translate-y-0.5
                    hover:shadow-blue-500/20
                    focus-visible:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-cyan-400
                  "
                >
                  Start Free Trial
                </Link>

                <Link
                  to="/contact-us"
                  className="
                    inline-flex
                    min-h-11
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-[color:var(--bf-border)]
                    bg-[var(--bf-surface)]
                    px-6
                    py-3
                    text-sm
                    font-bold
                    text-[color:var(--bf-text-primary)]
                    transition
                    duration-200
                    hover:-translate-y-0.5
                    hover:border-cyan-400/30
                    focus-visible:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-cyan-400
                  "
                >
                  Contact Us
                </Link>
              </div>
            </div>

            {/* =================================================
                HERO PRODUCT MOCKUP
            ================================================= */}

            <div
              className="
                relative
                mx-auto
                w-full
                max-w-[520px]
              "
            >
              <div
                aria-hidden="true"
                className="
                  absolute
                  -inset-5
                  rounded-[34px]
                  bg-gradient-to-r
                  from-cyan-500/10
                  via-blue-500/[0.07]
                  to-emerald-500/[0.08]
                  blur-3xl
                "
              />

              <div
                className="
                  relative
                  rounded-[26px]
                  border
                  border-white/10
                  bg-[#09111f]
                  p-2.5
                  shadow-2xl
                  shadow-black/25
                "
              >
                <div
                  className="
                    rounded-[20px]
                    border
                    border-white/[0.07]
                    bg-[#0b111c]
                    p-5
                  "
                >
                  {/* TOP */}

                  <div
                    className="
                      flex
                      items-center
                      justify-between
                      gap-3
                    "
                  >
                    <div>
                      <p
                        className="
                          text-[8px]
                          font-bold
                          uppercase
                          tracking-[0.18em]
                          text-cyan-300
                        "
                      >
                        Fleet Workspace
                      </p>

                      <h2
                        className="
                          mt-1.5
                          text-lg
                          font-black
                          text-white
                        "
                      >
                        Operations Modules
                      </h2>
                    </div>

                    <div
                      className="
                        flex
                        items-center
                        gap-2
                        rounded-full
                        border
                        border-emerald-400/20
                        bg-emerald-400/[0.06]
                        px-3
                        py-1.5
                        text-[8px]
                        font-bold
                        text-emerald-300
                      "
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

                      CONNECTED
                    </div>
                  </div>

                  {/* GROUPS */}

                  <div
                    className="
                      mt-5
                      grid
                      grid-cols-2
                      gap-2.5
                    "
                  >
                    {FEATURE_GROUPS.map(
                      (group) => {
                        const Icon =
                          group.icon;

                        return (
                          <div
                            key={group.title}
                            className="
                              rounded-xl
                              border
                              border-white/[0.07]
                              bg-white/[0.025]
                              p-3.5
                            "
                          >
                            <div
                              className="
                                flex
                                h-8
                                w-8
                                items-center
                                justify-center
                                rounded-lg
                                bg-cyan-400/[0.07]
                                text-cyan-300
                              "
                            >
                              <Icon
                                size={16}
                                aria-hidden="true"
                              />
                            </div>

                            <p
                              className="
                                mt-3
                                text-xs
                                font-black
                                text-white
                              "
                            >
                              {group.title}
                            </p>

                            <p
                              className="
                                mt-1
                                text-[9px]
                                leading-4
                                text-slate-400
                              "
                            >
                              {group.description}
                            </p>
                          </div>
                        );
                      }
                    )}
                  </div>

                  {/* LOWER PANEL */}

                  <div
                    className="
                      mt-3
                      rounded-xl
                      border
                      border-white/[0.07]
                      bg-white/[0.02]
                      p-4
                    "
                  >
                    <div
                      className="
                        flex
                        items-center
                        justify-between
                        gap-3
                      "
                    >
                      <div>
                        <p
                          className="
                            text-[11px]
                            font-bold
                            text-slate-200
                          "
                        >
                          One connected system
                        </p>

                        <p
                          className="
                            mt-1
                            text-[9px]
                            text-slate-400
                          "
                        >
                          Structured fleet operations
                        </p>
                      </div>

                      <Building2
                        size={18}
                        aria-hidden="true"
                        className="text-cyan-300"
                      />
                    </div>

                    <div
                      className="
                        mt-4
                        grid
                        grid-cols-4
                        gap-2
                      "
                    >
                      <div className="h-1.5 rounded-full bg-cyan-400/60" />
                      <div className="h-1.5 rounded-full bg-blue-400/50" />
                      <div className="h-1.5 rounded-full bg-emerald-400/50" />
                      <div className="h-1.5 rounded-full bg-cyan-400/45" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* =================================================
              GROUP SUMMARY
          ================================================= */}

          <div
            className="
              mt-8
              grid
              gap-3
              sm:grid-cols-2
              lg:grid-cols-4
            "
          >
            {FEATURE_GROUPS.map(
              (group) => {
                const Icon =
                  group.icon;

                return (
                  <article
                    key={group.title}
                    className="
                      rounded-2xl
                      border
                      border-[color:var(--bf-border)]
                      bg-[var(--bf-surface)]
                      p-4
                      shadow-sm
                      transition
                      duration-200
                      hover:-translate-y-0.5
                      hover:border-cyan-400/25
                    "
                  >
                    <div
                      className="
                        flex
                        h-9
                        w-9
                        items-center
                        justify-center
                        rounded-xl
                        border
                        border-cyan-400/20
                        bg-cyan-400/[0.07]
                        text-cyan-500
                      "
                    >
                      <Icon
                        size={18}
                        aria-hidden="true"
                      />
                    </div>

                    <h2
                      className="
                        mt-3
                        text-sm
                        font-black
                        text-[color:var(--bf-text-primary)]
                      "
                    >
                      {group.title}
                    </h2>

                    <p
                      className="
                        mt-1.5
                        text-xs
                        leading-5
                        text-[color:var(--bf-text-muted)]
                      "
                    >
                      {group.description}
                    </p>
                  </article>
                );
              }
            )}
          </div>
        </div>
      </section>

      {/* =====================================================
          INTRO
          NO SEPARATOR LINE
      ===================================================== */}

      <section
        className="
          relative
          px-5
          py-8
          sm:px-8
          sm:py-10
          lg:px-12
          lg:py-12
        "
      >
        <div className="mx-auto max-w-7xl">

          <div
            className="
              grid
              gap-6
              lg:grid-cols-[0.8fr_1.2fr]
              lg:gap-10
            "
          >
            <div>
              <p
                className="
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.2em]
                  text-cyan-500
                "
              >
                Built for transport businesses
              </p>

              <h2
                className="
                  mt-3
                  text-3xl
                  font-black
                  leading-tight
                  text-[color:var(--bf-text-primary)]
                  sm:text-4xl
                "
              >
                Everything has a place.

                <span
                  className="
                    ml-2
                    text-[color:var(--bf-text-muted)]
                  "
                >
                  Nothing scattered.
                </span>
              </h2>
            </div>

            <div className="flex items-end">
              <p
                className="
                  max-w-3xl
                  text-sm
                  leading-7
                  text-[color:var(--bf-text-secondary)]
                  sm:text-base
                "
              >
                From dispatch and documentation to finance,
                maintenance and compliance, Buddy Fleets is
                designed to give transport teams one clearer
                operational layer instead of multiple disconnected
                systems and records.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          FEATURE MODULES
      ===================================================== */}

      <section
        className="
          relative
          px-5
          py-8
          sm:px-8
          sm:py-10
          lg:px-12
          lg:py-12
        "
      >
        <div className="mx-auto max-w-7xl">

          {/* HEADER */}

          <div
            className="
              mb-6
              flex
              flex-col
              justify-between
              gap-4
              md:flex-row
              md:items-end
            "
          >
            <div>
              <p
                className="
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.2em]
                  text-cyan-500
                "
              >
                Platform capabilities
              </p>

              <h2
                className="
                  mt-3
                  text-3xl
                  font-black
                  text-[color:var(--bf-text-primary)]
                  sm:text-4xl
                "
              >
                Built around fleet workflows.
              </h2>
            </div>

            <p
              className="
                max-w-md
                text-sm
                leading-6
                text-[color:var(--bf-text-muted)]
              "
            >
              Modules are designed to work together so important
              fleet information remains easier to organize and
              review.
            </p>
          </div>

          {/* 17 MODULES */}

          <div
            className="
              grid
              gap-4
              md:grid-cols-2
              lg:grid-cols-3
            "
          >
            {FEATURES.map(
              (
                feature,
                index
              ) => (
                <FeatureCard
                  key={feature.id}
                  feature={feature}
                  index={index}
                />
              )
            )}
          </div>
        </div>
      </section>

      {/* =====================================================
          CONNECTED WORKFLOW
          NO BORDER-Y
      ===================================================== */}

      <section
        className="
          relative
          px-5
          py-8
          sm:px-8
          sm:py-10
          lg:px-12
          lg:py-12
        "
      >
        <div className="mx-auto max-w-7xl">

          <div
            className="
              grid
              items-center
              gap-8
              lg:grid-cols-[0.9fr_1.1fr]
              lg:gap-10
            "
          >
            {/* LEFT */}

            <div>
              <p
                className="
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.2em]
                  text-emerald-500
                "
              >
                Connected operations
              </p>

              <h2
                className="
                  mt-3
                  text-3xl
                  font-black
                  leading-tight
                  text-[color:var(--bf-text-primary)]
                  sm:text-4xl
                "
              >
                One workflow across

                <span
                  className="
                    ml-2
                    text-[color:var(--bf-text-muted)]
                  "
                >
                  the fleet lifecycle.
                </span>
              </h2>

              <p
                className="
                  mt-4
                  max-w-xl
                  text-sm
                  leading-7
                  text-[color:var(--bf-text-secondary)]
                "
              >
                Important information can stay connected from
                booking and dispatch through delivery, expenses,
                maintenance, compliance and settlement.
              </p>
            </div>

            {/* RIGHT */}

            <div
              className="
                rounded-[24px]
                border
                border-[color:var(--bf-border)]
                bg-[var(--bf-surface)]
                p-4
                shadow-sm
                sm:p-5
              "
            >
              <div
                className="
                  grid
                  gap-3
                  sm:grid-cols-2
                "
              >
                {CONNECTED_WORKFLOW.map(
                  (item) => {
                    const Icon =
                      item.icon;

                    return (
                      <article
                        key={item.number}
                        className="
                          rounded-2xl
                          border
                          border-[color:var(--bf-border)]
                          bg-[var(--bf-page-bg)]
                          p-4
                        "
                      >
                        <div
                          className="
                            flex
                            items-center
                            justify-between
                            gap-3
                          "
                        >
                          <div
                            className="
                              flex
                              h-9
                              w-9
                              items-center
                              justify-center
                              rounded-xl
                              bg-cyan-400/[0.07]
                              text-cyan-500
                            "
                          >
                            <Icon
                              size={17}
                              aria-hidden="true"
                            />
                          </div>

                          <span
                            className="
                              font-mono
                              text-[9px]
                              text-[color:var(--bf-text-muted)]
                            "
                          >
                            {item.number}
                          </span>
                        </div>

                        <h3
                          className="
                            mt-4
                            text-base
                            font-black
                            text-[color:var(--bf-text-primary)]
                          "
                        >
                          {item.title}
                        </h3>

                        <p
                          className="
                            mt-2
                            text-xs
                            leading-5
                            text-[color:var(--bf-text-muted)]
                          "
                        >
                          {item.text}
                        </p>
                      </article>
                    );
                  }
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          WHO IT IS FOR
      ===================================================== */}

      <section
        className="
          relative
          px-5
          py-8
          sm:px-8
          sm:py-10
          lg:px-12
          lg:py-12
        "
      >
        <div className="mx-auto max-w-7xl">

          <div
            className="
              rounded-[26px]
              border
              border-[color:var(--bf-border)]
              bg-[var(--bf-surface)]
              p-5
              shadow-sm
              sm:p-7
              lg:p-8
            "
          >
            <div
              className="
                grid
                gap-7
                lg:grid-cols-[0.8fr_1.2fr]
              "
            >
              <div>
                <div
                  className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-cyan-400/20
                    bg-cyan-400/[0.07]
                    text-cyan-500
                  "
                >
                  <Users
                    size={18}
                    aria-hidden="true"
                  />
                </div>

                <p
                  className="
                    mt-4
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.2em]
                    text-cyan-500
                  "
                >
                  Designed for Indian transport operations
                </p>

                <h2
                  className="
                    mt-3
                    text-3xl
                    font-black
                    leading-tight
                    text-[color:var(--bf-text-primary)]
                    sm:text-4xl
                  "
                >
                  Built for teams that manage fleets every day.
                </h2>
              </div>

              <div
                className="
                  grid
                  gap-3
                  sm:grid-cols-2
                "
              >
                {TARGET_USERS.map(
                  (item) => (
                    <div
                      key={item}
                      className="
                        flex
                        items-center
                        gap-3
                        rounded-xl
                        border
                        border-[color:var(--bf-border)]
                        bg-[var(--bf-page-bg)]
                        p-3.5
                      "
                    >
                      <BadgeCheck
                        size={17}
                        aria-hidden="true"
                        className="
                          shrink-0
                          text-emerald-500
                        "
                      />

                      <span
                        className="
                          text-sm
                          font-bold
                          text-[color:var(--bf-text-secondary)]
                        "
                      >
                        {item}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          FINAL CTA
      ===================================================== */}

      <section
        className="
          relative
          px-5
          pb-10
          pt-4
          sm:px-8
          sm:pb-12
          lg:px-12
        "
      >
        <div className="mx-auto max-w-6xl">

          <div
            className="
              relative
              overflow-hidden
              rounded-[28px]
              border
              border-cyan-400/20
              bg-[var(--bf-surface)]
              px-6
              py-8
              text-center
              shadow-sm
              sm:px-10
              sm:py-10
            "
          >
            {/* GLOW */}

            <div
              aria-hidden="true"
              className="
                absolute
                left-1/2
                top-0
                h-64
                w-64
                -translate-x-1/2
                -translate-y-1/2
                rounded-full
                bg-cyan-400/12
                blur-[90px]
              "
            />

            {/* GRID */}

            <div
              aria-hidden="true"
              className="
                absolute
                inset-0
                opacity-[0.04]
              "
              style={{
                backgroundImage:
                  'linear-gradient(rgba(100,116,139,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(100,116,139,0.3) 1px, transparent 1px)',
                backgroundSize:
                  '50px 50px',
              }}
            />

            <div className="relative">
              <p
                className="
                  text-[10px]
                  font-black
                  uppercase
                  tracking-[0.22em]
                  text-cyan-500
                "
              >
                Ready to get started?
              </p>

              <h2
                className="
                  mx-auto
                  mt-3
                  max-w-4xl
                  text-3xl
                  font-black
                  leading-tight
                  text-[color:var(--bf-text-primary)]
                  sm:text-4xl
                  lg:text-[44px]
                "
              >
                Bring your fleet operations{' '}

                <span
                  className="
                    bg-gradient-to-r
                    from-[#12BFF2]
                    via-[#078EE5]
                    to-[#0AA23B]
                    bg-clip-text
                    text-transparent
                  "
                >
                  into one platform.
                </span>
              </h2>

              <p
                className="
                  mx-auto
                  mt-4
                  max-w-2xl
                  text-sm
                  leading-6
                  text-[color:var(--bf-text-secondary)]
                "
              >
                Start with Buddy Fleets and create a cleaner,
                more organized workflow for your transport
                business.
              </p>

              <div
                className="
                  mt-5
                  flex
                  flex-col
                  justify-center
                  gap-3
                  sm:flex-row
                "
              >
                <Link
                  to="/signup"
                  className="
                    inline-flex
                    min-h-11
                    items-center
                    justify-center
                    rounded-xl
                    bg-gradient-to-r
                    from-[#078EE5]
                    to-[#0AA23B]
                    px-6
                    py-3
                    text-sm
                    font-black
                    text-white
                    shadow-lg
                    shadow-blue-900/10
                    transition
                    duration-200
                    hover:-translate-y-0.5
                    hover:shadow-blue-500/20
                    focus-visible:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-cyan-400
                  "
                >
                  Get Started
                </Link>

                <Link
                  to="/contact-us"
                  className="
                    inline-flex
                    min-h-11
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-[color:var(--bf-border)]
                    bg-[var(--bf-page-bg)]
                    px-6
                    py-3
                    text-sm
                    font-bold
                    text-[color:var(--bf-text-primary)]
                    transition
                    duration-200
                    hover:-translate-y-0.5
                    hover:border-cyan-400/30
                    focus-visible:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-cyan-400
                  "
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}