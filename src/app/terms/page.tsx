import type { Metadata } from 'next';
import LegalPage from '@/components/LegalPage';

export const metadata: Metadata = { title: 'Terms of Service | Tavyn' };

export default function TermsPage() {
    return (
        <LegalPage
            title="Terms of Service"
            lastUpdated="Last updated: May 31, 2026"
            intro="These Terms of Service govern your use of Tavyn. By using Tavyn, you agree to use the product responsibly and in accordance with these terms."
            sections={[
                {
                    heading: '1. Use of Tavyn',
                    paragraphs: [
                        'You may use Tavyn only in compliance with applicable laws and these terms. You agree to provide accurate information when using the product.',
                    ],
                },
                {
                    heading: '2. Beta Product',
                    paragraphs: [
                        'Tavyn may currently be in beta. Features may change, break, be limited, or be discontinued as the product improves. Beta access may be free, discounted, limited, or invitation-based.',
                    ],
                },
                {
                    heading: '3. Accounts and Access',
                    paragraphs: [
                        'You are responsible for account security and for activity that occurs through your access. You should not share access in a way that compromises product, account, or company security.',
                    ],
                },
                {
                    heading: '4. User Content',
                    paragraphs: [
                        'You retain ownership of the company context, founder answers, documents, repository content, and other materials you provide to Tavyn.',
                        'You grant Tavyn permission to process that content only as needed to provide, operate, support, secure, and improve the service.',
                        'You are responsible for ensuring that you have the rights needed to submit content to Tavyn and to use, publish, or approve any content created through Tavyn.',
                    ],
                },
                {
                    heading: '5. AI-Generated Content',
                    paragraphs: [
                        'Tavyn may generate SEO briefs, founder questions, draft blog posts, revisions, metadata, publishing suggestions, and other content.',
                        'AI output may be incomplete, inaccurate, outdated, or unsuitable for publication. You are responsible for reviewing, editing, approving, and validating content before publication.',
                        'You own the final content you approve and publish through Tavyn, subject to any rights in the materials you provided and any third-party materials included in that content.',
                        'Tavyn does not provide legal, financial, tax, medical, or professional advice. Tavyn also does not guarantee search rankings, traffic, conversions, revenue, or business outcomes.',
                    ],
                },
                {
                    heading: '6. Integrations and Publishing',
                    paragraphs: [
                        'Tavyn may connect to tools such as email, GitHub, CMS platforms, hosting platforms, analytics tools, or other services. You are responsible for granting appropriate access and for reviewing the permissions requested by those services.',
                        'Tavyn does not publish, modify, or push production content without user approval, unless you explicitly enable an automated publishing workflow.',
                        'For repository-based publishing, pull requests or reviewable changes are the preferred workflow. If you enable an automated workflow, you are responsible for monitoring the workflow and reviewing outputs as needed.',
                        "Third-party services are governed by their own terms and policies. Tavyn is not responsible for third-party platforms, outages, permission changes, or actions taken outside Tavyn's control.",
                    ],
                },
                {
                    heading: '7. Acceptable Use',
                    paragraphs: [
                        'You agree not to use Tavyn for illegal activity or to upload, submit, generate, approve, or publish content you do not have the rights to use.',
                        'You also agree not to reverse engineer, abuse, overload, scrape, probe, or interfere with Tavyn, or attempt to bypass usage limits, security controls, approval flows, or access restrictions.',
                        'You may not use Tavyn to generate or distribute spam, malware, deceptive content, impersonation, phishing, harmful content, or content that violates the rights of others.',
                    ],
                },
                {
                    heading: '8. Payments',
                    paragraphs: [
                        'If paid plans are introduced, pricing, billing, renewal, cancellation, and refund terms may be provided separately. Current or future pricing should not be assumed unless stated by Tavyn.',
                    ],
                },
                {
                    heading: '9. Termination',
                    paragraphs: [
                        'Tavyn may suspend or terminate access if you violate these terms or create risk for Tavyn, other users, or third parties. You may stop using Tavyn at any time.',
                    ],
                },
                {
                    heading: '10. Disclaimers',
                    paragraphs: [
                        'Tavyn is provided "as is" and "as available." Tavyn does not guarantee uninterrupted service, error-free output, search rankings, traffic, conversions, revenue, business results, or specific outcomes.',
                        "You understand that SEO performance depends on many factors outside Tavyn's control, including search engine behavior, competition, website authority, content quality, distribution, technical implementation, and market demand.",
                    ],
                },
                {
                    heading: '11. Limitation of Liability',
                    paragraphs: [
                        'To the maximum extent permitted by law, Tavyn will not be liable for indirect, incidental, special, consequential, exemplary, or punitive damages, or for lost profits, lost data, lost rankings, lost business opportunities, reputational harm, or content performance.',
                        "Tavyn's total liability for any claim related to the service will be limited to the amount you paid Tavyn for the service during the three months before the claim arose, or $100 if you have not paid Tavyn.",
                    ],
                },
                {
                    heading: '12. Indemnification',
                    paragraphs: [
                        'You agree to defend, indemnify, and hold Tavyn harmless from claims, damages, losses, liabilities, costs, and expenses arising from your use of Tavyn, your content, your published outputs, your violation of these terms, or your violation of third-party rights.',
                    ],
                },
                {
                    heading: '13. Changes to Terms',
                    paragraphs: [
                        'Tavyn may update these terms from time to time. When we do, we will update the "Last updated" date above.',
                    ],
                },
                {
                    heading: '14. Contact',
                    paragraphs: [
                        'Questions about these Terms of Service can be sent to nishchay@tavyn.dev.',
                    ],
                },
            ]}
        />
    );
}
