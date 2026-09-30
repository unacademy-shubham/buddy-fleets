import React from 'react';
import { Link } from 'react-router-dom';
import {
  motion,
  useReducedMotion,
} from 'framer-motion';

/* =========================================================
   LINKS
========================================================= */

const SHUBHAM_PHOTO =
  'https://drive.google.com/thumbnail?id=12_mss3NpN7WSjurHGS0eGyPMXMb_J2of&sz=w800';

const SHUBHAM_INSTAGRAM =
  'https://www.instagram.com/happiest_banda';

const NAVIN_INSTAGRAM =
  'https://www.instagram.com/navin.sharma/';

const BUDDY_COMPUTERS_URL =
  'https://www.instagram.com/buddy_computers';

/* =========================================================
   BASIC ICONS
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
        cx="17.4"
        cy="6.6"
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

function TruckIcon({
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
   REVEAL

   Same proven Framer Motion structure from old working page,
   but reduced animation distance/duration.
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
              y: 14,
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
        amount: 0.08,
      }}
      transition={{
        duration: 0.4,
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
      <p
        className="
          text-[9px]
          font-black
          uppercase
          tracking-[0.21em]
          text-cyan-500
          sm:text-[10px]
        "
      >
        {eyebrow}
      </p>

      <h2
        className="
          mt-3
          text-3xl
          font-black
          leading-[1.12]
          tracking-tight
          text-[color:var(--bf-text-primary)]
          sm:text-4xl
        "
      >
        {title}
      </h2>

      {description && (
        <p
          className="
            mt-3
            text-sm
            leading-7
            text-[color:var(--bf-text-secondary)]
            sm:text-base
          "
        >
          {description}
        </p>
      )}
    </div>
  );
}

/* =========================================================
   HERO PRODUCT GRAPHIC
========================================================= */

function HeroFleetGraphic() {
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

  const modules = [
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
  ];

  const workflow = [
    'Fleet',
    'Docs',
    'Dispatch',
    'Reports',
  ];

  return (
    <div
      className="
        relative
        mx-auto
        w-full
        max-w-[520px]
      "
    >
      {/* BACK GLOW */}

      <div
        aria-hidden="true"
        className="
          absolute
          left-1/2
          top-1/2
          h-[80%]
          w-[80%]
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          bg-blue-500/[0.08]
          blur-[100px]
        "
      />

      {/* DASHBOARD */}

      <div
        className="
          relative
          overflow-hidden
          rounded-[26px]
          border
          border-white/10
          bg-[#081425]
          p-4
          shadow-2xl
          shadow-black/30
        "
      >
        {/* TOP */}

        <div
          className="
            flex
            items-center
            justify-between
            gap-3
            border-b
            border-white/[0.06]
            pb-3
          "
        >
          <div>
            <p
              className="
                text-[7px]
                font-black
                uppercase
                tracking-[0.18em]
                text-slate-500
              "
            >
              Fleet Operations
            </p>

            <p
              className="
                mt-1
                text-xs
                font-black
                text-white
              "
            >
              Intelligence Overview
            </p>
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
            "
          >
            <span
              className="
                h-1.5
                w-1.5
                rounded-full
                bg-emerald-400
              "
            />

            <span
              className="
                text-[7px]
                font-black
                uppercase
                tracking-[0.13em]
                text-emerald-300
              "
            >
              Connected
            </span>
          </div>
        </div>

        {/* MINI MODULES */}

        <div
          className="
            mt-3
            grid
            grid-cols-3
            gap-2
          "
        >
          {modules.map(
            (item) => (
              <div
                key={item.value}
                className="
                  rounded-xl
                  border
                  border-white/[0.06]
                  bg-white/[0.025]
                  p-3
                "
              >
                <p
                  className="
                    text-[7px]
                    font-black
                    uppercase
                    tracking-[0.12em]
                    text-slate-500
                  "
                >
                  {item.label}
                </p>

                <p
                  className="
                    mt-1.5
                    text-[10px]
                    font-black
                    text-white
                  "
                >
                  {item.value}
                </p>

                <div
                  className="
                    mt-2.5
                    h-1
                    overflow-hidden
                    rounded-full
                    bg-white/[0.05]
                  "
                >
                  <div
                    className="
                      h-full
                      w-[70%]
                      rounded-full
                      bg-gradient-to-r
                      from-cyan-400
                      via-blue-500
                      to-emerald-400
                    "
                  />
                </div>
              </div>
            )
          )}
        </div>

        {/* GRAPH */}

        <div
          className="
            mt-3
            rounded-2xl
            border
            border-white/[0.06]
            bg-[#050d19]/75
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
                  text-[7px]
                  font-black
                  uppercase
                  tracking-[0.16em]
                  text-slate-500
                "
              >
                Operational Flow
              </p>

              <p
                className="
                  mt-1
                  text-[9px]
                  font-semibold
                  text-slate-300
                "
              >
                Connected fleet activity
              </p>
            </div>

            <span
              className="
                rounded-lg
                bg-cyan-400/[0.06]
                px-2
                py-1
                text-[7px]
                font-black
                tracking-[0.12em]
                text-cyan-300
              "
            >
              BUDDY FLEETS
            </span>
          </div>

          <div
            className="
              mt-4
              flex
              h-20
              items-end
              gap-2
            "
          >
            {bars.map(
              (
                height,
                index
              ) => (
                <div
                  key={index}
                  className="
                    flex
                    h-full
                    flex-1
                    items-end
                    overflow-hidden
                    rounded-md
                    bg-white/[0.025]
                  "
                >
                  <div
                    className="
                      w-full
                      rounded-md
                      bg-gradient-to-t
                      from-blue-600/40
                      via-blue-500/70
                      to-cyan-300
                    "
                    style={{
                      height:
                        `${height}%`,
                    }}
                  />
                </div>
              )
            )}
          </div>
        </div>

        {/* WORKFLOW */}

        <div
          className="
            mt-3
            rounded-2xl
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
              gap-2
            "
          >
            <TruckIcon
              className="
                h-4
                w-4
                text-cyan-300
              "
            />

            <span
              className="
                text-[7px]
                font-black
                uppercase
                tracking-[0.16em]
                text-slate-500
              "
            >
              Transport Workflow
            </span>
          </div>

          <div
            className="
              relative
              mt-4
            "
          >
            <div
              className="
                absolute
                left-3
                right-3
                top-[5px]
                h-px
                bg-white/[0.08]
              "
            />

            <div
              className="
                relative
                flex
                justify-between
              "
            >
              {workflow.map(
                (item) => (
                  <div
                    key={item}
                    className="
                      flex
                      flex-col
                      items-center
                    "
                  >
                    <span
                      className="
                        h-2.5
                        w-2.5
                        rounded-full
                        border-2
                        border-[#091425]
                        bg-cyan-400
                      "
                    />

                    <span
                      className="
                        mt-2
                        text-[7px]
                        font-bold
                        uppercase
                        tracking-[0.08em]
                        text-slate-500
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
}) {
  return (
    <article
      className="
        group
        h-full
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
      <span
        className="
          font-mono
          text-[9px]
          font-black
          tracking-[0.18em]
          text-cyan-500
        "
      >
        {number}
      </span>

      <h3
        className="
          mt-4
          text-lg
          font-black
          text-[color:var(--bf-text-primary)]
        "
      >
        {title}
      </h3>

      <p
        className="
          mt-2
          text-sm
          leading-6
          text-[color:var(--bf-text-secondary)]
        "
      >
        {description}
      </p>
    </article>
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
      className="
        flex
        min-w-0
        items-center
        gap-2.5
        rounded-xl
        border
        border-[color:var(--bf-border)]
        bg-[var(--bf-page-bg)]
        px-3
        py-2.5
        text-[10px]
        font-semibold
        text-[color:var(--bf-text-muted)]
        transition
        hover:border-cyan-400/25
        hover:text-cyan-500
      "
    >
      <span
        className="
          flex
          h-7
          w-7
          shrink-0
          items-center
          justify-center
          rounded-lg
          bg-cyan-400/[0.07]
          text-cyan-500
        "
      >
        {icon}
      </span>

      <span
        className="
          min-w-0
          truncate
        "
      >
        {children}
      </span>
    </a>
  );
}

/* =========================================================
   FOUNDER CARD
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
}) {
  const cyan =
    accent === 'cyan';

  return (
    <article
      className="
        relative
        h-full
        overflow-hidden
        rounded-[24px]
        border
        border-[color:var(--bf-border)]
        bg-[var(--bf-surface)]
        p-5
        shadow-sm
      "
    >
      <div
        aria-hidden="true"
        className={`
          pointer-events-none
          absolute
          -right-20
          -top-20
          h-52
          w-52
          rounded-full
          blur-[90px]

          ${
            cyan
              ? 'bg-cyan-500/[0.07]'
              : 'bg-blue-500/[0.07]'
          }
        `}
      />

      <div
        className="
          relative
          grid
          gap-5
          sm:grid-cols-[125px_minmax(0,1fr)]
          sm:items-center
        "
      >
        {/* PROFILE */}

        <div
          className="
            flex
            flex-col
            items-center
            text-center
          "
        >
          <div
            className={`
              relative
              h-28
              w-28
              overflow-hidden
              rounded-full
              border
              p-[3px]
              shadow-lg

              ${
                cyan
                  ? `
                    border-cyan-400/30
                    shadow-cyan-500/10
                  `
                  : `
                    border-blue-400/30
                    shadow-blue-500/10
                  `
              }
            `}
          >
            <div
              className="
                absolute
                inset-0
                rounded-full
                bg-gradient-to-br
                from-[#12BFF2]
                via-[#078EE5]
                to-[#0AA23B]
              "
            />

            <div
              className="
                relative
                flex
                h-full
                w-full
                items-center
                justify-center
                overflow-hidden
                rounded-full
                bg-[#07101f]
              "
            >
              {image ? (
                <img
                  src={image}
                  alt={`${name} - ${role}`}
                  width="448"
                  height="448"
                  loading="lazy"
                  decoding="async"
                  className="
                    h-full
                    w-full
                    object-cover
                    object-center
                  "
                />
              ) : (
                <span
                  className="
                    text-3xl
                    font-black
                    text-white
                  "
                >
                  {initials}
                </span>
              )}
            </div>
          </div>

          <h3
            className="
              mt-3
              text-base
              font-black
              leading-tight
              text-[color:var(--bf-text-primary)]
            "
          >
            {name}
          </h3>
        </div>

        {/* DETAILS */}

        <div className="min-w-0">

          <span
            className="
              inline-flex
              rounded-full
              border
              border-cyan-400/20
              bg-cyan-400/[0.06]
              px-3
              py-1
              text-[8px]
              font-black
              uppercase
              tracking-[0.15em]
              text-cyan-500
            "
          >
            {role}
          </span>

          <p
            className="
              mt-3
              text-sm
              leading-6
              text-[color:var(--bf-text-secondary)]
            "
          >
            {description}
          </p>

          <div
            className="
              mt-4
              grid
              gap-2
            "
          >
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
    </article>
  );
}

/* =========================================================
   ABOUT US PAGE
========================================================= */

export default function AboutUs() {
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
          PAGE BACKGROUND
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

        <div
          className="
            absolute
            inset-0
            opacity-[0.035]
          "
          style={{
            backgroundImage:
              'linear-gradient(rgba(100,116,139,0.28) 1px, transparent 1px), linear-gradient(90deg, rgba(100,116,139,0.28) 1px, transparent 1px)',
            backgroundSize:
              '72px 72px',
          }}
        />

        <div
          className="
            absolute
            -left-40
            top-20
            h-[400px]
            w-[400px]
            rounded-full
            bg-cyan-500/[0.06]
            blur-[120px]
          "
        />

        <div
          className="
            absolute
            -right-40
            top-[34rem]
            h-[440px]
            w-[440px]
            rounded-full
            bg-blue-500/[0.06]
            blur-[130px]
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
            mx-auto
            grid
            max-w-7xl
            items-center
            gap-8
            lg:grid-cols-[0.95fr_1.05fr]
            lg:gap-12
          "
        >
          {/* HERO TEXT */}

          <div className="relative z-10">

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
                "
              />

              <span
                className="
                  text-[9px]
                  font-black
                  uppercase
                  tracking-[0.2em]
                  text-cyan-500
                "
              >
                A Product of Buddy Computers
              </span>
            </div>

            <h1
              className="
                mt-4
                max-w-3xl
                text-[clamp(2.15rem,4.6vw,3.7rem)]
                font-black
                leading-[1.04]
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
                From technology solutions to fleet intelligence.
              </span>
            </h1>

            <p
              className="
                mt-4
                max-w-xl
                text-sm
                leading-7
                text-[color:var(--bf-text-secondary)]
                sm:text-base
              "
            >
              Buddy Fleets is a{' '}

              <span
                className="
                  font-bold
                  text-[color:var(--bf-text-primary)]
                "
              >
                Fleet Operations Intelligence Platform
              </span>{' '}

              created for Indian transport businesses with a
              simple philosophy — technology should make
              operations easier, clearer and more manageable.
            </p>

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
                to="/features"
                className="
                  inline-flex
                  min-h-11
                  items-center
                  justify-center
                  gap-2
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
                "
              >
                Explore Buddy Fleets

                <ArrowRightIcon
                  className="h-4 w-4"
                />
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
                  hover:border-cyan-400/30
                "
              >
                Contact Us
              </Link>
            </div>
          </div>

          {/* HERO GRAPHIC */}

          <HeroFleetGraphic />
        </div>
      </section>

      {/* =====================================================
          BUDDY COMPUTERS STORY
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
            grid
            max-w-7xl
            gap-8
            lg:grid-cols-[0.95fr_1.05fr]
            lg:items-center
            lg:gap-10
          "
        >
          {/* STORY */}

          <Reveal>
            <div>
              <SectionHeading
                eyebrow="Where the Story Begins"
                title="Buddy Computers came first."
              />

              <p
                className="
                  mt-4
                  text-sm
                  leading-7
                  text-[color:var(--bf-text-secondary)]
                  sm:text-base
                "
              >
                Buddy Computers began with a practical approach
                to technology — solving real computer, technical
                and digital problems without making technology
                unnecessarily difficult.
              </p>

              <p
                className="
                  mt-3
                  text-sm
                  leading-7
                  text-[color:var(--bf-text-secondary)]
                  sm:text-base
                "
              >
                From PC and laptop repair, hardware and custom PC
                solutions to networking, IT support, websites and
                creative digital services, the focus remains simple:
                understand the problem clearly and provide a solution
                that actually helps.
              </p>

              <p
                className="
                  mt-3
                  text-sm
                  leading-7
                  text-[color:var(--bf-text-secondary)]
                  sm:text-base
                "
              >
                That practical technology-first thinking became the
                foundation for Buddy Fleets — bringing the same
                approach into transport and fleet operations.
              </p>

              <a
                href={BUDDY_COMPUTERS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="
                  mt-5
                  inline-flex
                  min-h-10
                  items-center
                  gap-2
                  rounded-xl
                  border
                  border-cyan-400/20
                  bg-cyan-400/[0.06]
                  px-5
                  py-2.5
                  text-sm
                  font-black
                  text-cyan-500
                  transition
                  hover:border-cyan-400/35
                  hover:bg-cyan-400/[0.1]
                "
              >
                Visit Buddy Computers

                <ExternalIcon
                  className="h-4 w-4"
                />
              </a>
            </div>
          </Reveal>

          {/* SERVICES */}

          <Reveal delay={0.05}>
            <div
              className="
                rounded-[24px]
                border
                border-[color:var(--bf-border)]
                bg-[var(--bf-surface)]
                p-5
                shadow-sm
                sm:p-6
              "
            >
              <p
                className="
                  text-[9px]
                  font-black
                  uppercase
                  tracking-[0.18em]
                  text-cyan-500
                "
              >
                Buddy Computers
              </p>

              <h3
                className="
                  mt-2
                  text-xl
                  font-black
                  text-[color:var(--bf-text-primary)]
                "
              >
                Technology & Digital Services
              </h3>

              <p
                className="
                  mt-2
                  text-sm
                  leading-6
                  text-[color:var(--bf-text-muted)]
                "
              >
                Practical technology services across computers,
                networking, IT and digital work.
              </p>

              <div
                className="
                  mt-5
                  flex
                  flex-wrap
                  gap-2
                "
              >
                {buddyComputerServices.map(
                  (service) => (
                    <div
                      key={service}
                      className="
                        inline-flex
                        items-center
                        gap-2
                        rounded-xl
                        border
                        border-[color:var(--bf-border)]
                        bg-[var(--bf-page-bg)]
                        px-3
                        py-2
                        text-[9px]
                        font-semibold
                        text-[color:var(--bf-text-secondary)]
                        sm:text-[10px]
                      "
                    >
                      <span
                        className="
                          flex
                          h-4
                          w-4
                          items-center
                          justify-center
                          rounded-full
                          bg-cyan-400/[0.08]
                          text-cyan-500
                        "
                      >
                        <CheckIcon
                          className="h-2.5 w-2.5"
                        />
                      </span>

                      {service}
                    </div>
                  )
                )}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* =====================================================
          WHY BUDDY FLEETS
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

          <Reveal>
            <SectionHeading
              eyebrow="Why Buddy Fleets Exists"
              title="Transport software should make transport easier."
              description="Businesses adopt software to reduce work and improve clarity. But traditional ERP and transport systems can sometimes become difficult to navigate, difficult to understand and difficult to use in everyday operations."
            />
          </Reveal>

          <div
            className="
              mt-6
              grid
              gap-4
              lg:grid-cols-2
            "
          >
            {/* PROBLEM */}

            <Reveal>
              <article
                className="
                  h-full
                  rounded-[22px]
                  border
                  border-red-400/15
                  bg-red-400/[0.025]
                  p-5
                "
              >
                <span
                  className="
                    text-[9px]
                    font-black
                    uppercase
                    tracking-[0.18em]
                    text-red-400
                  "
                >
                  The Problem
                </span>

                <h3
                  className="
                    mt-3
                    text-xl
                    font-black
                    text-[color:var(--bf-text-primary)]
                  "
                >
                  Complexity became normal.
                </h3>

                <p
                  className="
                    mt-3
                    text-sm
                    leading-7
                    text-[color:var(--bf-text-secondary)]
                  "
                >
                  More screens, more menus and more options do not
                  automatically create better operations. Software
                  can become another task for the team instead of
                  becoming a tool that supports the team.
                </p>
              </article>
            </Reveal>

            {/* APPROACH */}

            <Reveal delay={0.05}>
              <article
                className="
                  h-full
                  rounded-[22px]
                  border
                  border-cyan-400/20
                  bg-cyan-400/[0.035]
                  p-5
                "
              >
                <span
                  className="
                    text-[9px]
                    font-black
                    uppercase
                    tracking-[0.18em]
                    text-cyan-500
                  "
                >
                  Our Approach
                </span>

                <h3
                  className="
                    mt-3
                    text-xl
                    font-black
                    text-[color:var(--bf-text-primary)]
                  "
                >
                  Start from zero. Keep it clear.
                </h3>

                <p
                  className="
                    mt-3
                    text-sm
                    leading-7
                    text-[color:var(--bf-text-secondary)]
                  "
                >
                  Buddy Fleets was created from the ground up around
                  one practical idea: technology should reduce
                  operational confusion, not add another layer of
                  complexity. Every workflow should have a clear
                  purpose.
                </p>
              </article>
            </Reveal>
          </div>
        </div>
      </section>

      {/* =====================================================
          MISSION
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
        <Reveal
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
            <div
              aria-hidden="true"
              className="
                absolute
                left-1/2
                top-1/2
                h-64
                w-64
                -translate-x-1/2
                -translate-y-1/2
                rounded-full
                bg-blue-500/[0.08]
                blur-[90px]
              "
            />

            <div className="relative">
              <p
                className="
                  text-[9px]
                  font-black
                  uppercase
                  tracking-[0.22em]
                  text-cyan-500
                "
              >
                Our Mission
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
                "
              >
                To make transport operations{' '}

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

          <Reveal>
            <SectionHeading
              eyebrow="Who We Serve"
              title="Built for businesses that keep India moving."
              description="Buddy Fleets is focused on businesses and operators working every day across India's transport and fleet ecosystem."
              center
            />
          </Reveal>

          <div
            className="
              mt-6
              grid
              gap-4
              sm:grid-cols-2
              xl:grid-cols-4
            "
          >
            {audience.map(
              (item) => (
                <Reveal
                  key={item.number}
                >
                  <AudienceCard
                    {...item}
                  />
                </Reveal>
              )
            )}
          </div>
        </div>
      </section>

      {/* =====================================================
          PRODUCT PHILOSOPHY
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

          <Reveal>
            <SectionHeading
              eyebrow="How We Think"
              title="Useful technology should feel natural."
              description="Buddy Fleets is guided by practical product thinking. The goal is not to add software for the sake of software — it is to make everyday transport work easier to manage."
              center
            />
          </Reveal>

          <div
            className="
              mt-6
              grid
              gap-4
              lg:grid-cols-3
            "
          >
            {philosophy.map(
              (
                item,
                index
              ) => (
                <Reveal
                  key={item.number}
                  delay={
                    index *
                    0.03
                  }
                >
                  <article
                    className="
                      h-full
                      rounded-[22px]
                      border
                      border-[color:var(--bf-border)]
                      bg-[var(--bf-surface)]
                      p-5
                      shadow-sm
                      transition
                      hover:-translate-y-0.5
                      hover:border-cyan-400/25
                    "
                  >
                    <span
                      className="
                        flex
                        h-9
                        w-9
                        items-center
                        justify-center
                        rounded-xl
                        border
                        border-cyan-400/15
                        bg-cyan-400/[0.06]
                        text-[9px]
                        font-black
                        text-cyan-500
                      "
                    >
                      {item.number}
                    </span>

                    <h3
                      className="
                        mt-4
                        text-lg
                        font-black
                        text-[color:var(--bf-text-primary)]
                      "
                    >
                      {item.title}
                    </h3>

                    <p
                      className="
                        mt-2
                        text-sm
                        leading-6
                        text-[color:var(--bf-text-secondary)]
                      "
                    >
                      {item.description}
                    </p>
                  </article>
                </Reveal>
              )
            )}
          </div>
        </div>
      </section>

      {/* =====================================================
          EXPLORE PLATFORM
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
        <Reveal
          className="
            mx-auto
            max-w-7xl
          "
        >
          <div
            className="
              rounded-[24px]
              border
              border-[color:var(--bf-border)]
              bg-[var(--bf-surface)]
              p-5
              shadow-sm
              sm:p-7
            "
          >
            <div
              className="
                flex
                flex-col
                gap-5
                lg:flex-row
                lg:items-center
                lg:justify-between
              "
            >
              <div className="max-w-2xl">
                <p
                  className="
                    text-[9px]
                    font-black
                    uppercase
                    tracking-[0.2em]
                    text-cyan-500
                  "
                >
                  Explore the Platform
                </p>

                <h2
                  className="
                    mt-2
                    text-2xl
                    font-black
                    text-[color:var(--bf-text-primary)]
                    sm:text-3xl
                  "
                >
                  See what Buddy Fleets brings together.
                </h2>

                <p
                  className="
                    mt-2
                    text-sm
                    leading-6
                    text-[color:var(--bf-text-secondary)]
                  "
                >
                  Explore the operational tools and workflows designed
                  to help transport teams manage their fleet more
                  clearly.
                </p>
              </div>

              <Link
                to="/features"
                className="
                  inline-flex
                  min-h-11
                  shrink-0
                  items-center
                  justify-center
                  gap-2
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
                  transition
                  hover:-translate-y-0.5
                "
              >
                Explore Features

                <ArrowRightIcon
                  className="h-4 w-4"
                />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      {/* =====================================================
          FOUNDERS
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

          <Reveal>
            <SectionHeading
              eyebrow="People Behind Buddy Fleets"
              title="Two founders. One clear direction."
              description="Technology, product thinking, business operations and customer understanding come together behind Buddy Fleets."
              center
            />
          </Reveal>

          <div
            className="
              mt-6
              grid
              items-stretch
              gap-4
              lg:grid-cols-2
            "
          >
            {/* SHUBHAM */}

            <Reveal>
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
            </Reveal>

            {/* NAVIN */}

            <Reveal delay={0.04}>
              <FounderCard
                initials="NS"
                name="Navin Sharma"
                role="Founder"
                description="Focused on Operations, Business Development, Sales & Product — understanding market requirements, building customer relationships, developing business opportunities and contributing to the product and commercial direction of Buddy Fleets."
                email="navin4338@gmail.com"
                instagram={NAVIN_INSTAGRAM}
                instagramHandle="@navin.sharma"
                accent="blue"
              />
            </Reveal>
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
        <Reveal
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
                bg-cyan-400/[0.1]
                blur-[90px]
              "
            />

            <div className="relative">
              <p
                className="
                  text-[9px]
                  font-black
                  uppercase
                  tracking-[0.22em]
                  text-cyan-500
                "
              >
                Move Forward with Buddy Fleets
              </p>

              <h2
                className="
                  mx-auto
                  mt-3
                  max-w-4xl
                  text-3xl
                  font-black
                  tracking-tight
                  text-[color:var(--bf-text-primary)]
                  sm:text-4xl
                "
              >
                Give your transport operations a clearer way to work.
              </h2>

              <p
                className="
                  mx-auto
                  mt-3
                  max-w-2xl
                  text-sm
                  leading-6
                  text-[color:var(--bf-text-secondary)]
                "
              >
                Explore Buddy Fleets with a 5-day free trial or
                connect with us to learn more about the platform.
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
                    gap-2
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
                    hover:-translate-y-0.5
                  "
                >
                  Start 5-Day Free Trial

                  <ArrowRightIcon
                    className="h-4 w-4"
                  />
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
                    hover:border-cyan-400/30
                  "
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}