import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../../supabaseClient';

/* =========================================================
   BUDDY FLEETS
   SIGNUP PAGE

   Navbar + Footer:
   AuthLayout.jsx handles them.

   IMPORTANT:
   Input padding is controlled per field so prefixes like
   @ and +91 never overlap placeholders or entered values.
========================================================= */

/* =========================================================
   INPUT STYLES
========================================================= */

const inputBase = `
  w-full
  rounded-xl
  border
  border-white/10
  bg-[#101a2c]/85
  py-2.5
  text-xs
  text-white
  outline-none
  transition-all
  duration-300

  placeholder:text-slate-600

  focus:border-cyan-400/60
  focus:bg-[#142139]
  focus:ring-4
  focus:ring-cyan-400/10

  disabled:cursor-not-allowed
  disabled:opacity-60

  sm:rounded-2xl
  sm:py-3
  sm:text-sm
`;

const normalInput =
  `${inputBase} px-4`;

const emailInput =
  `${inputBase} pl-11 pr-4`;

const mobileInput =
  `${inputBase} pl-[68px] pr-4`;

const passwordInput =
  `${inputBase} pl-4 pr-16`;

/* =========================================================
   AMBIENT ORB
========================================================= */

function AmbientOrb({
  className = '',
}) {
  return (
    <motion.div
      animate={{
        scale: [
          1,
          1.12,
          1,
        ],

        opacity: [
          0.2,
          0.42,
          0.2,
        ],
      }}
      transition={{
        duration: 7,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      className={`
        pointer-events-none
        absolute
        rounded-full
        blur-[110px]
        ${className}
      `}
    />
  );
}

/* =========================================================
   LIGHT TRAIL
========================================================= */

function LightTrail({
  delay = 0,
  duration = 8,
  bottom = 'bottom-[15%]',
  width = 'w-48',
}) {
  return (
    <motion.div
      initial={{
        x: '-30vw',
        opacity: 0,
      }}
      animate={{
        x: '130vw',

        opacity: [
          0,
          0.35,
          0.65,
          0,
        ],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'linear',
      }}
      className={`
        pointer-events-none
        absolute
        left-0
        ${bottom}
        h-px
        ${width}
        bg-gradient-to-r
        from-transparent
        via-cyan-300/50
        to-transparent
      `}
    />
  );
}

/* =========================================================
   TRUCK
========================================================= */

function Truck() {
  return (
    <div className="relative h-16 w-44 sm:h-20 sm:w-56">

      {/* UNDER GLOW */}

      <div className="absolute -bottom-2 left-2 h-5 w-40 rounded-full bg-cyan-400/20 blur-xl sm:w-52" />

      {/* TRAILER */}

      <div className="absolute left-0 top-1 h-11 w-32 rounded-md border border-cyan-300/20 bg-gradient-to-br from-slate-700/80 via-slate-800/80 to-[#07101f] shadow-[0_0_30px_rgba(34,211,238,0.12)] sm:h-14 sm:w-40">

        <div className="absolute left-2 right-2 top-2 h-1 rounded-full bg-cyan-400/40" />

        <div className="absolute left-2 top-5 text-[7px] font-black uppercase tracking-[0.25em] text-slate-500 sm:top-6">
          BUDDY FLEETS
        </div>

        <div className="absolute bottom-2 left-2 h-1 w-8 rounded-full bg-blue-400/30" />

        <div className="absolute bottom-2 right-2 h-1 w-12 rounded-full bg-violet-400/30" />

      </div>

      {/* CABIN */}

      <div className="absolute right-0 top-5 h-8 w-12 rounded-r-lg rounded-tl-sm border border-cyan-300/25 bg-gradient-to-br from-cyan-500/30 via-blue-600/30 to-violet-700/30 shadow-[0_0_25px_rgba(34,211,238,0.2)] sm:top-7 sm:h-10 sm:w-14">

        <div className="absolute left-2 top-2 h-3 w-7 rounded-sm border border-cyan-300/20 bg-cyan-300/10 sm:h-4 sm:w-9" />

      </div>

      {/* FRONT LIGHT */}

      <div className="absolute right-[-4px] top-[31px] h-2 w-2 rounded-full bg-cyan-200 shadow-[0_0_14px_rgba(34,211,238,1)] sm:top-[39px]" />

      {/* WHEELS */}

      <div className="absolute bottom-0 left-6 h-6 w-6 rounded-full border-2 border-slate-500 bg-[#020617] sm:left-8 sm:h-7 sm:w-7" />

      <div className="absolute bottom-0 right-6 h-6 w-6 rounded-full border-2 border-slate-500 bg-[#020617] sm:right-7 sm:h-7 sm:w-7" />

      {/* HUBS */}

      <div className="absolute bottom-[7px] left-[35px] h-2 w-2 rounded-full bg-slate-600 sm:bottom-[8px] sm:left-[42px]" />

      <div className="absolute bottom-[7px] right-[35px] h-2 w-2 rounded-full bg-slate-600 sm:bottom-[8px] sm:right-[42px]" />

    </div>
  );
}

/* =========================================================
   ANIMATED TRUCK
========================================================= */

function AnimatedTruck() {
  return (
    <motion.div
      initial={{
        x: '-20vw',
        opacity: 0,
      }}
      animate={{
        x: '120vw',

        opacity: [
          0,
          1,
          1,
          0,
        ],
      }}
      transition={{
        duration: 22,
        repeat: Infinity,
        repeatDelay: 3,
        ease: 'linear',
      }}
      className="absolute bottom-0 left-0"
    >
      <Truck />
    </motion.div>
  );
}

/* =========================================================
   MOBILE / TABLET TRUCK
========================================================= */

function MobileTruckScene() {
  return (
    <div className="relative h-24 w-full overflow-hidden border-y border-white/[0.04] sm:h-28 lg:hidden">

      <div className="absolute inset-x-0 bottom-2 h-px bg-gradient-to-r from-transparent via-cyan-400/35 to-transparent" />

      <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-cyan-500/[0.06] to-transparent" />

      <AnimatedTruck />

    </div>
  );
}

/* =========================================================
   RADAR
========================================================= */

function RadarPulse() {
  return (
    <div className="pointer-events-none absolute right-[7%] top-[30%] hidden h-36 w-36 xl:block">

      <motion.div
        animate={{
          scale: [
            0.7,
            1.4,
          ],

          opacity: [
            0.45,
            0,
          ],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeOut',
        }}
        className="absolute inset-0 rounded-full border border-cyan-400/20"
      />

      <motion.div
        animate={{
          scale: [
            0.7,
            1.4,
          ],

          opacity: [
            0.3,
            0,
          ],
        }}
        transition={{
          duration: 3,
          delay: 1.5,
          repeat: Infinity,
          ease: 'easeOut',
        }}
        className="absolute inset-0 rounded-full border border-cyan-400/15"
      />

      <div className="absolute inset-[20%] rounded-full border border-cyan-400/10" />

      <div className="absolute inset-[38%] rounded-full border border-cyan-400/20 bg-cyan-400/5" />

      <motion.div
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'linear',
        }}
        className="absolute left-1/2 top-1/2 h-[1px] w-1/2 origin-left bg-gradient-to-r from-cyan-400/70 to-transparent"
      />

      <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-300 shadow-[0_0_15px_rgba(34,211,238,1)]" />

    </div>
  );
}

/* =========================================================
   SIGNUP
========================================================= */

export default function Signup() {
  const [
    formData,
    setFormData,
  ] = useState({
    companyName: '',
    yourName: '',
    email: '',
    mobile: '',
    password: '',
    terms: false,
  });

  const [
    submitted,
    setSubmitted,
  ] = useState(false);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState('');

  /* =========================================================
     PASSWORD RULES
  ========================================================= */

  const passwordRules = {
    length:
      formData.password.length >= 8 &&
      formData.password.length <= 64,

    uppercase:
      /[A-Z]/.test(
        formData.password
      ),

    lowercase:
      /[a-z]/.test(
        formData.password
      ),

    number:
      /\d/.test(
        formData.password
      ),

    symbol:
      /[^A-Za-z0-9\s]/.test(
        formData.password
      ),
  };

  const isPasswordValid =
    passwordRules.length &&
    passwordRules.uppercase &&
    passwordRules.lowercase &&
    passwordRules.number &&
    passwordRules.symbol;

  /* =========================================================
     INPUT CHANGE
  ========================================================= */

  const handleChange = (
    event
  ) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    /* MOBILE = NUMBERS ONLY */

    if (
      name ===
      'mobile'
    ) {
      const numericValue =
        value
          .replace(
            /\D/g,
            ''
          )
          .slice(
            0,
            10
          );

      setFormData(
        (
          previous
        ) => ({
          ...previous,

          mobile:
            numericValue,
        })
      );

      setError('');

      return;
    }

    setFormData(
      (
        previous
      ) => ({
        ...previous,

        [name]:
          type ===
          'checkbox'
            ? checked
            : value,
      })
    );

    setError('');
  };

  /* =========================================================
     SIGNUP SUBMIT
  ========================================================= */

  const handleRegister =
    async (
      event
    ) => {
      event.preventDefault();

      if (loading) {
        return;
      }

      setError('');

      const cleanCompanyName =
        formData.companyName
          .trim();

      const cleanFullName =
        formData.yourName
          .trim();

      const cleanEmail =
        formData.email
          .trim()
          .toLowerCase();

      /* COMPANY */

      if (
        !cleanCompanyName
      ) {
        setError(
          'Please enter your company name.'
        );

        return;
      }

      /* NAME */

      if (
        !cleanFullName
      ) {
        setError(
          'Please enter your full name.'
        );

        return;
      }

      /* EMAIL */

      const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (
        !emailRegex.test(
          cleanEmail
        )
      ) {
        setError(
          'Please enter a valid email address.'
        );

        return;
      }

      /* MOBILE */

      if (
        !/^[0-9]{10}$/.test(
          formData.mobile
        )
      ) {
        setError(
          'Please enter a valid 10-digit mobile number.'
        );

        return;
      }

      /* PASSWORD */

      if (
        !isPasswordValid
      ) {
        setError(
          'Password must be 8–64 characters and include at least one uppercase letter, one lowercase letter, one number and one special character.'
        );

        return;
      }

      /* TERMS */

      if (
        !formData.terms
      ) {
        setError(
          'Please accept the terms before creating your account.'
        );

        return;
      }

      setLoading(true);

      try {

        /* =====================================================
           LOCKED SIGNUP WORKFLOW

           Signup
              ↓
           Supabase Auth
              ↓
           handle_new_auth_user()
              ↓
           pending company
              ↓
           Email confirmation
              ↓
           BUDDYxxx Company Code
              ↓
           active membership
              ↓
           5-Day Trial
        ===================================================== */

        const {
          data,
          error:
            signupError,
        } =
          await supabase
            .auth
            .signUp({
              email:
                cleanEmail,

              password:
                formData.password,

              options: {
                emailRedirectTo:
                  `${window.location.origin}/confirm`,

                data: {
                  signup_type:
                    'company_trial',

                  company_name:
                    cleanCompanyName,

                  full_name:
                    cleanFullName,

                  mobile:
                    `+91${formData.mobile}`,
                },
              },
            });

        if (
          signupError
        ) {
          throw signupError;
        }

        if (
          !data?.user
        ) {
          throw new Error(
            'Unable to create your account. Please try again.'
          );
        }

        setFormData(
          (
            previous
          ) => ({
            ...previous,

            companyName:
              cleanCompanyName,

            yourName:
              cleanFullName,

            email:
              cleanEmail,
          })
        );

        setSubmitted(
          true
        );

      } catch (err) {

        console.error(
          'Signup error:',
          err
        );

        setError(
          err?.message ||
            'Unable to create your account. Please try again.'
        );

      } finally {

        setLoading(
          false
        );

      }
    };

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <div
      className="
        relative
        min-h-full
        w-full
        overflow-x-hidden
        bg-[#050914]
        text-white

        lg:h-full
        lg:min-h-0
        lg:overflow-hidden
      "
    >

      {/* =====================================================
          BACKGROUND
      ===================================================== */}

      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">

        <img
          src="https://images.unsplash.com/photo-1519003722824-194d4455a60c?q=85&w=2400&auto=format&fit=crop"
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover object-center opacity-25"
        />

        <div className="absolute inset-0 bg-[#050914]/80" />

        <div className="absolute inset-0 bg-gradient-to-r from-[#050914] via-[#050914]/90 to-[#071329]/75" />

        <div className="absolute inset-0 bg-gradient-to-t from-[#050914] via-transparent to-[#050914]/65" />

        {/* GRID */}

        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(56,189,248,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.7) 1px, transparent 1px)',

            backgroundSize:
              '55px 55px',
          }}
        />

        {/* GLOWS */}

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_40%,rgba(6,182,212,0.10),transparent_30%),radial-gradient(circle_at_85%_40%,rgba(124,58,237,0.12),transparent_32%)]" />

        <AmbientOrb className="left-[4%] top-[15%] h-72 w-72 bg-cyan-500/20" />

        <AmbientOrb className="right-[5%] top-[20%] h-80 w-80 bg-violet-600/20" />

      </div>

      {/* =====================================================
          DESKTOP EFFECTS
      ===================================================== */}

      <div className="pointer-events-none absolute inset-0 z-[1] hidden overflow-hidden lg:block">

        <LightTrail
          delay={0}
          duration={8}
          bottom="bottom-[12%]"
          width="w-56"
        />

        <LightTrail
          delay={2.5}
          duration={9}
          bottom="bottom-[18%]"
          width="w-72"
        />

        <LightTrail
          delay={5}
          duration={7}
          bottom="bottom-[8%]"
          width="w-40"
        />

        <RadarPulse />

        <div className="absolute inset-x-0 bottom-0 h-20 overflow-hidden">

          <div className="absolute inset-x-0 bottom-1 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />

          <AnimatedTruck />

        </div>

      </div>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <div
        className="
          relative
          z-10
          mx-auto
          flex
          w-full
          max-w-[1280px]
          flex-col
          gap-7
          px-4
          py-7

          sm:gap-9
          sm:px-6
          sm:py-9

          lg:grid
          lg:h-full
          lg:grid-cols-[minmax(0,1fr)_430px]
          lg:items-center
          lg:gap-10
          lg:px-10
          lg:py-2

          xl:grid-cols-[minmax(0,1fr)_448px]
          xl:gap-16
        "
      >

        {/* =================================================
            HERO
        ================================================= */}

        <motion.section
          initial={{
            opacity: 0,
            x: -30,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          transition={{
            duration: 0.8,
          }}
          className="
            relative
            mx-auto
            w-full
            max-w-2xl
            text-center

            lg:mx-0
            lg:max-w-none
            lg:text-left
          "
        >

          {/* BADGE */}

          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-3.5 py-2 backdrop-blur-md sm:mb-5 sm:px-4">

            <span className="relative flex h-2 w-2">

              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />

              <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400" />

            </span>

            <span className="text-[8px] font-bold uppercase tracking-[0.18em] text-cyan-300 sm:text-[9px] xl:text-[10px]">
              Start Your Fleet Journey
            </span>

          </div>

          {/* HEADING */}

          <h1
            className="
              text-4xl
              font-black
              leading-[1.03]
              tracking-tight
              text-white

              sm:text-5xl
              lg:text-5xl
              xl:text-6xl
            "
          >
            Run your fleet

            <span className="block bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400 bg-clip-text text-transparent">
              smarter.
            </span>

          </h1>

          {/* DESCRIPTION */}

          <p
            className="
              mx-auto
              mt-4
              max-w-lg
              text-xs
              leading-6
              text-slate-400

              sm:mt-5
              sm:text-sm
              sm:leading-7

              lg:mx-0
              lg:max-w-md
            "
          >
            Bring vehicles, drivers, trips, expenses,
            compliance and workshop operations together
            in one intelligent transport command center.
          </p>

          {/* FEATURES */}

          <div
            className="
              mx-auto
              mt-5
              flex
              max-w-md
              flex-col
              items-start
              gap-2.5

              sm:mt-6

              lg:mx-0
              lg:mt-7
            "
          >

            {[
              '5-day free trial after email verification',
              'Centralized fleet operations',
              'Secure company-based access',
            ].map(
              (
                item
              ) => (
                <div
                  key={item}
                  className="flex items-center gap-3 text-left text-[10px] font-medium text-slate-300 sm:text-xs"
                >

                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-400/10 text-[9px] text-cyan-300">
                    ✓
                  </span>

                  {item}

                </div>
              )
            )}

          </div>

        </motion.section>

        {/* =================================================
            MOBILE / TABLET TRUCK
        ================================================= */}

        <MobileTruckScene />

        {/* =================================================
            SIGNUP CARD
        ================================================= */}

        <motion.section
          initial={{
            opacity: 0,
            y: 20,
            scale: 0.98,
          }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
          }}
          transition={{
            duration: 0.7,
            ease: 'easeOut',
          }}
          className="
            relative
            mx-auto
            w-full
            max-w-[448px]

            lg:mx-0
            lg:max-w-[430px]
            lg:justify-self-end

            xl:max-w-[448px]
          "
        >

          {/* OUTER GLOW */}

          <div className="absolute -inset-[1px] rounded-[26px] bg-gradient-to-br from-cyan-400/30 via-blue-500/10 to-violet-500/30 blur-xl sm:rounded-[30px]" />

          {/* CARD */}

          <div className="relative overflow-hidden rounded-[26px] border border-white/10 bg-[#07101f]/95 shadow-2xl shadow-black/60 backdrop-blur-2xl sm:rounded-[30px]">

            {/* TOP EDGE */}

            <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

            {/* GLOW */}

            <div className="pointer-events-none absolute -right-28 -top-28 h-56 w-56 rounded-full bg-cyan-500/10 blur-[80px]" />

            <div className="pointer-events-none absolute -bottom-28 -left-28 h-56 w-56 rounded-full bg-violet-600/10 blur-[80px]" />

            <div className="relative p-4 sm:p-5">

              {/* CARD HEADER */}

              <div className="mb-3">

                <div className="mb-2 flex items-center gap-1.5">

                  <span className="h-1.5 w-8 rounded-full bg-cyan-400" />

                  <span className="h-1.5 w-3 rounded-full bg-blue-500" />

                  <span className="h-1.5 w-2 rounded-full bg-violet-500" />

                </div>

                <h2 className="text-xl font-black tracking-tight text-white sm:text-2xl lg:text-xl xl:text-2xl">
                  Create your account
                </h2>

                <p className="mt-1 text-[10px] leading-4 text-slate-400 sm:text-[11px]">
                  Verify your email to activate your 5-day free trial.
                </p>

              </div>

              {!submitted ? (

                <form
                  onSubmit={
                    handleRegister
                  }
                  noValidate
                  className="space-y-2.5"
                >

                  {/* =========================================
                      COMPANY + NAME
                  ========================================= */}

                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">

                    {/* COMPANY */}

                    <div>

                      <label
                        htmlFor="companyName"
                        className="mb-1 block text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400"
                      >
                        Company Name
                      </label>

                      <input
                        id="companyName"
                        name="companyName"
                        type="text"
                        required
                        disabled={
                          loading
                        }
                        autoComplete="organization"
                        placeholder="Company name"
                        value={
                          formData.companyName
                        }
                        onChange={
                          handleChange
                        }
                        className={
                          normalInput
                        }
                      />

                    </div>

                    {/* NAME */}

                    <div>

                      <label
                        htmlFor="yourName"
                        className="mb-1 block text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400"
                      >
                        Your Name
                      </label>

                      <input
                        id="yourName"
                        name="yourName"
                        type="text"
                        required
                        disabled={
                          loading
                        }
                        autoComplete="name"
                        placeholder="Full name"
                        value={
                          formData.yourName
                        }
                        onChange={
                          handleChange
                        }
                        className={
                          normalInput
                        }
                      />

                    </div>

                  </div>

                  {/* =========================================
                      EMAIL
                  ========================================= */}

                  <div>

                    <label
                      htmlFor="email"
                      className="mb-1 block text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400"
                    >
                      Email Address
                    </label>

                    <div className="relative">

                      {/* PREFIX */}

                      <span
                        aria-hidden="true"
                        className="
                          pointer-events-none
                          absolute
                          left-4
                          top-1/2
                          z-10
                          -translate-y-1/2
                          text-[11px]
                          font-black
                          text-cyan-400/70
                        "
                      >
                        @
                      </span>

                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        disabled={
                          loading
                        }
                        autoComplete="email"
                        autoCapitalize="none"
                        spellCheck={false}
                        placeholder="name@company.com"
                        value={
                          formData.email
                        }
                        onChange={
                          handleChange
                        }
                        className={
                          emailInput
                        }
                      />

                    </div>

                  </div>

                  {/* =========================================
                      MOBILE
                  ========================================= */}

                  <div>

                    <label
                      htmlFor="mobile"
                      className="mb-1 block text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400"
                    >
                      Mobile Number
                    </label>

                    <div className="relative">

                      {/* PREFIX */}

                      <span
                        aria-hidden="true"
                        className="
                          pointer-events-none
                          absolute
                          left-4
                          top-1/2
                          z-10
                          -translate-y-1/2
                          border-r
                          border-white/10
                          pr-2
                          text-[10px]
                          font-bold
                          text-slate-500
                        "
                      >
                        +91
                      </span>

                      <input
                        id="mobile"
                        name="mobile"
                        type="tel"
                        required
                        disabled={
                          loading
                        }
                        autoComplete="tel"
                        inputMode="numeric"
                        maxLength={10}
                        placeholder="10-digit mobile number"
                        value={
                          formData.mobile
                        }
                        onChange={
                          handleChange
                        }
                        className={
                          mobileInput
                        }
                      />

                    </div>

                  </div>

                  {/* =========================================
                      PASSWORD
                  ========================================= */}

                  <div>

                    <label
                      htmlFor="password"
                      className="mb-1 block text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400"
                    >
                      Password
                    </label>

                    <div className="relative">

                      <input
                        id="password"
                        name="password"
                        type={
                          showPassword
                            ? 'text'
                            : 'password'
                        }
                        required
                        disabled={
                          loading
                        }
                        minLength={8}
                        maxLength={64}
                        autoComplete="new-password"
                        placeholder="Secure password"
                        value={
                          formData.password
                        }
                        onChange={
                          handleChange
                        }
                        className={
                          passwordInput
                        }
                      />

                      <button
                        type="button"
                        disabled={
                          loading
                        }
                        onClick={() =>
                          setShowPassword(
                            (
                              previous
                            ) =>
                              !previous
                          )
                        }
                        className="
                          absolute
                          right-2
                          top-1/2
                          -translate-y-1/2
                          rounded-md
                          px-2
                          py-1
                          text-[9px]
                          font-bold
                          text-slate-500
                          transition

                          hover:bg-white/5
                          hover:text-cyan-300

                          focus:outline-none
                          focus:ring-2
                          focus:ring-cyan-400/20

                          disabled:opacity-50
                        "
                        aria-label={
                          showPassword
                            ? 'Hide password'
                            : 'Show password'
                        }
                      >
                        {showPassword
                          ? 'HIDE'
                          : 'SHOW'}
                      </button>

                    </div>

                    {/* PASSWORD RULES */}

                    <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[8px]">

                      <span
                        className={
                          passwordRules.length
                            ? 'font-bold text-cyan-400'
                            : 'text-slate-500'
                        }
                      >
                        • 8–64 Chars
                      </span>

                      <span
                        className={
                          passwordRules.uppercase
                            ? 'font-bold text-cyan-400'
                            : 'text-slate-500'
                        }
                      >
                        • A-Z
                      </span>

                      <span
                        className={
                          passwordRules.lowercase
                            ? 'font-bold text-cyan-400'
                            : 'text-slate-500'
                        }
                      >
                        • a-z
                      </span>

                      <span
                        className={
                          passwordRules.number
                            ? 'font-bold text-cyan-400'
                            : 'text-slate-500'
                        }
                      >
                        • 0-9
                      </span>

                      <span
                        className={
                          passwordRules.symbol
                            ? 'font-bold text-cyan-400'
                            : 'text-slate-500'
                        }
                      >
                        • Symbol
                      </span>

                    </div>

                  </div>

                  {/* =========================================
                      ERROR
                  ========================================= */}

                  {error && (

                    <motion.div
                      initial={{
                        opacity: 0,
                        y: -4,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      className="rounded-lg border border-red-400/20 bg-red-400/[0.06] px-3 py-2"
                      role="alert"
                    >
                      <p className="text-[9px] leading-4 text-red-300">
                        {error}
                      </p>
                    </motion.div>

                  )}

                  {/* =========================================
                      TERMS
                  ========================================= */}

                  <label
                    htmlFor="terms"
                    className="group flex cursor-pointer items-start gap-2.5 select-none"
                  >

                    <input
                      id="terms"
                      name="terms"
                      type="checkbox"
                      disabled={
                        loading
                      }
                      checked={
                        formData.terms
                      }
                      onChange={
                        handleChange
                      }
                      className="peer sr-only"
                    />

                    <span
                      aria-hidden="true"
                      className="
                        mt-[1px]
                        flex
                        h-4
                        w-4
                        shrink-0
                        items-center
                        justify-center
                        rounded
                        border
                        border-white/15
                        bg-white/[0.03]
                        text-[9px]
                        font-black
                        text-transparent
                        transition

                        peer-focus:ring-2
                        peer-focus:ring-cyan-400/30

                        peer-checked:border-cyan-400
                        peer-checked:bg-cyan-400
                        peer-checked:text-slate-950
                      "
                    >
                      ✓
                    </span>

                    <span className="text-[8px] leading-4 text-slate-500 sm:text-[9px]">
                      I agree to use Buddy Fleets responsibly and provide accurate business information.
                    </span>

                  </label>

                  {/* =========================================
                      SUBMIT
                  ========================================= */}

                  <motion.button
                    whileHover={
                      !loading
                        ? {
                            y: -1,
                          }
                        : {}
                    }
                    whileTap={
                      !loading
                        ? {
                            scale: 0.99,
                          }
                        : {}
                    }
                    type="submit"
                    disabled={
                      loading
                    }
                    className="
                      group
                      relative
                      w-full
                      overflow-hidden
                      rounded-xl
                      bg-gradient-to-r
                      from-cyan-400
                      via-blue-500
                      to-violet-600
                      px-4
                      py-3
                      text-xs
                      font-black
                      text-white
                      shadow-xl
                      shadow-blue-600/20
                      transition-all
                      duration-300

                      hover:shadow-cyan-500/20

                      focus:outline-none
                      focus:ring-4
                      focus:ring-cyan-400/20

                      disabled:cursor-not-allowed
                      disabled:opacity-60

                      sm:rounded-2xl
                      sm:py-3.5
                      sm:text-sm

                      lg:py-3
                      lg:text-xs
                    "
                  >

                    <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

                    <span className="relative flex items-center justify-center gap-2">

                      {loading ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                          <span>
                            Creating Account...
                          </span>
                        </>
                      ) : (
                        <>
                          <span>
                            Start 5-Day Free Trial
                          </span>

                          <span className="text-base">
                            →
                          </span>
                        </>
                      )}

                    </span>

                  </motion.button>

                </form>

              ) : (

                /* =============================================
                   SUCCESS
                ============================================= */

                <motion.div
                  initial={{
                    opacity: 0,
                    scale: 0.96,
                    y: 8,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    y: 0,
                  }}
                  transition={{
                    duration: 0.5,
                  }}
                  className="py-4 text-center"
                >

                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-400/10 text-xl text-emerald-300 shadow-lg shadow-emerald-500/10">
                    ✓
                  </div>

                  <h3 className="mt-4 text-xl font-black text-white">
                    Check Your Email
                  </h3>

                  <p className="mt-2 break-words text-xs leading-5 text-slate-300">

                    We have sent a confirmation link to{' '}

                    <span className="font-semibold text-cyan-300">
                      {formData.email}
                    </span>

                    .

                  </p>

                  <div className="mt-4 rounded-2xl border border-cyan-400/15 bg-cyan-400/[0.04] p-4 text-left">

                    <p className="text-[10px] font-bold text-slate-200 sm:text-[11px]">
                      Verify your email to activate your trial
                    </p>

                    <p className="mt-1.5 text-[9px] leading-4 text-slate-500 sm:text-[10px]">
                      The confirmation link is valid for 1 hour.
                    </p>

                    <p className="mt-1 text-[9px] leading-4 text-slate-500 sm:text-[10px]">
                      Your Company Code and 5-day free trial will be activated only after successful email verification.
                    </p>

                  </div>

                  <Link
                    to="/login"
                    className="mt-5 inline-flex w-full items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] px-5 py-3 text-xs font-black text-slate-200 transition hover:bg-white/[0.09] hover:text-white sm:rounded-2xl"
                  >
                    Back to Login
                  </Link>

                </motion.div>

              )}

              {/* =========================================
                  LOGIN LINK
              ========================================= */}

              {!submitted && (

                <div className="mt-3 border-t border-white/[0.07] pt-2.5 text-center">

                  <p className="text-[9px] text-slate-500 sm:text-[10px]">

                    Already have a company account?{' '}

                    <Link
                      to="/login"
                      className="font-bold text-cyan-300 transition hover:text-cyan-200 hover:underline"
                    >
                      Log in here
                    </Link>

                  </p>

                </div>

              )}

            </div>

          </div>

        </motion.section>

      </div>

    </div>
  );
}