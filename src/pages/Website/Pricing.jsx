import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Check,
  ChevronDown,
  Crown,
  Gauge,
  Rocket,
  TrendingUp,
  Truck,
} from 'lucide-react';

/* =========================================================
   PRICING DATA
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
      'from-cyan-400 via-blue-500 to-blue-700',

    glow:
      'rgba(34, 211, 238, 0.20)',

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
      'Vehicle & Driver Management',
      'Vehicle & Driver Documents',
      'Document Expiry Alerts',
      'Expense & Fuel Tracking',
      'Maintenance Records',
      'Basic Dashboard',
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
      'from-blue-500 via-indigo-500 to-violet-600',

    glow:
      'rgba(99, 102, 241, 0.20)',

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
      'Earning Monitoring',
      'Driver Payments',
      'Maintenance Alerts',
      'Duty / Dispatch Allocation',
      'Advanced Dashboard & Reports',
    ],
  },

  {
    id: 'scale',
    name: 'Scale',
    tagline:
      'Advanced control for large fleet operations.',

    fleet:
      '51–200 Vehicles',

    users:
      '10 Users',

    sites:
      '3 Sites',

    icon:
      Gauge,

    accent:
      'from-violet-500 via-purple-500 to-fuchsia-600',

    glow:
      'rgba(168, 85, 247, 0.22)',

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
      'LR / Builty / Consignment Notes',
      'ePOD Management',
      'Advanced Expense Reports',
      'Site-wise Reports',
      'Vehicle Performance Reports',
    ],
  },

  {
    id: 'apex',
    name: 'Apex',
    tagline:
      'Complete operational control at enterprise scale.',

    fleet:
      '201+ Vehicles',

    users:
      '20 Users',

    sites:
      '4 Sites',

    icon:
      Crown,

    accent:
      'from-amber-400 via-orange-500 to-rose-600',

    glow:
      'rgba(251, 146, 60, 0.18)',

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
      'Advanced Fleet Reports',
      'Custom Report Filters',
      'Company-wide Operational Reports',
      'Advanced User & Role Control',
    ],
  },
];

/* =========================================================
   FORMAT PRICE
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
   PLAN VISUAL
========================================================= */

function PlanVisual({
  plan,
}) {
  const Icon =
    plan.icon;

  return (
    <div
      className="relative h-[160px] overflow-hidden rounded-[22px] border border-white/10 bg-[#09111f]"
      style={{
        boxShadow:
          `0 20px 60px ${plan.glow}`,
      }}
    >

      {/* GRADIENT BACKGROUND */}

      <div
        className={`absolute inset-0 bg-gradient-to-br ${plan.accent} opacity-30`}
      />

      {/* GRID */}

      <div
        className="absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            `
              linear-gradient(rgba(255,255,255,0.25) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.25) 1px, transparent 1px)
            `,

          backgroundSize:
            '28px 28px',

          transform:
            'perspective(500px) rotateX(58deg) scale(1.7)',

          transformOrigin:
            'bottom',
        }}
      />

      {/* GLOW */}

      <div
        className={`absolute -right-10 -top-14 h-40 w-40 rounded-full bg-gradient-to-br ${plan.accent} opacity-30 blur-3xl`}
      />

      {/* ROAD */}

      <div className="absolute bottom-0 left-1/2 h-[80px] w-[160%] -translate-x-1/2 bg-gradient-to-t from-black/80 to-transparent">

        <div className="absolute bottom-5 left-1/2 h-[2px] w-[70%] -translate-x-1/2 bg-gradient-to-r from-transparent via-white/40 to-transparent" />

        <div className="absolute bottom-10 left-1/2 h-[1px] w-[50%] -translate-x-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      </div>

      {/* ICON */}

      <div className="absolute inset-0 flex items-center justify-center">

        <motion.div
          animate={{
            y: [0, -5, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="relative flex h-20 w-20 items-center justify-center rounded-[24px] border border-white/15 bg-black/25 shadow-2xl backdrop-blur-md"
        >

          <Icon
            size={36}
            strokeWidth={1.6}
            className="text-white"
          />

          <div
            className={`absolute inset-0 -z-10 rounded-[24px] bg-gradient-to-br ${plan.accent} opacity-20 blur-xl`}
          />

        </motion.div>

      </div>

      {/* LABEL */}

      <div className="absolute bottom-4 left-4">

        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-1.5 backdrop-blur-md">

          <Truck
            size={12}
            className="text-cyan-300"
          />

          <span className="text-[9px] font-bold uppercase tracking-[0.13em] text-slate-200">
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
      <div className="min-h-[92px]">

        <div className="flex items-end gap-1.5">

          <span className="text-3xl font-black tracking-tight text-white xl:text-[34px]">
            ₹{formatPrice(
              totalPrice
            )}
          </span>

          <span className="pb-1 text-xs font-medium text-slate-500">
            / month
          </span>

        </div>

        <p className="mt-2 text-[11px] text-slate-500">
          Monthly subscription
        </p>

      </div>
    );
  }

  return (
    <div className="min-h-[92px]">

      <div className="text-3xl font-black tracking-tight text-white xl:text-[34px]">
        ₹{formatPrice(
          totalPrice
        )}
      </div>

      <div className="mt-1.5 flex flex-wrap items-center gap-2">

        <span className="text-xs font-medium text-slate-400">
          (₹
          {formatPrice(
            effectiveMonthly
          )}{' '}
          / month)
        </span>

        {savings > 0 && (
          <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-emerald-300">
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
  ] =
    useState(1);

  return (
    <article
      className={`relative flex h-full min-w-0 flex-col border-white/[0.08] bg-[#07101f]/80 px-5 py-6 backdrop-blur-xl lg:border-r lg:px-5 xl:px-6 ${
        plan.id ===
        'launch'
          ? 'lg:border-l'
          : ''
      }`}
    >

      {/* BADGE */}

      <div className="min-h-[28px]">

        {plan.badge && (
          <span
            className={`inline-flex rounded-full bg-gradient-to-r ${plan.accent} px-3 py-1 text-[8px] font-black uppercase tracking-[0.16em] text-white shadow-lg`}
          >
            {plan.badge}
          </span>
        )}

      </div>

      {/* PLAN NAME */}

      <div className="mt-3">

        <h2 className="text-[24px] font-black tracking-tight text-white">
          {plan.name}
        </h2>

        <p className="mt-2 min-h-[42px] text-[11px] leading-5 text-slate-400">
          {plan.tagline}
        </p>

      </div>

      {/* VISUAL */}

      <div className="mt-5">
        <PlanVisual
          plan={plan}
        />
      </div>

      {/* PRICE */}

      <div className="mt-6">

        <PriceBlock
          plan={plan}
          duration={
            duration
          }
        />

      </div>

      {/* DURATION */}

      <div className="relative mt-4">

        <label
          htmlFor={`${plan.id}-duration`}
          className="mb-2 block text-[9px] font-bold uppercase tracking-[0.16em] text-slate-500"
        >
          Subscription Duration
        </label>

        <div className="relative">

          <select
            id={`${plan.id}-duration`}
            value={duration}
            onChange={(
              event
            ) =>
              setDuration(
                Number(
                  event
                    .target
                    .value
                )
              )
            }
            className="h-12 w-full appearance-none rounded-xl border border-white/10 bg-white/[0.04] px-4 pr-11 text-xs font-bold text-white outline-none transition hover:border-cyan-400/30 focus:border-cyan-400/60 focus:bg-white/[0.06]"
          >

            {DURATIONS.map(
              (
                durationOption
              ) => (
                <option
                  key={
                    durationOption.months
                  }
                  value={
                    durationOption.months
                  }
                  className="bg-[#07101f] text-white"
                >
                  {
                    durationOption.label
                  }
                </option>
              )
            )}

          </select>

          <ChevronDown
            size={15}
            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

        </div>

      </div>

      {/* CTA */}

      <Link
        to="/signup"
        className={`mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r ${plan.accent} px-4 text-xs font-black text-white shadow-lg transition duration-300 hover:-translate-y-0.5 hover:brightness-110`}
      >
        Choose {plan.name}

        <ArrowRight
          size={14}
        />
      </Link>

      {/* DIVIDER */}

      <div className="my-6 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* FEATURES */}

      <div className="flex-1">

        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white">
          What you get
        </p>

        <div className="mt-4 space-y-3">

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
                  className="flex items-start gap-2.5"
                >

                  <div
                    className={`mt-[1px] flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
                      isInherited
                        ? 'bg-violet-400/10 text-violet-300'
                        : 'bg-emerald-400/10 text-emerald-300'
                    }`}
                  >

                    <Check
                      size={10}
                      strokeWidth={3}
                    />

                  </div>

                  <span
                    className={`text-[11px] leading-5 ${
                      isInherited
                        ? 'font-bold text-slate-300'
                        : 'text-slate-400'
                    }`}
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
  const plans =
    useMemo(
      () => PLANS,
      []
    );

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050914] text-white">

      {/* BACKGROUND */}

      <div className="pointer-events-none absolute inset-0">

        <div className="absolute left-[8%] top-[6%] h-[340px] w-[340px] rounded-full bg-cyan-500/10 blur-[120px]" />

        <div className="absolute right-[5%] top-[14%] h-[420px] w-[420px] rounded-full bg-violet-600/10 blur-[140px]" />

        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              `
                linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)
              `,

            backgroundSize:
              '48px 48px',
          }}
        />

      </div>

      <main className="relative z-10">

        {/* HERO */}

        <section className="px-4 pb-10 pt-16 text-center sm:px-6 sm:pt-20 lg:pb-14 lg:pt-24">

          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.55,
            }}
            className="mx-auto max-w-4xl"
          >

            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/15 bg-cyan-400/[0.06] px-4 py-2">

              <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.9)]" />

              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-300">
                Buddy Fleets Pricing
              </span>

            </div>

            <h1 className="mt-6 text-4xl font-black tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl">

              Choose the plan that

              <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400 bg-clip-text text-transparent">
                {' '}moves with your fleet.
              </span>

            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-400 sm:text-[15px]">
              Compare all four Buddy Fleets plans side by side.
              Choose your subscription duration and instantly see
              the total price, effective monthly cost and savings.
            </p>

          </motion.div>

        </section>

        {/* PLAN COMPARISON */}

        <section className="px-4 pb-20 sm:px-6 lg:px-8">

          <div className="mx-auto max-w-[1500px]">

            {/* MOBILE HELP */}

            <div className="mb-3 flex items-center justify-between lg:hidden">

              <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-500">
                Swipe to compare plans
              </span>

              <ArrowRight
                size={14}
                className="text-slate-500"
              />

            </div>

            {/* CARDS */}

            <div className="overflow-x-auto rounded-[26px] border border-white/[0.08] bg-[#07101f]/50 shadow-[0_30px_100px_rgba(0,0,0,0.35)]">

              <div className="grid min-w-[1160px] grid-cols-4 lg:min-w-0">

                {plans.map(
                  (
                    plan
                  ) => (
                    <PlanCard
                      key={
                        plan.id
                      }
                      plan={
                        plan
                      }
                    />
                  )
                )}

              </div>

            </div>

            {/* NOTE */}

            <p className="mt-5 text-center text-[10px] leading-5 text-slate-500">
              Choose a duration independently for each plan to compare
              the effective monthly value before selecting your subscription.
            </p>

          </div>

        </section>

        {/* BOTTOM CTA */}

        <section className="border-t border-white/[0.06] px-4 py-16 sm:px-6">

          <div className="mx-auto max-w-4xl rounded-[30px] border border-white/[0.08] bg-gradient-to-br from-white/[0.055] to-white/[0.015] px-6 py-10 text-center shadow-2xl backdrop-blur-xl sm:px-10">

            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-300">
              Start with Buddy Fleets
            </p>

            <h2 className="mt-3 text-2xl font-black text-white sm:text-3xl">
              Not sure which plan fits your fleet?
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-xs leading-6 text-slate-400 sm:text-sm">
              Start your 5-day free trial or speak with us to
              understand which plan best matches your operations.
            </p>

            <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">

              <Link
                to="/signup"
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-600 px-6 text-xs font-black text-white shadow-lg shadow-blue-500/15 transition hover:-translate-y-0.5 hover:brightness-110 sm:w-auto"
              >
                Start 5-Day Free Trial

                <ArrowRight
                  size={14}
                />
              </Link>

              <Link
                to="/contact"
                className="flex h-12 w-full items-center justify-center rounded-xl border border-white/10 bg-white/[0.035] px-6 text-xs font-bold text-slate-300 transition hover:border-white/20 hover:bg-white/[0.07] hover:text-white sm:w-auto"
              >
                Contact Us
              </Link>

            </div>

          </div>

        </section>

      </main>

    </div>
  );
}