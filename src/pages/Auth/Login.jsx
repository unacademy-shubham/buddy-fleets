import React, {
  useState,
} from 'react';

import {
  Link,
} from 'react-router-dom';

import {
  buildPortalHandoffUrl,
  getSecureAuthMessage,
  secureLogin,
  verifyMfa,
} from '../../services/secureAuth';


/* =========================================================
   BUDDY FLEETS
   LOGIN PAGE

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
   - No external background image
   - No truck / radar / chart
   - No blinking effects
   - PageSpeed-first

   FINAL LOGIN SECURITY:

   Company Code
        +
   Registered Email
        +
   Password
        ↓
   secure-login Edge Function
        ↓
   Optional MFA (only when enabled by user)
        ↓
   secure-mfa Edge Function when required
        ↓
   One-time opaque handoff
        ↓
   Fixed portal callback
        ↓
   HttpOnly __Host-bf_session

   IMPORTANT:
   - Browser never receives Supabase access/refresh tokens
   - Browser does not authorize company membership
   - Browser does not query security tables
   - Company tenant authority remains server-side company_id
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

const companyCodeInput =
  `${inputBase} pl-10 pr-3.5 uppercase`;

const emailInput =
  `${inputBase} pl-10 pr-3.5`;

const passwordInput =
  `${inputBase} pl-3.5 pr-20`;

const mfaInput =
  `${inputBase} px-3.5 text-center tracking-[0.32em] font-black`;


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
   LOGIN
========================================================= */

export default function Login() {
  const [
    companyCode,
    setCompanyCode,
  ] = useState('');

  const [
    email,
    setEmail,
  ] = useState('');

  const [
    password,
    setPassword,
  ] = useState('');

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState('');

  const [
    isLoading,
    setIsLoading,
  ] = useState(false);

  const [
    authStage,
    setAuthStage,
  ] = useState(
    'credentials'
  );

  const [
    flowCode,
    setFlowCode,
  ] = useState('');

  const [
    mfaCode,
    setMfaCode,
  ] = useState('');


  /* =========================================================
     RESET SECURE LOGIN FLOW
  ========================================================= */

  const resetLoginFlow =
    () => {
      setAuthStage(
        'credentials'
      );

      setFlowCode('');

      setMfaCode('');

      setPassword('');

      setErrorMessage('');
    };


  /* =========================================================
     COMPLETE SECURE PORTAL HANDOFF
  ========================================================= */

  const completePortalHandoff =
    (
      result
    ) => {
      if (
        result?.nextStep !==
          'PORTAL_HANDOFF' ||
        !result?.targetHost ||
        !result?.handoffCode
      ) {
        throw new Error(
          'INVALID_HANDOFF'
        );
      }


      const portalUrl =
        buildPortalHandoffUrl({
          targetHost:
            result.targetHost,

          handoffCode:
            result.handoffCode,
        });


      /*
        Full document navigation is intentional.

        Login origin:
        buddyfleets.in

        Destination:
        developer.buddyfleets.in
        team.buddyfleets.in
        portal.buddyfleets.in

        Only the short-lived opaque handoff code crosses origins.
      */

      window.location.replace(
        portalUrl
      );
    };


  /* =========================================================
     PASSWORD LOGIN SUBMIT
  ========================================================= */

  const handleSubmit =
    async (
      event
    ) => {
      event.preventDefault();


      if (
        isLoading
      ) {
        return;
      }


      setErrorMessage('');


      const cleanCompanyCode =
        companyCode
          .trim()
          .toUpperCase();


      const cleanEmail =
        email
          .trim()
          .toLowerCase();


      /*
        IMPORTANT:
        Password intentionally not trimmed.
      */

      const cleanPassword =
        password;


      /* =====================================================
         COMPANY CODE
      ===================================================== */

      if (
        !cleanCompanyCode
      ) {
        setErrorMessage(
          'Please enter your Company Code.'
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
        setErrorMessage(
          'Please enter your registered email address.'
        );

        return;
      }


      /* =====================================================
         PASSWORD
      ===================================================== */

      if (
        !cleanPassword
      ) {
        setErrorMessage(
          'Please enter your password.'
        );

        return;
      }


      setIsLoading(
        true
      );


      try {
        /*
          Password authentication + role/company authorization
          happens entirely inside secure-login.

          Browser receives no Supabase session.
        */

        const result =
          await secureLogin({
            companyCode:
              cleanCompanyCode,

            email:
              cleanEmail,

            password:
              cleanPassword,
          });


        /*
          Password is no longer needed after secure-login
          succeeds, regardless of whether MFA is enabled.
        */

        setPassword('');


        /*
          MFA disabled:
          secure-login returns a one-time portal handoff
          immediately.
        */

        if (
          result?.nextStep ===
          'PORTAL_HANDOFF'
        ) {
          completePortalHandoff(
            result
          );

          return;
        }


        /*
          MFA enabled:
          secure-login returns a short-lived flowCode and the
          browser asks only for the existing authenticator code.

          Login NEVER enrolls a new MFA factor.
        */

        if (
          result?.nextStep ===
          'MFA_CHALLENGE'
        ) {
          const secureFlowCode =
            String(
              result?.flowCode ||
              ''
            ).trim();


          if (
            secureFlowCode.length <
            20
          ) {
            throw new Error(
              'LOGIN_FLOW_INVALID'
            );
          }


          setFlowCode(
            secureFlowCode
          );


          setAuthStage(
            'mfa-challenge'
          );

          return;
        }


        throw new Error(
          'LOGIN_FLOW_INVALID'
        );
      } catch (
        error
      ) {
        console.error(
          'Secure login error:',
          error?.code ||
          error?.message
        );


        setErrorMessage(
          getSecureAuthMessage(
            error
          )
        );
      } finally {
        setIsLoading(
          false
        );
      }
    };


  /* =========================================================
     MFA VERIFY
  ========================================================= */

  const handleMfaSubmit =
    async (
      event
    ) => {
      event.preventDefault();


      if (
        isLoading
      ) {
        return;
      }


      setErrorMessage('');


      const cleanCode =
        String(
          mfaCode ||
          ''
        )
          .replace(
            /\D/g,
            ''
          )
          .slice(
            0,
            6
          );


      if (
        cleanCode.length !==
        6
      ) {
        setErrorMessage(
          'Please enter the 6-digit authentication code.'
        );

        return;
      }


      if (
        !flowCode
      ) {
        setErrorMessage(
          'Your secure login session has expired. Please log in again.'
        );

        return;
      }


      setIsLoading(
        true
      );


      try {
        const result =
          await verifyMfa({
            flowCode,

            code:
              cleanCode,
          });


        completePortalHandoff(
          result
        );
      } catch (
        error
      ) {
        console.error(
          'Secure MFA error:',
          error?.code ||
          error?.message
        );


        const code =
          error?.code ||
          error?.message;


        if (
          code ===
            'LOGIN_FLOW_EXPIRED' ||
          code ===
            'LOGIN_FLOW_INVALID' ||
          code ===
            'SECURITY_CONTEXT_CHANGED'
        ) {
          setFlowCode('');
        }


        setErrorMessage(
          getSecureAuthMessage(
            error
          )
        );
      } finally {
        setIsLoading(
          false
        );
      }
    };


  /* =========================================================
     DERIVED UI STATE
  ========================================================= */

  const isMfaStage =
    authStage ===
    'mfa-challenge';


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
              'linear-gradient(rgba(100,116,139,.28) 1px, transparent 1px), linear-gradient(90deg, rgba(100,116,139,.28) 1px, transparent 1px)',

            backgroundSize:
              '72px 72px',
          }}
        />

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
          lg:grid-cols-[minmax(0,1fr)_420px]
          lg:gap-12
          lg:px-12
          lg:py-5
          xl:grid-cols-[minmax(0,1fr)_440px]
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
              Secure Console Access
            </span>
          </div>


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
              Welcome back to
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
              command center.
            </span>
          </h1>


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
            Access your fleet operations, compliance,
            workshops and financial information securely
            through your company workspace.
          </p>


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
              'Company-specific secure access',
              'Role & site based permissions',
              'Protected fleet operations',
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

            Secure Authentication + Optional MFA
          </div>
        </div>


        {/* =================================================
            LOGIN / MFA FORM AREA
        ================================================= */}

        <div
          className="
            relative
            mx-auto
            w-full
            max-w-[440px]
            lg:mx-0
            lg:justify-self-end
          "
        >
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
                p-5
                sm:p-6
              "
            >
              {/* ===============================================
                  FORM HEADER
              =============================================== */}

              <div className="mb-4">
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
                  {isMfaStage
                    ? 'Verify your identity'
                    : 'Log in to console'}
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
                  {isMfaStage
                    ? 'Enter the 6-digit code from your authenticator app.'
                    : 'Enter your Company Code and registered credentials.'}
                </p>
              </div>


              {/* ===============================================
                  ERROR
              =============================================== */}

              {errorMessage && (
                <div
                  className="
                    mb-3
                    rounded-xl
                    border
                    border-red-400/20
                    bg-red-400/[0.06]
                    px-3
                    py-2.5
                  "
                  role="alert"
                  aria-live="polite"
                >
                  <div
                    className="
                      flex
                      items-start
                      gap-2
                    "
                  >
                    <span
                      className="
                        mt-[1px]
                        flex
                        h-4
                        w-4
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        bg-red-400/10
                        text-[9px]
                        font-black
                        text-red-500
                      "
                    >
                      !
                    </span>

                    <p
                      className="
                        text-[9px]
                        leading-4
                        text-red-500
                        sm:text-[10px]
                      "
                    >
                      {errorMessage}
                    </p>
                  </div>
                </div>
              )}


              {/* ===============================================
                  CREDENTIAL FORM
              =============================================== */}

              {!isMfaStage && (
                <form
                  onSubmit={
                    handleSubmit
                  }
                  noValidate
                  className="
                    space-y-3
                  "
                >
                  {/* COMPANY CODE */}

                  <div>
                    <label
                      htmlFor="companyCode"
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
                      Company Code
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
                        #
                      </span>

                      <input
                        id="companyCode"
                        type="text"
                        required
                        disabled={
                          isLoading
                        }
                        autoComplete="organization"
                        autoCapitalize="characters"
                        spellCheck={false}
                        placeholder="BUDDY001"
                        value={
                          companyCode
                        }
                        onChange={(
                          event
                        ) => {
                          setCompanyCode(
                            event.target.value
                          );

                          setErrorMessage('');
                        }}
                        className={
                          companyCodeInput
                        }
                      />
                    </div>
                  </div>


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
                      Registered Email
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
                        type="email"
                        required
                        disabled={
                          isLoading
                        }
                        autoComplete="username"
                        autoCapitalize="none"
                        spellCheck={false}
                        placeholder="name@company.com"
                        value={
                          email
                        }
                        onChange={(
                          event
                        ) => {
                          setEmail(
                            event.target.value
                          );

                          setErrorMessage('');
                        }}
                        className={
                          emailInput
                        }
                      />
                    </div>
                  </div>


                  {/* PASSWORD */}

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
                        type={
                          showPassword
                            ? 'text'
                            : 'password'
                        }
                        required
                        disabled={
                          isLoading
                        }
                        autoComplete="current-password"
                        placeholder="Enter your password"
                        value={
                          password
                        }
                        onChange={(
                          event
                        ) => {
                          setPassword(
                            event.target.value
                          );

                          setErrorMessage('');
                        }}
                        className={
                          passwordInput
                        }
                      />

                      <button
                        type="button"
                        disabled={
                          isLoading
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

                    <div
                      className="
                        mt-1.5
                        text-right
                      "
                    >
                      <Link
                        to="/forgot-password"
                        className="
                          rounded
                          text-[9px]
                          font-bold
                          text-cyan-500
                          transition-colors
                          duration-200
                          hover:text-cyan-400
                          hover:underline
                          focus-visible:outline-none
                          focus-visible:ring-2
                          focus-visible:ring-cyan-400/30
                          sm:text-[10px]
                        "
                      >
                        Forgot Password?
                      </Link>
                    </div>
                  </div>


                  {/* LOGIN BUTTON */}

                  <button
                    type="submit"
                    disabled={
                      isLoading
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
                    {isLoading ? (
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
                          Verifying Access...
                        </span>
                      </>
                    ) : (
                      <>
                        <span>
                          Login
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
              )}


              {/* ===============================================
                  MFA FORM
              =============================================== */}

              {isMfaStage && (
                <form
                  onSubmit={
                    handleMfaSubmit
                  }
                  noValidate
                  className="
                    space-y-3
                  "
                >
                  <div
                    className="
                      rounded-xl
                      border
                      border-emerald-400/15
                      bg-emerald-400/[0.04]
                      px-3
                      py-2.5
                    "
                  >
                    <div
                      className="
                        flex
                        items-center
                        gap-2
                      "
                    >
                      <ShieldIcon
                        className="
                          h-4
                          w-4
                          shrink-0
                          text-emerald-500
                        "
                      />

                      <p
                        className="
                          text-[9px]
                          leading-4
                          text-[color:var(--bf-text-secondary)]
                        "
                      >
                        Two-factor authentication is enabled for this account. Enter the code from your authenticator app to continue.
                      </p>
                    </div>
                  </div>


                  <div>
                    <label
                      htmlFor="mfaCode"
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
                      Authentication Code
                    </label>

                    <input
                      id="mfaCode"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      autoComplete="one-time-code"
                      required
                      disabled={
                        isLoading
                      }
                      maxLength={6}
                      placeholder="000000"
                      value={
                        mfaCode
                      }
                      onChange={(
                        event
                      ) => {
                        const value =
                          event
                            .target
                            .value
                            .replace(
                              /\D/g,
                              ''
                            )
                            .slice(
                              0,
                              6
                            );

                        setMfaCode(
                          value
                        );

                        setErrorMessage('');
                      }}
                      className={
                        mfaInput
                      }
                    />
                  </div>


                  <button
                    type="submit"
                    disabled={
                      isLoading ||
                      mfaCode.length !==
                        6
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
                    {isLoading ? (
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
                          Verifying Code...
                        </span>
                      </>
                    ) : (
                      <>
                        <ShieldIcon
                          className="
                            h-4
                            w-4
                          "
                        />

                        <span>
                          Verify & Continue
                        </span>
                      </>
                    )}
                  </button>


                  <button
                    type="button"
                    disabled={
                      isLoading
                    }
                    onClick={
                      resetLoginFlow
                    }
                    className="
                      w-full
                      rounded-lg
                      py-1.5
                      text-[9px]
                      font-bold
                      text-[color:var(--bf-text-muted)]
                      transition-colors
                      hover:text-cyan-500
                      disabled:opacity-50
                    "
                  >
                    Restart secure login
                  </button>
                </form>
              )}


              {/* ===============================================
                  SIGNUP LINK
              =============================================== */}

              {!isMfaStage && (
                <div
                  className="
                    mt-4
                    border-t
                    border-[color:var(--bf-border)]
                    pt-3
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
                    New to Buddy Fleets?{' '}

                    <Link
                      to="/signup"
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
                      Start your 5-day free trial
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