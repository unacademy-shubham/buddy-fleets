import React from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';

/* =========================================================
   LINKS
========================================================= */

const SHUBHAM_PHOTO =
  'https://drive.google.com/thumbnail?id=12_mss3NpN7WSjurHGS0eGyPMXMb_J2of&sz=w1200';

const SHUBHAM_INSTAGRAM =
  'https://www.instagram.com/happiest_banda';

const NAVIN_INSTAGRAM =
  'https://www.instagram.com/navin.sharma/';

/*
  Temporary URL.
  Buddy Computers website ready hone ke baad
  sirf is URL ko replace karna hai.
*/
const BUDDY_COMPUTERS_URL =
  'https://example.com';

/* =========================================================
   ICONS
========================================================= */

function ArrowRightIcon({ className = '' }) {
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

function ExternalIcon({ className = '' }) {
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

function MailIcon({ className = '' }) {
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

function InstagramIcon({ className = '' }) {
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
        cx="17.4"
        cy="6.6"
        r="1"
        fill="currentColor"
      />
    </svg>
  );
}

function CheckIcon({ className = '' }) {
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

function TruckIcon({ className = '' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M3 6h11v10H3V6Zm11 4h4l3 3v3h-7v-6Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />

      <circle
        cx="7"
        cy="17"
        r="2"
        stroke="currentColor"
        strokeWidth="1.6"
      />

      <circle
        cx="18"
        cy="17"
        r="2"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  );
}

/* =========================================================
   REVEAL ANIMATION
========================================================= */

function Reveal({
  children,
  className = '',
  delay = 0,
}) {
  const reduceMotion = useReducedMotion();

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
      <p className="text-[9px] font-black uppercase tracking-[0.24em] text-cyan-400 sm:text-[10px]">
        {eyebrow}
      </p>

      <h2 className="mt-3 text-3xl font-black leading-[1.12] tracking-tight text-white sm:text-4xl lg:text-5xl">
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

function HeroFleetGraphic() {
  const reduceMotion = useReducedMotion();

  const bars = [
    46,
    66,
    54,
    83,
    71,
    92,
    77,
    96,
  ];

  return (
    <div className="relative mx-auto w-full max-w-[590px]">

      {/* BACK GLOW */}

      <div className="absolute left-1/2 top-1/2 h-[85%] w-[85%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 blur-[110px]" />

      {/* MAIN DASHBOARD */}

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
        className="
          relative
          overflow-hidden
          rounded-[32px]
          border
          border-white/10
          bg-[#081425]/95
          p-4
          shadow-2xl
          shadow-black/50
          backdrop-blur-2xl
          sm:p-5
        "
      >

        {/* TOP */}

        <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">

          <div>

            <p className="text-[7px] font-black uppercase tracking-[0.2em] text-slate-600 sm:text-[8px]">
              Fleet Operations
            </p>

            <p className="mt-1 text-xs font-black text-white sm:text-sm">
              Intelligence Overview
            </p>

          </div>

          <div className="flex items-center gap-2 rounded-full border border-cyan-400/15 bg-cyan-400/[0.05] px-3 py-1.5">

            <span className="relative flex h-2 w-2">

              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-60" />

              <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400" />

            </span>

            <span className="text-[7px] font-black uppercase tracking-[0.15em] text-cyan-300 sm:text-[8px]">
              Connected
            </span>

          </div>

        </div>

        {/* MINI MODULES */}

        <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">

          {[
            {
              label: 'Fleet',
              value: 'Vehicles',
            },
            {
              label: 'People',
              value: 'Drivers',
            },
            {
              label: 'Workflow',
              value: 'Operations',
            },
          ].map((item, index) => (
            <motion.div
              key={item.value}
              animate={
                reduceMotion
                  ? {}
                  : {
                      y: [
                        0,
                        index % 2 === 0
                          ? -3
                          : 3,
                        0,
                      ],
                    }
              }
              transition={{
                duration: 4 + index,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-3"
            >

              <p className="text-[6px] font-black uppercase tracking-[0.15em] text-slate-600 sm:text-[7px]">
                {item.label}
              </p>

              <p className="mt-2 text-[9px] font-black text-white sm:text-[11px]">
                {item.value}
              </p>

              <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/[0.05]">

                <motion.div
                  animate={
                    reduceMotion
                      ? {}
                      : {
                          x: [
                            '-80%',
                            '180%',
                          ],
                        }
                  }
                  transition={{
                    duration:
                      2.8 + index * 0.3,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                  className="h-full w-[45%] rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500"
                />

              </div>

            </motion.div>
          ))}

        </div>

        {/* OPERATION GRAPH */}

        <div className="mt-4 rounded-[22px] border border-white/[0.06] bg-[#050d19]/70 p-4">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-[7px] font-black uppercase tracking-[0.17em] text-slate-600 sm:text-[8px]">
                Operational Flow
              </p>

              <p className="mt-1 text-[9px] font-semibold text-slate-300 sm:text-[10px]">
                Connected fleet activity
              </p>

            </div>

            <span className="rounded-lg bg-cyan-400/[0.06] px-2 py-1 text-[6px] font-black tracking-[0.15em] text-cyan-400 sm:text-[7px]">
              BUDDY FLEETS
            </span>

          </div>

          <div className="mt-6 flex h-28 items-end gap-2 sm:h-32 sm:gap-3">

            {bars.map((height, index) => (
              <div
                key={index}
                className="relative flex h-full flex-1 items-end overflow-hidden rounded-md bg-white/[0.025]"
              >

                <motion.div
                  initial={{
                    height: 0,
                  }}
                  whileInView={{
                    height: `${height}%`,
                  }}
                  viewport={{
                    once: true,
                  }}
                  transition={{
                    duration: 1,
                    delay:
                      index *
                      0.07,
                  }}
                  className="w-full rounded-md bg-gradient-to-t from-blue-600/40 via-blue-500/70 to-cyan-300"
                />

              </div>
            ))}

          </div>

        </div>

        {/* ROUTE */}

        <div className="mt-4 rounded-[22px] border border-white/[0.06] bg-white/[0.02] p-4">

          <div className="flex items-center gap-2">

            <TruckIcon className="h-4 w-4 text-cyan-400" />

            <span className="text-[8px] font-black uppercase tracking-[0.18em] text-slate-500">
              Transport Workflow
            </span>

          </div>

          <div className="relative mt-5">

            <div className="absolute left-2 right-2 top-[5px] h-px bg-white/[0.08]" />

            <motion.div
              animate={
                reduceMotion
                  ? {}
                  : {
                      left: [
                        '2%',
                        '88%',
                        '2%',
                      ],
                    }
              }
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute top-[1px] h-2.5 w-2.5 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,.8)]"
            />

            <div className="relative flex justify-between">

              {[
                'Fleet',
                'Docs',
                'Dispatch',
                'Reports',
              ].map((item) => (
                <div
                  key={item}
                  className="flex flex-col items-center"
                >

                  <span className="h-2.5 w-2.5 rounded-full border-2 border-[#091425] bg-slate-500" />

                  <span className="mt-2 text-[6px] font-bold uppercase tracking-[0.1em] text-slate-600 sm:text-[7px]">
                    {item}
                  </span>

                </div>
              ))}

            </div>

          </div>

        </div>

      </motion.div>

      {/* FLOATING ITEM LEFT */}

      <motion.div
        animate={
          reduceMotion
            ? {}
            : {
                y: [
                  0,
                  -11,
                  0,
                ],
                x: [
                  0,
                  3,
                  0,
                ],
              }
        }
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="
          absolute
          -left-4
          top-[18%]
          hidden
          rounded-2xl
          border
          border-cyan-400/15
          bg-[#06101d]/95
          px-4
          py-3
          shadow-xl
          backdrop-blur-xl
          sm:block
          lg:-left-10
        "
      >

        <p className="text-[6px] font-black uppercase tracking-[0.17em] text-cyan-400">
          Organized
        </p>

        <p className="mt-1 text-[9px] font-bold text-white">
          Fleet Data
        </p>

      </motion.div>

      {/* FLOATING ITEM RIGHT */}

      <motion.div
        animate={
          reduceMotion
            ? {}
            : {
                y: [
                  0,
                  11,
                  0,
                ],
              }
        }
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="
          absolute
          -right-3
          bottom-[16%]
          hidden
          rounded-2xl
          border
          border-violet-400/15
          bg-[#06101d]/95
          px-4
          py-3
          shadow-xl
          backdrop-blur-xl
          sm:block
          lg:-right-8
        "
      >

        <p className="text-[6px] font-black uppercase tracking-[0.17em] text-violet-400">
          Built For
        </p>

        <p className="mt-1 text-[9px] font-bold text-white">
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
  description,
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
        className="
          group
          relative
          h-full
          overflow-hidden
          rounded-[26px]
          border
          border-white/[0.08]
          bg-[#091221]
          p-6
          transition
          duration-500
          hover:border-cyan-400/15
        "
      >

        <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-cyan-500/[0.04] blur-3xl transition group-hover:bg-cyan-500/[0.1]" />

        <div className="relative">

          <span className="text-[9px] font-black tracking-[0.2em] text-cyan-400/60">
            {number}
          </span>

          <h3 className="mt-7 text-xl font-black text-white">
            {title}
          </h3>

          <p className="mt-3 text-xs leading-6 text-slate-400 sm:text-sm">
            {description}
          </p>

        </div>

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
    !href.startsWith('mailto:');

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
      className="
        group
        flex
        min-w-0
        items-center
        gap-2.5
        rounded-xl
        border
        border-white/[0.07]
        bg-white/[0.025]
        px-3
        py-2.5
        text-[9px]
        font-semibold
        text-slate-400
        transition

        hover:border-cyan-400/20
        hover:bg-cyan-400/[0.04]
        hover:text-cyan-300

        sm:text-[10px]
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
   FOUNDER CARD

   DESKTOP:
   [ CIRCLE PHOTO ] [ ROLE + DETAILS ]
   [ NAME        ]

   OUTER GRID:
   SHUBHAM | NAVIN
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

  const cyan =
    accent === 'cyan';

  return (
    <Reveal
      delay={delay}
      className="h-full"
    >

      <motion.div
        whileHover={
          reduceMotion
            ? {}
            : {
                y: -6,
              }
        }
        transition={{
          duration: 0.3,
        }}
        className="
          group
          relative
          h-full
          overflow-hidden
          rounded-[30px]
          border
          border-white/[0.08]
          bg-[#091221]
          p-5
          shadow-2xl
          shadow-black/20
          sm:p-6
        "
      >

        <div
          className={`
            pointer-events-none
            absolute
            -right-20
            -top-20
            h-56
            w-56
            rounded-full
            blur-[90px]

            ${
              cyan
                ? 'bg-cyan-500/[0.08]'
                : 'bg-violet-500/[0.09]'
            }
          `}
        />

        <div className="relative grid gap-6 sm:grid-cols-[145px_minmax(0,1fr)] sm:items-center">

          {/* PROFILE */}

          <div className="flex flex-col items-center text-center">

            <motion.div
              whileHover={
                reduceMotion
                  ? {}
                  : {
                      scale: 1.05,
                    }
              }
              transition={{
                duration: 0.3,
              }}
              className={`
                relative
                h-32
                w-32
                overflow-hidden
                rounded-full
                border
                p-[3px]
                shadow-xl

                ${
                  cyan
                    ? 'border-cyan-400/30 shadow-cyan-500/10'
                    : 'border-violet-400/30 shadow-violet-500/10'
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
                    cyan
                      ? 'from-cyan-400 via-blue-500 to-violet-600'
                      : 'from-violet-400 via-purple-500 to-blue-600'
                  }
                `}
              />

              <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-[#07101f]">

                {image ? (

                  <img
                    src={image}
                    alt={`${name} - ${role}`}
                    loading="lazy"
                    className="
                      h-full
                      w-full
                      object-cover
                      object-center
                      transition
                      duration-700
                      group-hover:scale-105
                    "
                  />

                ) : (

                  <>

                    <div className="absolute left-3 top-3 h-14 w-14 rounded-full bg-cyan-400/10 blur-2xl" />

                    <div className="absolute bottom-3 right-3 h-16 w-16 rounded-full bg-violet-500/20 blur-2xl" />

                    <span className="relative text-3xl font-black text-white">
                      {initials}
                    </span>

                  </>

                )}

              </div>

            </motion.div>

            <h3 className="mt-4 text-lg font-black leading-tight text-white">
              {name}
            </h3>

          </div>

          {/* DETAILS */}

          <div className="min-w-0">

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
                  cyan
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

            <div className="mt-5 grid gap-2">

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

      </motion.div>

    </Reveal>
  );
}

/* =========================================================
   ABOUT US PAGE
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
      number: '01',
      title: 'Transport Companies',
      description:
        'Bring fleet, transport and everyday operational activities into a cleaner digital working environment.',
    },
    {
      number: '02',
      title: 'Fleet Owners',
      description:
        'Organize vehicles, drivers, documents, expenses and routine fleet activity more clearly.',
    },
    {
      number: '03',
      title: 'Logistics Companies',
      description:
        'Support fast-moving logistics workflows with structured information and better operational clarity.',
    },
    {
      number: '04',
      title: 'Fleet Operators',
      description:
        'Manage everyday fleet work without turning routine operations into complicated software processes.',
    },
  ];

  const philosophy = [
    {
      number: '01',
      title: 'Less Complexity',
      description:
        'Clear workflows matter more than overloaded screens, unnecessary controls and difficult software processes.',
    },
    {
      number: '02',
      title: 'Operational Clarity',
      description:
        'Fleet information should be organized so teams can understand what is happening and act with greater confidence.',
    },
    {
      number: '03',
      title: 'Connected Operations',
      description:
        'Vehicles, drivers, documents, expenses, maintenance, dispatch and transport activity should work together in one connected environment.',
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
              duration: 15,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute -left-40 top-10 h-[440px] w-[440px] rounded-full bg-cyan-500/[0.08] blur-[140px]"
          />

          <motion.div
            animate={
              reduceMotion
                ? {}
                : {
                    x: [
                      0,
                      -55,
                      0,
                    ],
                    y: [
                      0,
                      -30,
                      0,
                    ],
                  }
            }
            transition={{
              duration: 17,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute -right-40 top-[10%] h-[500px] w-[500px] rounded-full bg-violet-600/[0.1] blur-[150px]"
          />

          <div
            className="absolute inset-0 opacity-[0.035]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(56,189,248,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,.8) 1px, transparent 1px)',
              backgroundSize:
                '58px 58px',
            }}
          />

        </div>

        <div className="relative mx-auto grid min-h-[690px] max-w-[1400px] items-center gap-14 px-5 py-20 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:px-12 lg:py-24 xl:px-16">

          {/* HERO TEXT */}

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
              duration: 0.85,
              ease: 'easeOut',
            }}
            className="relative z-10"
          >

            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/[0.05] px-4 py-2 backdrop-blur-xl">

              <span className="relative flex h-2 w-2">

                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-60" />

                <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400" />

              </span>

              <span className="text-[8px] font-black uppercase tracking-[0.22em] text-cyan-300 sm:text-[9px]">
                A Product of Buddy Computers
              </span>

            </div>

            <h1 className="mt-6 text-4xl font-black leading-[1.02] tracking-tight text-white sm:text-6xl lg:text-[64px] xl:text-[72px]">

              From technology

              <span className="block bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400 bg-clip-text text-transparent">
                solutions to fleet
              </span>

              intelligence.

            </h1>

            <p className="mt-6 max-w-xl text-sm leading-7 text-slate-400 sm:text-base sm:leading-8 lg:text-[17px]">
              Buddy Fleets is a{' '}

              <span className="font-semibold text-slate-200">
                Fleet Operations Intelligence Platform
              </span>{' '}

              created for Indian transport businesses with a simple
              philosophy — technology should make operations easier,
              clearer and more manageable.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">

              <Link
                to="/features"
                className="
                  group
                  inline-flex
                  items-center
                  gap-2
                  rounded-xl
                  bg-gradient-to-r
                  from-cyan-400
                  via-blue-500
                  to-violet-600
                  px-6
                  py-3.5
                  text-xs
                  font-black
                  text-white
                  shadow-xl
                  shadow-blue-600/20
                  transition
                  hover:-translate-y-0.5
                  hover:shadow-cyan-500/20
                  sm:text-sm
                "
              >
                Explore Buddy Fleets

                <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                to="/contact"
                className="
                  inline-flex
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-white/10
                  bg-white/[0.04]
                  px-6
                  py-3.5
                  text-xs
                  font-bold
                  text-slate-200
                  transition
                  hover:border-white/20
                  hover:bg-white/[0.07]
                  sm:text-sm
                "
              >
                Contact Us
              </Link>

            </div>

          </motion.div>

          {/* HERO GRAPHIC */}

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
              ease: 'easeOut',
            }}
          >

            <HeroFleetGraphic />

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

                <SectionHeading
                  eyebrow="Where the Story Begins"
                  title="Buddy Computers came first."
                />

                <p className="mt-6 text-sm leading-8 text-slate-400 sm:text-base">
                  Buddy Computers began with a practical approach
                  to technology — solving real computer, technical
                  and digital problems without making technology
                  unnecessarily difficult.
                </p>

                <p className="mt-4 text-sm leading-8 text-slate-400 sm:text-base">
                  From PC and laptop repair, hardware and custom PC
                  solutions to networking, IT support, websites and
                  creative digital services, the focus remains simple:
                  understand the problem clearly and provide a solution
                  that actually helps.
                </p>

                <p className="mt-4 text-sm leading-8 text-slate-400 sm:text-base">
                  That practical technology-first thinking became the
                  foundation for Buddy Fleets — bringing the same
                  approach into transport and fleet operations.
                </p>

                <a
                  href={BUDDY_COMPUTERS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    group
                    mt-7
                    inline-flex
                    items-center
                    gap-2
                    rounded-xl
                    border
                    border-cyan-400/20
                    bg-cyan-400/[0.06]
                    px-5
                    py-3
                    text-xs
                    font-black
                    text-cyan-200
                    transition

                    hover:-translate-y-0.5
                    hover:bg-cyan-400/[0.1]

                    sm:text-sm
                  "
                >
                  Visit Buddy Computers

                  <ExternalIcon className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </a>

              </div>

            </Reveal>

            {/* SERVICES */}

            <Reveal delay={0.08}>

              <motion.div
                whileHover={
                  reduceMotion
                    ? {}
                    : {
                        y: -5,
                      }
                }
                className="
                  relative
                  overflow-hidden
                  rounded-[30px]
                  border
                  border-white/[0.08]
                  bg-[#091221]
                  p-6
                  shadow-2xl
                  shadow-black/20
                  sm:p-8
                "
              >

                <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-blue-500/[0.08] blur-[90px]" />

                <div className="relative">

                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-400">
                    Buddy Computers
                  </p>

                  <h3 className="mt-2 text-xl font-black text-white sm:text-2xl">
                    Technology & Digital Services
                  </h3>

                  <p className="mt-3 text-xs leading-6 text-slate-500 sm:text-sm">
                    Practical technology services across computers,
                    networking, IT and digital work.
                  </p>

                  <div className="mt-6 flex flex-wrap gap-2.5">

                    {buddyComputerServices.map((service, index) => (
                      <motion.div
                        key={service}
                        initial={
                          reduceMotion
                            ? false
                            : {
                                opacity: 0,
                                scale: 0.92,
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
                        whileHover={
                          reduceMotion
                            ? {}
                            : {
                                y: -3,
                              }
                        }
                        className="
                          inline-flex
                          items-center
                          gap-2
                          rounded-xl
                          border
                          border-white/[0.07]
                          bg-white/[0.03]
                          px-3
                          py-2
                          text-[9px]
                          font-semibold
                          text-slate-300
                          sm:text-[10px]
                        "
                      >

                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-cyan-400/10 text-cyan-300">

                          <CheckIcon className="h-2.5 w-2.5" />

                        </span>

                        {service}

                      </motion.div>
                    ))}

                  </div>

                </div>

              </motion.div>

            </Reveal>

          </div>

        </div>

      </section>

      {/* =====================================================
          WHY BUDDY FLEETS
      ===================================================== */}

      <section className="relative border-y border-white/[0.05] bg-[#070d19] py-20 sm:py-24 lg:py-28">

        <div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-12">

          <Reveal>

            <SectionHeading
              eyebrow="Why Buddy Fleets Exists"
              title="Transport software should make transport easier."
              description="Businesses adopt software to reduce work and improve clarity. But traditional ERP and transport systems can sometimes become difficult to navigate, difficult to understand and difficult to use in everyday operations."
            />

          </Reveal>

          <div className="mt-12 grid gap-5 lg:grid-cols-2">

            {/* PROBLEM */}

            <Reveal>

              <motion.div
                whileHover={
                  reduceMotion
                    ? {}
                    : {
                        y: -6,
                      }
                }
                className="
                  relative
                  h-full
                  overflow-hidden
                  rounded-[30px]
                  border
                  border-red-400/10
                  bg-red-400/[0.025]
                  p-7
                  sm:p-8
                "
              >

                <div className="absolute -right-20 -top-20 h-52 w-52 rounded-full bg-red-500/[0.05] blur-[90px]" />

                <div className="relative">

                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-red-300/70">
                    The Problem
                  </span>

                  <h3 className="mt-5 text-2xl font-black text-white sm:text-3xl">
                    Complexity became normal.
                  </h3>

                  <p className="mt-4 text-sm leading-8 text-slate-400">
                    More screens, more menus and more options do not
                    automatically create better operations. Software
                    can become another task for the team instead of
                    becoming a tool that supports the team.
                  </p>

                </div>

              </motion.div>

            </Reveal>

            {/* APPROACH */}

            <Reveal delay={0.08}>

              <motion.div
                whileHover={
                  reduceMotion
                    ? {}
                    : {
                        y: -6,
                      }
                }
                className="
                  relative
                  h-full
                  overflow-hidden
                  rounded-[30px]
                  border
                  border-cyan-400/15
                  bg-gradient-to-br
                  from-cyan-400/[0.05]
                  via-blue-500/[0.03]
                  to-violet-500/[0.04]
                  p-7
                  sm:p-8
                "
              >

                <div className="absolute -right-20 -top-20 h-52 w-52 rounded-full bg-cyan-500/[0.08] blur-[90px]" />

                <div className="relative">

                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-300">
                    Our Approach
                  </span>

                  <h3 className="mt-5 text-2xl font-black text-white sm:text-3xl">
                    Start from zero. Keep it clear.
                  </h3>

                  <p className="mt-4 text-sm leading-8 text-slate-400">
                    Buddy Fleets was created from the ground up around
                    one practical idea: technology should reduce
                    operational confusion, not add another layer of
                    complexity. Every workflow should have a clear
                    purpose.
                  </p>

                </div>

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

          <div className="
            relative
            overflow-hidden
            rounded-[34px]
            border
            border-cyan-400/15
            bg-[#081426]
            px-6
            py-14
            text-center
            sm:px-10
            sm:py-16
            lg:px-16
          ">

            <motion.div
              animate={
                reduceMotion
                  ? {}
                  : {
                      scale: [
                        1,
                        1.18,
                        1,
                      ],
                    }
              }
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="
                pointer-events-none
                absolute
                left-1/2
                top-1/2
                h-72
                w-72
                -translate-x-1/2
                -translate-y-1/2
                rounded-full
                bg-blue-500/10
                blur-[100px]
              "
            />

            <div className="relative">

              <p className="text-[9px] font-black uppercase tracking-[0.24em] text-cyan-400">
                Our Mission
              </p>

              <h2 className="mx-auto mt-5 max-w-4xl text-3xl font-black leading-tight text-white sm:text-4xl lg:text-5xl">

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

            <SectionHeading
              eyebrow="Who We Serve"
              title="Built for businesses that keep India moving."
              description="Buddy Fleets is focused on businesses and operators working every day across India's transport and fleet ecosystem."
              center
            />

          </Reveal>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

            {audience.map((item, index) => (
              <AudienceCard
                key={item.title}
                {...item}
                delay={
                  index *
                  0.06
                }
              />
            ))}

          </div>

        </div>

      </section>

      {/* =====================================================
          PRODUCT PHILOSOPHY
      ===================================================== */}

      <section className="py-20 sm:py-24 lg:py-28">

        <div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-12">

          <Reveal>

            <SectionHeading
              eyebrow="How We Think"
              title="Useful technology should feel natural."
              description="Buddy Fleets is guided by practical product thinking. The goal is not to add software for the sake of software — it is to make everyday transport work easier to manage."
              center
            />

          </Reveal>

          <div className="mt-12 grid gap-5 lg:grid-cols-3">

            {philosophy.map((item, index) => (
              <Reveal
                key={item.number}
                delay={
                  index *
                  0.07
                }
              >

                <motion.div
                  whileHover={
                    reduceMotion
                      ? {}
                      : {
                          y: -7,
                        }
                  }
                  transition={{
                    duration: 0.25,
                  }}
                  className="
                    group
                    h-full
                    rounded-[28px]
                    border
                    border-white/[0.08]
                    bg-white/[0.025]
                    p-7
                    transition
                    hover:border-cyan-400/15
                  "
                >

                  <span className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-cyan-400/15
                    bg-cyan-400/[0.05]
                    text-[9px]
                    font-black
                    text-cyan-300
                  ">
                    {item.number}
                  </span>

                  <h3 className="mt-6 text-xl font-black text-white">
                    {item.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-slate-400">
                    {item.description}
                  </p>

                </motion.div>

              </Reveal>
            ))}

          </div>

        </div>

      </section>

      {/* =====================================================
          EXPLORE FEATURES CTA
      ===================================================== */}

      <section className="px-5 pb-20 sm:px-8 sm:pb-24 lg:px-12 lg:pb-28">

        <Reveal className="mx-auto max-w-[1280px]">

          <div className="
            relative
            overflow-hidden
            rounded-[32px]
            border
            border-white/[0.08]
            bg-gradient-to-r
            from-[#071526]
            via-[#0b1730]
            to-[#17102c]
            p-7
            sm:p-10
          ">

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
                ease: 'easeInOut',
              }}
              className="absolute -right-24 top-[-80px] h-72 w-72 rounded-full bg-violet-500/15 blur-[100px]"
            />

            <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">

              <div className="max-w-2xl">

                <p className="text-[9px] font-black uppercase tracking-[0.22em] text-cyan-400">
                  Explore the Platform
                </p>

                <h2 className="mt-3 text-2xl font-black text-white sm:text-3xl">
                  See what Buddy Fleets brings together.
                </h2>

                <p className="mt-3 text-sm leading-7 text-slate-400">
                  Explore the operational tools and workflows designed
                  to help transport teams manage their fleet more
                  clearly.
                </p>

              </div>

              <Link
                to="/features"
                className="
                  group
                  inline-flex
                  shrink-0
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-gradient-to-r
                  from-cyan-400
                  via-blue-500
                  to-violet-600
                  px-6
                  py-3.5
                  text-xs
                  font-black
                  text-white
                  shadow-lg
                  shadow-blue-500/20
                  transition

                  hover:-translate-y-0.5

                  sm:text-sm
                "
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

      <section className="relative border-y border-white/[0.05] bg-[#070d19] py-20 sm:py-24 lg:py-28">

        <div className="mx-auto max-w-[1350px] px-5 sm:px-8 lg:px-12">

          <Reveal>

            <SectionHeading
              eyebrow="People Behind Buddy Fleets"
              title="Two founders. One clear direction."
              description="Technology, product thinking, business operations and customer understanding come together behind Buddy Fleets."
              center
            />

          </Reveal>

          {/* ===============================================
              SHUBHAM LEFT | NAVIN RIGHT
          =============================================== */}

          <div className="mt-14 grid items-stretch gap-6 lg:grid-cols-2">

            {/* SHUBHAM */}

            <FounderCard
              image={SHUBHAM_PHOTO}
              initials="SJ"
              name="Shubham Jangir"
              role="Founder & Developer"
              description="Leading the technical direction of Buddy Fleets, including product architecture, platform development, system design and the technology behind the complete Buddy Fleets experience."
              email="jangirshubham72@gmail.com"
              instagram={SHUBHAM_INSTAGRAM}
              instagramHandle="@happiest_banda"
              accent="cyan"
            />

            {/* NAVIN */}

            <FounderCard
              initials="NS"
              name="Navin Sharma"
              role="Founder"
              description="Focused on Operations, Business Development, Sales & Product — understanding market requirements, building customer relationships, developing business opportunities and contributing to the product and commercial direction of Buddy Fleets."
              email="navin4338@gmail.com"
              instagram={NAVIN_INSTAGRAM}
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
            className="
              absolute
              left-1/2
              top-0
              h-80
              w-[70%]
              -translate-x-1/2
              rounded-full
              bg-blue-500/[0.08]
              blur-[130px]
            "
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
              Explore Buddy Fleets with a 5-day free trial or
              connect with us to learn more about the platform.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">

              <Link
                to="/signup"
                className="
                  group
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-gradient-to-r
                  from-cyan-400
                  via-blue-500
                  to-violet-600
                  px-7
                  py-3.5
                  text-xs
                  font-black
                  text-white
                  shadow-xl
                  shadow-blue-600/20
                  transition

                  hover:-translate-y-0.5
                  hover:shadow-cyan-500/20

                  sm:text-sm
                "
              >
                Start 5-Day Free Trial

                <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                to="/contact"
                className="
                  inline-flex
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-white/10
                  bg-white/[0.04]
                  px-7
                  py-3.5
                  text-xs
                  font-black
                  text-slate-200
                  transition

                  hover:border-white/20
                  hover:bg-white/[0.07]

                  sm:text-sm
                "
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