import React, {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  Bot,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  MessageCircle,
  Send,
  Sparkles,
  Truck,
  WalletCards,
  Wrench,
  X,
} from 'lucide-react';

import { Link } from 'react-router-dom';

/* =========================================================
   WELCOME MESSAGE
========================================================= */

const WELCOME_MESSAGE = {
  id: 'welcome',
  role: 'assistant',
  text:
    "Hi! I'm Buddy Assistant. Ask me about Buddy Fleets, features, workflows, pricing or getting started.",
};

/* =========================================================
   QUICK QUESTIONS
========================================================= */

const QUICK_QUESTIONS = [
  {
    id: 'features',
    label: 'What can Buddy Fleets do?',
    icon: Truck,
  },
  {
    id: 'workflow',
    label: 'How does the workflow work?',
    icon: CheckCircle2,
  },
  {
    id: 'pricing',
    label: 'Tell me about pricing',
    icon: WalletCards,
  },
  {
    id: 'maintenance',
    label: 'Maintenance features',
    icon: Wrench,
  },
];

/* =========================================================
   NORMALIZE TEXT
========================================================= */

function normalizeText(value = '') {
  return String(value)
    .toLowerCase()
    .replace(/[^\w\s/+-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/* =========================================================
   LOCAL CHATBOT ANSWERS
========================================================= */

function getAssistantReply(userText) {
  const text =
    normalizeText(userText);

  /* GREETING */

  if (
    text === 'hi' ||
    text === 'hello' ||
    text === 'hey' ||
    text.includes('good morning') ||
    text.includes('good afternoon') ||
    text.includes('good evening')
  ) {
    return {
      text:
        'Hello! Ask me about Buddy Fleets features, workflows, vehicles, drivers, finance, maintenance, compliance or pricing.',
    };
  }

  /* ABOUT */

  if (
    text.includes('what is buddy') ||
    text.includes('buddy fleets kya') ||
    text.includes('about buddy') ||
    text.includes('what does buddy')
  ) {
    return {
      text:
        'Buddy Fleets is a fleet operations platform that brings trips, vehicles, drivers, LR/Bilty, delivery records, expenses, maintenance, compliance and settlements into one workspace.',
      action: {
        label: 'About Buddy Fleets',
        to: '/about',
      },
    };
  }

  /* FEATURES */

  if (
    text.includes('feature') ||
    text.includes('module') ||
    text.includes('what can') ||
    text.includes('what do')
  ) {
    return {
      text:
        'Buddy Fleets covers vehicles, drivers, LR/Bilty, consignments, dispatch, ePOD, expenses, diesel, advances, invoices, settlements, documents, workshop maintenance, tyres, spare parts, challans, trip planning and role-based access.',
      action: {
        label: 'View Features',
        to: '/features',
      },
    };
  }

  /* WORKFLOW */

  if (
    text.includes('workflow') ||
    text.includes('booking') ||
    text.includes('dispatch') ||
    text.includes('trip process') ||
    text.includes('how does it work')
  ) {
    return {
      text:
        'The workflow moves from Booking to Dispatch, Trip Updates, Delivery/ePOD and finally Settlement, keeping operational records connected throughout the trip.',
      action: {
        label: 'Explore Features',
        to: '/features',
      },
    };
  }

  /* VEHICLE / DRIVER */

  if (
    text.includes('vehicle') ||
    text.includes('driver')
  ) {
    return {
      text:
        'Buddy Fleets helps organize vehicle and driver records alongside trip allocation, dispatch, documents and maintenance information.',
      action: {
        label: 'View Features',
        to: '/features',
      },
    };
  }

  /* LR / BILTY */

  if (
    text.includes('lr') ||
    text.includes('bilty') ||
    text.includes('consignment')
  ) {
    return {
      text:
        'LR/Bilty and consignment records can stay connected with vehicle assignment, driver assignment, delivery and settlement workflows.',
      action: {
        label: 'Transport Features',
        to: '/features',
      },
    };
  }

  /* DELIVERY */

  if (
    text.includes('epod') ||
    text.includes('delivery') ||
    text.includes('proof of delivery')
  ) {
    return {
      text:
        'Buddy Fleets supports delivery status and ePOD records so completed trip information stays organized.',
      action: {
        label: 'View Features',
        to: '/features',
      },
    };
  }

  /* FINANCE */

  if (
    text.includes('finance') ||
    text.includes('expense') ||
    text.includes('earning') ||
    text.includes('invoice') ||
    text.includes('settlement') ||
    text.includes('advance') ||
    text.includes('diesel') ||
    text.includes('fuel')
  ) {
    return {
      text:
        'Transport finance workflows can include expenses, diesel, driver advances, party records, invoices and settlements.',
      action: {
        label: 'Finance Features',
        to: '/features',
      },
    };
  }

  /* MAINTENANCE */

  if (
    text.includes('maintenance') ||
    text.includes('workshop') ||
    text.includes('tyre') ||
    text.includes('tire') ||
    text.includes('spare')
  ) {
    return {
      text:
        'Maintenance includes workshop jobs, service records, tyre management, spare parts and vehicle maintenance information.',
      action: {
        label: 'Maintenance Features',
        to: '/features',
      },
    };
  }

  /* COMPLIANCE */

  if (
    text.includes('compliance') ||
    text.includes('document') ||
    text.includes('renewal') ||
    text.includes('alert') ||
    text.includes('challan')
  ) {
    return {
      text:
        'Buddy Fleets helps organize document, compliance, renewal, alert and challan-related fleet records.',
      action: {
        label: 'Compliance Features',
        to: '/features',
      },
    };
  }

  /* ACCESS */

  if (
    text.includes('role') ||
    text.includes('access') ||
    text.includes('permission') ||
    text.includes('employee')
  ) {
    return {
      text:
        'Role-based access lets owners, managers, accountants and operators work according to their responsibilities.',
      action: {
        label: 'View Features',
        to: '/features',
      },
    };
  }

  /* PRICING */

  if (
    text.includes('price') ||
    text.includes('pricing') ||
    text.includes('cost') ||
    text.includes('plan') ||
    text.includes('subscription')
  ) {
    return {
      text:
        'You can check the latest Buddy Fleets plan information on the Pricing page.',
      action: {
        label: 'View Pricing',
        to: '/pricing',
      },
    };
  }

  /* SIGNUP */

  if (
    text.includes('trial') ||
    text.includes('signup') ||
    text.includes('sign up') ||
    text.includes('register') ||
    text.includes('get started')
  ) {
    return {
      text:
        'Create your Buddy Fleets account from the Signup page to begin onboarding.',
      action: {
        label: 'Get Started',
        to: '/signup',
      },
    };
  }

  /* LOGIN */

  if (
    text.includes('login') ||
    text.includes('sign in')
  ) {
    return {
      text:
        'Existing users can access Buddy Fleets from the Login page.',
      action: {
        label: 'Login',
        to: '/login',
      },
    };
  }

  /* CONTACT */

  if (
    text.includes('contact') ||
    text.includes('support') ||
    text.includes('call') ||
    text.includes('email') ||
    text.includes('whatsapp') ||
    text.includes('talk')
  ) {
    return {
      text:
        'Use the Contact Us page or the green WhatsApp button to talk directly with the Buddy Fleets team.',
      action: {
        label: 'Contact Us',
        to: '/contact-us',
      },
    };
  }

  /* SECURITY */

  if (
    text.includes('security') ||
    text.includes('secure') ||
    text.includes('data safe')
  ) {
    return {
      text:
        'For specific data security or technical questions, please contact the Buddy Fleets team directly.',
      action: {
        label: 'Contact Us',
        to: '/contact-us',
      },
    };
  }

  /* FALLBACK */

  return {
    text:
      "I couldn't confidently answer that. Try asking about features, vehicles, LR/Bilty, finance, maintenance, pricing or getting started.",
    action: {
      label: 'Contact Us',
      to: '/contact-us',
    },
  };
}

/* =========================================================
   MESSAGE
========================================================= */

function MessageBubble({
  message,
  onNavigate,
}) {
  const isAssistant =
    message.role === 'assistant';

  return (
    <div
      className={`
        flex w-full
        ${
          isAssistant
            ? 'justify-start'
            : 'justify-end'
        }
      `}
    >
      <div
        className={`
          max-w-[90%]
          rounded-xl
          px-3
          py-2

          ${
            isAssistant
              ? `
                rounded-tl-sm
                border
                border-[color:var(--bf-border)]
                bg-[var(--bf-page-bg)]
              `
              : `
                rounded-tr-sm
                bg-gradient-to-br
                from-[#078EE5]
                to-[#0AA23B]
              `
          }
        `}
      >
        <p
          className={`
            text-[11px]
            leading-[1.55]

            ${
              isAssistant
                ? 'text-[color:var(--bf-text-secondary)]'
                : 'text-white'
            }
          `}
        >
          {message.text}
        </p>

        {message.action && (
          <Link
            to={message.action.to}
            onClick={onNavigate}
            className="
              mt-2
              inline-flex
              items-center
              gap-0.5
              rounded-md
              border
              border-cyan-400/20
              bg-cyan-400/[0.06]
              px-2
              py-1
              text-[9px]
              font-bold
              text-cyan-500
              transition
              hover:bg-cyan-400/[0.11]
            "
          >
            {message.action.label}

            <ChevronRight
              size={10}
              aria-hidden="true"
            />
          </Link>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   BUDDY CHATBOT
========================================================= */

export default function BuddyChatbot({
  onClose,
}) {
  const [
    messages,
    setMessages,
  ] = useState([
    WELCOME_MESSAGE,
  ]);

  const [
    input,
    setInput,
  ] = useState('');

  const [
    isTyping,
    setIsTyping,
  ] = useState(false);

  const inputRef =
    useRef(null);

  const scrollRef =
    useRef(null);

  const typingTimeoutRef =
    useRef(null);

  /* =======================================================
     INITIAL FOCUS
  ======================================================= */

  useEffect(() => {
    const timer =
      window.setTimeout(
        () => {
          inputRef.current?.focus();
        },
        80
      );

    return () =>
      window.clearTimeout(
        timer
      );
  }, []);

  /* =======================================================
     AUTO SCROLL
  ======================================================= */

  useEffect(() => {
    const element =
      scrollRef.current;

    if (!element) {
      return;
    }

    element.scrollTo({
      top: element.scrollHeight,
      behavior: 'smooth',
    });
  }, [
    messages,
    isTyping,
  ]);

  /* =======================================================
     CLEANUP
  ======================================================= */

  useEffect(() => {
    return () => {
      if (
        typingTimeoutRef.current
      ) {
        window.clearTimeout(
          typingTimeoutRef.current
        );
      }
    };
  }, []);

  /* =======================================================
     QUESTION
  ======================================================= */

  const submitQuestion = (
    question
  ) => {
    const cleanQuestion =
      String(
        question || ''
      ).trim();

    if (
      !cleanQuestion ||
      isTyping
    ) {
      return;
    }

    const userMessage = {
      id:
        `user-${Date.now()}`,
      role: 'user',
      text: cleanQuestion,
    };

    setMessages(
      (previous) => [
        ...previous,
        userMessage,
      ]
    );

    setInput('');
    setIsTyping(true);

    const answer =
      getAssistantReply(
        cleanQuestion
      );

    typingTimeoutRef.current =
      window.setTimeout(
        () => {
          setMessages(
            (previous) => [
              ...previous,
              {
                id:
                  `assistant-${Date.now()}`,
                role:
                  'assistant',
                ...answer,
              },
            ]
          );

          setIsTyping(false);
        },
        240
      );
  };

  /* =======================================================
     SUBMIT
  ======================================================= */

  const handleSubmit = (
    event
  ) => {
    event.preventDefault();

    submitQuestion(input);
  };

  /* =======================================================
     RESET
  ======================================================= */

  const resetChat = () => {
    if (
      typingTimeoutRef.current
    ) {
      window.clearTimeout(
        typingTimeoutRef.current
      );
    }

    setMessages([
      WELCOME_MESSAGE,
    ]);

    setInput('');
    setIsTyping(false);

    window.setTimeout(
      () =>
        inputRef.current?.focus(),
      50
    );
  };

  return (
    <div
      role="dialog"
      aria-label="Buddy Fleets Assistant"
      className="
        flex

        h-[min(430px,calc(100dvh-230px))]
        min-h-[280px]

        w-[min(330px,calc(100vw-24px))]
        max-w-full

        flex-col
        overflow-hidden

        rounded-[18px]

        border
        border-[color:var(--bf-border)]

        bg-[var(--bf-surface)]

        shadow-2xl
        shadow-black/25

        backdrop-blur-2xl
      "
    >
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div
        className="
          flex
          shrink-0
          items-center
          justify-between
          gap-2

          border-b
          border-[color:var(--bf-border)]

          px-3
          py-2.5
        "
      >
        <div
          className="
            flex
            min-w-0
            items-center
            gap-2
          "
        >
          <div
            className="
              flex
              h-8
              w-8
              shrink-0
              items-center
              justify-center

              rounded-lg

              bg-gradient-to-br
              from-[#12BFF2]
              via-[#078EE5]
              to-[#0AA23B]

              text-white
            "
          >
            <Bot
              size={16}
              aria-hidden="true"
            />
          </div>

          <div className="min-w-0">
            <div
              className="
                flex
                items-center
                gap-1
              "
            >
              <p
                className="
                  truncate
                  text-[12px]
                  font-black
                  text-[color:var(--bf-text-primary)]
                "
              >
                Buddy Assistant
              </p>

              <Sparkles
                size={10}
                aria-hidden="true"
                className="
                  shrink-0
                  text-cyan-500
                "
              />
            </div>

            <div
              className="
                flex
                items-center
                gap-1
              "
            >
              <span
                className="
                  h-1
                  w-1
                  rounded-full
                  bg-emerald-500
                "
              />

              <span
                className="
                  text-[7px]
                  font-bold
                  uppercase
                  tracking-[0.12em]
                  text-emerald-500
                "
              >
                Online
              </span>
            </div>
          </div>
        </div>

        <div
          className="
            flex
            items-center
            gap-1
          "
        >
          <button
            type="button"
            onClick={resetChat}
            aria-label="Start new conversation"
            title="New conversation"
            className="
              flex
              h-7
              w-7
              items-center
              justify-center
              rounded-md
              border
              border-[color:var(--bf-border)]
              text-[color:var(--bf-text-muted)]
              transition
              hover:text-cyan-500
            "
          >
            <CircleHelp
              size={12}
              aria-hidden="true"
            />
          </button>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close Buddy Assistant"
            className="
              flex
              h-7
              w-7
              items-center
              justify-center
              rounded-md
              border
              border-[color:var(--bf-border)]
              text-[color:var(--bf-text-muted)]
              transition
              hover:text-red-500
            "
          >
            <X
              size={13}
              aria-hidden="true"
            />
          </button>
        </div>
      </div>

      {/* =====================================================
          SCROLLABLE BODY
      ===================================================== */}

      <div
        ref={scrollRef}
        className="
          min-h-0
          flex-1
          overflow-x-hidden
          overflow-y-auto
          overscroll-contain

          px-2.5
          py-2.5
        "
      >
        {/* MESSAGES */}

        <div className="space-y-2">
          {messages.map(
            (message) => (
              <MessageBubble
                key={message.id}
                message={message}
                onNavigate={onClose}
              />
            )
          )}

          {/* TYPING */}

          {isTyping && (
            <div className="flex justify-start">
              <div
                className="
                  flex
                  items-center
                  gap-1

                  rounded-xl
                  rounded-tl-sm

                  border
                  border-[color:var(--bf-border)]

                  bg-[var(--bf-page-bg)]

                  px-3
                  py-2.5
                "
              >
                <span className="h-1 w-1 animate-pulse rounded-full bg-cyan-500" />
                <span className="h-1 w-1 animate-pulse rounded-full bg-blue-500 [animation-delay:120ms]" />
                <span className="h-1 w-1 animate-pulse rounded-full bg-emerald-500 [animation-delay:240ms]" />
              </div>
            </div>
          )}
        </div>

        {/* =================================================
            QUICK QUESTIONS
        ================================================= */}

        {messages.length <= 2 &&
          !isTyping && (
            <div className="mt-2.5">
              <p
                className="
                  mb-1.5
                  text-[7px]
                  font-bold
                  uppercase
                  tracking-[0.15em]
                  text-[color:var(--bf-text-muted)]
                "
              >
                Quick questions
              </p>

              <div
                className="
                  grid
                  grid-cols-1
                  gap-1.5
                "
              >
                {QUICK_QUESTIONS.map(
                  (item) => {
                    const Icon =
                      item.icon;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() =>
                          submitQuestion(
                            item.label
                          )
                        }
                        className="
                          group
                          flex
                          w-full
                          items-center
                          gap-2

                          rounded-lg

                          border
                          border-[color:var(--bf-border)]

                          bg-[var(--bf-page-bg)]

                          px-2.5
                          py-2

                          text-left

                          transition
                          duration-200

                          hover:border-cyan-400/25
                          hover:bg-cyan-400/[0.04]
                        "
                      >
                        <div
                          className="
                            flex
                            h-7
                            w-7
                            shrink-0
                            items-center
                            justify-center

                            rounded-md

                            bg-cyan-400/[0.07]
                            text-cyan-500
                          "
                        >
                          <Icon
                            size={12}
                            aria-hidden="true"
                          />
                        </div>

                        <span
                          className="
                            min-w-0
                            flex-1

                            text-[9px]
                            font-semibold

                            text-[color:var(--bf-text-secondary)]
                          "
                        >
                          {item.label}
                        </span>

                        <ChevronRight
                          size={11}
                          aria-hidden="true"
                          className="
                            shrink-0
                            text-[color:var(--bf-text-muted)]
                            transition
                            group-hover:translate-x-0.5
                          "
                        />
                      </button>
                    );
                  }
                )}
              </div>
            </div>
          )}
      </div>

      {/* =====================================================
          INPUT
      ===================================================== */}

      <div
        className="
          shrink-0

          border-t
          border-[color:var(--bf-border)]

          bg-[var(--bf-surface)]

          px-2.5
          pb-2
          pt-2
        "
      >
        <form
          onSubmit={handleSubmit}
          className="
            flex
            items-center
            gap-1.5

            rounded-lg

            border
            border-[color:var(--bf-border)]

            bg-[var(--bf-page-bg)]

            p-1

            transition

            focus-within:border-cyan-400/40
            focus-within:ring-1
            focus-within:ring-cyan-400/10
          "
        >
          <textarea
            ref={inputRef}
            value={input}
            rows={1}
            maxLength={400}
            placeholder="Ask Buddy Assistant..."
            onChange={(event) =>
              setInput(
                event.target.value
              )
            }
            onKeyDown={(event) => {
              if (
                event.key ===
                  'Enter' &&
                !event.shiftKey
              ) {
                event.preventDefault();

                handleSubmit(event);
              }
            }}
            className="
              max-h-16
              min-h-8
              flex-1
              resize-none

              bg-transparent

              px-2
              py-1.5

              text-[11px]
              leading-5

              text-[color:var(--bf-text-primary)]

              outline-none

              placeholder:text-[color:var(--bf-text-muted)]
            "
          />

          <button
            type="submit"
            disabled={
              !input.trim() ||
              isTyping
            }
            aria-label="Send message"
            className="
              flex
              h-8
              w-8
              shrink-0
              items-center
              justify-center

              rounded-md

              bg-gradient-to-br
              from-[#078EE5]
              to-[#0AA23B]

              text-white

              transition

              hover:opacity-90

              disabled:cursor-not-allowed
              disabled:opacity-40
            "
          >
            <Send
              size={13}
              aria-hidden="true"
            />
          </button>
        </form>

        {/* FOOT NOTE */}

        <div
          className="
            mt-1
            flex
            items-center
            justify-center
            gap-1
          "
        >
          <MessageCircle
            size={7}
            aria-hidden="true"
            className="text-emerald-500"
          />

          <p
            className="
              text-[6px]
              leading-3
              text-[color:var(--bf-text-muted)]
            "
          >
            Need personal help? Use WhatsApp.
          </p>
        </div>
      </div>
    </div>
  );
}