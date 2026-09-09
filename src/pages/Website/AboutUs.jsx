import React from 'react';
import { Link } from 'react-router-dom';
import {
  motion,
  useReducedMotion,
} from 'framer-motion';

/* =========================================================
   TEMPORARY / EASY-TO-CHANGE LINKS
========================================================= */

const SHUBHAM_PHOTO =
  'https://drive.google.com/thumbnail?id=12_mss3NpN7WSjurHGS0eGyPMXMb_J2of&sz=w1200';

const SHUBHAM_INSTAGRAM =
  'https://www.instagram.com/happiest_banda';

const NAVIN_INSTAGRAM =
  'https://www.instagram.com/navin.sharma/';

/*
  Buddy Computers ki website ready hone ke baad
  sirf is URL ko replace karna hai.
*/

const BUDDY_COMPUTERS_URL =
  'https://example.com';

/* =========================================================
   SMALL INLINE ICONS
   No extra icon package required
========================================================= */

function ArrowIcon({
  className = '',
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M5 12h14M13 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowUpRightIcon({
  className = '',
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M7 17 17 7M8 7h9v9"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MailIcon({
  className = '',
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="3"
        stroke="currentColor"
        strokeWidth="1.7"
      />

      <path
        d="m5 8 7 5 7-5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function InstagramIcon({
  className = '',
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="5"
        stroke="currentColor"
        strokeWidth="1.7"
      />

      <circle
        cx="12"
        cy="12"
        r="4"
        stroke="currentColor"
        strokeWidth="1.7"
      />

      <circle
        cx="17.5"
        cy="6.5"
        r="1"
        fill="currentColor"
      />
    </svg>
  );
}

function CheckIcon({
  className = '',
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="m5 12 4 4L19 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* =========================================================
   ANIMATION WRAPPER
========================================================= */

function Reveal({
  children,
  className = '',
  delay = 0,
}) {
  const reduceMotion =
    useReducedMotion();

  return (
    <motion.div
      initial={
        reduceMotion
          ? false
          : {
              opacity: 0,
              y: 28,
            }
      }
      whileInView={
        reduceMotion
          ? {}
          : {
              opacity: 1,
              y: 0,
            }
      }
      viewport={{
        once: true,
        amount: 0.18,
      }}
      transition={{
        duration: 0.65,
        delay,
        ease: 'easeOut',
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* =========================================================
   SECTION HEADING
========================================================= */

function SectionHeading({
  eyebrow,
  title,
  description,
  center = false,
}) {
  return (
    <div
      className={
        center
          ? 'mx-auto max-w-3xl text-center'
          : 'max-w-3xl'
      }
    >
      <p className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-400 sm:text-xs">
        {eyebrow}
      </p>

      <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
        {title}
      </h2>

      {description && (
        <p className="mt-4 text-sm leading-7 text-slate-400 sm:text-base sm:leading-8">
          {description}
        </p>
      )}
    </div>
  );
}

/* =========================================================
   WHO WE SERVE CARD
========================================================= */

function AudienceCard({
  number,
  title,
  description,
  delay = 0,
}) {
  return (
    <Reveal delay={delay}>
      <div className="group relative h-full overflow-hidden rounded-[26px] border border-white/[0.08] bg-white/[0.035] p-6 backdrop-blur-xl transition duration-500 hover:-translate-y-1 hover:border-cyan-400/20 hover:bg-white/[0.05]">

        <div className="pointer-events-none absolute -right-14 -top-14 h-32 w-32 rounded-full bg-cyan-500/5 blur-3xl transition group-hover:bg-cyan-500/10" />

        <div className="relative">

          <span className="text-[10px] font-black tracking-[0.2em] text-cyan-400/60">
            {number}
          </span>

          <h3 className="mt-7 text-xl font-black text-white">
            {title}
          </h3>

          <p className="mt-3 text-xs leading-6 text-slate-400 sm:text-sm">
            {description}
          </p>

        </div>

      </div>
    </Reveal>
  );
}

/* =========================================================
   FOUNDER CONTACT LINK
========================================================= */

function FounderLink({
  href,
  icon,
  children,
}) {
  return (
    <a
      href={href}
      target={
        href.startsWith('mailto:')
          ? undefined
          : '_blank'
      }
      rel={
        href.startsWith('mailto:')
          ? undefined
          : 'noopener noreferrer'
      }
      className="
        group
        flex
        min-w-0
        items-center
        gap-2.5
        rounded-xl
        border
        border-white/[0.07]
        bg-white/[0.03]
        px-3
        py-2.5
        text-[10px]
        font-semibold
        text-slate-400
        transition

        hover:border-cyan-400/20
        hover:bg-cyan-400/[0.05]
        hover:text-cyan-300

        sm:text-[11px]
      "
    >
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] text-cyan-400">
        {icon}
      </span>

      <span className="min-w-0 truncate">
        {children}
      </span>
    </a>
  );
}

/* =========================================================
   ABOUT US
========================================================= */

export default function AboutUs() {
  const reduceMotion =
    useReducedMotion();

  const audience = [
    {
      number: '01',
      title: 'Transport Companies',
      description:
        'Bring everyday fleet and transport operations into a cleaner, more connected digital environment.',
    },
    {
      number: '02',
      title: 'Fleet Owners',
      description:
        'Get a clearer way to manage vehicles, drivers, documents, expenses and operational activity.',
    },
    {
      number: '03',
      title: 'Logistics Companies',
      description:
        'Support fast-moving transport workflows with structured information and better operational visibility.',
    },
    {
      number: '04',
      title: 'Fleet Operators',
      description:
        'Keep routine fleet work organized without turning daily operations into complicated software processes.',
    },
  ];

  const buddyServices = [
    'PC & Laptop Repair',
    'Custom PC Builds',
    'Computer Hardware',
    'Software Support',
    'Networking',
    'IT Support',
    'OS & Software Setup',
    'Website Development',
    'Logo Design',
    'Video Editing',
    'PC Accessories',
    'Technical Services',
  ];

  return (
    <div className="overflow-hidden bg-[#050914] text-white">

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="relative isolate overflow-hidden border-b border-white/[0.05]">

        {/* BACKGROUND */}

        <div className="pointer-events-none absolute inset-0">

          <div className="absolute inset-0 bg-[#050914]" />

          <div className="absolute left-[-10%] top-[5%] h-[420px] w-[420px] rounded-full bg-cyan-500/[0.08] blur-[120px]" />

          <div className="absolute right-[-8%] top-[15%] h-[440px] w-[440px] rounded-full bg-violet-600/[0.1] blur-[130px]" />

          <div
            className="absolute inset-0 opacity-[0.035]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(56,189,248,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.8) 1px, transparent 1px)',
              backgroundSize:
                '60px 60px',
            }}
          />

        </div>

        <div className="relative mx-auto grid min-h-[670px] max-w-[1400px] items-center gap-14 px-5 py-20 sm:px-8 lg:grid-cols-[1fr_0.92fr] lg:px-12 lg:py-24 xl:px-16">

          {/* HERO COPY */}

          <motion.div
            initial={
              reduceMotion
                ? false
                : {
                    opacity: 0,
                    x: -30,
                  }
            }
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              duration: 0.8,
              ease: 'easeOut',
            }}
            className="relative z-10 max-w-3xl"
          >

            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/[0.05] px-4 py-2 backdrop-blur-xl">

              <span className="relative flex h-2 w-2">

                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-60" />

                <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400" />

              </span>

              <span className="text-[9px] font-black uppercase tracking-[0.22em] text-cyan-300 sm:text-[10px]">
                About Buddy Fleets
              </span>

            </div>

            <h1 className="mt-6 text-4xl font-black leading-[1.02] tracking-tight text-white sm:text-6xl lg:text-[64px] xl:text-[72px]">

              Built to power

              <span className="block bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400 bg-clip-text text-transparent">
                modern transport
              </span>

              operations.

            </h1>

            <p className="mt-6 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base sm:leading-8 lg:text-lg">
              Buddy Fleets is a{' '}
              <span className="font-semibold text-slate-200">
                Fleet Operations Intelligence Platform
              </span>{' '}
              built for Indian transport businesses — designed
              to make everyday operations easier to understand,
              organize and manage.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">

              <Link
                to="/features"
                className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-600 px-5 py-3.5 text-xs font-black text-white shadow-xl shadow-blue-600/20 transition hover:-translate-y-0.5 hover:shadow-cyan-500/20 sm:px-6 sm:text-sm"
              >
                Explore Buddy Fleets

                <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                to="/contact"
                className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3.5 text-xs font-bold text-slate-200 transition hover:border-white/20 hover:bg-white/[0.07] sm:px-6 sm:text-sm"
              >
                Talk to Us
              </Link>

            </div>

          </motion.div>

          {/* HERO VISUAL */}

          <motion.div
            initial={
              reduceMotion
                ? false
                : {
                    opacity: 0,
                    x: 36,
                    scale: 0.97,
                  }
            }
            animate={{
              opacity: 1,
              x: 0,
              scale: 1,
            }}
            transition={{
              duration: 0.9,
              delay: 0.1,
              ease: 'easeOut',
            }}
            className="relative"
          >

            <div className="absolute -inset-6 rounded-[42px] bg-gradient-to-br from-cyan-500/10 via-transparent to-violet-600/15 blur-2xl" />

            <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[#07101f] shadow-2xl shadow-black/50">

              <div className="relative aspect-[5/4] overflow-hidden">

                <img
                  src="https://images.unsplash.com/photo-1519003722824-194d4455a60c?q=85&w=1800&auto=format&fit=crop"
                  alt="Transport fleet operations"
                  className="h-full w-full object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#050914] via-[#050914]/35 to-transparent" />

                <div className="absolute inset-0 bg-gradient-to-r from-cyan-950/25 to-violet-950/20" />

                {/* FLOATING STATUS */}

                <motion.div
                  animate={
                    reduceMotion
                      ? {}
                      : {
                          y: [
                            0,
                            -8,
                            0,
                          ],
                        }
                  }
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="absolute left-5 top-5 rounded-2xl border border-white/10 bg-[#07101f]/80 px-4 py-3 shadow-xl backdrop-blur-xl sm:left-6 sm:top-6"
                >
                  <p className="text-[8px] font-black uppercase tracking-[0.2em] text-cyan-400">
                    Platform Direction
                  </p>

                  <p className="mt-1 text-xs font-bold text-white sm:text-sm">
                    Fleet Operations Intelligence
                  </p>
                </motion.div>

                {/* BOTTOM PANEL */}

                <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7">

                  <div className="rounded-[22px] border border-white/10 bg-[#07101f]/80 p-4 backdrop-blur-2xl">

                    <div className="grid gap-3 sm:grid-cols-3">

                      {[
                        'Vehicles',
                        'Drivers',
                        'Operations',
                      ].map(
                        (
                          item,
                          index
                        ) => (
                          <div
                            key={item}
                            className="rounded-xl border border-white/[0.06] bg-white/[0.035] p-3"
                          >
                            <span className="text-[8px] font-black tracking-[0.18em] text-slate-600">
                              0{index + 1}
                            </span>

                            <p className="mt-2 text-[10px] font-bold text-slate-200 sm:text-xs">
                              {item}
                            </p>

                            <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/[0.05]">

                              <motion.div
                                initial={{
                                  width: 0,
                                }}
                                whileInView={{
                                  width:
                                    index === 0
                                      ? '82%'
                                      : index === 1
                                        ? '67%'
                                        : '91%',
                                }}
                                viewport={{
                                  once: true,
                                }}
                                transition={{
                                  duration: 1.2,
                                  delay:
                                    0.3 +
                                    index *
                                      0.12,
                                }}
                                className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500"
                              />

                            </div>

                          </div>
                        )
                      )}

                    </div>

                  </div>

                </div>

              </div>

            </div>

          </motion.div>

        </div>

      </section>

      {/* =====================================================
          WHY BUDDY FLEETS EXISTS
      ===================================================== */}

      <section className="relative py-20 sm:py-24 lg:py-28">

        <div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-12">

          <Reveal>

            <SectionHeading
              eyebrow="Why Buddy Fleets Exists"
              title="Transport software shouldn't make transport more complicated."
              description="Many businesses adopt ERP or transport software expecting operations to become easier, only to end up working through complex screens, cluttered processes and systems that take too much effort to understand."
            />

          </Reveal>

          <div className="mt-12 grid gap-5 lg:grid-cols-2">

            <Reveal>

              <div className="relative h-full overflow-hidden rounded-[30px] border border-red-400/10 bg-gradient-to-br from-red-500/[0.04] to-white/[0.02] p-6 sm:p-8">

                <span className="text-[10px] font-black uppercase tracking-[0.22em] text-red-300/70">
                  The Problem
                </span>

                <h3 className="mt-5 text-2xl font-black text-white sm:text-3xl">
                  Complexity became normal.
                </h3>

                <p className="mt-4 text-sm leading-7 text-slate-400">
                  Traditional business software can become difficult
                  to navigate, difficult to adopt and difficult to use
                  in everyday work. More screens and more options do
                  not always create better operations.
                </p>

              </div>

            </Reveal>

            <Reveal delay={0.08}>

              <div className="relative h-full overflow-hidden rounded-[30px] border border-cyan-400/15 bg-gradient-to-br from-cyan-500/[0.06] via-blue-500/[0.03] to-violet-500/[0.05] p-6 sm:p-8">

                <span className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-300">
                  Our Approach
                </span>

                <h3 className="mt-5 text-2xl font-black text-white sm:text-3xl">
                  Start simpler. Build clearer.
                </h3>

                <p className="mt-4 text-sm leading-7 text-slate-400">
                  Buddy Fleets is being shaped from the ground up
                  around one practical idea: technology should reduce
                  operational confusion, not add another layer of it.
                  Every experience should feel focused, understandable
                  and purposeful.
                </p>

              </div>

            </Reveal>

          </div>

        </div>

      </section>

      {/* =====================================================
          MISSION
      ===================================================== */}

      <section className="px-5 pb-20 sm:px-8 sm:pb-24 lg:px-12">

        <Reveal className="mx-auto max-w-[1280px]">

          <div className="relative overflow-hidden rounded-[34px] border border-cyan-400/15 bg-[#081223] px-6 py-12 text-center sm:px-10 sm:py-16 lg:px-16">

            <div className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 blur-[100px]" />

            <div className="relative">

              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-cyan-400">
                Our Mission
              </p>

              <h2 className="mx-auto mt-5 max-w-4xl text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
                To make transport operations{' '}

                <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400 bg-clip-text text-transparent">
                  simpler, smarter and easier to manage
                </span>{' '}

                for Indian businesses.
              </h2>

            </div>

          </div>

        </Reveal>

      </section>

      {/* =====================================================
          WHO WE SERVE
      ===================================================== */}

      <section className="relative border-y border-white/[0.05] bg-[#070d19] py-20 sm:py-24 lg:py-28">

        <div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-12">

          <Reveal>

            <SectionHeading
              eyebrow="Who We Serve"
              title="Built around the people who keep transport moving."
              description="Buddy Fleets is focused on businesses and operators working every day across India's transport and fleet ecosystem."
              center
            />

          </Reveal>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

            {audience.map(
              (
                item,
                index
              ) => (
                <AudienceCard
                  key={
                    item.title
                  }
                  {...item}
                  delay={
                    index *
                    0.06
                  }
                />
              )
            )}

          </div>

        </div>

      </section>

      {/* =====================================================
          PRODUCT PHILOSOPHY
      ===================================================== */}

      <section className="py-20 sm:py-24 lg:py-28">

        <div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-12">

          <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">

            <Reveal>

              <div className="lg:sticky lg:top-28">

                <SectionHeading
                  eyebrow="Our Product Philosophy"
                  title="Useful technology should feel natural."
                  description="Buddy Fleets is guided by practical product thinking rather than adding complexity simply because software can."
                />

              </div>

            </Reveal>

            <div className="grid gap-4">

              {[
                {
                  number:
                    '01',
                  title:
                    'Less Complexity',
                  text:
                    'Clear workflows matter more than overloaded screens. The goal is to help teams understand what they need to do without fighting the software.',
                },
                {
                  number:
                    '02',
                  title:
                    'Operational Clarity',
                  text:
                    'Fleet information should be organized in a way that makes everyday decisions easier, faster and more understandable.',
                },
                {
                  number:
                    '03',
                  title:
                    'Built Around Transport Work',
                  text:
                    'Vehicles, drivers, documents, expenses, maintenance, dispatch and transport workflows belong together in one connected operational environment.',
                },
              ].map(
                (
                  item,
                  index
                ) => (
                  <Reveal
                    key={
                      item.number
                    }
                    delay={
                      index *
                      0.06
                    }
                  >

                    <div className="group rounded-[26px] border border-white/[0.08] bg-white/[0.03] p-6 transition duration-500 hover:border-cyan-400/15 hover:bg-white/[0.045] sm:p-7">

                      <div className="flex gap-5">

                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-400/15 bg-cyan-400/[0.06] text-[10px] font-black text-cyan-300">
                          {
                            item.number
                          }
                        </span>

                        <div>

                          <h3 className="text-xl font-black text-white">
                            {
                              item.title
                            }
                          </h3>

                          <p className="mt-2 text-sm leading-7 text-slate-400">
                            {
                              item.text
                            }
                          </p>

                        </div>

                      </div>

                    </div>

                  </Reveal>
                )
              )}

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          EXPLORE FEATURES MID CTA
      ===================================================== */}

      <section className="px-5 pb-20 sm:px-8 sm:pb-24 lg:px-12">

        <Reveal className="mx-auto max-w-[1280px]">

          <div className="relative overflow-hidden rounded-[32px] border border-white/[0.08] bg-gradient-to-r from-[#071526] via-[#0b1730] to-[#14102b] p-7 sm:p-10">

            <div className="pointer-events-none absolute right-[-5%] top-[-40%] h-72 w-72 rounded-full bg-violet-500/15 blur-[100px]" />

            <div className="relative flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">

              <div className="max-w-2xl">

                <p className="text-[9px] font-black uppercase tracking-[0.22em] text-cyan-400">
                  Explore the Platform
                </p>

                <h2 className="mt-3 text-2xl font-black text-white sm:text-3xl">
                  See what Buddy Fleets brings together.
                </h2>

                <p className="mt-3 text-sm leading-7 text-slate-400">
                  Explore the operational tools and workflows
                  designed to help transport teams manage their
                  fleet more clearly.
                </p>

              </div>

              <Link
                to="/features"
                className="group inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-400/[0.08] px-6 py-3.5 text-xs font-black text-cyan-200 transition hover:-translate-y-0.5 hover:bg-cyan-400/[0.13] sm:text-sm"
              >
                Explore Features

                <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>

            </div>

          </div>

        </Reveal>

      </section>

      {/* =====================================================
          FOUNDERS
      ===================================================== */}

      <section className="relative border-y border-white/[0.05] bg-[#070d19] py-20 sm:py-24 lg:py-28">

        <div className="mx-auto max-w-[1180px] px-5 sm:px-8 lg:px-12">

          <Reveal>

            <SectionHeading
              eyebrow="The People Behind Buddy Fleets"
              title="Built with product thinking and transport business focus."
              description="Buddy Fleets combines technology development with business operations, customer understanding and market execution."
              center
            />

          </Reveal>

          <div className="mt-14 grid gap-6 lg:grid-cols-2">

            {/* =================================================
                SHUBHAM
            ================================================= */}

            <Reveal>

              <div className="group h-full overflow-hidden rounded-[32px] border border-white/[0.08] bg-[#091222] shadow-xl shadow-black/20">

                {/* IMAGE */}

                <div className="relative aspect-[16/11] overflow-hidden bg-[#0a1425]">

                  <img
                    src={
                      SHUBHAM_PHOTO
                    }
                    alt="Shubham Jangir - Founder and Developer of Buddy Fleets"
                    loading="lazy"
                    className="h-full w-full object-cover object-center transition duration-700 group-hover:scale-[1.025]"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-[#091222] via-transparent to-transparent" />

                  <div className="absolute bottom-5 left-5">

                    <span className="rounded-full border border-cyan-400/20 bg-[#06101c]/75 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.18em] text-cyan-300 backdrop-blur-xl">
                      Founder & Developer
                    </span>

                  </div>

                </div>

                {/* DETAILS */}

                <div className="p-6 sm:p-7">

                  <h3 className="text-2xl font-black text-white">
                    Shubham Jangir
                  </h3>

                  <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-cyan-400">
                    Founder & Developer
                  </p>

                  <p className="mt-4 text-sm leading-7 text-slate-400">
                    Focused on the technical direction of Buddy Fleets,
                    including product architecture, platform development,
                    system design and the technology that powers the
                    overall product experience.
                  </p>

                  <div className="mt-6 grid gap-2 sm:grid-cols-2">

                    <FounderLink
                      href="mailto:jangirshubham72@gmail.com"
                      icon={
                        <MailIcon className="h-4 w-4" />
                      }
                    >
                      jangirshubham72@gmail.com
                    </FounderLink>

                    <FounderLink
                      href={
                        SHUBHAM_INSTAGRAM
                      }
                      icon={
                        <InstagramIcon className="h-4 w-4" />
                      }
                    >
                      @happiest_banda
                    </FounderLink>

                  </div>

                </div>

              </div>

            </Reveal>

            {/* =================================================
                NAVIN
            ================================================= */}

            <Reveal delay={0.08}>

              <div className="group h-full overflow-hidden rounded-[32px] border border-white/[0.08] bg-[#091222] shadow-xl shadow-black/20">

                {/* TEMPORARY PROFILE PLACEHOLDER */}

                <div className="relative flex aspect-[16/11] items-center justify-center overflow-hidden bg-gradient-to-br from-[#08172a] via-[#0e1a34] to-[#21113c]">

                  <div className="absolute left-[15%] top-[10%] h-40 w-40 rounded-full bg-cyan-400/10 blur-[70px]" />

                  <div className="absolute bottom-[5%] right-[10%] h-44 w-44 rounded-full bg-violet-500/15 blur-[80px]" />

                  <div
                    className="absolute inset-0 opacity-[0.06]"
                    style={{
                      backgroundImage:
                        'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)',
                      backgroundSize:
                        '42px 42px',
                    }}
                  />

                  <motion.div
                    animate={
                      reduceMotion
                        ? {}
                        : {
                            y: [
                              0,
                              -8,
                              0,
                            ],
                            rotate: [
                              0,
                              1,
                              0,
                            ],
                          }
                    }
                    transition={{
                      duration: 6,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    className="relative flex h-32 w-32 items-center justify-center rounded-[32px] border border-white/10 bg-white/[0.05] text-4xl font-black text-white shadow-2xl backdrop-blur-xl sm:h-36 sm:w-36 sm:text-5xl"
                  >
                    NS
                  </motion.div>

                  <div className="absolute bottom-5 left-5">

                    <span className="rounded-full border border-violet-400/20 bg-[#0b0b1c]/75 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.18em] text-violet-300 backdrop-blur-xl">
                      Founder
                    </span>

                  </div>

                </div>

                {/* DETAILS */}

                <div className="p-6 sm:p-7">

                  <h3 className="text-2xl font-black text-white">
                    Navin Sharma
                  </h3>

                  <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-violet-400">
                    Founder
                  </p>

                  <p className="mt-4 text-sm leading-7 text-slate-400">
                    Focused on Operations, Business Development,
                    Sales & Product — connecting Buddy Fleets with
                    market requirements, customer conversations,
                    business opportunities and the commercial direction
                    of the platform.
                  </p>

                  <div className="mt-6 grid gap-2 sm:grid-cols-2">

                    <FounderLink
                      href="mailto:navin4338@gmail.com"
                      icon={
                        <MailIcon className="h-4 w-4" />
                      }
                    >
                      navin4338@gmail.com
                    </FounderLink>

                    <FounderLink
                      href={
                        NAVIN_INSTAGRAM
                      }
                      icon={
                        <InstagramIcon className="h-4 w-4" />
                      }
                    >
                      @navin.sharma
                    </FounderLink>

                  </div>

                </div>

              </div>

            </Reveal>

          </div>

        </div>

      </section>

      {/* =====================================================
          BUDDY COMPUTERS
      ===================================================== */}

      <section className="py-20 sm:py-24 lg:py-28">

        <div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-12">

          <Reveal>

            <div className="relative overflow-hidden rounded-[34px] border border-white/[0.08] bg-[#081120] p-6 sm:p-10 lg:p-12">

              <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-blue-500/10 blur-[100px]" />

              <div className="pointer-events-none absolute -bottom-28 left-[15%] h-72 w-72 rounded-full bg-violet-500/10 blur-[100px]" />

              <div className="relative grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">

                {/* COPY */}

                <div>

                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-400">
                    A Product of Buddy Computers
                  </p>

                  <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">
                    Technology beyond fleet operations.
                  </h2>

                  <p className="mt-5 max-w-xl text-sm leading-7 text-slate-400">
                    Buddy Fleets is a product of{' '}

                    <span className="font-bold text-white">
                      Buddy Computers
                    </span>

                    , a technology and computer services brand
                    working across PC solutions, technical services,
                    networking, digital services and creative technology.
                  </p>

                  <p className="mt-4 max-w-xl text-sm leading-7 text-slate-400">
                    The same practical approach used to solve everyday
                    technology problems is carried into Buddy Fleets:
                    understand the problem clearly, then build a solution
                    that is easier to use.
                  </p>

                  <a
                    href={
                      BUDDY_COMPUTERS_URL
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group mt-7 inline-flex items-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-400/[0.07] px-5 py-3 text-xs font-black text-cyan-200 transition hover:-translate-y-0.5 hover:bg-cyan-400/[0.12] sm:text-sm"
                  >
                    Visit Buddy Computers

                    <ArrowUpRightIcon className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </a>

                </div>

                {/* SERVICES */}

                <div className="rounded-[26px] border border-white/[0.07] bg-white/[0.025] p-5 sm:p-6">

                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">
                    Services & Solutions
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2.5">

                    {buddyServices.map(
                      (
                        service
                      ) => (
                        <span
                          key={
                            service
                          }
                          className="inline-flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.035] px-3 py-2 text-[9px] font-semibold text-slate-300 sm:text-[10px]"
                        >
                          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-cyan-400/10 text-cyan-300">

                            <CheckIcon className="h-2.5 w-2.5" />

                          </span>

                          {
                            service
                          }

                        </span>
                      )
                    )}

                  </div>

                </div>

              </div>

            </div>

          </Reveal>

        </div>

      </section>

      {/* =====================================================
          FINAL CTA
      ===================================================== */}

      <section className="relative border-t border-white/[0.05] bg-[#070d19]">

        <div className="pointer-events-none absolute inset-0">

          <div className="absolute left-1/2 top-0 h-80 w-[70%] -translate-x-1/2 rounded-full bg-blue-500/[0.07] blur-[120px]" />

        </div>

        <div className="relative mx-auto max-w-[1000px] px-5 py-20 text-center sm:px-8 sm:py-24 lg:py-28">

          <Reveal>

            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-400">
              Ready to Explore Buddy Fleets?
            </p>

            <h2 className="mx-auto mt-4 max-w-4xl text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
              Give your transport operations a clearer way to move forward.
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
              Explore Buddy Fleets with a 5-day free trial or talk
              to us to learn more about the platform.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">

              <Link
                to="/signup"
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-600 px-7 py-3.5 text-xs font-black text-white shadow-xl shadow-blue-600/20 transition hover:-translate-y-0.5 hover:shadow-cyan-500/20 sm:text-sm"
              >
                Start 5-Day Free Trial

                <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                to="/contact"
                className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-7 py-3.5 text-xs font-black text-slate-200 transition hover:border-white/20 hover:bg-white/[0.07] sm:text-sm"
              >
                Contact Us
              </Link>

            </div>

          </Reveal>

        </div>

      </section>

    </div>
  );
}