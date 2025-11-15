import { Metadata } from 'next'
import { GlassPanel } from '@/components/ui/GlassPanel'

export const metadata: Metadata = {
  title: 'Terms & Conditions | GLITZFUSION Academy',
  description:
    'Read the Terms & Conditions for GLITZFUSION Academy in Badlapur covering admissions, payments, conduct, intellectual property, and limitations of liability.',
  alternates: {
    canonical: 'https://glitzfusion.in/terms',
  },
}

export default function TermsPage() {
  return (
    <div className="relative min-h-screen pt-24 pb-20">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-spotlight opacity-30" />
      </div>

      <div className="relative z-10 container-custom">
        <div className="max-w-4xl mx-auto">
          <GlassPanel className="p-8 md:p-10 lg:p-12">
            <header className="mb-10">
              <h1 className="text-3xl md:text-4xl font-bold text-gradient-gold mb-4">
                Terms &amp; Conditions
              </h1>
              <p className="text-gray-300 text-sm md:text-base max-w-2xl">
                These Terms &amp; Conditions govern your use of GLITZFUSION Academy&apos;s
                website, courses, programs, workshops, and all related services.
                By enrolling with us or using our services, you agree to these
                terms.
              </p>
            </header>

            <div className="space-y-8 text-gray-300 text-sm md:text-base leading-relaxed">
              <section>
                <h2 className="text-xl font-semibold text-white mb-3">
                  1. Services &amp; Enrolment
                </h2>
                <p>
                  GLITZFUSION Academy provides professional training in Acting,
                  Dancing, Photography, Filmmaking, Modeling and related
                  creative arts. Enrolment into any course, batch, or workshop
                  is subject to availability, eligibility criteria and successful
                  completion of the admission process as communicated by the
                  Academy.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">
                  2. Fees, Payments &amp; Non-Refundable Policy
                </h2>
                <p className="mb-3">
                  All course fees, registration charges, workshop fees and any
                  additional payments towards our services must be paid as per
                  the schedule communicated at the time of admission.
                </p>
                <p className="mb-3 font-semibold text-primary-gold">
                  All payments made towards our services are strictly
                  non-refundable. Once a payment is made and your seat is
                  confirmed, no refunds will be issued under any circumstances,
                  including but not limited to change of mind, change of
                  schedule, relocation, non-attendance, or dissatisfaction with
                  the course.
                </p>
                <p>
                  In exceptional situations where the Academy cancels a complete
                  course or batch before commencement, GLITZFUSION may, at its
                  sole discretion, offer a transfer to another batch or course
                  or provide an appropriate remedy as communicated in writing.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">
                  3. Student Conduct &amp; Discipline
                </h2>
                <p className="mb-3">
                  Students are expected to maintain professional behaviour and a
                  respectful learning environment. GLITZFUSION reserves the
                  right to suspend or terminate a student&apos;s participation
                  without refund in cases of misconduct, harassment,
                  non-compliance with Academy rules, or behaviour that disrupts
                  classes or harms the Academy&apos;s reputation.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">
                  4. Attendance &amp; Schedule Changes
                </h2>
                <p className="mb-3">
                  Students are responsible for attending scheduled classes and
                  sessions on time. Missed classes will not be compensated,
                  refunded or adjusted unless explicitly communicated in
                  writing by the Academy.
                </p>
                <p>
                  GLITZFUSION reserves the right to modify class timings,
                  faculty, locations, or delivery modes (online/offline) when
                  reasonably required. Any such changes will be communicated to
                  students using the contact details shared at the time of
                  admission.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">
                  5. Intellectual Property
                </h2>
                <p className="mb-3">
                  All course content, study material, videos, recordings,
                  assignments, branding, logos and creative assets provided by
                  GLITZFUSION remain the exclusive intellectual property of the
                  Academy.
                </p>
                <p>
                  Students may not copy, reproduce, distribute, share, sell, or
                  use the material for any commercial purpose without prior
                  written permission from GLITZFUSION Academy.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">
                  6. Photography, Filming &amp; Promotions
                </h2>
                <p className="mb-3">
                  As part of classes, rehearsals, events or showcases, the
                  Academy may photograph or record students for educational,
                  archival and promotional purposes.
                </p>
                <p>
                  By enrolling, you grant GLITZFUSION the right to use your
                  images, videos and performances in marketing materials,
                  social-media posts, websites, and other promotional content,
                  without additional compensation. If you have specific
                  concerns, please raise them with the Academy in writing
                  before enrolment.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">
                  7. Limitation of Liability
                </h2>
                <p className="mb-3">
                  While GLITZFUSION strives to provide a safe, supportive and
                  high-quality learning environment, the Academy cannot
                  guarantee specific career outcomes or industry placements.
                </p>
                <p>
                  To the maximum extent permitted by law, GLITZFUSION Academy
                  and its team shall not be liable for any indirect, incidental
                  or consequential damages arising from participation in any
                  course, workshop or activity.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">
                  8. Changes to These Terms
                </h2>
                <p className="mb-3">
                  GLITZFUSION may update these Terms &amp; Conditions from time to
                  time to reflect operational, legal or regulatory changes.
                </p>
                <p>
                  The latest version will always be available on this page. By
                  continuing to use our services after changes are published,
                  you agree to the updated terms.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">
                  9. Contact
                </h2>
                <p>
                  For any questions regarding these Terms &amp; Conditions, please
                  contact us at{' '}
                  <span className="text-primary-gold">contact@glitzfusion.in</span>.
                </p>
              </section>
            </div>
          </GlassPanel>
        </div>
      </div>
    </div>
  )
}
