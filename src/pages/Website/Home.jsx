import React from 'react';
import { Link } from 'react-router-dom';

import {
  BadgeCheck,
  Bell,
  ClipboardCheck,
  FileText,
  Fuel,
  PackageCheck,
  ReceiptText,
  ShieldCheck,
  Truck,
  Users,
  WalletCards,
  Wrench,
} from 'lucide-react';

/* =========================================================
   IMAGE CONFIG

   Hero image optimized for mobile LCP.

   IMPORTANT:
   Keep these local truck assets in sync with the preload
   that we will add to index.html next.
========================================================= */

const IMAGES = {
  truck: {
    small: '/images/truck-400.webp',
    medium: '/images/truck-640.webp',
  },

  workshop: {
    small: '/images/workshop-400.webp',
    medium: '/images/workshop-560.webp',
  },

  finance: {
    small: '/images/finance-400.webp',
    medium: '/images/finance-560.webp',
  },
};

/* =========================================================
   HIGHLIGHTS
========================================================= */

const HIGHLIGHTS = [
  {
    title: 'Fleet Operations',
    description:
      'Vehicles, drivers, trips and dispatch workflows.',
    icon: Truck,
  },

  {
    title: 'Finance',
    description:
      'Expenses, diesel, advances and settlements.',
    icon: WalletCards,
  },

  {
    title: 'Compliance',
    description:
      'Documents, renewals and operational alerts.',
    icon: ShieldCheck,
  },

  {
    title: 'Maintenance',
    description:
      'Workshop, tyres, spares and service records.',
    icon: Wrench,
  },
];

/* =========================================================
   CORE FEATURES
========================================================= */

const CORE_FEATURES = [
  {
    number: '01',

    title:
      'Transport Operations',

    description:
      'Manage LR/Bilty, consignments, trip allocation, vehicle assignment, driver assignment and delivery workflows from one connected system.',

    image:
      IMAGES.truck,

    imageAlt:
      'Commercial transport truck representing transport operations',

    icon:
      Truck,
  },

  {
    number: '02',

    title:
      'Workshop, Tyres & Spares',

    description:
      'Maintain workshop jobs, service records, tyre lifecycle, spare parts and vehicle maintenance information in one place.',

    image:
      IMAGES.workshop,

    imageAlt:
      'Vehicle workshop representing maintenance operations',

    icon:
      Wrench,
  },

  {
    number: '03',

    title:
      'Expenses & Transport Finance',

    description:
      'Organize trip expenses, diesel, driver advances, party records, invoices and settlements with cleaner financial workflows.',

    image:
      IMAGES.finance,

    imageAlt:
      'Financial records representing transport finance workflows',

    icon:
      ReceiptText,
  },
];

/* =========================================================
   WORKFLOW
========================================================= */

const WORKFLOW = [
  {
    step: '01',

    title:
      'Booking',

    text:
      'Create LR/Bilty and consignment details.',

    icon:
      FileText,
  },

  {
    step: '02',

    title:
      'Dispatch',

    text:
      'Assign the required vehicle and driver.',

    icon:
      Truck,
  },

  {
    step: '03',

    title:
      'Trip Updates',

    text:
      'Keep trip information and operational progress organized.',

    icon:
      ClipboardCheck,
  },

  {
    step: '04',

    title:
      'Delivery',

    text:
      'Record delivery status and ePOD information.',

    icon:
      PackageCheck,
  },

  {
    step: '05',

    title:
      'Settlement',

    text:
      'Close the trip and complete financial records.',

    icon:
      WalletCards,
  },
];

/* =========================================================
   BENEFITS
========================================================= */

const BENEFITS = [
  {
    title:
      'Controlled Fleet Records',

    text:
      'Keep vehicle, driver, party and operational records inside one organized platform.',

    icon:
      ShieldCheck,
  },

  {
    title:
      'Simpler Daily Operations',

    text:
      'Reduce repetitive manual work and give your transport team a clearer workflow.',

    icon:
      BadgeCheck,
  },

  {
    title:
      'Role-Based Access',

    text:
      'Give owners, managers, accountants and operators access based on their responsibilities.',

    icon:
      Users,
  },
];

/* =========================================================
   OVERVIEW
========================================================= */

const OVERVIEW_ITEMS = [
  {
    title:
      'Trip & LR/Bilty',

    icon:
      FileText,
  },

  {
    title:
      'Vehicles & Drivers',

    icon:
      Truck,
  },

  {
    title:
      'Expenses & Diesel',

    icon:
      Fuel,
  },

  {
    title:
      'Maintenance & Alerts',

    icon:
      Bell,
  },
];

/* =========================================================
   PRODUCT MOCKUP
========================================================= */

const PRODUCT_ITEMS = [
  {
    label:
      'Vehicle Records',

    value:
      'Vehicles',

    icon:
      Truck,
  },

  {
    label:
      'Trip Operations',

    value:
      'Trips',

    icon:
      ClipboardCheck,
  },

  {
    label:
      'Delivery Records',

    value:
      'ePOD',

    icon:
      PackageCheck,
  },

  {
    label:
      'Pending Actions',

    value:
      'Alerts',

    icon:
      Bell,
  },
];

/* =========================================================
   REUSABLE HEADING GRADIENT
========================================================= */

const headingGradient = `
  bg-gradient-to-r
  from-[#12BFF2]
  via-[#078EE5]
  to-[#0AA23B]
  bg-clip-text
  text-transparent
`;

/* =========================================================
   HOME
========================================================= */

export default function Home() {
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

            opacity-[0.045]
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

            -left-44
            top-10

            h-[420px]
            w-[420px]

            rounded-full

            bg-cyan-500/[0.08]

            blur-[120px]
          "
        />

        <div
          className="
            absolute

            -right-44
            top-[30rem]

            h-[440px]
            w-[440px]

            rounded-full

            bg-blue-500/[0.07]

            blur-[130px]
          "
        />

        <div
          className="
            absolute

            bottom-[8%]
            left-[32%]

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
          aria-hidden="true"
          className="
            pointer-events-none

            absolute
            left-1/2
            top-[25%]

            h-[400px]
            w-[88%]
            max-w-[820px]

            -translate-x-1/2

            rounded-full

            bg-blue-500/[0.05]

            blur-[125px]
          "
        />

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

            <div
              className="
                relative
                z-10

                min-w-0
              "
            >
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

                    shrink-0

                    rounded-full

                    bg-cyan-400

                    shadow-[0_0_12px_rgba(34,211,238,0.55)]
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
                  YOUR FLEETS ONE OPERATING SYSTEM
                </span>
              </div>

              {/* =================================================
                  HERO TITLE

                  EXACTLY 3 LINES ON NORMAL SCREENS.
              ================================================= */}

              <h1
                className="
                  max-w-[720px]

                  overflow-visible

                  pb-2

                  text-[clamp(1.72rem,4vw,3.3rem)]

                  font-black

                  leading-[1.08]

                  tracking-[-0.025em]
                "
              >
                <span
                  className={`
                    block

                    overflow-visible

                    pb-[0.08em]

                    whitespace-nowrap

                    ${headingGradient}
                  `}
                >
                  Cloud based
                </span>

                <span
                  className={`
                    block

                    overflow-visible

                    pb-[0.08em]

                    whitespace-nowrap

                    ${headingGradient}
                  `}
                >
                  intellectual Fleets
                </span>

                <span
                  className={`
                    block

                    overflow-visible

                    pb-[0.12em]

                    whitespace-nowrap

                    ${headingGradient}
                  `}
                >
                  management system
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

                  lg:text-[16px]
                "
              >
                Buddy Fleets brings trips, LR/Bilty,
                vehicles, drivers, diesel, maintenance,
                compliance, documents and settlements
                into one simpler transport operations
                platform.
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
                  to="/features"
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

                    shadow-sm

                    transition
                    duration-200

                    hover:-translate-y-0.5
                    hover:border-cyan-400/30

                    focus-visible:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-cyan-400
                  "
                >
                  View Features
                </Link>
              </div>

              {/* TRUST ROW */}

              <div
                className="
                  mt-5

                  flex
                  flex-wrap

                  gap-x-5
                  gap-y-2

                  text-[11px]
                  font-medium

                  text-[color:var(--bf-text-muted)]
                "
              >
                <span
                  className="
                    flex
                    items-center
                    gap-2
                  "
                >
                  <BadgeCheck
                    size={14}
                    aria-hidden="true"
                    className="text-emerald-500"
                  />

                  Fleet Management
                </span>

                <span
                  className="
                    flex
                    items-center
                    gap-2
                  "
                >
                  <BadgeCheck
                    size={14}
                    aria-hidden="true"
                    className="text-emerald-500"
                  />

                  Transport Operations
                </span>

                <span
                  className="
                    flex
                    items-center
                    gap-2
                  "
                >
                  <BadgeCheck
                    size={14}
                    aria-hidden="true"
                    className="text-emerald-500"
                  />

                  Finance & Compliance
                </span>
              </div>
            </div>

            {/* =================================================
                HERO VISUAL
            ================================================= */}

            <div
              className="
                relative

                mx-auto

                w-full
                max-w-[520px]
              "
            >
              {/* GLOW */}

              <div
                aria-hidden="true"
                className="
                  absolute
                  -inset-5

                  rounded-[36px]

                  bg-gradient-to-r
                  from-cyan-500/12
                  via-blue-500/[0.06]
                  to-emerald-500/[0.08]

                  blur-3xl
                "
              />

              {/* FRAME */}

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
                    overflow-hidden

                    rounded-[20px]

                    border
                    border-white/[0.08]

                    bg-[#0b111c]
                  "
                >
                  {/* TOP BAR */}

                  <div
                    className="
                      flex

                      items-center
                      justify-between

                      border-b
                      border-white/[0.06]

                      px-4
                      py-3
                    "
                  >
                    <div
                      className="
                        flex
                        items-center
                        gap-2
                      "
                    >
                      <span className="h-2 w-2 rounded-full bg-red-400/70" />
                      <span className="h-2 w-2 rounded-full bg-amber-400/70" />
                      <span className="h-2 w-2 rounded-full bg-emerald-400/70" />
                    </div>

                    <p
                      className="
                        hidden

                        text-[8px]
                        font-bold

                        uppercase

                        tracking-[0.18em]

                        text-slate-400

                        sm:block
                      "
                    >
                      Buddy Fleets
                    </p>

                    <span
                      className="
                        h-2
                        w-2

                        rounded-full

                        bg-emerald-400
                      "
                    />
                  </div>

                  {/* =================================================
                      HERO LCP IMAGE

                      Keep:
                      - loading=eager
                      - fetchPriority=high
                      - responsive srcSet
                      - explicit width/height

                      index.html preload will use the same local assets.
                  ================================================= */}

                  <div
                    className="
                      relative

                      aspect-[4/3]

                      min-h-[245px]

                      overflow-hidden

                      sm:min-h-[300px]
                    "
                  >
                    <img
                      src={IMAGES.truck.medium}
                      srcSet={`
                        ${IMAGES.truck.small} 400w,
                        ${IMAGES.truck.medium} 640w
                      `}
                      sizes="
                        (max-width: 640px) 92vw,
                        (max-width: 1024px) 520px,
                        500px
                      "
                      alt="Commercial transport truck"
                      width="640"
                      height="427"
                      loading="eager"
                      fetchPriority="high"
                      decoding="async"
                      className="
                        h-full
                        w-full

                        object-cover

                        opacity-70
                      "
                    />

                    <div
                      aria-hidden="true"
                      className="
                        absolute
                        inset-0

                        bg-gradient-to-t
                        from-[#080d16]
                        via-[#080d16]/25
                        to-transparent
                      "
                    />

                    {/* CENTER ICON */}

                    <div
                      className="
                        absolute
                        left-1/2
                        top-1/2

                        flex
                        h-14
                        w-14

                        -translate-x-1/2
                        -translate-y-1/2

                        items-center
                        justify-center

                        rounded-2xl

                        border
                        border-cyan-300/30

                        bg-cyan-400/15

                        text-cyan-100

                        backdrop-blur-xl
                      "
                    >
                      <Truck
                        size={25}
                        aria-hidden="true"
                      />
                    </div>

                    {/* STATUS */}

                    <div
                      className="
                        absolute

                        bottom-3
                        left-3
                        right-3
                      "
                    >
                      <div
                        className="
                          rounded-xl

                          border
                          border-white/10

                          bg-black/60

                          p-3.5

                          backdrop-blur-xl
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
                                text-[8px]
                                font-semibold

                                uppercase

                                tracking-[0.18em]

                                text-slate-400
                              "
                            >
                              Operations Overview
                            </p>

                            <p
                              className="
                                mt-1

                                text-xs
                                font-bold

                                text-white

                                sm:text-sm
                              "
                            >
                              Fleet workspace connected
                            </p>
                          </div>

                          <span
                            className="
                              rounded-full

                              border
                              border-emerald-400/20

                              bg-emerald-400/10

                              px-2.5
                              py-1

                              text-[8px]
                              font-bold

                              text-emerald-300
                            "
                          >
                            ACTIVE
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* =================================================
              HIGHLIGHTS
          ================================================= */}

          <div
            className="
              mt-8

              grid
              grid-cols-1

              gap-3

              sm:grid-cols-2

              lg:grid-cols-4
            "
          >
            {HIGHLIGHTS.map(
              (
                item
              ) => {
                const Icon =
                  item.icon;

                return (
                  <article
                    key={
                      item.title
                    }
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
                      {item.title}
                    </h2>

                    <p
                      className="
                        mt-1.5

                        text-xs
                        leading-5

                        text-[color:var(--bf-text-muted)]
                      "
                    >
                      {item.description}
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
        <div
          className="
            mx-auto
            max-w-7xl
          "
        >
          <div
            className="
              grid
              gap-6

              lg:grid-cols-[0.85fr_1.15fr]
              lg:gap-10
            "
          >
            <div>
              <p
                className="
                  text-[11px]
                  font-bold

                  uppercase

                  tracking-[0.2em]

                  text-cyan-500
                "
              >
                One connected ecosystem
              </p>

              <h2
                className="
                  mt-3

                  text-3xl
                  font-black

                  leading-tight

                  text-[color:var(--bf-text-primary)]

                  sm:text-4xl

                  lg:text-[44px]
                "
              >
                Your transport business.
                <br />

                <span
                  className="
                    text-[color:var(--bf-text-muted)]
                  "
                >
                  One workspace.
                </span>
              </h2>
            </div>

            <div
              className="
                flex
                items-end
              "
            >
              <p
                className="
                  max-w-3xl

                  text-sm
                  leading-7

                  text-[color:var(--bf-text-secondary)]

                  sm:text-base
                "
              >
                Reduce dependence on scattered registers,
                spreadsheets, messages and disconnected
                records. Buddy Fleets gives your team one
                structured operational layer for day-to-day
                fleet management.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          CORE CAPABILITIES
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
        <div
          className="
            mx-auto
            max-w-7xl
          "
        >
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
                  text-[11px]
                  font-bold

                  uppercase

                  tracking-[0.2em]

                  text-emerald-500
                "
              >
                Core capabilities
              </p>

              <h2
                className="
                  mt-3

                  max-w-3xl

                  text-3xl
                  font-black

                  text-[color:var(--bf-text-primary)]

                  sm:text-4xl
                "
              >
                Built for everyday transport operations.
              </h2>
            </div>

            <Link
              to="/features"
              className="
                inline-flex
                min-h-10

                items-center
                justify-center

                rounded-xl

                border
                border-[color:var(--bf-border)]

                bg-[var(--bf-surface)]

                px-5
                py-2.5

                text-sm
                font-bold

                text-[color:var(--bf-text-primary)]

                transition
                duration-200

                hover:border-cyan-400/30

                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-cyan-400
              "
            >
              View All Features
            </Link>
          </div>

          {/* CARDS */}

          <div
            className="
              grid

              gap-4

              lg:grid-cols-3
            "
          >
            {CORE_FEATURES.map(
              (
                feature
              ) => {
                const Icon =
                  feature.icon;

                return (
                  <article
                    key={
                      feature.number
                    }
                    className="
                      group

                      overflow-hidden

                      rounded-[24px]

                      border
                      border-[color:var(--bf-border)]

                      bg-[var(--bf-surface)]

                      shadow-sm

                      transition
                      duration-300

                      hover:-translate-y-0.5
                      hover:border-cyan-400/25
                    "
                  >
                    {/* IMAGE */}

                    <div
                      className="
                        relative

                        aspect-[3/1.65]

                        overflow-hidden

                        bg-[#0b111c]
                      "
                    >
                      <img
                        src={feature.image.small}
                        srcSet={`
                          ${feature.image.small} 400w,
                          ${feature.image.medium} 560w
                        `}
                        sizes="
                          (max-width: 640px) 92vw,
                          (max-width: 1024px) 520px,
                          400px
                        "
                        alt={feature.imageAlt}
                        width="560"
                        height="373"
                        loading="lazy"
                        decoding="async"
                        className="
                          h-full
                          w-full

                          object-cover

                          opacity-65

                          transition
                          duration-500

                          group-hover:scale-[1.02]
                          group-hover:opacity-75
                        "
                      />

                      <div
                        aria-hidden="true"
                        className="
                          absolute
                          inset-0

                          bg-gradient-to-t
                          from-[#080d16]
                          via-[#080d16]/20
                          to-transparent
                        "
                      />

                      <div
                        className="
                          absolute
                          left-4
                          top-4

                          flex
                          h-10
                          w-10

                          items-center
                          justify-center

                          rounded-xl

                          border
                          border-white/10

                          bg-black/40

                          text-cyan-300

                          backdrop-blur-xl
                        "
                      >
                        <Icon
                          size={19}
                          aria-hidden="true"
                        />
                      </div>

                      <span
                        className="
                          absolute
                          right-4
                          top-4

                          font-mono

                          text-[10px]

                          text-slate-300
                        "
                      >
                        {feature.number}
                      </span>
                    </div>

                    {/* CONTENT */}

                    <div className="p-5">
                      <h3
                        className="
                          text-lg
                          font-black

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
            )}
          </div>
        </div>
      </section>

      {/* =====================================================
          WORKFLOW

          NO SECTION BORDER / NO DIVIDER LINE
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
        <div
          className="
            mx-auto
            max-w-7xl
          "
        >
          <div
            className="
              mb-6
              max-w-4xl
            "
          >
            <p
              className="
                text-[11px]
                font-bold

                uppercase

                tracking-[0.2em]

                text-cyan-500
              "
            >
              End-to-end workflow
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
              From booking to settlement.

              <span
                className="
                  ml-2

                  text-[color:var(--bf-text-muted)]
                "
              >
                Everything stays connected.
              </span>
            </h2>
          </div>

          <div
            className="
              grid

              gap-3

              sm:grid-cols-2

              lg:grid-cols-5
            "
          >
            {WORKFLOW.map(
              (
                item
              ) => {
                const Icon =
                  item.icon;

                return (
                  <article
                    key={
                      item.step
                    }
                    className="
                      h-full

                      rounded-2xl

                      border
                      border-[color:var(--bf-border)]

                      bg-[var(--bf-surface)]

                      p-4

                      transition
                      duration-200

                      hover:-translate-y-0.5
                      hover:border-cyan-400/25
                    "
                  >
                    <div
                      className="
                        flex
                        items-center
                        justify-between
                      "
                    >
                      <div
                        className="
                          flex
                          h-10
                          w-10

                          items-center
                          justify-center

                          rounded-xl

                          border
                          border-cyan-400/15

                          bg-cyan-400/[0.07]

                          text-cyan-500
                        "
                      >
                        <Icon
                          size={18}
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
                        {item.step}
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
      </section>

      {/* =====================================================
          OPERATIONS OVERVIEW
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
        <div
          className="
            mx-auto
            max-w-7xl
          "
        >
          <div
            className="
              grid
              items-center

              gap-8

              lg:grid-cols-[0.85fr_1.15fr]
              lg:gap-10
            "
          >
            {/* TEXT */}

            <div>
              <p
                className="
                  text-[11px]
                  font-bold

                  uppercase

                  tracking-[0.2em]

                  text-emerald-500
                "
              >
                Operations overview
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
                Keep important fleet information

                <span
                  className="
                    ml-2

                    text-[color:var(--bf-text-muted)]
                  "
                >
                  easier to review.
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
                Review operational records such as trips,
                vehicles, expenses, deliveries,
                maintenance and pending actions without
                relying on multiple disconnected
                registers.
              </p>

              <div
                className="
                  mt-5

                  grid

                  gap-2.5

                  sm:grid-cols-2
                "
              >
                {OVERVIEW_ITEMS.map(
                  (
                    item
                  ) => {
                    const Icon =
                      item.icon;

                    return (
                      <div
                        key={
                          item.title
                        }
                        className="
                          flex
                          items-center
                          gap-3

                          rounded-xl

                          border
                          border-[color:var(--bf-border)]

                          bg-[var(--bf-surface)]

                          p-3
                        "
                      >
                        <div
                          className="
                            flex
                            h-8
                            w-8

                            shrink-0

                            items-center
                            justify-center

                            rounded-lg

                            bg-emerald-400/[0.08]

                            text-emerald-500
                          "
                        >
                          <Icon
                            size={16}
                            aria-hidden="true"
                          />
                        </div>

                        <span
                          className="
                            text-sm
                            font-semibold

                            text-[color:var(--bf-text-secondary)]
                          "
                        >
                          {item.title}
                        </span>
                      </div>
                    );
                  }
                )}
              </div>
            </div>

            {/* =================================================
                PRODUCT MOCKUP
            ================================================= */}

            <div className="relative">
              <div
                aria-hidden="true"
                className="
                  absolute
                  -inset-6

                  rounded-[36px]

                  bg-blue-500/[0.05]

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

                  shadow-xl
                  shadow-black/20
                "
              >
                <div
                  className="
                    rounded-[20px]

                    border
                    border-white/[0.06]

                    bg-[#0b111c]

                    p-5
                  "
                >
                  {/* HEADER */}

                  <div
                    className="
                      flex
                      flex-col

                      justify-between

                      gap-3

                      sm:flex-row
                      sm:items-center
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
                        Fleet workspace
                      </p>

                      <h3
                        className="
                          mt-1.5

                          text-lg
                          font-black

                          text-white
                        "
                      >
                        Operations Overview
                      </h3>
                    </div>

                    <div
                      className="
                        inline-flex
                        w-fit

                        items-center
                        gap-2

                        rounded-full

                        border
                        border-emerald-400/20

                        bg-emerald-400/[0.06]

                        px-3
                        py-1.5

                        text-[9px]
                        font-bold

                        text-emerald-300
                      "
                    >
                      <span
                        className="
                          h-2
                          w-2

                          rounded-full

                          bg-emerald-400
                        "
                      />

                      CONNECTED
                    </div>
                  </div>

                  {/* PRODUCT ITEMS */}

                  <div
                    className="
                      mt-5

                      grid
                      grid-cols-2

                      gap-2.5
                    "
                  >
                    {PRODUCT_ITEMS.map(
                      (
                        item
                      ) => {
                        const Icon =
                          item.icon;

                        return (
                          <div
                            key={
                              item.label
                            }
                            className="
                              rounded-xl

                              border
                              border-white/[0.06]

                              bg-white/[0.025]

                              p-3.5
                            "
                          >
                            <Icon
                              size={18}
                              aria-hidden="true"
                              className="text-cyan-300"
                            />

                            <p
                              className="
                                mt-3

                                text-sm
                                font-black

                                text-white
                              "
                            >
                              {item.value}
                            </p>

                            <p
                              className="
                                mt-1

                                text-[8px]
                                font-medium

                                uppercase

                                tracking-wider

                                text-slate-400
                              "
                            >
                              {item.label}
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
                      border-white/[0.06]

                      bg-white/[0.02]

                      p-4
                    "
                  >
                    <div
                      className="
                        flex

                        items-center
                        justify-between

                        gap-4
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
                          Operational Records
                        </p>

                        <p
                          className="
                            mt-1

                            text-[9px]

                            text-slate-400
                          "
                        >
                          Structured fleet information
                        </p>
                      </div>

                      <ClipboardCheck
                        size={18}
                        aria-hidden="true"
                        className="text-cyan-300"
                      />
                    </div>

                    <div
                      className="
                        mt-4

                        grid

                        gap-2

                        sm:grid-cols-3
                      "
                    >
                      <div className="h-1.5 rounded-full bg-cyan-400/60" />
                      <div className="h-1.5 rounded-full bg-blue-400/50" />
                      <div className="h-1.5 rounded-full bg-emerald-400/50" />
                    </div>

                    <div
                      className="
                        mt-2.5

                        grid

                        gap-2

                        sm:grid-cols-4
                      "
                    >
                      <div className="h-1.5 rounded-full bg-white/15" />
                      <div className="h-1.5 rounded-full bg-white/15" />
                      <div className="h-1.5 rounded-full bg-white/15" />
                      <div className="h-1.5 rounded-full bg-white/15" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          BENEFITS
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
        <div
          className="
            mx-auto
            max-w-7xl
          "
        >
          <div
            className="
              mb-6

              text-center
            "
          >
            <p
              className="
                text-[11px]
                font-bold

                uppercase

                tracking-[0.2em]

                text-cyan-500
              "
            >
              Why Buddy Fleets
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
              Built around real fleet workflows.
            </h2>
          </div>

          <div
            className="
              grid

              gap-4

              md:grid-cols-3
            "
          >
            {BENEFITS.map(
              (
                benefit,
                index
              ) => {
                const Icon =
                  benefit.icon;

                return (
                  <article
                    key={
                      benefit.title
                    }
                    className="
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
                    <div
                      className="
                        flex
                        items-center
                        justify-between
                      "
                    >
                      <div
                        className="
                          flex
                          h-11
                          w-11

                          items-center
                          justify-center

                          rounded-xl

                          border
                          border-cyan-400/15

                          bg-cyan-400/[0.07]

                          text-cyan-500
                        "
                      >
                        <Icon
                          size={21}
                          aria-hidden="true"
                        />
                      </div>

                      <span
                        className="
                          font-mono

                          text-[10px]

                          text-[color:var(--bf-text-muted)]
                        "
                      >
                        0{index + 1}
                      </span>
                    </div>

                    <h3
                      className="
                        mt-5

                        text-lg
                        font-black

                        text-[color:var(--bf-text-primary)]
                      "
                    >
                      {benefit.title}
                    </h3>

                    <p
                      className="
                        mt-2.5

                        text-sm
                        leading-6

                        text-[color:var(--bf-text-secondary)]
                      "
                    >
                      {benefit.text}
                    </p>
                  </article>
                );
              }
            )}
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
        <div
          className="
            mx-auto
            max-w-6xl
          "
        >
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
                Ready to modernize?
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
                Your fleet deserves{' '}

                <span
                  className={
                    headingGradient
                  }
                >
                  simpler technology.
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
                Bring daily transport operations together
                with Buddy Fleets and build a cleaner,
                more organized fleet workflow.
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
                {/* =========================================
                    WHITE BUTTON BUG FIXED
                ========================================= */}

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
                  to="/features"
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
                  View Features
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}