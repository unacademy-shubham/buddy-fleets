import React from 'react';
import { Link } from 'react-router-dom';
import {
  motion,
  useReducedMotion,
} from 'framer-motion';

/* =========================================================
   LINKS / PROFILE DATA
========================================================= */

const SHUBHAM_PHOTO =
  'https://drive.google.com/thumbnail?id=12_mss3NpN7WSjurHGS0eGyPMXMb_J2of&sz=w1200';

const SHUBHAM_INSTAGRAM =
  'https://www.instagram.com/happiest_banda';

const NAVIN_INSTAGRAM =
  'https://www.instagram.com/navin.sharma/';

/*
  Buddy Computers website ready hone ke baad
  sirf ye URL replace karna hai.
*/

const BUDDY_COMPUTERS_URL =
  'https://example.com';

/* =========================================================
   ICONS
========================================================= */

function ArrowRightIcon({
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

function ExternalIcon({
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
        cx="17.3"
        cy="6.7"
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
   REVEAL
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
              y: 34,
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
        amount: 0.15,
      }}
      transition={{
        duration: 0.7,
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
   SECTION TITLE
========================================================= */

function SectionTitle({
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
      <p className="text-[9px] font-black uppercase tracking-[0.24em] text-cyan-400 sm:text-[10px]">
        {eyebrow}
      </p>

      <h2 className="mt-3 text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
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
   HERO UI GRAPHIC
========================================================= */

function HeroOperationsGraphic() {
  const reduceMotion =
    useReducedMotion();

  return (
    <div className="relative mx-auto w-full max-w-[570px]">

      {/* GLOW */}

      <div className="absolute left-1/2 top-1/2 h-[85%] w-[85%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 blur-[100px]" />

      {/* MAIN PANEL */}

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
          duration: 7,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="relative overflow-hidden rounded-[30px] border border-white/10 bg-[#091426]/90 p-4 shadow-2xl shadow-black/50 backdrop-blur-2xl sm:p-5"
      >

        {/* HEADER */}

        <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">

          <div>

            <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-500">
              Fleet Operations
            </p>

            <p className="mt-1 text-sm font-black text-white">
              Intelligence Overview
            </p>

          </div>

          <div className="flex items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-400/[0.05] px-3 py-1.5">

            <span className="relative flex h-2 w-2">

              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />

              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />

            </span>

            <span className="text-[8px] font-black uppercase tracking-[0.15em] text-emerald-300">
              Live
            </span>

          </div>

        </div>

        {/* MINI CARDS */}

        <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">

          {[
            {
              label:
                'Vehicles',
              value:
                'Fleet',
            },
            {
              label:
                'Drivers',
              value:
                'People',
            },
            {
              label:
                'Operations',
              value:
                'Control',
            },
          ].map(
            (
              item,
              index
            ) => (
              <motion.div
                key={
                  item.label
                }
                animate={
                  reduceMotion
                    ? {}
                    : {
                        y: [
                          0,
                          index % 2 === 0
                            ? -4
                            : 4,
                          0,
                        ],
                      }
                }
                transition={{
                  duration:
                    4 +
                    index,
                  repeat:
                    Infinity,
                  ease:
                    'easeInOut',
                }}
                className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-3"
              >

                <p className="text-[7px] font-bold uppercase tracking-[0.14em] text-slate-600 sm:text-[8px]">
                  {
                    item.label
                  }
                </p>

                <p className="mt-2 text-[10px] font-black text-white sm:text-xs">
                  {
                    item.value
                  }
                </p>

              </motion.div>
            )
          )}

        </div>

        {/* GRAPH */}

        <div className="mt-4 rounded-[22px] border border-white/[0.06] bg-[#07101f]/80 p-4">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-[8px] font-black uppercase tracking-[0.16em] text-slate-600">
                Operational Flow
              </p>

              <p className="mt-1 text-[10px] font-bold text-slate-300">
                Connected fleet activity
              </p>

            </div>

            <span className="text-[8px] font-black text-cyan-300">
              BUDDY FLEETS
            </span>

          </div>

          <div className="mt-7 flex h-28 items-end gap-2 sm:h-32 sm:gap-3">

            {[
              42,
              63,
              48,
              82,
              68,
              91,
              74,
              96,
            ].map(
              (
                height,
                index
              ) => (
                <div
                  key={
                    index
                  }
                  className="relative flex h-full flex-1 items-end overflow-hidden rounded-md bg-white/[0.025]"
                >

                  <motion.div
                    initial={{
                      height: 0,
                    }}
                    whileInView={{
                      height:
                        `${height}%`,
                    }}
                    viewport={{
                      once: true,
                    }}
                    transition={{
                      duration:
                        0.9,
                      delay:
                        index *
                        0.08,
                    }}
                    animate={
                      reduceMotion
                        ? {}
                        : {
                            opacity: [
                              0.75,
                              1,
                              0.75,
                            ],
                          }
                    }
                    className="w-full rounded-md bg-gradient-to-t from-blue-600/50 via-cyan-400/70 to-cyan-300"
                  />

                </div>
              )
            )}

          </div>

        </div>

      </motion.div>

      {/* FLOATING CARD 1 */}

      <motion.div
        animate={
          reduceMotion
            ? {}
            : {
                y: [
                  0,
                  -12,
                  0,
                ],
                x: [
                  0,
                  4,
                  0,
                ],
              }
        }
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute -left-2 top-[18%] hidden rounded-2xl border border-cyan-400/15 bg-[#07101f]/95 p-3 shadow-xl backdrop-blur-xl sm:block lg:-left-10"
      >

        <p className="text-[7px] font-black uppercase tracking-[0.15em] text-cyan-400">
          Connected
        </p>

        <p className="mt-1 text-[10px] font-bold text-white">
          Fleet Data
        </p>

      </motion.div>

      {/* FLOATING CARD 2 */}

      <motion.div
        animate={
          reduceMotion
            ? {}
            : {
                y: [
                  0,
                  12,
                  0,
                ],
              }
        }
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute -right-2 bottom-[12%] hidden rounded-2xl border border-violet-400/15 bg-[#07101f]/95 p-3 shadow-xl backdrop-blur-xl sm:block lg:-right-8"
      >

        <p className="text-[7px] font-black uppercase tracking-[0.15em] text-violet-400">
          Designed For
        </p>

        <p className="mt-1 text-[10px] font-bold text-white">
          Indian Transport
        </p>

      </motion.div>

    </div>
  );
}

/* =========================================================
   AUDIENCE CARD
========================================================= */

function AudienceCard({
  number,
  title,
  text,
  delay,
}) {
  return (
    <Reveal delay={delay}>

      <motion.div
        whileHover={{
          y: -7,
        }}
        transition={{
          duration: 0.25,
        }}
        className="group relative h-full overflow-hidden rounded-[26px] border border-white/[0.08] bg-[#091221] p-6"
      >

        <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-cyan-500/[0.04] blur-3xl transition group-hover:bg-cyan-500/[0.1]" />

        <span className="text-[9px] font-black tracking-[0.2em] text-cyan-400/60">
          {number}
        </span>

        <h3 className="mt-8 text-xl font-black text-white">
          {title}
        </h3>

        <p className="mt-3 text-xs leading-6 text-slate-400 sm:text-sm">
          {text}
        </p>

      </motion.div>

    </Reveal>
  );
}

/* =========================================================
   FOUNDER CONTACT
========================================================= */

function FounderContact({
  href,
  icon,
  children,
}) {
  const external =
    !href.startsWith(
      'mailto:'
    );

  return (
    <a
      href={href}
      target={
        external
          ? '_blank'
          : undefined
      }
      rel={
        external
          ? 'noopener noreferrer'
          : undefined
      }
      className="group flex items-center gap-2.5 rounded-xl border border-white/[0.07] bg-white/[0.025] px-3 py-2.5 text-[9px] font-semibold text-slate-400 transition hover:border-cyan-400/20 hover:bg-cyan-400/[0.04] hover:text-cyan-300 sm:text-[10px]"
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
   FOUNDER CARD

   LEFT:
   circular profile
   name

   RIGHT:
   role
   description
   contacts
========================================================= */

function FounderCard({
  image,
  initials,
  name,
  role,
  description,
  email,
  instagram,
  instagramHandle,
  accent = 'cyan',
  delay = 0,
}) {
  const reduceMotion =
    useReducedMotion();

  const isCyan =
    accent === 'cyan';

  return (
    <Reveal delay={delay}>

      <div className="relative overflow-hidden rounded-[30px] border border-white/[0.08] bg-[#091221] p-5 shadow-xl shadow-black/20 sm:p-6">

        <div
          className={`
            pointer-events-none
            absolute
            right-[-80px]
            top-[-80px]
            h-56
            w-56
            rounded-full
            blur-[90px]

            ${
              isCyan
                ? 'bg-cyan-500/[0.08]'
                : 'bg-violet-500/[0.09]'
            }
          `}
        />

        <div className="relative grid gap-6 sm:grid-cols-[150px_minmax(0,1fr)] sm:items-center">

          {/* ===============================================
              PROFILE SIDE
          =============================================== */}

          <div className="flex flex-col items-center text-center">

            <motion.div
              whileHover={
                reduceMotion
                  ? {}
                  : {
                      scale: 1.04,
                    }
              }
              className={`
                relative
                flex
                h-32
                w-32
                items-center
                justify-center
                overflow-hidden
                rounded-full
                border
                p-[3px]
                shadow-2xl

                ${
                  isCyan
                    ? 'border-cyan-400/25 shadow-cyan-500/10'
                    : 'border-violet-400/25 shadow-violet-500/10'
                }
              `}
            >

              <div
                className={`
                  absolute
                  inset-0
                  rounded-full
                  bg-gradient-to-br

                  ${
                    isCyan
                      ? 'from-cyan-400 via-blue-500 to-violet-600'
                      : 'from-violet-400 via-purple-500 to-blue-600'
                  }
                `}
              />

              <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-[#081221]">

                {image ? (

                  <img
                    src={image}
                    alt={`${name} - ${role}`}
                    loading="lazy"
                    className="h-full w-full object-cover object-center"
                  />

                ) : (

                  <>
                    <div className="absolute left-2 top-4 h-14 w-14 rounded-full bg-cyan-400/10 blur-2xl" />

                    <div className="absolute bottom-3 right-2 h-14 w-14 rounded-full bg-violet-500/15 blur-2xl" />

                    <span className="relative text-3xl font-black text-white">
                      {initials}
                    </span>
                  </>

                )}

              </div>

            </motion.div>

            <h3 className="mt-4 text-lg font-black text-white">
              {name}
            </h3>

          </div>

          {/* ===============================================
              DETAILS SIDE
          =============================================== */}

          <div>

            <span
              className={`
                inline-flex
                rounded-full
                border
                px-3
                py-1.5
                text-[8px]
                font-black
                uppercase
                tracking-[0.18em]

                ${
                  isCyan
                    ? 'border-cyan-400/20 bg-cyan-400/[0.06] text-cyan-300'
                    : 'border-violet-400/20 bg-violet-400/[0.06] text-violet-300'
                }
              `}
            >
              {role}
            </span>

            <p className="mt-4 text-sm leading-7 text-slate-400">
              {description}
            </p>

            <div className="mt-5 grid gap-2 lg:grid-cols-2">

              <FounderContact
                href={`mailto:${email}`}
                icon={
                  <MailIcon className="h-4 w-4" />
                }
              >
                {email}
              </FounderContact>

              <FounderContact
                href={instagram}
                icon={
                  <InstagramIcon className="h-4 w-4" />
                }
              >
                {instagramHandle}
              </FounderContact>

            </div>

          </div>

        </div>

      </div>

    </Reveal>
  );
}

/* =========================================================
   ABOUT US
========================================================= */

export default function AboutUs() {
  const reduceMotion =
    useReducedMotion();

  const buddyComputerServices = [
    'PC & Laptop Repair',
    'Computer Hardware',
    'Custom PC Builds',
    'Software Support',
    'Networking',
    'IT Support',
    'OS & Software Setup',
    'PC Accessories',
    'Website Development',
    'Logo Design',
    'Video Editing',
    'Technical Services',
  ];

  const audience = [
    {
      number:
        '01',
      title:
        'Transport Companies',
      text:
        'Bring fleet, transport and operational activities into a cleaner digital working environment.',
    },
    {
      number:
        '02',
      title:
        'Fleet Owners',
      text:
        'Organize vehicles, drivers, documents, expenses and everyday fleet activity more clearly.',
    },
    {
      number:
        '03',
      title:
        'Logistics Companies',
      text:
        'Support fast-moving logistics operations with structured workflows and better operational visibility.',
    },
    {
      number:
        '04',
      title:
        'Fleet Operators',
      text:
        'Manage routine fleet activity without turning everyday work into complicated software processes.',
    },
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

          <motion.div
            animate={
              reduceMotion
                ? {}
                : {
                    x: [
                      0,
                      60,
                      0,
                    ],
                    y: [
                      0,
                      30,
                      0,
                    ],
                  }
            }
            transition={{
              duration: 14,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute -left-40 top-10 h-[420px] w-[420px] rounded-full bg-cyan-500/[0.09] blur-[130px]"
          />

          <motion.div
            animate={
              reduceMotion
                ? {}
                : {
                    x: [
                      0,
                      -50,
                      0,
                    ],
                    y: [
                      0,
                      -20,
                      0,
                    ],
                  }
            }
            transition={{
              duration: 16,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute -right-40 top-[12%] h-[480px] w-[480px] rounded-full bg-violet-600/[0.1] blur-[140px]"
          />

          <div
            className="absolute inset-0 opacity-[0.035]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(56,189,248,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.8) 1px, transparent 1px)',
              backgroundSize:
                '58px 58px',
            }}
          />

        </div>

        <div className="relative mx-auto grid min-h-[680px] max-w-[1400px] items-center gap-14 px-5 py-20 sm:px-8 lg:grid-cols-[0.96fr_1.04fr] lg:px-12 lg:py-24 xl:px-16">

          {/* COPY */}

          <motion.div
            initial={
              reduceMotion
                ? false
                : {
                    opacity: 0,
                    x: -35,
                  }
            }
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              duration: 0.8,
            }}
            className="relative z-10"
          >

            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/[0.05] px-4 py-2 backdrop-blur-xl">

              <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,.8)]" />

              <span className="text-[8px] font-black uppercase tracking-[0.22em] text-cyan-300 sm:text-[9px]">
                A Product of Buddy Computers
              </span>

            </div>

            <h1 className="mt-6 text-4xl font-black leading-[1.02] tracking-tight sm:text-6xl lg:text-[64px] xl:text-[72px]">

              Technology built

              <span className="block bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400 bg-clip-text text-transparent">
                around real work.
              </span>

            </h1>

            <p className="mt-6 max-w-xl text-sm leading-7 text-slate-400 sm:text-base sm:leading-8">
              Buddy Fleets is a modern{' '}

              <span className="font-bold text-slate-200">
                Fleet Operations Intelligence Platform
              </span>{' '}

              created for Indian transport businesses with one
              clear goal — make everyday transport operations
              simpler, smarter and easier to manage.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">

              <Link
                to="/features"
                className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-600 px-6 py-3.5 text-xs font-black text-white shadow-xl shadow-blue-600/20 transition hover:-translate-y-0.5 hover:shadow-cyan-500/20 sm:text-sm"
              >
                Explore Buddy Fleets

                <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                to="/contact"
                className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-6 py-3.5 text-xs font-bold text-slate-200 transition hover:bg-white/[0.07] sm:text-sm"
              >
                Contact Us
              </Link>

            </div>

          </motion.div>

          {/* VISUAL */}

          <motion.div
            initial={
              reduceMotion
                ? false
                : {
                    opacity: 0,
                    x: 40,
                    scale: 0.96,
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
            }}
          >

            <HeroOperationsGraphic />

          </motion.div>

        </div>

      </section>

      {/* =====================================================
          BUDDY COMPUTERS STORY
      ===================================================== */}

      <section className="relative py-20 sm:py-24 lg:py-28">

        <div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-12">

          <div className="grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">

            {/* STORY */}

            <Reveal>

              <div>

                <SectionTitle
                  eyebrow="Where the Story Begins"
                  title="Buddy Computers came first."
                />

                <p className="mt-6 text-sm leading-8 text-slate-400 sm:text-base">
                  Buddy Computers started with a practical approach
                  to technology — helping people solve real computer
                  and digital problems without making technology
                  unnecessarily difficult.
                </p>

                <p className="mt-4 text-sm leading-8 text-slate-400 sm:text-base">
                  From PC and laptop repair to computer hardware,
                  networking, IT support and digital services, the
                  focus has always remained the same:
                  understand the problem clearly and provide a
                  solution that actually helps.
                </p>

                <p className="mt-4 text-sm leading-8 text-slate-400 sm:text-base">
                  Buddy Fleets carries that same thinking into the
                  transport industry.
                </p>

                <a
                  href={
                    BUDDY_COMPUTERS_URL
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group mt-7 inline-flex items-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-400/[0.06] px-5 py-3 text-xs font-black text-cyan-200 transition hover:-translate-y-0.5 hover:bg-cyan-400/[0.1] sm:text-sm"
                >
                  Visit Buddy Computers

                  <ExternalIcon className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </a>

              </div>

            </Reveal>

            {/* SERVICES PANEL */}

            <Reveal delay={0.08}>

              <div className="relative overflow-hidden rounded-[30px] border border-white/[0.08] bg-[#091221] p-6 sm:p-8">

                <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-blue-500/[0.08] blur-[90px]" />

                <div className="relative">

                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">
                    Buddy Computers
                  </p>

                  <h3 className="mt-2 text-xl font-black text-white sm:text-2xl">
                    Technology & Digital Services
                  </h3>

                  <div className="mt-6 flex flex-wrap gap-2.5">

                    {buddyComputerServices.map(
                      (
                        service,
                        index
                      ) => (

                        <motion.div
                          key={
                            service
                          }
                          initial={
                            reduceMotion
                              ? false
                              : {
                                  opacity: 0,
                                  scale: 0.94,
                                }
                          }
                          whileInView={{
                            opacity: 1,
                            scale: 1,
                          }}
                          viewport={{
                            once: true,
                          }}
                          transition={{
                            delay:
                              index *
                              0.035,
                          }}
                          whileHover={{
                            y: -3,
                          }}
                          className="inline-flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.03] px-3 py-2 text-[9px] font-semibold text-slate-300 sm:text-[10px]"
                        >

                          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-cyan-400/10 text-cyan-300">

                            <CheckIcon className="h-2.5 w-2.5" />

                          </span>

                          {
                            service
                          }

                        </motion.div>

                      )
                    )}

                  </div>

                </div>

              </div>

            </Reveal>

          </div>

        </div>

      </section>

      {/* =====================================================
          BUDDY FLEETS STORY
      ===================================================== */}

      <section className="border-y border-white/[0.05] bg-[#070d19] py-20 sm:py-24 lg:py-28">

        <div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-12">

          <Reveal>

            <SectionTitle
              eyebrow="Why Buddy Fleets"
              title="Transport software became more complicated than transport itself."
              description="Many businesses adopt ERP or transport software expecting their work to become easier. Instead, they often face cluttered dashboards, complicated workflows and systems that take too much effort to understand."
            />

          </Reveal>

          <div className="mt-12 grid gap-5 lg:grid-cols-2">

            <Reveal>

              <motion.div
                whileHover={{
                  y: -5,
                }}
                className="h-full rounded-[30px] border border-red-400/10 bg-red-400/[0.025] p-7 sm:p-8"
              >

                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-red-300/70">
                  The Problem
                </span>

                <h3 className="mt-5 text-2xl font-black text-white">
                  Too much software. Too little clarity.
                </h3>

                <p className="mt-4 text-sm leading-8 text-slate-400">
                  Business software can quickly become overloaded with
                  screens, options and processes. That complexity can
                  slow down the same teams the software was supposed
                  to help.
                </p>

              </motion.div>

            </Reveal>

            <Reveal delay={0.08}>

              <motion.div
                whileHover={{
                  y: -5,
                }}
                className="h-full rounded-[30px] border border-cyan-400/15 bg-gradient-to-br from-cyan-400/[0.05] to-violet-500/[0.04] p-7 sm:p-8"
              >

                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-300">
                  Buddy Fleets Approach
                </span>

                <h3 className="mt-5 text-2xl font-black text-white">
                  Start from zero. Keep the purpose clear.
                </h3>

                <p className="mt-4 text-sm leading-8 text-slate-400">
                  Buddy Fleets was created from the ground up around
                  one simple belief: technology should make operations
                  easier to understand and manage, not add another
                  layer of complexity.
                </p>

              </motion.div>

            </Reveal>

          </div>

        </div>

      </section>

      {/* =====================================================
          MISSION
      ===================================================== */}

      <section className="px-5 py-20 sm:px-8 sm:py-24 lg:px-12 lg:py-28">

        <Reveal className="mx-auto max-w-[1280px]">

          <div className="relative overflow-hidden rounded-[34px] border border-cyan-400/15 bg-[#081426] px-6 py-14 text-center sm:px-10 sm:py-16">

            <motion.div
              animate={
                reduceMotion
                  ? {}
                  : {
                      scale: [
                        1,
                        1.15,
                        1,
                      ],
                    }
              }
              transition={{
                duration: 8,
                repeat: Infinity,
              }}
              className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 blur-[100px]"
            />

            <div className="relative">

              <p className="text-[9px] font-black uppercase tracking-[0.24em] text-cyan-400">
                Our Mission
              </p>

              <h2 className="mx-auto mt-5 max-w-4xl text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">

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

      <section className="border-y border-white/[0.05] bg-[#070d19] py-20 sm:py-24 lg:py-28">

        <div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-12">

          <Reveal>

            <SectionTitle
              eyebrow="Who We Serve"
              title="Built for businesses that keep India moving."
              description="Buddy Fleets is focused on the transport and fleet ecosystem where vehicles, people and everyday operations need to work together."
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

          <Reveal>

            <SectionTitle
              eyebrow="How We Think"
              title="Modern software should remove friction."
              description="Buddy Fleets is built around practical product thinking — every part of the platform should help make transport operations clearer."
              center
            />

          </Reveal>

          <div className="mt-12 grid gap-5 lg:grid-cols-3">

            {[
              {
                number:
                  '01',
                title:
                  'Less Complexity',
                text:
                  'Clear workflows matter more than overloaded screens and unnecessary options.',
              },
              {
                number:
                  '02',
                title:
                  'Operational Clarity',
                text:
                  'Important fleet information should be easier to understand and easier to act on.',
              },
              {
                number:
                  '03',
                title:
                  'Connected Operations',
                text:
                  'Vehicles, drivers, documents, expenses and transport activity belong in one connected environment.',
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
                    0.07
                  }
                >

                  <motion.div
                    whileHover={{
                      y: -7,
                    }}
                    className="h-full rounded-[28px] border border-white/[0.08] bg-white/[0.025] p-7"
                  >

                    <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/15 bg-cyan-400/[0.05] text-[9px] font-black text-cyan-300">
                      {
                        item.number
                      }
                    </span>

                    <h3 className="mt-6 text-xl font-black text-white">
                      {
                        item.title
                      }
                    </h3>

                    <p className="mt-3 text-sm leading-7 text-slate-400">
                      {
                        item.text
                      }
                    </p>

                  </motion.div>

                </Reveal>

              )
            )}

          </div>

        </div>

      </section>

      {/* =====================================================
          EXPLORE FEATURES
      ===================================================== */}

      <section className="px-5 pb-20 sm:px-8 sm:pb-24 lg:px-12 lg:pb-28">

        <Reveal className="mx-auto max-w-[1280px]">

          <div className="relative overflow-hidden rounded-[32px] border border-white/[0.08] bg-gradient-to-r from-[#071526] via-[#0b1730] to-[#17102c] p-7 sm:p-10">

            <motion.div
              animate={
                reduceMotion
                  ? {}
                  : {
                      x: [
                        0,
                        -45,
                        0,
                      ],
                    }
              }
              transition={{
                duration: 10,
                repeat: Infinity,
              }}
              className="absolute -right-24 top-[-80px] h-72 w-72 rounded-full bg-violet-500/15 blur-[100px]"
            />

            <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">

              <div className="max-w-2xl">

                <p className="text-[9px] font-black uppercase tracking-[0.22em] text-cyan-400">
                  Explore the Platform
                </p>

                <h2 className="mt-3 text-2xl font-black text-white sm:text-3xl">
                  Discover what Buddy Fleets brings together.
                </h2>

                <p className="mt-3 text-sm leading-7 text-slate-400">
                  Explore the tools and workflows designed around
                  everyday fleet and transport operations.
                </p>

              </div>

              <Link
                to="/features"
                className="group inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-600 px-6 py-3.5 text-xs font-black text-white shadow-lg shadow-blue-500/20 transition hover:-translate-y-0.5 sm:text-sm"
              >
                Explore Features

                <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>

            </div>

          </div>

        </Reveal>

      </section>

      {/* =====================================================
          FOUNDERS
      ===================================================== */}

      <section className="border-y border-white/[0.05] bg-[#070d19] py-20 sm:py-24 lg:py-28">

        <div className="mx-auto max-w-[1180px] px-5 sm:px-8 lg:px-12">

          <Reveal>

            <SectionTitle
              eyebrow="People Behind Buddy Fleets"
              title="Two founders. One clear direction."
              description="Technology, product thinking, business operations and customer understanding come together behind Buddy Fleets."
              center
            />

          </Reveal>

          <div className="mt-14 grid gap-6">

            {/* SHUBHAM */}

            <FounderCard
              image={
                SHUBHAM_PHOTO
              }
              initials="SJ"
              name="Shubham Jangir"
              role="Founder & Developer"
              description="Leading the technical direction of Buddy Fleets, including platform development, product architecture, system design and the technology behind the complete Buddy Fleets experience."
              email="jangirshubham72@gmail.com"
              instagram={
                SHUBHAM_INSTAGRAM
              }
              instagramHandle="@happiest_banda"
              accent="cyan"
            />

            {/* NAVIN */}

            <FounderCard
              initials="NS"
              name="Navin Sharma"
              role="Founder"
              description="Focused on Operations, Business Development, Sales & Product — understanding market requirements, building customer relationships, developing business opportunities and contributing to the commercial and product direction of Buddy Fleets."
              email="navin4338@gmail.com"
              instagram={
                NAVIN_INSTAGRAM
              }
              instagramHandle="@navin.sharma"
              accent="violet"
              delay={0.08}
            />

          </div>

        </div>

      </section>

      {/* =====================================================
          FINAL CTA
      ===================================================== */}

      <section className="relative overflow-hidden">

        <div className="pointer-events-none absolute inset-0">

          <motion.div
            animate={
              reduceMotion
                ? {}
                : {
                    x: [
                      '-15%',
                      '15%',
                      '-15%',
                    ],
                  }
            }
            transition={{
              duration: 14,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute left-1/2 top-0 h-80 w-[70%] -translate-x-1/2 rounded-full bg-blue-500/[0.08] blur-[130px]"
          />

        </div>

        <div className="relative mx-auto max-w-[1000px] px-5 py-20 text-center sm:px-8 sm:py-24 lg:py-28">

          <Reveal>

            <p className="text-[9px] font-black uppercase tracking-[0.24em] text-cyan-400">
              Move Forward with Buddy Fleets
            </p>

            <h2 className="mx-auto mt-4 max-w-4xl text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
              Give your transport operations a clearer way to work.
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
              Start your 5-day free trial or connect with us
              to learn more about Buddy Fleets.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">

              <Link
                to="/signup"
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-600 px-7 py-3.5 text-xs font-black text-white shadow-xl shadow-blue-600/20 transition hover:-translate-y-0.5 hover:shadow-cyan-500/20 sm:text-sm"
              >
                Start 5-Day Free Trial

                <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                to="/contact"
                className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-7 py-3.5 text-xs font-black text-slate-200 transition hover:bg-white/[0.07] sm:text-sm"
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