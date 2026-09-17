function cx(...classes) {
  return classes
    .filter(Boolean)
    .join(' ');
}

export function Page({
  children,
}) {
  return (
    <>
      <style>
        {`
          .bf-dev-workspace {
            min-height: calc(100dvh - var(--bf-header-height, 66px));
            background: var(--bf-dev-page-bg);
            color: var(--bf-dev-text);
            overflow-x: hidden;
          }

          .bf-dev-workspace > * + * {
            margin-top: 24px;
          }

          .bf-dev-workspace > :not(.bf-dev-page-band) {
            margin-left: 24px;
            margin-right: 24px;
          }

          .bf-dev-workspace > .bf-dev-page-band + * {
            position: relative;
            z-index: 2;
            margin-top: -22px;
          }

          .bf-dev-workspace > :last-child {
            margin-bottom: 24px;
          }

          @media (max-width: 767px) {
            .bf-dev-workspace > :not(.bf-dev-page-band) {
              margin-left: 14px;
              margin-right: 14px;
            }

            .bf-dev-workspace > .bf-dev-page-band + * {
              margin-top: -14px;
            }

            .bf-dev-workspace > * + * {
              margin-top: 16px;
            }
          }
        `}
      </style>

      <div
        className="
          bf-dev-workspace
        "
      >
        {children}
      </div>
    </>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}) {
  return (
    <section
      className="
        bf-dev-page-band
        relative
        min-h-[104px]
        overflow-hidden
        bg-[var(--bf-dev-primary)]
        px-6
        pb-8
        pt-6
        text-white
        sm:px-7
        lg:px-8
      "
    >
      <div
        className="
          relative
          z-[1]
          flex
          flex-col
          gap-4
          lg:flex-row
          lg:items-start
          lg:justify-between
        "
      >
        <div
          className="
            min-w-0
          "
        >
          <h1
            className="
              text-[25px]
              font-semibold
              tracking-[-0.02em]
              text-white
              sm:text-[27px]
            "
          >
            {title}
          </h1>

          {description && (
            <p
              className="
                mt-1.5
                max-w-3xl
                text-[10px]
                leading-5
                text-white/72
              "
            >
              {description}
            </p>
          )}
        </div>

        <div
          className="
            flex
            shrink-0
            flex-col
            items-start
            gap-2
            lg:items-end
          "
        >
          <div
            className="
              text-[10px]
              font-medium
              text-white/80
            "
          >
            Developer
            <span className="mx-2 text-white/35">
              /
            </span>
            <span className="text-white">
              {eyebrow || title}
            </span>
          </div>

          {actions && (
            <div
              className="
                flex
                flex-wrap
                items-center
                gap-2
              "
            >
              {actions}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export function Card({
  children,
  className = '',
}) {
  return (
    <section
      className={cx(
        `
          rounded-[5px]
          border
          border-[var(--bf-dev-border)]
          bg-[var(--bf-dev-surface)]
          shadow-[0_1px_2px_rgba(0,0,0,.04)]
        `,
        className
      )}
    >
      {children}
    </section>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
}) {
  return (
    <div
      className="
        flex
        min-h-[55px]
        items-center
        justify-between
        gap-3
        border-b
        border-[var(--bf-dev-border)]
        px-5
        py-3
      "
    >
      <div>
        <div
          className="
            text-[15px]
            font-medium
            text-[var(--bf-dev-text)]
          "
        >
          {title}
        </div>

        {subtitle && (
          <div
            className="
              mt-0.5
              text-[9px]
              text-[var(--bf-dev-text-3)]
            "
          >
            {subtitle}
          </div>
        )}
      </div>

      {action}
    </div>
  );
}

export function Button({
  children,
  icon: Icon,
  variant = 'default',
  onClick,
}) {
  const styles = {
    default:
      'border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface)] text-[var(--bf-dev-text-2)] hover:bg-[var(--bf-dev-surface-2)] hover:text-[var(--bf-dev-text)]',
    header:
      'border-[#111827] bg-[#111827] text-white hover:border-[#1F2937] hover:bg-[#1F2937] hover:text-white',
    pageBand:
      'border-white/30 bg-white/12 text-white hover:border-white/45 hover:bg-white/20 hover:text-white',
    primary:
      'border-[var(--bf-dev-primary)] bg-[var(--bf-dev-primary)] text-white hover:bg-[var(--bf-dev-primary-strong)]',
    success:
      'border-emerald-500 bg-emerald-500 text-white hover:bg-emerald-600',
    danger:
      'border-rose-500/25 bg-rose-500/10 text-rose-500 hover:bg-rose-500/15',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        `
          inline-flex
          min-h-[32px]
          items-center
          justify-center
          gap-1.5
          rounded-[4px]
          border
          px-3
          py-1.5
          text-[10px]
          font-semibold
          transition
          duration-150
          focus-visible:outline-none
          focus-visible:ring-2
          focus-visible:ring-[rgb(var(--bf-dev-primary-rgb)/.35)]
        `,
        styles[variant]
      )}
    >
      {Icon && (
        <Icon size={13} />
      )}

      {children}
    </button>
  );
}

export function Status({
  status,
}) {
  const styles = {
    active:
      'border-emerald-500/20 bg-emerald-500/10 text-emerald-500',
    success:
      'border-emerald-500/20 bg-emerald-500/10 text-emerald-500',
    production:
      'border-[rgb(var(--bf-dev-primary-rgb)/.20)] bg-[rgb(var(--bf-dev-primary-rgb)/.10)] text-[var(--bf-dev-primary)]',
    trial:
      'border-amber-500/20 bg-amber-500/10 text-amber-500',
    beta:
      'border-violet-500/20 bg-violet-500/10 text-violet-500',
    planned:
      'border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface-2)] text-[var(--bf-dev-text-2)]',
    published:
      'border-emerald-500/20 bg-emerald-500/10 text-emerald-500',
    info:
      'border-[rgb(var(--bf-dev-primary-rgb)/.20)] bg-[rgb(var(--bf-dev-primary-rgb)/.10)] text-[var(--bf-dev-primary)]',
    warning:
      'border-amber-500/20 bg-amber-500/10 text-amber-500',
  };

  return (
    <span
      className={cx(
        `
          inline-flex
          items-center
          rounded-full
          border
          px-2
          py-1
          text-[8px]
          font-bold
          uppercase
          tracking-[0.08em]
        `,
        styles[status] ||
          'border-[var(--bf-dev-border)] bg-[var(--bf-dev-surface-2)] text-[var(--bf-dev-text-2)]'
      )}
    >
      {status}
    </span>
  );
}
