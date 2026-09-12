import React, {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  LoaderCircle,
  X,
} from 'lucide-react';

/* =========================================================
   DEFAULT WHATSAPP MESSAGE
========================================================= */

const DEFAULT_MESSAGE =
  'Hello, I would like to know more about Buddy Fleets.';

/* =========================================================
   SESSION CACHE

   Contacts ek baar load hone ke baad same browser session
   me repeat DB query nahi hogi.
========================================================= */

let cachedWhatsappContacts = null;

/* =========================================================
   SHARED LOAD PROMISE

   Agar user accidentally fast double-click kare to bhi
   duplicate Supabase query avoid hogi.
========================================================= */

let contactsLoadPromise = null;

/* =========================================================
   LAZY SUPABASE CLIENT

   IMPORTANT PERFORMANCE OPTIMIZATION:

   Supabase initial website bundle ke saath load nahi hoga.

   User jab WhatsApp button first time open karega tabhi
   supabaseClient module dynamically load hoga.
========================================================= */

let supabaseClientPromise = null;

function getSupabaseClient() {
  if (!supabaseClientPromise) {
    supabaseClientPromise = import(
      '../supabaseClient'
    ).then(
      (
        module
      ) => module.supabase
    );
  }

  return supabaseClientPromise;
}

/* =========================================================
   WHATSAPP ICON
========================================================= */

function WhatsAppIcon({
  size = 24,
  className = '',
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path
        d="
          M16.004 3
          C8.82 3 3 8.824 3 16.006
          c0 2.292.599 4.53 1.736 6.502
          L3 29l6.684-1.752
          a12.934 12.934 0 0 0 6.316 1.61
          h.006
          C23.184 28.858 29 23.034 29 15.852
          C29 8.824 23.184 3 16.004 3
          Z

          M16.006 26.666
          h-.004
          a10.74 10.74 0 0 1-5.476-1.5
          l-.394-.234
          -3.968 1.04
          1.06-3.866
          -.256-.398
          a10.758 10.758 0 0 1-1.656-5.702
          C5.312 10.106 10.108 5.31 16.008 5.31
          c5.894 0 10.684 4.796 10.684 10.694
          0 5.892-4.792 10.662-10.686 10.662
          Z

          M21.862 18.654
          c-.32-.16-1.894-.934-2.188-1.04
          -.292-.106-.506-.16-.72.16
          -.214.32-.826 1.04-1.012 1.254
          -.186.214-.374.24-.694.08
          -.32-.16-1.35-.498-2.572-1.588
          -.95-.846-1.592-1.89-1.778-2.21
          -.186-.32-.02-.494.14-.654
          .144-.144.32-.374.48-.56
          .16-.186.214-.32.32-.534
          .106-.214.054-.4-.026-.56
          -.08-.16-.72-1.734-.986-2.374
          -.26-.626-.524-.54-.72-.55
          -.186-.01-.4-.012-.614-.012
          -.214 0-.56.08-.854.4
          -.294.32-1.12 1.094-1.12 2.668
          0 1.574 1.146 3.094 1.306 3.308
          .16.214 2.256 3.444 5.466 4.83
          .764.33 1.36.526 1.824.674
          .766.244 1.464.21 2.016.128
          .616-.092 1.894-.774 2.162-1.52
          .266-.746.266-1.386.186-1.52
          -.08-.134-.294-.214-.614-.374
          Z
        "
      />
    </svg>
  );
}

/* =========================================================
   NUMBER SANITIZER
========================================================= */

function sanitizeWhatsappNumber(
  value
) {
  return String(
    value || ''
  ).replace(
    /\D/g,
    ''
  );
}

/* =========================================================
   BUILD WHATSAPP URL
========================================================= */

function buildWhatsappUrl(
  number
) {
  const cleanNumber =
    sanitizeWhatsappNumber(
      number
    );

  if (!cleanNumber) {
    return null;
  }

  const encodedMessage =
    encodeURIComponent(
      DEFAULT_MESSAGE
    );

  return (
    `https://wa.me/${cleanNumber}` +
    `?text=${encodedMessage}`
  );
}

/* =========================================================
   FETCH CONTACTS

   Supabase + database dono first interaction tak deferred.
========================================================= */

async function fetchWhatsappContacts() {
  if (
    cachedWhatsappContacts
  ) {
    return cachedWhatsappContacts;
  }

  if (
    contactsLoadPromise
  ) {
    return contactsLoadPromise;
  }

  contactsLoadPromise =
    (async () => {
      try {
        const supabase =
          await getSupabaseClient();

        const {
          data,
          error:
            queryError,
        } =
          await supabase
            .from(
              'contact_people'
            )
            .select(`
              id,
              name,
              role,
              whatsapp_number,
              whatsapp_display_order
            `)
            .eq(
              'is_active',
              true
            )
            .eq(
              'show_on_whatsapp',
              true
            )
            .not(
              'whatsapp_number',
              'is',
              null
            )
            .order(
              'whatsapp_display_order',
              {
                ascending:
                  true,
              }
            );

        if (
          queryError
        ) {
          throw queryError;
        }

        const validContacts =
          (
            data || []
          ).filter(
            (
              contact
            ) =>
              sanitizeWhatsappNumber(
                contact
                  .whatsapp_number
              )
          );

        cachedWhatsappContacts =
          validContacts;

        return validContacts;
      } finally {
        contactsLoadPromise =
          null;
      }
    })();

  return contactsLoadPromise;
}

/* =========================================================
   WHATSAPP CONTACT BUTTON
========================================================= */

export default function WhatsAppContactButton() {
  const [
    isOpen,
    setIsOpen,
  ] = useState(false);

  const [
    contacts,
    setContacts,
  ] = useState(
    cachedWhatsappContacts ||
      []
  );

  const [
    isLoading,
    setIsLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState('');

  const panelRef =
    useRef(null);

  const buttonRef =
    useRef(null);

  /* =======================================================
     LOAD CONTACTS

     Initial website load par:
     - no DB query
     - no Supabase client import

     First WhatsApp interaction par hi dono load honge.
  ======================================================= */

  const loadContacts =
    async () => {
      if (
        cachedWhatsappContacts
      ) {
        setContacts(
          cachedWhatsappContacts
        );

        if (
          cachedWhatsappContacts
            .length === 0
        ) {
          setError(
            'WhatsApp support is currently unavailable.'
          );
        }

        return;
      }

      try {
        setIsLoading(
          true
        );

        setError('');

        const validContacts =
          await fetchWhatsappContacts();

        setContacts(
          validContacts
        );

        if (
          validContacts.length ===
          0
        ) {
          setError(
            'WhatsApp support is currently unavailable.'
          );
        }
      } catch (
        err
      ) {
        console.error(
          'WhatsApp contacts error:',
          err
        );

        setError(
          'Unable to load WhatsApp contacts right now.'
        );
      } finally {
        setIsLoading(
          false
        );
      }
    };

  /* =======================================================
     OPEN / CLOSE
  ======================================================= */

  const handleToggle =
    async () => {
      const nextState =
        !isOpen;

      setIsOpen(
        nextState
      );

      if (
        nextState &&
        contacts.length ===
          0 &&
        !isLoading
      ) {
        await loadContacts();
      }
    };

  const closePanel =
    () => {
      setIsOpen(
        false
      );
    };

  /* =======================================================
     CLICK OUTSIDE
  ======================================================= */

  useEffect(
    () => {
      if (
        !isOpen
      ) {
        return undefined;
      }

      const handleOutsideClick =
        (
          event
        ) => {
          const clickedPanel =
            panelRef.current
              ?.contains(
                event.target
              );

          const clickedButton =
            buttonRef.current
              ?.contains(
                event.target
              );

          if (
            !clickedPanel &&
            !clickedButton
          ) {
            closePanel();
          }
        };

      document.addEventListener(
        'mousedown',
        handleOutsideClick
      );

      document.addEventListener(
        'touchstart',
        handleOutsideClick,
        {
          passive: true,
        }
      );

      return () => {
        document.removeEventListener(
          'mousedown',
          handleOutsideClick
        );

        document.removeEventListener(
          'touchstart',
          handleOutsideClick
        );
      };
    },
    [
      isOpen,
    ]
  );

  /* =======================================================
     ESCAPE KEY
  ======================================================= */

  useEffect(
    () => {
      if (
        !isOpen
      ) {
        return undefined;
      }

      const handleKeyDown =
        (
          event
        ) => {
          if (
            event.key ===
            'Escape'
          ) {
            closePanel();

            window.setTimeout(
              () => {
                buttonRef.current
                  ?.focus();
              },
              0
            );
          }
        };

      document.addEventListener(
        'keydown',
        handleKeyDown
      );

      return () => {
        document.removeEventListener(
          'keydown',
          handleKeyDown
        );
      };
    },
    [
      isOpen,
    ]
  );

  /* =======================================================
     CONTACT CLICK
  ======================================================= */

  const handleContactClick =
    (
      contact
    ) => {
      const url =
        buildWhatsappUrl(
          contact
            .whatsapp_number
        );

      if (
        !url
      ) {
        return;
      }

      window.open(
        url,
        '_blank',
        'noopener,noreferrer'
      );

      closePanel();
    };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div
      className="
        relative

        flex
        flex-col
        items-end
      "
    >
      {/* =====================================================
          CONTACT CHOOSER
      ===================================================== */}

      {isOpen && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Choose WhatsApp contact"
          className="
            absolute

            bottom-[60px]
            right-0

            w-[min(330px,calc(100vw-32px))]

            overflow-hidden

            rounded-2xl

            border
            border-[color:var(--bf-border)]

            bg-[var(--bf-surface)]

            shadow-2xl
            shadow-black/25

            backdrop-blur-2xl
          "
        >
          {/* ===============================================
              HEADER
          =============================================== */}

          <div
            className="
              flex

              items-start
              justify-between

              gap-4

              border-b
              border-[color:var(--bf-border)]

              px-4
              py-4
            "
          >
            <div
              className="
                flex

                min-w-0

                items-center

                gap-3
              "
            >
              <div
                className="
                  flex
                  h-10
                  w-10

                  shrink-0

                  items-center
                  justify-center

                  rounded-xl

                  bg-[#25D366]

                  text-white

                  shadow-md
                  shadow-emerald-950/15
                "
              >
                <WhatsAppIcon
                  size={22}
                />
              </div>

              <div
                className="
                  min-w-0
                "
              >
                <p
                  className="
                    text-sm
                    font-black

                    text-[color:var(--bf-text-primary)]
                  "
                >
                  Chat on WhatsApp
                </p>

                <p
                  className="
                    mt-1

                    text-[11px]
                    leading-5

                    text-[color:var(--bf-text-muted)]
                  "
                >
                  Choose who you want to contact.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={
                closePanel
              }
              aria-label="Close WhatsApp contacts"
              className="
                flex
                h-8
                w-8

                shrink-0

                items-center
                justify-center

                rounded-lg

                border
                border-[color:var(--bf-border)]

                text-[color:var(--bf-text-muted)]

                transition

                hover:border-red-400/25
                hover:text-red-500

                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-red-400
              "
            >
              <X
                size={16}
                aria-hidden="true"
              />
            </button>
          </div>

          {/* ===============================================
              CONTENT
          =============================================== */}

          <div
            className="
              p-3
            "
          >
            {/* LOADING */}

            {isLoading && (
              <div
                className="
                  flex

                  min-h-[120px]

                  items-center
                  justify-center
                "
              >
                <div
                  className="
                    flex
                    flex-col

                    items-center

                    gap-3
                  "
                >
                  <LoaderCircle
                    size={22}
                    aria-hidden="true"
                    className="
                      animate-spin

                      text-[#25D366]
                    "
                  />

                  <p
                    className="
                      text-xs

                      text-[color:var(--bf-text-muted)]
                    "
                  >
                    Loading contacts...
                  </p>
                </div>
              </div>
            )}

            {/* ERROR */}

            {!isLoading &&
              error && (
                <div
                  className="
                    rounded-xl

                    border
                    border-red-400/20

                    bg-red-400/[0.06]

                    px-4
                    py-4

                    text-xs
                    leading-5

                    text-red-500
                  "
                >
                  {error}
                </div>
              )}

            {/* ===============================================
                CONTACT LIST
            =============================================== */}

            {!isLoading &&
              !error &&
              contacts.length >
                0 && (
                <div
                  className="
                    space-y-2
                  "
                >
                  {contacts.map(
                    (
                      contact
                    ) => (
                      <button
                        key={
                          contact.id
                        }
                        type="button"
                        onClick={() =>
                          handleContactClick(
                            contact
                          )
                        }
                        className="
                          group

                          flex

                          w-full

                          items-center

                          gap-3

                          rounded-xl

                          border
                          border-[color:var(--bf-border)]

                          bg-[var(--bf-page-bg)]

                          p-3

                          text-left

                          transition
                          duration-200

                          hover:-translate-y-[1px]
                          hover:border-[#25D366]/40
                          hover:bg-emerald-400/[0.05]

                          focus-visible:outline-none
                          focus-visible:ring-2
                          focus-visible:ring-[#25D366]
                        "
                      >
                        {/* ICON */}

                        <div
                          className="
                            flex
                            h-10
                            w-10

                            shrink-0

                            items-center
                            justify-center

                            rounded-xl

                            bg-[#25D366]

                            text-white

                            shadow-sm
                            shadow-emerald-950/15
                          "
                        >
                          <WhatsAppIcon
                            size={21}
                          />
                        </div>

                        {/* DETAILS */}

                        <div
                          className="
                            min-w-0
                            flex-1
                          "
                        >
                          <p
                            className="
                              truncate

                              text-sm
                              font-black

                              text-[color:var(--bf-text-primary)]
                            "
                          >
                            {
                              contact.name
                            }
                          </p>

                          <p
                            className="
                              mt-0.5

                              truncate

                              text-[11px]

                              text-[color:var(--bf-text-muted)]
                            "
                          >
                            {
                              contact.role
                            }
                          </p>
                        </div>

                        {/* CHAT LABEL */}

                        <span
                          className="
                            rounded-full

                            border
                            border-[#25D366]/15

                            bg-[#25D366]/10

                            px-2.5
                            py-1

                            text-[8px]
                            font-black

                            uppercase

                            tracking-wide

                            text-[#20a951]
                          "
                        >
                          Chat
                        </span>
                      </button>
                    )
                  )}
                </div>
              )}
          </div>

          {/* ===============================================
              FOOTER
          =============================================== */}

          {!isLoading &&
            !error &&
            contacts.length >
              0 && (
              <div
                className="
                  border-t
                  border-[color:var(--bf-border)]

                  px-4
                  py-2.5
                "
              >
                <p
                  className="
                    text-center

                    text-[9px]
                    leading-4

                    text-[color:var(--bf-text-muted)]
                  "
                >
                  Your selected contact will open in WhatsApp.
                </p>
              </div>
            )}
        </div>
      )}

      {/* =====================================================
          MAIN FLOATING WHATSAPP BUTTON
      ===================================================== */}

      <button
        ref={buttonRef}
        type="button"
        onClick={
          handleToggle
        }
        aria-label={
          isOpen
            ? 'Close WhatsApp contacts'
            : 'Contact Buddy Fleets on WhatsApp'
        }
        aria-expanded={
          isOpen
        }
        title="WhatsApp"
        className="
          group

          flex
          h-12
          w-12

          items-center
          justify-center

          rounded-2xl

          border
          border-[#4ade80]/30

          bg-[#25D366]

          text-white

          shadow-xl
          shadow-emerald-950/25

          transition
          duration-200

          hover:-translate-y-0.5
          hover:bg-[#20bd5a]
          hover:shadow-emerald-500/20

          focus-visible:outline-none
          focus-visible:ring-2
          focus-visible:ring-[#25D366]
          focus-visible:ring-offset-2
        "
      >
        {isOpen ? (
          <X
            size={21}
            aria-hidden="true"
          />
        ) : (
          <WhatsAppIcon
            size={25}
          />
        )}
      </button>
    </div>
  );
}