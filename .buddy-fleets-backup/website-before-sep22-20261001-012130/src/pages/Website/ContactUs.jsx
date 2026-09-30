import React, {
  useEffect,
  useRef,
  useState,
} from 'react';

import { Link } from 'react-router-dom';

import { supabase } from '../../supabaseClient';

/* =========================================================
   ENQUIRY OPTIONS
========================================================= */

const ENQUIRY_OPTIONS = [
  {
    value: 'Buddy Fleets',
    label: 'Buddy Fleets',
  },
  {
    value: 'Product Demo',
    label: 'Product Demo',
  },
  {
    value: 'Free Trial',
    label: '5-Day Free Trial',
  },
  {
    value: 'Sales',
    label: 'Sales Enquiry',
  },
  {
    value: 'Partnership',
    label: 'Business / Partnership',
  },
  {
    value: 'Technical',
    label: 'Technical Enquiry',
  },
  {
    value: 'Other',
    label: 'Other',
  },
];

/* =========================================================
   ENQUIRY TYPES
========================================================= */

const ENQUIRY_TYPES = [
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
];

/* =========================================================
   ICONS
========================================================= */

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

function UserIcon({
  className = '',
}) {
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

function BuildingIcon({
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

function PhoneIcon({
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
        d="M7.5 3h3l1.4 4-2.1 1.6c1 2.3 2.8 4.1 5.1 5.1l1.6-2.1 4 1.4v3c0 1.1-.9 2-2 2C10.5 18 6 13.5 6 5.5c0-1.4.6-2.5 1.5-2.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MessageIcon({
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

function SendIcon({
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

function ChevronIcon({
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
        d="m6 9 6 6 6-6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
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

function CheckCircleIcon({
  className = '',
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="1.8"
      />

      <path
        d="m8 12 2.5 2.5L16 9"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AlertIcon({
  className = '',
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="1.8"
      />

      <path
        d="M12 7v6M12 17h.01"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* =========================================================
   CUSTOM SELECT

   No native browser <select>.
========================================================= */

function CustomSelect({
  value,
  options,
  onChange,
  disabled = false,
}) {
  const wrapperRef =
    useRef(null);

  const [
    open,
    setOpen,
  ] = useState(false);

  const [
    activeIndex,
    setActiveIndex,
  ] = useState(0);

  const selectedIndex =
    Math.max(
      0,
      options.findIndex(
        (option) =>
          option.value ===
          value
      )
    );

  const selected =
    options[selectedIndex] ||
    options[0];

  /* =======================================================
     CLOSE OUTSIDE
  ======================================================= */

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    function handleOutside(
      event
    ) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(
          event.target
        )
      ) {
        setOpen(false);
      }
    }

    document.addEventListener(
      'pointerdown',
      handleOutside
    );

    return () => {
      document.removeEventListener(
        'pointerdown',
        handleOutside
      );
    };
  }, [
    open,
  ]);

  /* =======================================================
     ACTIVE OPTION
  ======================================================= */

  useEffect(() => {
    if (open) {
      setActiveIndex(
        selectedIndex
      );
    }
  }, [
    open,
    selectedIndex,
  ]);

  function selectOption(
    option
  ) {
    onChange(
      option.value
    );

    setOpen(false);
  }

  function handleKeyDown(
    event
  ) {
    if (disabled) {
      return;
    }

    if (
      event.key === 'Enter' ||
      event.key === ' '
    ) {
      event.preventDefault();

      if (!open) {
        setOpen(true);
      } else {
        selectOption(
          options[
            activeIndex
          ]
        );
      }

      return;
    }

    if (
      event.key ===
      'ArrowDown'
    ) {
      event.preventDefault();

      if (!open) {
        setOpen(true);
        return;
      }

      setActiveIndex(
        (current) =>
          Math.min(
            current + 1,
            options.length - 1
          )
      );

      return;
    }

    if (
      event.key ===
      'ArrowUp'
    ) {
      event.preventDefault();

      if (!open) {
        setOpen(true);
        return;
      }

      setActiveIndex(
        (current) =>
          Math.max(
            current - 1,
            0
          )
      );

      return;
    }

    if (
      event.key === 'Escape'
    ) {
      setOpen(false);
    }
  }

  return (
    <div
      ref={wrapperRef}
      className="relative"
    >
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => {
          if (!disabled) {
            setOpen(
              (current) =>
                !current
            );
          }
        }}
        onKeyDown={
          handleKeyDown
        }
        className={`
          flex
          min-h-11
          w-full
          items-center
          justify-between
          gap-4

          rounded-xl
          border

          px-3.5
          py-2.5

          text-left
          text-sm

          outline-none

          transition
          duration-200

          ${
            open
              ? `
                border-cyan-400/40
                bg-[var(--bf-page-bg)]
                ring-2
                ring-cyan-400/[0.06]
              `
              : `
                border-[color:var(--bf-border)]
                bg-[var(--bf-page-bg)]
                hover:border-cyan-400/25
              `
          }

          ${
            disabled
              ? `
                cursor-not-allowed
                opacity-60
              `
              : 'cursor-pointer'
          }
        `}
      >
        <span
          className="
            font-medium
            text-[color:var(--bf-text-primary)]
          "
        >
          {selected?.label}
        </span>

        <ChevronIcon
          className={`
            h-4
            w-4
            shrink-0

            text-[color:var(--bf-text-muted)]

            transition-transform
            duration-200

            ${
              open
                ? `
                  rotate-180
                  text-cyan-500
                `
                : ''
            }
          `}
        />
      </button>

      {open &&
        !disabled && (
          <div
            role="listbox"
            className="
              absolute
              left-0
              right-0
              top-[calc(100%+6px)]
              z-50

              max-h-64
              overflow-y-auto

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
            {options.map(
              (
                option,
                index
              ) => {
                const isSelected =
                  option.value ===
                  value;

                const isActive =
                  index ===
                  activeIndex;

                return (
                  <button
                    key={
                      option.value
                    }
                    type="button"
                    role="option"
                    aria-selected={
                      isSelected
                    }
                    onMouseEnter={() =>
                      setActiveIndex(
                        index
                      )
                    }
                    onClick={() =>
                      selectOption(
                        option
                      )
                    }
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

                      ${
                        isSelected
                          ? `
                            bg-cyan-500/[0.09]
                            text-cyan-500
                          `
                          : isActive
                            ? `
                              bg-cyan-500/[0.04]
                              text-[color:var(--bf-text-primary)]
                            `
                            : `
                              text-[color:var(--bf-text-secondary)]
                              hover:bg-cyan-500/[0.04]
                            `
                      }
                    `}
                  >
                    <span>
                      {
                        option.label
                      }
                    </span>

                    {isSelected && (
                      <span
                        className="
                          flex
                          h-5
                          w-5
                          items-center
                          justify-center
                          rounded-md
                          bg-cyan-500/[0.08]
                          text-cyan-500
                        "
                      >
                        <CheckIcon
                          className="h-3 w-3"
                        />
                      </span>
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
   CONTACT PERSON CARD
========================================================= */

function ContactPerson({
  name,
  role,
  description,
  email,
  instagramUrl,
  instagramHandle,
  index = 0,
}) {
  const cyan =
    index === 0;

  return (
    <article
      className="
        group
        relative
        overflow-hidden
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
      <div
        aria-hidden="true"
        className={`
          pointer-events-none
          absolute
          -right-16
          -top-16
          h-40
          w-40
          rounded-full
          blur-[80px]

          ${
            cyan
              ? 'bg-cyan-500/[0.07]'
              : 'bg-blue-500/[0.07]'
          }
        `}
      />

      <div className="relative">

        <div
          className="
            flex
            items-start
            gap-3
          "
        >
          <div
            className={`
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-xl
              border

              ${
                cyan
                  ? `
                    border-cyan-400/20
                    bg-cyan-400/[0.07]
                    text-cyan-500
                  `
                  : `
                    border-blue-400/20
                    bg-blue-400/[0.07]
                    text-blue-500
                  `
              }
            `}
          >
            <UserIcon
              className="h-4 w-4"
            />
          </div>

          <div className="min-w-0">

            <h3
              className="
                text-base
                font-black
                text-[color:var(--bf-text-primary)]
              "
            >
              {name}
            </h3>

            <p
              className={`
                mt-1
                text-[8px]
                font-black
                uppercase
                tracking-[0.16em]

                ${
                  cyan
                    ? 'text-cyan-500'
                    : 'text-blue-500'
                }
              `}
            >
              {role}
            </p>
          </div>
        </div>

        {description && (
          <p
            className="
              mt-4
              text-sm
              leading-6
              text-[color:var(--bf-text-secondary)]
            "
          >
            {description}
          </p>
        )}

        <div
          className="
            mt-4
            space-y-2
          "
        >
          {email && (
            <a
              href={`mailto:${email}`}
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
                  bg-cyan-500/[0.07]
                  text-cyan-500
                "
              >
                <MailIcon
                  className="h-3.5 w-3.5"
                />
              </span>

              <span className="truncate">
                {email}
              </span>
            </a>
          )}

          {instagramUrl && (
            <a
              href={
                instagramUrl
              }
              target="_blank"
              rel="noopener noreferrer"
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

                hover:border-pink-400/25
                hover:text-pink-500
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
                  bg-pink-500/[0.07]
                  text-pink-500
                "
              >
                <InstagramIcon
                  className="h-3.5 w-3.5"
                />
              </span>

              <span className="truncate">
                {instagramHandle ||
                  'Instagram'}
              </span>
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   CONTACT LOADING CARD
========================================================= */

function ContactLoadingCard() {
  return (
    <div
      className="
        rounded-[22px]
        border
        border-[color:var(--bf-border)]
        bg-[var(--bf-surface)]
        p-5
      "
    >
      <div
        className="
          flex
          items-center
          gap-3
        "
      >
        <div
          className="
            h-10
            w-10
            animate-pulse
            rounded-xl
            bg-[var(--bf-page-bg)]
          "
        />

        <div className="flex-1">

          <div
            className="
              h-3.5
              w-36
              animate-pulse
              rounded
              bg-[var(--bf-page-bg)]
            "
          />

          <div
            className="
              mt-2
              h-2.5
              w-20
              animate-pulse
              rounded
              bg-[var(--bf-page-bg)]
            "
          />
        </div>
      </div>

      <div
        className="
          mt-4
          h-3
          w-full
          animate-pulse
          rounded
          bg-[var(--bf-page-bg)]
        "
      />

      <div
        className="
          mt-2
          h-3
          w-4/5
          animate-pulse
          rounded
          bg-[var(--bf-page-bg)]
        "
      />

      <div
        className="
          mt-4
          h-10
          animate-pulse
          rounded-xl
          bg-[var(--bf-page-bg)]
        "
      />
    </div>
  );
}

/* =========================================================
   CONTACT US PAGE
========================================================= */

export default function ContactUs() {
  const [
    contacts,
    setContacts,
  ] = useState([]);

  const [
    contactsLoading,
    setContactsLoading,
  ] = useState(true);

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    formStatus,
    setFormStatus,
  ] = useState({
    type: '',
    message: '',
  });

  const [
    formData,
    setFormData,
  ] = useState({
    name: '',
    company: '',
    email: '',
    mobile: '',
    enquiryType:
      'Buddy Fleets',
    message: '',
  });

  /* =======================================================
     LOAD CONTACT PEOPLE

     Database remains source of truth.
  ======================================================= */

  useEffect(() => {
    let mounted = true;

    async function loadContacts() {
      try {
        setContactsLoading(
          true
        );

        const {
          data,
          error,
        } =
          await supabase
            .from(
              'contact_people'
            )
            .select(`
              id,
              name,
              role,
              email,
              instagram_handle,
              instagram_url,
              description,
              display_order
            `)
            .eq(
              'is_active',
              true
            )
            .eq(
              'show_on_contact_page',
              true
            )
            .order(
              'display_order',
              {
                ascending:
                  true,
              }
            );

        if (error) {
          throw error;
        }

        if (mounted) {
          setContacts(
            data || []
          );
        }
      } catch (error) {
        console.error(
          'Failed to load contact people:',
          error
        );

        if (mounted) {
          setContacts([]);
        }
      } finally {
        if (mounted) {
          setContactsLoading(
            false
          );
        }
      }
    }

    loadContacts();

    return () => {
      mounted = false;
    };
  }, []);

  /* =======================================================
     INPUT CHANGE
  ======================================================= */

  function handleChange(
    event
  ) {
    const {
      name,
      value,
    } = event.target;

    setFormData(
      (previous) => ({
        ...previous,
        [name]: value,
      })
    );

    if (
      formStatus.message
    ) {
      setFormStatus({
        type: '',
        message: '',
      });
    }
  }

  function handleEnquiryTypeChange(
    value
  ) {
    setFormData(
      (previous) => ({
        ...previous,
        enquiryType:
          value,
      })
    );

    if (
      formStatus.message
    ) {
      setFormStatus({
        type: '',
        message: '',
      });
    }
  }

  /* =======================================================
     VALIDATION
  ======================================================= */

  function validateForm() {
    const name =
      formData.name.trim();

    const email =
      formData.email.trim();

    const message =
      formData.message.trim();

    if (!name) {
      return 'Please enter your name.';
    }

    if (!email) {
      return 'Please enter your email address.';
    }

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
      !emailPattern.test(
        email
      )
    ) {
      return 'Please enter a valid email address.';
    }

    if (!message) {
      return 'Please enter your message.';
    }

    if (
      message.length > 5000
    ) {
      return 'Message is too long.';
    }

    return '';
  }

  /* =======================================================
     SUBMIT

     IMPORTANT:
     - NO mailto submission
     - Supabase Edge Function remains authoritative
  ======================================================= */

  async function handleSubmit(
    event
  ) {
    event.preventDefault();

    if (submitting) {
      return;
    }

    const validationError =
      validateForm();

    if (validationError) {
      setFormStatus({
        type: 'error',
        message:
          validationError,
      });

      return;
    }

    try {
      setSubmitting(true);

      setFormStatus({
        type: '',
        message: '',
      });

      const {
        data,
        error,
      } =
        await supabase
          .functions
          .invoke(
            'contact-enquiry',
            {
              body: {
                name:
                  formData.name
                    .trim(),

                company:
                  formData.company
                    .trim(),

                email:
                  formData.email
                    .trim()
                    .toLowerCase(),

                mobile:
                  formData.mobile
                    .trim(),

                enquiryType:
                  formData.enquiryType,

                message:
                  formData.message
                    .trim(),
              },
            }
          );

      if (error) {
        console.error(
          'Contact Edge Function error:',
          error
        );

        throw new Error(
          'Unable to submit enquiry.'
        );
      }

      if (
        !data?.success
      ) {
        throw new Error(
          data?.message ||
            'Unable to submit enquiry.'
        );
      }

      setFormStatus({
        type: 'success',
        message:
          data?.message ||
          'Thank you! Your enquiry has been submitted successfully.',
      });

      setFormData({
        name: '',
        company: '',
        email: '',
        mobile: '',
        enquiryType:
          'Buddy Fleets',
        message: '',
      });
    } catch (error) {
      console.error(
        'Contact submission failed:',
        error
      );

      setFormStatus({
        type: 'error',
        message:
          'We could not submit your enquiry right now. Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  }

  /* =======================================================
     SHARED INPUT STYLE
  ======================================================= */

  const inputClass = `
    w-full

    rounded-xl

    border
    border-[color:var(--bf-border)]

    bg-[var(--bf-page-bg)]

    px-3.5
    py-2.5

    text-sm

    text-[color:var(--bf-text-primary)]

    outline-none

    transition
    duration-200

    placeholder:text-[color:var(--bf-text-muted)]

    focus:border-cyan-400/40
    focus:ring-2
    focus:ring-cyan-400/[0.06]

    disabled:cursor-not-allowed
    disabled:opacity-60
  `;

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
            top-16
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
            top-[30rem]
            h-[430px]
            w-[430px]
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

          text-center

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
            max-w-4xl
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
              Contact Buddy Fleets
            </span>
          </div>

          <h1
            className="
              mx-auto
              mt-4
              max-w-4xl

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
              Let's talk about your fleet operations.
            </span>
          </h1>

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
            Have a question about Buddy Fleets,
            your trial, product capabilities or
            working with us? Send your enquiry and
            connect directly with the people behind
            the platform.
          </p>
        </div>
      </section>

      {/* =====================================================
          FORM + DIRECT CONTACT
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
            gap-6

            lg:grid-cols-[1.08fr_0.92fr]
            lg:gap-8
          "
        >
          {/* =================================================
              FORM
          ================================================= */}

          <div
            className="
              relative
              overflow-visible

              rounded-[24px]

              border
              border-[color:var(--bf-border)]

              bg-[var(--bf-surface)]

              p-5

              shadow-sm

              sm:p-6
            "
          >
            <div
              aria-hidden="true"
              className="
                pointer-events-none
                absolute
                -right-24
                -top-24
                h-64
                w-64
                rounded-full
                bg-blue-500/[0.06]
                blur-[100px]
              "
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
                Send an Enquiry
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
                Tell us what you need.
              </h2>

              <p
                className="
                  mt-2
                  max-w-2xl
                  text-sm
                  leading-6
                  text-[color:var(--bf-text-secondary)]
                "
              >
                Share your details and our team will receive your
                enquiry directly.
              </p>

              <form
                onSubmit={
                  handleSubmit
                }
                className="mt-5"
                noValidate
              >
                {/* NAME + COMPANY */}

                <div
                  className="
                    grid
                    gap-4
                    sm:grid-cols-2
                  "
                >
                  {/* NAME */}

                  <div>

                    <label
                      htmlFor="name"
                      className="
                        mb-1.5
                        block
                        text-[9px]
                        font-bold
                        uppercase
                        tracking-[0.12em]
                        text-[color:var(--bf-text-muted)]
                      "
                    >
                      Full Name *
                    </label>

                    <div className="relative">

                      <UserIcon
                        className="
                          pointer-events-none
                          absolute
                          left-3.5
                          top-1/2
                          h-4
                          w-4
                          -translate-y-1/2
                          text-[color:var(--bf-text-muted)]
                        "
                      />

                      <input
                        id="name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        maxLength={120}
                        disabled={
                          submitting
                        }
                        value={
                          formData.name
                        }
                        onChange={
                          handleChange
                        }
                        placeholder="Your name"
                        className={`${inputClass} pl-10`}
                      />
                    </div>
                  </div>

                  {/* COMPANY */}

                  <div>

                    <label
                      htmlFor="company"
                      className="
                        mb-1.5
                        block
                        text-[9px]
                        font-bold
                        uppercase
                        tracking-[0.12em]
                        text-[color:var(--bf-text-muted)]
                      "
                    >
                      Company Name
                    </label>

                    <div className="relative">

                      <BuildingIcon
                        className="
                          pointer-events-none
                          absolute
                          left-3.5
                          top-1/2
                          h-4
                          w-4
                          -translate-y-1/2
                          text-[color:var(--bf-text-muted)]
                        "
                      />

                      <input
                        id="company"
                        name="company"
                        type="text"
                        autoComplete="organization"
                        maxLength={180}
                        disabled={
                          submitting
                        }
                        value={
                          formData.company
                        }
                        onChange={
                          handleChange
                        }
                        placeholder="Company name"
                        className={`${inputClass} pl-10`}
                      />
                    </div>
                  </div>

                  {/* EMAIL */}

                  <div>

                    <label
                      htmlFor="email"
                      className="
                        mb-1.5
                        block
                        text-[9px]
                        font-bold
                        uppercase
                        tracking-[0.12em]
                        text-[color:var(--bf-text-muted)]
                      "
                    >
                      Email Address *
                    </label>

                    <div className="relative">

                      <MailIcon
                        className="
                          pointer-events-none
                          absolute
                          left-3.5
                          top-1/2
                          h-4
                          w-4
                          -translate-y-1/2
                          text-[color:var(--bf-text-muted)]
                        "
                      />

                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        maxLength={254}
                        disabled={
                          submitting
                        }
                        value={
                          formData.email
                        }
                        onChange={
                          handleChange
                        }
                        placeholder="name@company.com"
                        className={`${inputClass} pl-10`}
                      />
                    </div>
                  </div>

                  {/* MOBILE */}

                  <div>

                    <label
                      htmlFor="mobile"
                      className="
                        mb-1.5
                        block
                        text-[9px]
                        font-bold
                        uppercase
                        tracking-[0.12em]
                        text-[color:var(--bf-text-muted)]
                      "
                    >
                      Mobile Number
                    </label>

                    <div className="relative">

                      <PhoneIcon
                        className="
                          pointer-events-none
                          absolute
                          left-3.5
                          top-1/2
                          h-4
                          w-4
                          -translate-y-1/2
                          text-[color:var(--bf-text-muted)]
                        "
                      />

                      <input
                        id="mobile"
                        name="mobile"
                        type="tel"
                        autoComplete="tel"
                        maxLength={30}
                        disabled={
                          submitting
                        }
                        value={
                          formData.mobile
                        }
                        onChange={
                          handleChange
                        }
                        placeholder="+91"
                        className={`${inputClass} pl-10`}
                      />
                    </div>
                  </div>
                </div>

                {/* ENQUIRY TYPE */}

                <div
                  className="
                    relative
                    z-30
                    mt-4
                  "
                >
                  <label
                    className="
                      mb-1.5
                      block
                      text-[9px]
                      font-bold
                      uppercase
                      tracking-[0.12em]
                      text-[color:var(--bf-text-muted)]
                    "
                  >
                    Enquiry About
                  </label>

                  <CustomSelect
                    value={
                      formData.enquiryType
                    }
                    options={
                      ENQUIRY_OPTIONS
                    }
                    onChange={
                      handleEnquiryTypeChange
                    }
                    disabled={
                      submitting
                    }
                  />
                </div>

                {/* MESSAGE */}

                <div className="mt-4">

                  <label
                    htmlFor="message"
                    className="
                      mb-1.5
                      block
                      text-[9px]
                      font-bold
                      uppercase
                      tracking-[0.12em]
                      text-[color:var(--bf-text-muted)]
                    "
                  >
                    Message *
                  </label>

                  <div className="relative">

                    <MessageIcon
                      className="
                        pointer-events-none
                        absolute
                        left-3.5
                        top-3.5
                        h-4
                        w-4
                        text-[color:var(--bf-text-muted)]
                      "
                    />

                    <textarea
                      id="message"
                      name="message"
                      rows={5}
                      maxLength={5000}
                      disabled={
                        submitting
                      }
                      value={
                        formData.message
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Tell us how we can help..."
                      className={`${inputClass} resize-none pl-10`}
                    />
                  </div>

                  <div
                    className="
                      mt-1.5
                      text-right
                      text-[8px]
                      font-semibold
                      text-[color:var(--bf-text-muted)]
                    "
                  >
                    {
                      formData.message
                        .length
                    }
                    /5000
                  </div>
                </div>

                {/* STATUS */}

                {formStatus.message && (
                  <div
                    className={`
                      mt-4
                      flex
                      items-start
                      gap-2.5

                      rounded-xl
                      border

                      px-3.5
                      py-3

                      text-xs
                      font-semibold

                      ${
                        formStatus.type ===
                        'success'
                          ? `
                            border-emerald-400/20
                            bg-emerald-400/[0.06]
                            text-emerald-500
                          `
                          : `
                            border-red-400/20
                            bg-red-400/[0.06]
                            text-red-500
                          `
                      }
                    `}
                  >
                    {formStatus.type ===
                    'success' ? (
                      <CheckCircleIcon
                        className="
                          mt-0.5
                          h-4
                          w-4
                          shrink-0
                        "
                      />
                    ) : (
                      <AlertIcon
                        className="
                          mt-0.5
                          h-4
                          w-4
                          shrink-0
                        "
                      />
                    )}

                    <span>
                      {
                        formStatus.message
                      }
                    </span>
                  </div>
                )}

                {/* SUBMIT */}

                <button
                  type="submit"
                  disabled={
                    submitting
                  }
                  className="
                    mt-4
                    inline-flex
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

                    px-6
                    py-3

                    text-sm
                    font-black
                    text-white

                    shadow-lg
                    shadow-blue-500/10

                    transition

                    hover:-translate-y-0.5

                    disabled:cursor-not-allowed
                    disabled:opacity-60
                    disabled:hover:translate-y-0

                    sm:w-auto
                  "
                >
                  {submitting ? (
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

                      Sending Enquiry...
                    </>
                  ) : (
                    <>
                      Send Enquiry

                      <SendIcon
                        className="h-4 w-4"
                      />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* =================================================
              DIRECT CONTACT
          ================================================= */}

          <div>

            <div className="mb-4">

              <p
                className="
                  text-[9px]
                  font-black
                  uppercase
                  tracking-[0.2em]
                  text-cyan-500
                "
              >
                Direct Contact
              </p>

              <h2
                className="
                  mt-2
                  text-2xl
                  font-black
                  tracking-tight
                  text-[color:var(--bf-text-primary)]
                  sm:text-3xl
                "
              >
                Connect with us directly.
              </h2>

              <p
                className="
                  mt-2
                  max-w-xl
                  text-sm
                  leading-6
                  text-[color:var(--bf-text-secondary)]
                "
              >
                Reach the Buddy Fleets team directly for
                product, technology, sales, business or
                partnership-related discussions.
              </p>
            </div>

            <div className="space-y-3">

              {contactsLoading ? (
                <>
                  <ContactLoadingCard />
                  <ContactLoadingCard />
                </>
              ) : contacts.length >
                0 ? (
                contacts.map(
                  (
                    contact,
                    index
                  ) => (
                    <ContactPerson
                      key={
                        contact.id
                      }
                      name={
                        contact.name
                      }
                      role={
                        contact.role
                      }
                      description={
                        contact.description
                      }
                      email={
                        contact.email
                      }
                      instagramUrl={
                        contact.instagram_url
                      }
                      instagramHandle={
                        contact.instagram_handle
                      }
                      index={
                        index
                      }
                    />
                  )
                )
              ) : (
                <div
                  className="
                    rounded-[22px]

                    border
                    border-[color:var(--bf-border)]

                    bg-[var(--bf-surface)]

                    p-5
                  "
                >
                  <MailIcon
                    className="
                      h-5
                      w-5
                      text-cyan-500
                    "
                  />

                  <h3
                    className="
                      mt-3
                      text-lg
                      font-black
                      text-[color:var(--bf-text-primary)]
                    "
                  >
                    Send us an enquiry
                  </h3>

                  <p
                    className="
                      mt-2
                      text-sm
                      leading-6
                      text-[color:var(--bf-text-secondary)]
                    "
                  >
                    Direct contact information is temporarily
                    unavailable. You can still use the enquiry
                    form.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          ENQUIRY TYPES
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
            max-w-7xl
          "
        >
          <div
            className="
              mx-auto
              max-w-3xl
              text-center
            "
          >
            <p
              className="
                text-[9px]
                font-black
                uppercase
                tracking-[0.2em]
                text-cyan-500
              "
            >
              We're Here to Help
            </p>

            <h2
              className="
                mt-3
                text-3xl
                font-black
                tracking-tight
                text-[color:var(--bf-text-primary)]
                sm:text-4xl
              "
            >
              Start the right conversation.
            </h2>

            <p
              className="
                mt-3
                text-sm
                leading-7
                text-[color:var(--bf-text-secondary)]
                sm:text-base
              "
            >
              Whether you're exploring Buddy Fleets for the
              first time or want to discuss your transport
              operations, you can reach us directly.
            </p>
          </div>

          <div
            className="
              mt-6
              grid
              gap-4

              sm:grid-cols-2
              lg:grid-cols-4
            "
          >
            {ENQUIRY_TYPES.map(
              (item) => (
                <article
                  key={
                    item.number
                  }
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
                      font-mono
                      text-[9px]
                      font-black
                      tracking-[0.18em]
                      text-cyan-500
                    "
                  >
                    {
                      item.number
                    }
                  </span>

                  <h3
                    className="
                      mt-4
                      text-lg
                      font-black
                      text-[color:var(--bf-text-primary)]
                    "
                  >
                    {
                      item.title
                    }
                  </h3>

                  <p
                    className="
                      mt-2
                      text-xs
                      leading-6
                      text-[color:var(--bf-text-secondary)]
                    "
                  >
                    {
                      item.description
                    }
                  </p>
                </article>
              )
            )}
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
        <div
          className="
            relative
            mx-auto
            max-w-5xl
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
              Ready to Get Started?
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
              Experience a simpler approach to fleet operations.
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
              Start your 5-day free trial and explore Buddy Fleets.
            </p>

            <Link
              to="/signup"
              className="
                mt-5
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

              <ArrowIcon
                className="h-4 w-4"
              />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}