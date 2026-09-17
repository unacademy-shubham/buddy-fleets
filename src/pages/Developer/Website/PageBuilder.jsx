import {
  AppWindow,
  BadgeCheck,
  Blocks,
  CheckCircle2,
  ChevronRight,
  FileText,
  Gauge,
  MonitorCog,
  PencilRuler,
  Plus,
  Rocket,
} from 'lucide-react';

import {
  Page,
  PageHeader,
  Card,
  CardHeader,
  Button,
} from '../shared/DeveloperPageUI';

const WEBSITE_PAGES = [
  {
    name: 'Home',
    path: '/',
    status: 'published',
  },
  {
    name: 'Features',
    path: '/features',
    status: 'published',
  },
  {
    name: 'Pricing',
    path: '/pricing',
    status: 'published',
  },
  {
    name: 'About Us',
    path: '/about',
    status: 'published',
  },
  {
    name: 'Contact Us',
    path: '/contact-us',
    status: 'published',
  },
];

export default function PageBuilder() {
  return (
    <Page>
      <PageHeader
        eyebrow="Website Studio / Page Builder"
        title="Page Builder"
        description="Build and organize public Buddy Fleets website pages, reusable sections and conversion-focused content."
        actions={
          <>
            <Button
              variant="pageBand"
              icon={MonitorCog}
            >
              Preview
            </Button>

            <Button
              variant="primary"
              icon={Rocket}
            >
              Save draft
            </Button>
          </>
        }
      />

      <div
        className="
          grid
          gap-4
          xl:grid-cols-[300px_1fr]
        "
      >
        <Card>
          <CardHeader
            title="Website pages"
            subtitle="Select a page to edit"
            action={
              <Button icon={Plus}>
                Page
              </Button>
            }
          />

          <div className="space-y-1 p-2.5">
            {WEBSITE_PAGES.map(
              (page) => (
                <button
                  key={page.path}
                  type="button"
                  className="
                    flex
                    w-full
                    items-center
                    justify-between
                    gap-3
                    rounded-lg
                    border
                    border-[var(--bf-dev-border)]
                    bg-[var(--bf-dev-surface)]
                    px-3
                    py-3
                    text-left
                    transition
                    hover:bg-[var(--bf-dev-surface-2)]
                  "
                >
                  <div>
                    <div className="text-[11px] font-semibold text-[var(--bf-dev-text)]">
                      {page.name}
                    </div>
                    <div className="mt-0.5 text-[9px] text-[var(--bf-dev-text-3)]">
                      {page.path}
                    </div>
                  </div>

                  <ChevronRight
                    size={14}
                    className="text-[var(--bf-dev-text-3)]"
                  />
                </button>
              )
            )}
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader
              title="Page canvas"
              subtitle="Reusable blocks available for the selected page"
            />

            <div
              className="
                grid
                gap-3
                p-4
                md:grid-cols-2
                xl:grid-cols-3
              "
            >
              {[
                ['Hero Section', 'Headline, supporting copy, CTA and hero media.', AppWindow],
                ['Feature Grid', 'Product capability cards and module highlights.', Blocks],
                ['Trust Section', 'Customer proof, platform stats and testimonials.', BadgeCheck],
                ['Pricing Block', 'Plan cards, feature comparison and offer copy.', Gauge],
                ['CTA Block', 'Conversion-focused call-to-action section.', Rocket],
                ['Footer Block', 'Navigation, legal links and company information.', FileText],
              ].map(([title, text, Icon]) => (
                <button
                  key={title}
                  type="button"
                  className="
                    rounded-lg
                    border
                    border-[var(--bf-dev-border)]
                    bg-[var(--bf-dev-surface)]
                    p-4
                    text-left
                    transition
                    hover:bg-[var(--bf-dev-surface-2)]
                  "
                >
                  <Icon
                    size={17}
                    className="text-[var(--bf-dev-primary)]"
                  />
                  <div className="mt-3 text-[11px] font-bold text-[var(--bf-dev-text)]">
                    {title}
                  </div>
                  <div className="mt-1 text-[10px] leading-5 text-[var(--bf-dev-text-2)]">
                    {text}
                  </div>
                </button>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Builder status"
              subtitle="Draft changes are isolated from the live website"
            />

            <div className="grid gap-3 p-4 sm:grid-cols-3">
              {[
                ['Draft pages', '3', PencilRuler],
                ['Reusable blocks', '18', Blocks],
                ['Published pages', '5', CheckCircle2],
              ].map(([label, value, Icon]) => (
                <div
                  key={label}
                  className="
                    rounded-lg
                    border
                    border-[var(--bf-dev-border)]
                    bg-[var(--bf-dev-surface-2)]
                    p-4
                  "
                >
                  <Icon
                    size={16}
                    className="text-[var(--bf-dev-primary)]"
                  />
                  <div className="mt-3 text-[20px] font-semibold text-[var(--bf-dev-text)]">
                    {value}
                  </div>
                  <div className="mt-1 text-[9px] text-[var(--bf-dev-text-3)]">
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </Page>
  );
}
