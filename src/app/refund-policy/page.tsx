import { Metadata } from 'next'
import { GlassPanel } from '@/components/ui/GlassPanel'

export const metadata: Metadata = {
  title: 'Refund Policy | GLITZFUSION Academy',
  description:
    'Read the Refund Policy for GLITZFUSION Academy. All payments made towards our courses, workshops and services are strictly non-refundable.',
  alternates: {
    canonical: 'https://glitzfusion.in/refund-policy',
  },
}

export default function RefundPolicyPage() {
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
                Refund Policy
              </h1>
              <p className="text-gray-300 text-sm md:text-base max-w-2xl">
                This Refund Policy explains how payments made to GLITZFUSION
                Academy for our courses, workshops and related services are
                handled. Please read this carefully before completing any
                payment.
              </p>
            </header>

            <div className="space-y-8 text-gray-300 text-sm md:text-base leading-relaxed">
              <section>
                <h2 className="text-xl font-semibold text-white mb-3">
                  1. No Refund on Services
                </h2>
                <p className="mb-3 font-semibold text-primary-gold">
                  All payments made to GLITZFUSION Academy towards our services
                  are strictly non-refundable. This includes, but is not limited
                  to:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Course fees and tuition fees</li>
                  <li>Registration or admission charges</li>
                  <li>Workshop and seminar fees</li>
                  <li>Event, showcase or performance participation fees</li>
                  <li>Any other charges collected for Academy services</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">
                  2. Change of Mind or Personal Reasons
                </h2>
                <p>
                  Once a payment is completed and your seat or service is
                  confirmed, no refunds will be provided under any
                  circumstances, including (but not limited to) change of mind,
                  change in personal schedule, relocation, medical reasons,
                  academic commitments or any other personal situation.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">
                  3. Non-Attendance &amp; Partial Attendance
                </h2>
                <p className="mb-3">
                  It is the student&apos;s responsibility to attend classes and
                  sessions as per the schedule shared by the Academy.
                </p>
                <p>
                  No refunds or fee adjustments will be provided for missed
                  classes, late joining, early exit from the course, or partial
                  attendance of any batch or program.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">
                  4. Course Changes, Transfers &amp; Batch Shifts
                </h2>
                <p className="mb-3">
                  Requests to change batches, timings or move to another course
                  are subject to availability and sole discretion of
                  GLITZFUSION Academy.
                </p>
                <p>
                  Approval of such changes does not imply any refund. At most,
                  where operationally possible, the Academy may allow an
                  internal adjustment or rescheduling purely as a goodwill
                  gesture and not as a right.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">
                  5. Academy-Initiated Cancellations
                </h2>
                <p className="mb-3">
                  In rare cases where GLITZFUSION cancels an entire course or
                  workshop before it starts (for example, due to insufficient
                  enrolments or operational constraints), the Academy may offer
                  an alternative batch, course transfer or an appropriate
                  remedy, which will be communicated in writing.
                </p>
                <p>
                  Any such remedy will be decided solely by GLITZFUSION Academy
                  and will not be treated as a general refund policy.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">
                  6. Duplicate or Excess Payments
                </h2>
                <p className="mb-3">
                  In case of a clear technical error leading to duplicate or
                  excess payment, the student (or payer) must inform the Academy
                  immediately with valid proof of transaction.
                </p>
                <p>
                  After verification, GLITZFUSION may process an appropriate
                  adjustment or refund for the extra amount paid. This is the
                  only limited scenario where a refund may be considered, and it
                  is strictly subject to verification and approval.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">
                  7. Third-Party Platforms &amp; Payment Gateways
                </h2>
                <p>
                  If you make a payment through a third-party payment gateway or
                  platform, you are also subject to their terms and conditions.
                  GLITZFUSION is not responsible for any charges, delays,
                  technical errors or policies of such third-party services.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">
                  8. Policy Updates
                </h2>
                <p className="mb-3">
                  GLITZFUSION Academy may update this Refund Policy from time to
                  time to align with operational changes or legal requirements.
                </p>
                <p>
                  The latest version will always be available on this page.
                  Continued use of our services after an update constitutes your
                  acceptance of the revised policy.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">
                  9. Contact
                </h2>
                <p>
                  If you have any questions about this Refund Policy, please
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
