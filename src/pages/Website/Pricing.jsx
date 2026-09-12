import React, {
  useEffect,
  useRef,
  useState,
} from 'react';

import { Link } from 'react-router-dom';

import {
  Check,
  ChevronDown,
  Crown,
  Gauge,
  Rocket,
  TrendingUp,
  Truck,
} from 'lucide-react';

/* =========================================================
   SUBSCRIPTION DURATIONS
========================================================= */

const DURATIONS = [
  {
    months: 1,
    label: '1 Month',
  },
  {
    months: 3,
    label: '3 Months',
  },
  {
    months: 6,
    label: '6 Months',
  },
  {
    months: 12,
    label: '12 Months',
  },
];

/* =========================================================
   PRICING PLANS

   IMPORTANT:
   Prices / vehicle limits / user limits / site limits
   are preserved from the existing pricing page.

   Feature wording stays within approved Buddy Fleets scope.
========================================================= */

const PLANS = [
  {
    id: 'launch',

    name: 'Launch',

    tagline:
      'Essential fleet control for getting started.',

    fleet:
      '1–10 Vehicles',

    users:
      '2 Users',

    sites:
      '1 Site',

    icon:
      Rocket,

    accent:
      'from-[#12BFF2] via-[#078EE5] to-[#075bb8]',

    accentSoft:
      'bg-cyan-500/[0.07]',

    accentText:
      'text-cyan-500',

    prices: {
      1: 7000,
      3: 19500,
      6: 36000,
      12: 66000,
    },

    features: [
      '1–10 Vehicles',
      '2 Users',
      '1 Site',
      'Vehicle & Driver Records',
      'Vehicle & Driver Documents',
      'Document Expiry Alerts',
      'Expenses & Fuel Records',
      'Maintenance Records',
      'Dashboard & Reports',
    ],
  },

  {
    id: 'accelerate',

    name: 'Accelerate',

    tagline:
      'Smarter operations for growing fleets.',

    fleet:
      '11–50 Vehicles',

    users:
      '5 Users',

    sites:
      '2 Sites',

    icon:
      TrendingUp,

    accent:
      'from-[#078EE5] via-[#087bd0] to-[#0AA23B]',

    accentSoft:
      'bg-blue-500/[0.07]',

    accentText:
      'text-blue-500',

    prices: {
      1: 13000,
      3: 37500,
      6: 72000,
      12: 132000,
    },

    features: [
      '11–50 Vehicles',
      '5 Users',
      '2 Sites',
      'Everything in Launch',
      'Expenses & Earnings',
      'Driver Advances & Payments',
      'Workshop & Maintenance',
      'Duty & Dispatch Allocation',
      'Dashboard & Reports',
    ],
  },

  {
    id: 'scale',

    name: 'Scale',

    tagline:
      'Connected control for larger fleet operations.',

    fleet:
      '51–200 Vehicles',

    users:
      '10 Users',

    sites:
      '3 Sites',

    icon:
      Gauge,

    accent:
      'from-[#078EE5] via-[#0b96b7] to-[#0AA23B]',

    accentSoft:
      'bg-emerald-500/[0.07]',

    accentText:
      'text-emerald-500',

    badge:
      'MOST POPULAR',

    prices: {
      1: 22000,
      3: 63000,
      6: 120000,
      12: 216000,
    },

    features: [
      '51–200 Vehicles',
      '10 Users',
      '3 Sites',
      'Everything in Accelerate',
      'LR / Bilty / Consignment Records',
      'ePOD & Delivery Records',
      'Invoices & Settlements',
      'Party Records & Ledgers',
      'Role & Site Access',
    ],
  },

  {
    id: 'apex',

    name: 'Apex',

    tagline:
      'Complete operational coverage for large fleets.',

    fleet:
      '201+ Vehicles',

    users:
      '20 Users',

    sites:
      '4 Sites',

    icon:
      Crown,

    accent:
      'from-[#078EE5] via-[#0b9f74] to-[#0AA23B]',

    accentSoft:
      'bg-emerald-500/[0.07]',

    accentText:
      'text-emerald-500',

    prices: {
      1: 30000,
      3: 87000,
      6: 168000,
      12: 324000,
    },

    features: [
      '201+ Vehicles',
      '20 Users',
      '4 Sites',
      'Everything in Scale',
      'Trip & Route Planning',
      'Challan Records',
      'Tyre Management',
      'Spare Parts Management',
      'Document & Compliance Alerts',
    ],
  },
];

/* =========================================================
   PRICE FORMATTER
========================================================= */

function formatPrice(value) {
  return new Intl.NumberFormat(
    'en-IN',
    {
      maximumFractionDigits: 0,
    }
  ).format(value);
}

/* =========================================================
   CUSTOM DURATION DROPDOWN

   No native <select>.
========================================================= */

function DurationPicker({
  planId,
  value,
  onChange,
}) {
  const [
    isOpen,
    setIsOpen,
  ] = useState(false);

  const wrapperRef =
    useRef(null);

  const selectedOption =
    DURATIONS.find(
      (item) =>
        item.months === value
    ) || DURATIONS[0];

  /* =======================================================
     CLICK OUTSIDE
  ======================================================= */

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleOutside =
      (event) => {
        if (
          wrapperRef.current &&
          !wrapperRef.current.contains(
            event.target
          )
        ) {
          setIsOpen(false);
        }
      };

    document.addEventListener(
      'mousedown',
      handleOutside
    );

    document.addEventListener(
      'touchstart',
      handleOutside,
      {
        passive: true,
      }
    );

    return () => {
      document.removeEventListener(
        'mousedown',
        handleOutside
      );

      document.removeEventListener(
        'touchstart',
        handleOutside
      );
    };
  }, [
    isOpen,
  ]);

  /* =======================================================
     ESCAPE KEY
  ======================================================= */

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleKeyDown =
      (event) => {
        if (
          event.key ===
          'Escape'
        ) {
          setIsOpen(false);
        }
      };

    document.addEventListener(
      'keydown',
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        'keydown',
        handleKeyDown
      );
    };
  }, [
    isOpen,
  ]);

  return (
    <div
      ref={wrapperRef}
      className="
        relative
        z-30
      "
    >
      <p
        id={`${planId}-duration-label`}
        className="
          mb-1.5
          text-[8px]
          font-black
          uppercase
          tracking-[0.15em]
          text-[color:var(--bf-text-muted)]
        "
      >
        Subscription Duration
      </p>

      <button
        type="button"
        aria-labelledby={`${planId}-duration-label`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() =>
          setIsOpen(
            (previous) =>
              !previous
          )
        }
        className="
          flex
          h-10
          w-full
          items-center
          justify-between
          gap-3

          rounded-xl
          border
          border-[color:var(--bf-border)]

          bg-[var(--bf-page-bg)]

          px-3.5

          text-left
          text-[11px]
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
        <span>
          {selectedOption.label}
        </span>

        <ChevronDown
          size={14}
          aria-hidden="true"
          className={`
            shrink-0
            text-[color:var(--bf-text-muted)]
            transition-transform
            duration-200

            ${
              isOpen
                ? 'rotate-180'
                : ''
            }
          `}
        />
      </button>

      {/* OPTIONS */}

      {isOpen && (
        <div
          role="listbox"
          aria-labelledby={`${planId}-duration-label`}
          className="
            absolute
            left-0
            right-0
            top-[calc(100%+6px)]
            z-50

            overflow-hidden

            rounded-xl
            border
            border-[color:var(--bf-border)]

            bg-[var(--bf-surface)]

            p-1.5

            shadow-2xl
            shadow-black/25

            backdrop-blur-2xl
          "
        >
          {DURATIONS.map(
            (option) => {
              const isSelected =
                option.months ===
                value;

              return (
                <button
                  key={
                    option.months
                  }
                  type="button"
                  role="option"
                  aria-selected={
                    isSelected
                  }
                  onClick={() => {
                    onChange(
                      option.months
                    );

                    setIsOpen(
                      false
                    );
                  }}
                  className={`
                    flex
                    w-full
                    items-center
                    justify-between
                    gap-3

                    rounded-lg

                    px-3
                    py-2.5

                    text-left
                    text-[11px]
                    font-semibold

                    transition
                    duration-150

                    ${
                      isSelected
                        ? `
                          bg-cyan-500/[0.09]
                          text-cyan-500
                        `
                        : `
                          text-[color:var(--bf-text-secondary)]
                          hover:bg-cyan-500/[0.05]
                          hover:text-[color:var(--bf-text-primary)]
                        `
                    }
                  `}
                >
                  <span>
                    {option.label}
                  </span>

                  {isSelected && (
                    <Check
                      size={13}
                      aria-hidden="true"
                    />
                  )}
                </button>
              );
            }
          )}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   PLAN VISUAL

   Static visual.
   No Framer Motion.
========================================================= */

function PlanVisual({
  plan,
}) {
  const Icon =
    plan.icon;

  return (
    <div
      className="
        relative
        h-[112px]
        overflow-hidden
        rounded-[18px]
        border
        border-white/10
        bg-[#09111f]
      "
    >
      {/* GRADIENT */}

      <div
        className={`
          absolute
          inset-0
          bg-gradient-to-br
          ${plan.accent}
          opacity-25
        `}
      />

      {/* GRID */}

      <div
        aria-hidden="true"
        className="
          absolute
          inset-0
          opacity-[0.08]
        "
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)',
          backgroundSize:
            '24px 24px',
        }}
      />

      {/* GLOW */}

      <div
        aria-hidden="true"
        className={`
          absolute
          -right-10
          -top-14
          h-36
          w-36
          rounded-full
          bg-gradient-to-br
          ${plan.accent}
          opacity-25
          blur-3xl
        `}
      />

      {/* ICON */}

      <div
        className="
          absolute
          inset-0
          flex
          items-center
          justify-center
        "
      >
        <div
          className="
            flex
            h-14
            w-14
            items-center
            justify-center

            rounded-2xl

            border
            border-white/15

            bg-black/25

            text-white

            shadow-xl
            backdrop-blur-md
          "
        >
          <Icon
            size={27}
            strokeWidth={1.7}
            aria-hidden="true"
          />
        </div>
      </div>

      {/* FLEET LABEL */}

      <div
        className="
          absolute
          bottom-3
          left-3
        "
      >
        <div
          className="
            flex
            items-center
            gap-1.5

            rounded-full

            border
            border-white/10

            bg-black/35

            px-2.5
            py-1

            backdrop-blur-md
          "
        >
          <Truck
            size={10}
            aria-hidden="true"
            className="text-cyan-300"
          />

          <span
            className="
              text-[8px]
              font-bold
              uppercase
              tracking-[0.1em]
              text-slate-200
            "
          >
            {plan.fleet}
          </span>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   PRICE BLOCK
========================================================= */

function PriceBlock({
  plan,
  duration,
}) {
  const totalPrice =
    plan.prices[duration];

  const baseMonthly =
    plan.prices[1];

  const effectiveMonthly =
    Math.round(
      totalPrice /
      duration
    );

  const regularPrice =
    baseMonthly *
    duration;

  const savings =
    Math.max(
      regularPrice -
        totalPrice,
      0
    );

  if (
    duration === 1
  ) {
    return (
      <div>
        <div
          className="
            flex
            items-end
            gap-1.5
          "
        >
          <span
            className="
              text-[28px]
              font-black
              tracking-tight
              text-[color:var(--bf-text-primary)]
            "
          >
            ₹
            {formatPrice(
              totalPrice
            )}
          </span>

          <span
            className="
              pb-1
              text-[10px]
              font-medium
              text-[color:var(--bf-text-muted)]
            "
          >
            / month
          </span>
        </div>

        <p
          className="
            mt-1
            text-[9px]
            text-[color:var(--bf-text-muted)]
          "
        >
          Monthly subscription
        </p>
      </div>
    );
  }

  return (
    <div>
      <div
        className="
          text-[28px]
          font-black
          tracking-tight
          text-[color:var(--bf-text-primary)]
        "
      >
        ₹
        {formatPrice(
          totalPrice
        )}
      </div>

      <div
        className="
          mt-1
          flex
          flex-wrap
          items-center
          gap-2
        "
      >
        <span
          className="
            text-[10px]
            font-medium
            text-[color:var(--bf-text-muted)]
          "
        >
          ₹
          {formatPrice(
            effectiveMonthly
          )}{' '}
          / month
        </span>

        {savings > 0 && (
          <span
            className="
              rounded-full
              border
              border-emerald-500/20
              bg-emerald-500/[0.08]
              px-2
              py-1
              text-[8px]
              font-black
              uppercase
              tracking-wide
              text-emerald-500
            "
          >
            Save ₹
            {formatPrice(
              savings
            )}
          </span>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   PLAN CARD
========================================================= */

function PlanCard({
  plan,
}) {
  const [
    duration,
    setDuration,
  ] = useState(1);

  const Icon =
    plan.icon;

  const isPopular =
    Boolean(plan.badge);

  return (
    <article
      className={`
        relative
        flex
        min-w-0
        flex-col

        rounded-[24px]

        border

        bg-[var(--bf-surface)]

        p-4

        shadow-sm

        transition
        duration-200

        hover:-translate-y-0.5

        ${
          isPopular
            ? `
              border-cyan-400/35
              shadow-lg
              shadow-cyan-950/10
            `
            : `
              border-[color:var(--bf-border)]
              hover:border-cyan-400/25
            `
        }
      `}
    >
      {/* =====================================================
          PLAN HEADER
      ===================================================== */}

      <div
        className="
          flex
          items-start
          justify-between
          gap-3
        "
      >
        <div
          className="
            flex
            min-w-0
            items-center
            gap-2.5
          "
        >
          <div
            className={`
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-xl
              ${plan.accentSoft}
              ${plan.accentText}
            `}
          >
            <Icon
              size={17}
              aria-hidden="true"
            />
          </div>

          <div className="min-w-0">
            <h2
              className="
                text-xl
                font-black
                tracking-tight
                text-[color:var(--bf-text-primary)]
              "
            >
              {plan.name}
            </h2>

            <p
              className="
                mt-0.5
                text-[9px]
                font-semibold
                text-[color:var(--bf-text-muted)]
              "
            >
              {plan.fleet}
            </p>
          </div>
        </div>

        {plan.badge && (
          <span
            className="
              shrink-0
              rounded-full
              bg-gradient-to-r
              from-[#12BFF2]
              via-[#078EE5]
              to-[#0AA23B]
              px-2.5
              py-1
              text-[7px]
              font-black
              uppercase
              tracking-[0.12em]
              text-white
            "
          >
            {plan.badge}
          </span>
        )}
      </div>

      <p
        className="
          mt-3
          min-h-[38px]
          text-[11px]
          leading-5
          text-[color:var(--bf-text-muted)]
        "
      >
        {plan.tagline}
      </p>

      {/* =====================================================
          VISUAL
      ===================================================== */}

      <div className="mt-3">
        <PlanVisual
          plan={plan}
        />
      </div>

      {/* =====================================================
          LIMITS
      ===================================================== */}

      <div
        className="
          mt-3
          grid
          grid-cols-3
          gap-2
        "
      >
        <div
          className="
            rounded-xl
            border
            border-[color:var(--bf-border)]
            bg-[var(--bf-page-bg)]
            px-2
            py-2.5
            text-center
          "
        >
          <p
            className="
              text-[7px]
              font-bold
              uppercase
              tracking-wide
              text-[color:var(--bf-text-muted)]
            "
          >
            Fleet
          </p>

          <p
            className="
              mt-1
              text-[9px]
              font-black
              text-[color:var(--bf-text-primary)]
            "
          >
            {plan.fleet}
          </p>
        </div>

        <div
          className="
            rounded-xl
            border
            border-[color:var(--bf-border)]
            bg-[var(--bf-page-bg)]
            px-2
            py-2.5
            text-center
          "
        >
          <p
            className="
              text-[7px]
              font-bold
              uppercase
              tracking-wide
              text-[color:var(--bf-text-muted)]
            "
          >
            Users
          </p>

          <p
            className="
              mt-1
              text-[9px]
              font-black
              text-[color:var(--bf-text-primary)]
            "
          >
            {plan.users}
          </p>
        </div>

        <div
          className="
            rounded-xl
            border
            border-[color:var(--bf-border)]
            bg-[var(--bf-page-bg)]
            px-2
            py-2.5
            text-center
          "
        >
          <p
            className="
              text-[7px]
              font-bold
              uppercase
              tracking-wide
              text-[color:var(--bf-text-muted)]
            "
          >
            Sites
          </p>

          <p
            className="
              mt-1
              text-[9px]
              font-black
              text-[color:var(--bf-text-primary)]
            "
          >
            {plan.sites}
          </p>
        </div>
      </div>

      {/* =====================================================
          PRICE
      ===================================================== */}

      <div className="mt-4">
        <PriceBlock
          plan={plan}
          duration={
            duration
          }
        />
      </div>

      {/* =====================================================
          CUSTOM DURATION PICKER
      ===================================================== */}

      <div className="mt-4">
        <DurationPicker
          planId={plan.id}
          value={duration}
          onChange={
            setDuration
          }
        />
      </div>

      {/* =====================================================
          CTA
      ===================================================== */}

      <Link
        to="/signup"
        className={`
          mt-4
          flex
          h-10
          w-full
          items-center
          justify-center

          rounded-xl

          bg-gradient-to-r
          ${plan.accent}

          px-4

          text-[11px]
          font-black
          text-white

          shadow-md

          transition
          duration-200

          hover:-translate-y-0.5
          hover:brightness-110

          focus-visible:outline-none
          focus-visible:ring-2
          focus-visible:ring-cyan-400
        `}
      >
        Choose {plan.name}
      </Link>

      {/* =====================================================
          FEATURES
      ===================================================== */}

      <div
        className="
          mt-5
          flex-1
        "
      >
        <p
          className="
            text-[9px]
            font-black
            uppercase
            tracking-[0.15em]
            text-[color:var(--bf-text-primary)]
          "
        >
          What you get
        </p>

        <div
          className="
            mt-3
            space-y-2.5
          "
        >
          {plan.features.map(
            (
              feature,
              index
            ) => {
              const isInherited =
                feature.startsWith(
                  'Everything in'
                );

              return (
                <div
                  key={`${plan.id}-${index}`}
                  className="
                    flex
                    items-start
                    gap-2
                  "
                >
                  <div
                    className={`
                      mt-[2px]
                      flex
                      h-4
                      w-4
                      shrink-0
                      items-center
                      justify-center
                      rounded-full

                      ${
                        isInherited
                          ? `
                            bg-blue-500/[0.08]
                            text-blue-500
                          `
                          : `
                            bg-emerald-500/[0.08]
                            text-emerald-500
                          `
                      }
                    `}
                  >
                    <Check
                      size={9}
                      strokeWidth={3}
                      aria-hidden="true"
                    />
                  </div>

                  <span
                    className={`
                      text-[10px]
                      leading-5

                      ${
                        isInherited
                          ? `
                            font-bold
                            text-[color:var(--bf-text-secondary)]
                          `
                          : `
                            text-[color:var(--bf-text-muted)]
                          `
                      }
                    `}
                  >
                    {feature}
                  </span>
                </div>
              );
            }
          )}
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   PRICING PAGE
========================================================= */

export default function Pricing() {
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
            top-16
            h-[400px]
            w-[400px]
            rounded-full
            bg-cyan-500/[0.07]
            blur-[120px]
          "
        />

        <div
          className="
            absolute
            -right-40
            top-[28rem]
            h-[440px]
            w-[440px]
            rounded-full
            bg-blue-500/[0.06]
            blur-[130px]
          "
        />

        <div
          className="
            absolute
            bottom-[8%]
            left-[38%]
            h-[350px]
            w-[350px]
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
          pb-7
          pt-8
          text-center

          sm:px-8
          sm:pb-8
          sm:pt-10

          lg:px-12
          lg:pt-12
        "
      >
        <div
          className="
            mx-auto
            max-w-4xl
          "
        >
          {/* BADGE */}

          <div
            className="
              inline-flex
              items-center
              gap-2.5

              rounded-full

              border
              border-cyan-400/20

              bg-cyan-400/[0.06]

              px-4
              py-2
            "
          >
            <span
              className="
                h-1.5
                w-1.5
                rounded-full
                bg-cyan-400
                shadow-[0_0_10px_rgba(34,211,238,0.65)]
              "
            />

            <span
              className="
                text-[9px]
                font-black
                uppercase
                tracking-[0.18em]
                text-cyan-500
              "
            >
              Buddy Fleets Pricing
            </span>
          </div>

          {/* TITLE */}

          <h1
            className="
              mx-auto
              mt-4
              max-w-4xl

              text-[clamp(2.1rem,4.6vw,3.7rem)]
              font-black
              leading-[1.05]
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
              Choose the plan that moves with your fleet.
            </span>
          </h1>

          {/* DESCRIPTION */}

          <p
            className="
              mx-auto
              mt-4
              max-w-2xl

              text-sm
              leading-7

              text-[color:var(--bf-text-secondary)]

              sm:text-base
            "
          >
            Compare all four Buddy Fleets plans, choose your
            subscription duration and instantly see the total
            price, effective monthly cost and savings.
          </p>
        </div>
      </section>

      {/* =====================================================
          PLAN GRID

          Responsive:
          Mobile  = 1
          Tablet  = 2
          Laptop+ = 4
      ===================================================== */}

      <section
        className="
          relative
          px-5
          pb-10
          pt-4

          sm:px-8
          sm:pb-12

          lg:px-8
        "
      >
        <div
          className="
            mx-auto
            max-w-[1500px]
          "
        >
          <div
            className="
              grid
              gap-4

              md:grid-cols-2
              xl:grid-cols-4
            "
          >
            {PLANS.map(
              (plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                />
              )
            )}
          </div>

          {/* NOTE */}

          <p
            className="
              mx-auto
              mt-4
              max-w-3xl
              text-center

              text-[9px]
              leading-5

              text-[color:var(--bf-text-muted)]
            "
          >
            Duration can be selected independently for each
            plan so you can compare total pricing, effective
            monthly value and applicable savings.
          </p>
        </div>
      </section>

      {/* =====================================================
          BOTTOM CTA

          No section divider line.
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
            max-w-5xl
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

                h-60
                w-60

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
                  text-[9px]
                  font-black
                  uppercase
                  tracking-[0.2em]
                  text-cyan-500
                "
              >
                Start with Buddy Fleets
              </p>

              <h2
                className="
                  mt-3

                  text-2xl
                  font-black
                  leading-tight

                  text-[color:var(--bf-text-primary)]

                  sm:text-3xl
                "
              >
                Not sure which plan fits your fleet?
              </h2>

              <p
                className="
                  mx-auto
                  mt-3
                  max-w-xl

                  text-xs
                  leading-6

                  text-[color:var(--bf-text-secondary)]

                  sm:text-sm
                "
              >
                Start your 5-day free trial or speak with us
                to understand which plan best matches your
                operations.
              </p>

              <div
                className="
                  mt-5
                  flex
                  flex-col
                  items-center
                  justify-center
                  gap-3

                  sm:flex-row
                "
              >
                <Link
                  to="/signup"
                  className="
                    flex
                    min-h-11
                    w-full
                    items-center
                    justify-center

                    rounded-xl

                    bg-gradient-to-r
                    from-[#12BFF2]
                    via-[#078EE5]
                    to-[#0AA23B]

                    px-6
                    py-3

                    text-xs
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

                    sm:w-auto
                  "
                >
                  Start 5-Day Free Trial
                </Link>

                <Link
                  to="/contact-us"
                  className="
                    flex
                    min-h-11
                    w-full
                    items-center
                    justify-center

                    rounded-xl

                    border
                    border-[color:var(--bf-border)]

                    bg-[var(--bf-page-bg)]

                    px-6
                    py-3

                    text-xs
                    font-bold

                    text-[color:var(--bf-text-primary)]

                    transition
                    duration-200

                    hover:-translate-y-0.5
                    hover:border-cyan-400/30

                    focus-visible:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-cyan-400

                    sm:w-auto
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