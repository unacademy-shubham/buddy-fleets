import React, {
  useState,
} from 'react';

import {
  Link,
} from 'react-router-dom';

import { supabase } from '../../supabaseClient';

/* =========================================================
   BUDDY FLEETS
   SIGNUP PAGE

   WebsiteLayout handles:
   - Header
   - Development notice
   - Footer
   - Dark / Light theme

   DESIGN RULE:
   - One unified auth canvas
   - No separate visual sections
   - Same website theme system
   - No Framer Motion
   - No heavy background image
   - No truck / radar / chart
   - No blinking effects
   - PageSpeed-first

   SIGNUP WORKFLOW:

   Signup
      ↓
   Supabase Auth
      ↓
   handle_new_auth_user()
      ↓
   Pending Company
      ↓
   Email Confirmation
      ↓
   BUDDYxxx Company Code
      ↓
   Active Membership
      ↓
   5-Day Trial
========================================================= */

/* =========================================================
   INPUT STYLES
========================================================= */

const inputBase = `
  w-full

  rounded-xl

  border
  border-[color:var(--bf-border)]

  bg-[var(--bf-page-bg)]

  py-2.5

  text-xs
  text-[color:var(--bf-text-primary)]

  outline-none

  transition-colors
  duration-200

  placeholder:text-[color:var(--bf-text-muted)]

  hover:border-cyan-400/25

  focus:border-cyan-400/45
  focus:ring-2
  focus:ring-cyan-400/[0.07]

  disabled:cursor-not-allowed
  disabled:opacity-60

  sm:text-sm
`;

const normalInput =
  `${inputBase} px-3.5`;

const emailInput =
  `${inputBase} pl-10 pr-3.5`;

const mobileInput =
  `${inputBase} pl-[62px] pr-3.5`;

const passwordInput =
  `${inputBase} pl-3.5 pr-20`;

/* =========================================================
   ICONS
========================================================= */

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

function ShieldIcon({
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
        d="M12 3 19 6v5c0 4.5-2.8 8-7 10-4.2-2-7-5.5-7-10V6l7-3Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />

      <path
        d="m9 12 2 2 4-4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
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

      /* =====================================================
         COMPANY
      ===================================================== */

      if (
        !cleanCompanyName
      ) {
        setError(
          'Please enter your company name.'
        );

        return;
      }

      /* =====================================================
         NAME
      ===================================================== */

      if (
        !cleanFullName
      ) {
        setError(
          'Please enter your full name.'
        );

        return;
      }

      /* =====================================================
         EMAIL
      ===================================================== */

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

      /* =====================================================
         MOBILE
      ===================================================== */

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

      /* =====================================================
         PASSWORD
      ===================================================== */

      if (
        !isPasswordValid
      ) {
        setError(
          'Password must be 8–64 characters and include at least one uppercase letter, one lowercase letter, one number and one special character.'
        );

        return;
      }

      /* =====================================================
         TERMS
      ===================================================== */

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
           Pending Company
              ↓
           Email Confirmation
              ↓
           BUDDYxxx Company Code
              ↓
           Active Membership
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
        isolate

        flex
        w-full
        flex-1

        overflow-hidden

        bg-[var(--bf-page-bg)]

        text-[color:var(--bf-text-primary)]

        transition-colors
        duration-300
      "
    >
      {/* =====================================================
          SINGLE UNIFIED BACKGROUND
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
        {/* BASE */}

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

            opacity-[0.035]
          "
          style={{
            backgroundImage:
              'linear-gradient(rgba(100,116,139,.28) 1px, transparent 1px), linear-gradient(90deg, rgba(100,116,139,.28) 1px, transparent 1px)',

            backgroundSize:
              '72px 72px',
          }}
        />

        {/* LEFT CYAN GLOW */}

        <div
          className="
            absolute
            -left-48
            top-[-80px]

            h-[480px]
            w-[480px]

            rounded-full

            bg-cyan-500/[0.065]

            blur-[135px]
          "
        />

        {/* RIGHT BLUE GLOW */}

        <div
          className="
            absolute
            -right-52
            top-[5%]

            h-[500px]
            w-[500px]

            rounded-full

            bg-blue-500/[0.055]

            blur-[145px]
          "
        />

        {/* CENTER GREEN GLOW */}

        <div
          className="
            absolute
            bottom-[-240px]
            left-[38%]

            h-[420px]
            w-[420px]

            rounded-full

            bg-emerald-500/[0.04]

            blur-[130px]
          "
        />
      </div>

      {/* =====================================================
          ONE UNIFIED AUTH CANVAS

          No separate Hero Section.
          No separate Feature Section.
          No separate visual panel split.

          Left content + right form are part of one grid.
      ===================================================== */}

      <div
        className="
          relative

          mx-auto

          grid
          w-full
          max-w-7xl

          items-center

          gap-7

          px-5
          py-6

          sm:px-8
          sm:py-7

          lg:grid-cols-[minmax(0,1fr)_440px]
          lg:gap-12
          lg:px-12
          lg:py-5

          xl:grid-cols-[minmax(0,1fr)_460px]
          xl:gap-16
        "
      >
        {/* =================================================
            LEFT CONTENT
        ================================================= */}

        <div
          className="
            mx-auto

            w-full
            max-w-2xl

            text-center

            lg:mx-0
            lg:text-left
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

              px-3.5
              py-2
            "
          >
            <span
              className="
                h-1.5
                w-1.5

                rounded-full

                bg-emerald-500
              "
            />

            <span
              className="
                text-[8px]
                font-black
                uppercase
                tracking-[0.19em]

                text-cyan-500

                sm:text-[9px]
              "
            >
              Start Your Fleet Journey
            </span>
          </div>

          {/* HEADING */}

          <h1
            className="
              mt-4

              text-[clamp(2.15rem,4.2vw,3.75rem)]

              font-black

              leading-[1.04]

              tracking-[-0.035em]
            "
          >
            <span
              className="
                block

                text-[color:var(--bf-text-primary)]
              "
            >
              Run your fleet
            </span>

            <span
              className="
                block

                bg-gradient-to-r
                from-[#12BFF2]
                via-[#078EE5]
                to-[#0AA23B]

                bg-clip-text
                text-transparent
              "
            >
              smarter.
            </span>
          </h1>

          {/* DESCRIPTION */}

          <p
            className="
              mx-auto
              mt-3.5

              max-w-lg

              text-xs
              leading-6

              text-[color:var(--bf-text-secondary)]

              sm:text-sm
              sm:leading-7

              lg:mx-0
            "
          >
            Bring vehicles, drivers, trips, expenses,
            compliance and workshop operations together
            in one intelligent transport command center.
          </p>

          {/* SUPPORTING POINTS */}

          <div
            className="
              mx-auto
              mt-5

              flex
              max-w-lg
              flex-col

              gap-2.5

              lg:mx-0
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
                  key={
                    item
                  }
                  className="
                    flex
                    items-center
                    gap-3

                    text-left

                    text-[10px]
                    font-medium

                    text-[color:var(--bf-text-secondary)]

                    sm:text-xs
                  "
                >
                  <span
                    className="
                      flex
                      h-5
                      w-5

                      shrink-0

                      items-center
                      justify-center

                      rounded-lg

                      border
                      border-cyan-400/20

                      bg-cyan-400/[0.06]

                      text-cyan-500
                    "
                  >
                    <CheckIcon
                      className="
                        h-3
                        w-3
                      "
                    />
                  </span>

                  <span>
                    {item}
                  </span>
                </div>
              )
            )}
          </div>

          {/* SECURITY LINE */}

          <div
            className="
              mx-auto
              mt-5

              flex
              max-w-lg

              items-center
              justify-center

              gap-2

              text-[8px]
              font-semibold
              uppercase
              tracking-[0.14em]

              text-[color:var(--bf-text-muted)]

              lg:mx-0
              lg:justify-start
            "
          >
            <ShieldIcon
              className="
                h-3.5
                w-3.5

                text-emerald-500
              "
            />

            Supabase Secure Authentication
          </div>
        </div>

        {/* =================================================
            SIGNUP FORM AREA

            Still part of same unified canvas.
            No separate page section.
        ================================================= */}

        <div
          className="
            relative

            mx-auto

            w-full
            max-w-[460px]

            lg:mx-0
            lg:justify-self-end
          "
        >
          {/* SOFT OUTER GLOW */}

          <div
            aria-hidden="true"
            className="
              absolute
              -inset-[1px]

              rounded-[25px]

              bg-gradient-to-br
              from-cyan-400/18
              via-blue-500/[0.05]
              to-emerald-500/14

              blur-xl
            "
          />

          {/* FORM SURFACE */}

          <div
            className="
              relative

              overflow-hidden

              rounded-[24px]

              border
              border-[color:var(--bf-border)]

              bg-[var(--bf-surface)]

              shadow-2xl
              shadow-black/10

              backdrop-blur-xl
            "
          >
            {/* TOP GRADIENT LINE */}

            <div
              className="
                absolute
                left-0
                right-0
                top-0

                h-px

                bg-gradient-to-r
                from-transparent
                via-cyan-400
                to-transparent
              "
            />

            {/* STATIC CARD GLOW */}

            <div
              aria-hidden="true"
              className="
                pointer-events-none

                absolute
                -right-28
                -top-28

                h-56
                w-56

                rounded-full

                bg-cyan-500/[0.055]

                blur-[80px]
              "
            />

            <div
              className="
                relative

                p-4

                sm:p-5
              "
            >
              {/* ===============================================
                  FORM HEADER
              =============================================== */}

              <div className="mb-3">

                <div
                  className="
                    mb-2

                    flex
                    items-center
                    gap-1.5
                  "
                >
                  <span
                    className="
                      h-1.5
                      w-8

                      rounded-full

                      bg-[#12BFF2]
                    "
                  />

                  <span
                    className="
                      h-1.5
                      w-3

                      rounded-full

                      bg-[#078EE5]
                    "
                  />

                  <span
                    className="
                      h-1.5
                      w-2

                      rounded-full

                      bg-[#0AA23B]
                    "
                  />
                </div>

                <h2
                  className="
                    text-xl
                    font-black
                    tracking-tight

                    text-[color:var(--bf-text-primary)]

                    sm:text-2xl
                  "
                >
                  Create your account
                </h2>

                <p
                  className="
                    mt-1

                    text-[10px]
                    leading-4

                    text-[color:var(--bf-text-muted)]

                    sm:text-[11px]
                  "
                >
                  Verify your email to activate your 5-day free trial.
                </p>
              </div>

              {!submitted ? (
                /* ===============================================
                   FORM
                =============================================== */

                <form
                  onSubmit={
                    handleRegister
                  }
                  noValidate
                  className="
                    space-y-2.5
                  "
                >
                  {/* =============================================
                      COMPANY + NAME
                  ============================================= */}

                  <div
                    className="
                      grid
                      grid-cols-1

                      gap-2.5

                      sm:grid-cols-2
                    "
                  >
                    {/* COMPANY */}

                    <div>
                      <label
                        htmlFor="companyName"
                        className="
                          mb-1

                          block

                          text-[8px]
                          font-bold
                          uppercase
                          tracking-[0.13em]

                          text-[color:var(--bf-text-muted)]

                          sm:text-[9px]
                        "
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
                        className="
                          mb-1

                          block

                          text-[8px]
                          font-bold
                          uppercase
                          tracking-[0.13em]

                          text-[color:var(--bf-text-muted)]

                          sm:text-[9px]
                        "
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

                  {/* =============================================
                      EMAIL + MOBILE
                  ============================================= */}

                  <div
                    className="
                      grid
                      grid-cols-1

                      gap-2.5

                      sm:grid-cols-2
                    "
                  >
                    {/* EMAIL */}

                    <div>
                      <label
                        htmlFor="email"
                        className="
                          mb-1

                          block

                          text-[8px]
                          font-bold
                          uppercase
                          tracking-[0.13em]

                          text-[color:var(--bf-text-muted)]

                          sm:text-[9px]
                        "
                      >
                        Email Address
                      </label>

                      <div className="relative">

                        <span
                          aria-hidden="true"
                          className="
                            pointer-events-none

                            absolute
                            left-3.5
                            top-1/2
                            z-10

                            -translate-y-1/2

                            text-[11px]
                            font-black

                            text-cyan-500
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

                    {/* MOBILE */}

                    <div>
                      <label
                        htmlFor="mobile"
                        className="
                          mb-1

                          block

                          text-[8px]
                          font-bold
                          uppercase
                          tracking-[0.13em]

                          text-[color:var(--bf-text-muted)]

                          sm:text-[9px]
                        "
                      >
                        Mobile Number
                      </label>

                      <div className="relative">

                        <span
                          aria-hidden="true"
                          className="
                            pointer-events-none

                            absolute
                            left-3
                            top-1/2
                            z-10

                            -translate-y-1/2

                            border-r
                            border-[color:var(--bf-border)]

                            pr-2

                            text-[9px]
                            font-bold

                            text-[color:var(--bf-text-muted)]
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
                          placeholder="10-digit number"
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
                  </div>

                  {/* =============================================
                      PASSWORD
                  ============================================= */}

                  <div>
                    <label
                      htmlFor="password"
                      className="
                        mb-1

                        block

                        text-[8px]
                        font-bold
                        uppercase
                        tracking-[0.13em]

                        text-[color:var(--bf-text-muted)]

                        sm:text-[9px]
                      "
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

                          rounded-lg

                          px-2.5
                          py-1.5

                          text-[8px]
                          font-black

                          text-[color:var(--bf-text-muted)]

                          transition-colors
                          duration-200

                          hover:bg-cyan-400/[0.06]
                          hover:text-cyan-500

                          focus-visible:outline-none
                          focus-visible:ring-2
                          focus-visible:ring-cyan-400/30

                          disabled:opacity-50

                          sm:text-[9px]
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

                    <div
                      className="
                        mt-1.5

                        flex
                        flex-wrap

                        items-center

                        gap-x-2.5
                        gap-y-1

                        text-[8px]
                      "
                    >
                      <span
                        className={
                          passwordRules.length
                            ? 'font-bold text-emerald-500'
                            : 'text-[color:var(--bf-text-muted)]'
                        }
                      >
                        • 8–64 Chars
                      </span>

                      <span
                        className={
                          passwordRules.uppercase
                            ? 'font-bold text-emerald-500'
                            : 'text-[color:var(--bf-text-muted)]'
                        }
                      >
                        • A-Z
                      </span>

                      <span
                        className={
                          passwordRules.lowercase
                            ? 'font-bold text-emerald-500'
                            : 'text-[color:var(--bf-text-muted)]'
                        }
                      >
                        • a-z
                      </span>

                      <span
                        className={
                          passwordRules.number
                            ? 'font-bold text-emerald-500'
                            : 'text-[color:var(--bf-text-muted)]'
                        }
                      >
                        • 0-9
                      </span>

                      <span
                        className={
                          passwordRules.symbol
                            ? 'font-bold text-emerald-500'
                            : 'text-[color:var(--bf-text-muted)]'
                        }
                      >
                        • Symbol
                      </span>
                    </div>
                  </div>

                  {/* =============================================
                      ERROR
                  ============================================= */}

                  {error && (
                    <div
                      className="
                        rounded-xl

                        border
                        border-red-400/20

                        bg-red-400/[0.06]

                        px-3
                        py-2
                      "
                      role="alert"
                      aria-live="polite"
                    >
                      <p
                        className="
                          text-[9px]
                          leading-4

                          text-red-500

                          sm:text-[10px]
                        "
                      >
                        {error}
                      </p>
                    </div>
                  )}

                  {/* =============================================
                      TERMS
                  ============================================= */}

                  <label
                    htmlFor="terms"
                    className="
                      group

                      flex
                      cursor-pointer

                      select-none

                      items-start
                      gap-2.5
                    "
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
                      className="
                        peer
                        sr-only
                      "
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
                        border-[color:var(--bf-border)]

                        bg-[var(--bf-page-bg)]

                        text-[9px]
                        font-black
                        text-transparent

                        transition-colors
                        duration-200

                        peer-focus-visible:ring-2
                        peer-focus-visible:ring-cyan-400/30

                        peer-checked:border-cyan-500
                        peer-checked:bg-cyan-500
                        peer-checked:text-white
                      "
                    >
                      ✓
                    </span>

                    <span
                      className="
                        text-[8px]
                        leading-4

                        text-[color:var(--bf-text-muted)]

                        sm:text-[9px]
                      "
                    >
                      I agree to use Buddy Fleets responsibly and provide accurate business information.
                    </span>
                  </label>

                  {/* =============================================
                      SUBMIT
                  ============================================= */}

                  <button
                    type="submit"
                    disabled={
                      loading
                    }
                    className="
                      group

                      flex
                      min-h-11
                      w-full

                      items-center
                      justify-center

                      gap-2

                      rounded-xl

                      bg-gradient-to-r
                      from-[#12BFF2]
                      via-[#078EE5]
                      to-[#0AA23B]

                      px-4
                      py-2.5

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
                      focus-visible:ring-cyan-400/50

                      disabled:cursor-not-allowed
                      disabled:opacity-60
                      disabled:hover:translate-y-0

                      sm:text-sm
                    "
                  >
                    {loading ? (
                      <>
                        <span
                          className="
                            h-4
                            w-4

                            animate-spin

                            rounded-full

                            border-2
                            border-white/30
                            border-t-white
                          "
                        />

                        <span>
                          Creating Account...
                        </span>
                      </>
                    ) : (
                      <>
                        <span>
                          Start 5-Day Free Trial
                        </span>

                        <ArrowIcon
                          className="
                            h-4
                            w-4

                            transition-transform
                            duration-200

                            group-hover:translate-x-0.5
                          "
                        />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* ===============================================
                   SUCCESS STATE
                =============================================== */

                <div
                  className="
                    py-2
                    text-center
                  "
                >
                  <div
                    className="
                      mx-auto

                      flex
                      h-14
                      w-14

                      items-center
                      justify-center

                      rounded-2xl

                      border
                      border-emerald-400/25

                      bg-emerald-400/[0.08]

                      text-emerald-500
                    "
                  >
                    <MailIcon
                      className="
                        h-6
                        w-6
                      "
                    />
                  </div>

                  <h3
                    className="
                      mt-4

                      text-xl
                      font-black

                      text-[color:var(--bf-text-primary)]
                    "
                  >
                    Check Your Email
                  </h3>

                  <p
                    className="
                      mt-2

                      break-words

                      text-xs
                      leading-5

                      text-[color:var(--bf-text-secondary)]
                    "
                  >
                    We have sent a confirmation link to{' '}

                    <span
                      className="
                        font-semibold
                        text-cyan-500
                      "
                    >
                      {formData.email}
                    </span>

                    .
                  </p>

                  <div
                    className="
                      mt-4

                      rounded-2xl

                      border
                      border-cyan-400/15

                      bg-cyan-400/[0.04]

                      p-4

                      text-left
                    "
                  >
                    <p
                      className="
                        text-[10px]
                        font-bold

                        text-[color:var(--bf-text-primary)]

                        sm:text-[11px]
                      "
                    >
                      Verify your email to activate your trial
                    </p>

                    <p
                      className="
                        mt-1.5

                        text-[9px]
                        leading-4

                        text-[color:var(--bf-text-muted)]

                        sm:text-[10px]
                      "
                    >
                      The confirmation link is valid for 1 hour.
                    </p>

                    <p
                      className="
                        mt-1

                        text-[9px]
                        leading-4

                        text-[color:var(--bf-text-muted)]

                        sm:text-[10px]
                      "
                    >
                      Your Company Code and 5-day free trial will be activated only after successful email verification.
                    </p>
                  </div>

                  <Link
                    to="/login"
                    className="
                      mt-4

                      inline-flex
                      min-h-11
                      w-full

                      items-center
                      justify-center

                      rounded-xl

                      border
                      border-[color:var(--bf-border)]

                      bg-[var(--bf-page-bg)]

                      px-5
                      py-2.5

                      text-xs
                      font-black

                      text-[color:var(--bf-text-primary)]

                      transition-colors
                      duration-200

                      hover:border-cyan-400/30
                      hover:bg-cyan-400/[0.04]

                      focus-visible:outline-none
                      focus-visible:ring-2
                      focus-visible:ring-cyan-400/30
                    "
                  >
                    Back to Login
                  </Link>
                </div>
              )}

              {/* ===============================================
                  LOGIN LINK
              =============================================== */}

              {!submitted && (
                <div
                  className="
                    mt-3

                    border-t
                    border-[color:var(--bf-border)]

                    pt-2.5

                    text-center
                  "
                >
                  <p
                    className="
                      text-[9px]

                      text-[color:var(--bf-text-muted)]

                      sm:text-[10px]
                    "
                  >
                    Already have a company account?{' '}

                    <Link
                      to="/login"
                      className="
                        font-bold

                        text-cyan-500

                        transition-colors
                        duration-200

                        hover:text-cyan-400
                        hover:underline

                        focus-visible:outline-none
                        focus-visible:ring-2
                        focus-visible:ring-cyan-400/30
                      "
                    >
                      Log in here
                    </Link>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}