import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/* =========================================================
   CONTACT DETAILS
========================================================= */

const SHUBHAM_EMAIL = 'jangirshubham72@gmail.com';
const NAVIN_EMAIL = 'navin4338@gmail.com';

const SHUBHAM_INSTAGRAM =
  'https://www.instagram.com/happiest_banda';

const NAVIN_INSTAGRAM =
  'https://www.instagram.com/navin.sharma/';

/* =========================================================
   ICONS
========================================================= */

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

function UserIcon({ className = '' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <circle
        cx="12"
        cy="8"
        r="4"
        stroke="currentColor"
        strokeWidth="1.7"
      />

      <path
        d="M4.5 20c.8-4 3.3-6 7.5-6s6.7 2 7.5 6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function BuildingIcon({ className = '' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M5 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16"
        stroke="currentColor"
        strokeWidth="1.7"
      />

      <path
        d="M3 21h18M8 7h2M14 7h2M8 11h2M14 11h2M8 15h2M14 15h2"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PhoneIcon({ className = '' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M7.5 3h3l1.4 4-2.1 1.6c1 2.3 2.8 4.1 5.1 5.1l1.6-2.1 4 1.4v3c0 1.1-.9 2-2 2C10.5 18 6 13.5 6 5.5c0-1.4.6-2.5 1.5-2.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MessageIcon({ className = '' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M5 18.5 3.5 21l4-1.2c1.3.7 2.8 1.2 4.5 1.2 5 0 9-3.8 9-8.5S17 4 12 4s-9 3.8-9 8.5c0 2.3.8 4.4 2 6Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />

      <path
        d="M8 10h8M8 14h5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SendIcon({ className = '' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="m21 3-8.5 18-2-8-8-2L21 3Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="m10.5 13 5-5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ArrowIcon({ className = '' }) {
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

/* =========================================================
   REVEAL
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
              y: 30,
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
   CONTACT PERSON CARD
========================================================= */

function ContactPerson({
  name,
  role,
  description,
  email,
  instagram,
  instagramHandle,
  accent = 'cyan',
}) {
  const isCyan = accent === 'cyan';

  return (
    <div
      className="
        group
        relative
        overflow-hidden
        rounded-[26px]
        border
        border-white/[0.08]
        bg-white/[0.025]
        p-5
        transition
        duration-500
        hover:border-white/[0.14]
        sm:p-6
      "
    >
      <div
        className={`
          pointer-events-none
          absolute
          -right-16
          -top-16
          h-44
          w-44
          rounded-full
          blur-[80px]

          ${
            isCyan
              ? 'bg-cyan-500/[0.08]'
              : 'bg-violet-500/[0.09]'
          }
        `}
      />

      <div className="relative">

        <div className="flex items-start gap-4">

          <div
            className={`
              flex
              h-12
              w-12
              shrink-0
              items-center
              justify-center
              rounded-2xl
              border

              ${
                isCyan
                  ? 'border-cyan-400/15 bg-cyan-400/[0.06] text-cyan-300'
                  : 'border-violet-400/15 bg-violet-400/[0.06] text-violet-300'
              }
            `}
          >
            <UserIcon className="h-5 w-5" />
          </div>

          <div>
            <h3 className="text-lg font-black text-white">
              {name}
            </h3>

            <p
              className={`
                mt-1
                text-[8px]
                font-black
                uppercase
                tracking-[0.18em]

                ${
                  isCyan
                    ? 'text-cyan-400'
                    : 'text-violet-400'
                }
              `}
            >
              {role}
            </p>
          </div>

        </div>

        <p className="mt-5 text-sm leading-7 text-slate-400">
          {description}
        </p>

        <div className="mt-5 space-y-2">

          <a
            href={`mailto:${email}`}
            className="
              flex
              min-w-0
              items-center
              gap-3
              rounded-xl
              border
              border-white/[0.06]
              bg-white/[0.025]
              px-3
              py-3
              text-[10px]
              font-semibold
              text-slate-400
              transition

              hover:border-cyan-400/20
              hover:bg-cyan-400/[0.04]
              hover:text-cyan-300
            "
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] text-cyan-400">
              <MailIcon className="h-4 w-4" />
            </span>

            <span className="truncate">
              {email}
            </span>
          </a>

          <a
            href={instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="
              flex
              min-w-0
              items-center
              gap-3
              rounded-xl
              border
              border-white/[0.06]
              bg-white/[0.025]
              px-3
              py-3
              text-[10px]
              font-semibold
              text-slate-400
              transition

              hover:border-pink-400/20
              hover:bg-pink-400/[0.04]
              hover:text-pink-300
            "
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] text-pink-400">
              <InstagramIcon className="h-4 w-4" />
            </span>

            <span className="truncate">
              {instagramHandle}
            </span>
          </a>

        </div>

      </div>

    </div>
  );
}

/* =========================================================
   CONTACT US PAGE
========================================================= */

export default function ContactUs() {
  const reduceMotion = useReducedMotion();

  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    mobile: '',
    enquiryType: 'Buddy Fleets',
    message: '',
  });

  const [error, setError] = useState('');

  function handleChange(event) {
    const {
      name,
      value,
    } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) {
      setError('');
    }
  }

  function handleSubmit(event) {
    event.preventDefault();

    const name =
      formData.name.trim();

    const email =
      formData.email.trim();

    const message =
      formData.message.trim();

    if (!name) {
      setError('Please enter your name.');
      return;
    }

    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    if (!message) {
      setError('Please enter your message.');
      return;
    }

    const subject =
      `${formData.enquiryType} Enquiry - ${name}`;

    const body = [
      'Hello Buddy Fleets,',
      '',
      `Name: ${name}`,
      `Company: ${formData.company.trim() || 'Not provided'}`,
      `Email: ${email}`,
      `Mobile: ${formData.mobile.trim() || 'Not provided'}`,
      `Enquiry Type: ${formData.enquiryType}`,
      '',
      'Message:',
      message,
      '',
      'Sent from Buddy Fleets Contact Us page.',
    ].join('\n');

    const mailto =
      `mailto:${SHUBHAM_EMAIL}` +
      `?subject=${encodeURIComponent(subject)}` +
      `&body=${encodeURIComponent(body)}`;

    window.location.href = mailto;
  }

  const inputClass = `
    w-full
    rounded-2xl
    border
    border-white/[0.08]
    bg-[#0b1527]
    px-4
    py-3.5
    text-sm
    text-white
    outline-none
    transition

    placeholder:text-slate-600

    focus:border-cyan-400/30
    focus:bg-[#0d192d]
    focus:ring-4
    focus:ring-cyan-400/[0.06]
  `;

  return (
    <div className="overflow-hidden bg-[#050914] text-white">

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="relative overflow-hidden border-b border-white/[0.05]">

        <div className="pointer-events-none absolute inset-0">

          <div className="absolute inset-0 bg-[#050914]" />

          <motion.div
            animate={
              reduceMotion
                ? {}
                : {
                    x: [
                      0,
                      55,
                      0,
                    ],
                    y: [
                      0,
                      25,
                      0,
                    ],
                  }
            }
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute -left-40 top-[-100px] h-[430px] w-[430px] rounded-full bg-cyan-500/[0.08] blur-[140px]"
          />

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
              duration: 17,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute -right-40 top-[10%] h-[480px] w-[480px] rounded-full bg-violet-600/[0.1] blur-[150px]"
          />

          <div
            className="absolute inset-0 opacity-[0.035]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(56,189,248,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,.8) 1px, transparent 1px)',
              backgroundSize: '58px 58px',
            }}
          />

        </div>

        <div className="relative mx-auto max-w-[1200px] px-5 py-20 text-center sm:px-8 sm:py-24 lg:px-12 lg:py-28">

          <motion.div
            initial={
              reduceMotion
                ? false
                : {
                    opacity: 0,
                    y: 28,
                  }
            }
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.8,
            }}
          >

            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/[0.05] px-4 py-2">

              <span className="relative flex h-2 w-2">

                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-50" />

                <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400" />

              </span>

              <span className="text-[9px] font-black uppercase tracking-[0.22em] text-cyan-300">
                Contact Buddy Fleets
              </span>

            </div>

            <h1 className="mx-auto mt-6 max-w-5xl text-4xl font-black leading-[1.04] tracking-tight text-white sm:text-6xl lg:text-[68px]">

              Let's talk about your

              <span className="block bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400 bg-clip-text text-transparent">
                fleet operations.
              </span>

            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base sm:leading-8">
              Have a question about Buddy Fleets, your trial,
              product capabilities or working with us? Send us
              your enquiry and connect directly with the people
              behind the platform.
            </p>

          </motion.div>

        </div>

      </section>

      {/* =====================================================
          CONTACT FORM + DIRECT CONTACT
      ===================================================== */}

      <section className="relative py-20 sm:py-24 lg:py-28">

        <div className="mx-auto grid max-w-[1280px] gap-8 px-5 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:px-12">

          {/* =================================================
              FORM
          ================================================= */}

          <Reveal>

            <div
              className="
                relative
                overflow-hidden
                rounded-[32px]
                border
                border-white/[0.08]
                bg-[#081221]
                p-5
                shadow-2xl
                shadow-black/20
                sm:p-7
                lg:p-8
              "
            >

              <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-500/[0.08] blur-[110px]" />

              <div className="relative">

                <p className="text-[9px] font-black uppercase tracking-[0.22em] text-cyan-400">
                  Send an Enquiry
                </p>

                <h2 className="mt-3 text-2xl font-black text-white sm:text-3xl">
                  Tell us what you need.
                </h2>

                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
                  Share a few details and your email application
                  will open with your enquiry already prepared.
                </p>

                <form
                  onSubmit={handleSubmit}
                  className="mt-8"
                >

                  <div className="grid gap-4 sm:grid-cols-2">

                    {/* NAME */}

                    <div>

                      <label
                        htmlFor="name"
                        className="mb-2 block text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500"
                      >
                        Full Name *
                      </label>

                      <div className="relative">

                        <UserIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />

                        <input
                          id="name"
                          name="name"
                          type="text"
                          autoComplete="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Your name"
                          className={`${inputClass} pl-11`}
                        />

                      </div>

                    </div>

                    {/* COMPANY */}

                    <div>

                      <label
                        htmlFor="company"
                        className="mb-2 block text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500"
                      >
                        Company Name
                      </label>

                      <div className="relative">

                        <BuildingIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />

                        <input
                          id="company"
                          name="company"
                          type="text"
                          autoComplete="organization"
                          value={formData.company}
                          onChange={handleChange}
                          placeholder="Company name"
                          className={`${inputClass} pl-11`}
                        />

                      </div>

                    </div>

                    {/* EMAIL */}

                    <div>

                      <label
                        htmlFor="email"
                        className="mb-2 block text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500"
                      >
                        Email Address *
                      </label>

                      <div className="relative">

                        <MailIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />

                        <input
                          id="email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="name@company.com"
                          className={`${inputClass} pl-11`}
                        />

                      </div>

                    </div>

                    {/* MOBILE */}

                    <div>

                      <label
                        htmlFor="mobile"
                        className="mb-2 block text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500"
                      >
                        Mobile Number
                      </label>

                      <div className="relative">

                        <PhoneIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />

                        <input
                          id="mobile"
                          name="mobile"
                          type="tel"
                          autoComplete="tel"
                          value={formData.mobile}
                          onChange={handleChange}
                          placeholder="+91"
                          className={`${inputClass} pl-11`}
                        />

                      </div>

                    </div>

                  </div>

                  {/* ENQUIRY TYPE */}

                  <div className="mt-4">

                    <label
                      htmlFor="enquiryType"
                      className="mb-2 block text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500"
                    >
                      Enquiry About
                    </label>

                    <select
                      id="enquiryType"
                      name="enquiryType"
                      value={formData.enquiryType}
                      onChange={handleChange}
                      className={inputClass}
                    >
                      <option value="Buddy Fleets">
                        Buddy Fleets
                      </option>

                      <option value="Product Demo">
                        Product Demo
                      </option>

                      <option value="Free Trial">
                        5-Day Free Trial
                      </option>

                      <option value="Sales">
                        Sales Enquiry
                      </option>

                      <option value="Partnership">
                        Business / Partnership
                      </option>

                      <option value="Technical">
                        Technical Enquiry
                      </option>

                      <option value="Other">
                        Other
                      </option>
                    </select>

                  </div>

                  {/* MESSAGE */}

                  <div className="mt-4">

                    <label
                      htmlFor="message"
                      className="mb-2 block text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500"
                    >
                      Message *
                    </label>

                    <div className="relative">

                      <MessageIcon className="pointer-events-none absolute left-4 top-4 h-4 w-4 text-slate-600" />

                      <textarea
                        id="message"
                        name="message"
                        rows="6"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Tell us how we can help..."
                        className={`${inputClass} resize-none pl-11`}
                      />

                    </div>

                  </div>

                  {/* ERROR */}

                  {error && (
                    <div className="mt-4 rounded-xl border border-red-400/15 bg-red-400/[0.05] px-4 py-3 text-xs font-semibold text-red-300">
                      {error}
                    </div>
                  )}

                  {/* SUBMIT */}

                  <button
                    type="submit"
                    className="
                      group
                      mt-6
                      inline-flex
                      w-full
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
                      text-sm
                      font-black
                      text-white
                      shadow-xl
                      shadow-blue-600/20
                      transition

                      hover:-translate-y-0.5
                      hover:shadow-cyan-500/20

                      sm:w-auto
                    "
                  >
                    Send Enquiry

                    <SendIcon className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-0.5" />
                  </button>

                </form>

              </div>

            </div>

          </Reveal>

          {/* =================================================
              DIRECT CONTACT
          ================================================= */}

          <div>

            <Reveal>

              <div className="mb-6">

                <p className="text-[9px] font-black uppercase tracking-[0.22em] text-cyan-400">
                  Direct Contact
                </p>

                <h2 className="mt-3 text-3xl font-black tracking-tight text-white">
                  Connect with us directly.
                </h2>

                <p className="mt-4 text-sm leading-7 text-slate-400">
                  Buddy Fleets is being built with both technology
                  and transport business operations in mind. Reach
                  the relevant founder directly below.
                </p>

              </div>

            </Reveal>

            <div className="space-y-4">

              <Reveal delay={0.05}>

                <ContactPerson
                  name="Shubham Jangir"
                  role="Founder & Developer"
                  description="For platform, technology, product development and technical enquiries related to Buddy Fleets."
                  email={SHUBHAM_EMAIL}
                  instagram={SHUBHAM_INSTAGRAM}
                  instagramHandle="@happiest_banda"
                  accent="cyan"
                />

              </Reveal>

              <Reveal delay={0.1}>

                <ContactPerson
                  name="Navin Sharma"
                  role="Founder"
                  description="For operations, business development, sales, partnerships and product-related discussions."
                  email={NAVIN_EMAIL}
                  instagram={NAVIN_INSTAGRAM}
                  instagramHandle="@navin.sharma"
                  accent="violet"
                />

              </Reveal>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          CONTACT REASONS
      ===================================================== */}

      <section className="border-y border-white/[0.05] bg-[#070d19] py-20 sm:py-24">

        <div className="mx-auto max-w-[1200px] px-5 sm:px-8 lg:px-12">

          <Reveal>

            <div className="mx-auto max-w-3xl text-center">

              <p className="text-[9px] font-black uppercase tracking-[0.22em] text-cyan-400">
                We're Here to Help
              </p>

              <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
                Start the right conversation.
              </h2>

              <p className="mt-4 text-sm leading-7 text-slate-400 sm:text-base">
                Whether you're exploring Buddy Fleets for the
                first time or want to discuss your transport
                operations, you can reach us directly.
              </p>

            </div>

          </Reveal>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            {[
              {
                number: '01',
                title: 'Product Enquiries',
                description:
                  'Understand Buddy Fleets and how the platform approaches fleet operations.',
              },
              {
                number: '02',
                title: '5-Day Free Trial',
                description:
                  'Questions related to starting or understanding your Buddy Fleets trial.',
              },
              {
                number: '03',
                title: 'Sales & Business',
                description:
                  'Discuss product requirements, commercial conversations and business opportunities.',
              },
              {
                number: '04',
                title: 'Technical Questions',
                description:
                  'Connect for platform, account or other technical Buddy Fleets enquiries.',
              },
            ].map((item, index) => (
              <Reveal
                key={item.number}
                delay={index * 0.05}
              >

                <motion.div
                  whileHover={
                    reduceMotion
                      ? {}
                      : {
                          y: -6,
                        }
                  }
                  className="
                    group
                    h-full
                    rounded-[24px]
                    border
                    border-white/[0.07]
                    bg-white/[0.025]
                    p-5
                    transition
                    hover:border-cyan-400/15
                    sm:p-6
                  "
                >
                  <span className="text-[9px] font-black tracking-[0.2em] text-cyan-400/60">
                    {item.number}
                  </span>

                  <h3 className="mt-6 text-lg font-black text-white">
                    {item.title}
                  </h3>

                  <p className="mt-3 text-xs leading-6 text-slate-400">
                    {item.description}
                  </p>

                </motion.div>

              </Reveal>
            ))}

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

        <div className="relative mx-auto max-w-[950px] px-5 py-20 text-center sm:px-8 sm:py-24 lg:py-28">

          <Reveal>

            <p className="text-[9px] font-black uppercase tracking-[0.24em] text-cyan-400">
              Ready to Get Started?
            </p>

            <h2 className="mx-auto mt-4 max-w-4xl text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
              Experience a simpler approach to fleet operations.
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
              Start your 5-day free trial and explore Buddy Fleets.
            </p>

            <a
              href="/signup"
              className="
                group
                mt-8
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

              <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>

          </Reveal>

        </div>

      </section>

    </div>
  );
}