import type { Metadata } from 'next';
import LegalPage from '@/components/LegalPage';

export const metadata: Metadata = { title: 'Privacy Policy | Tavyn' };

export default function PrivacyPage() {
    return (
        <LegalPage
            title="Privacy Policy"
            lastUpdated="Last updated: May 31, 2026"
            intro="Tavyn respects your privacy. This policy explains what information Tavyn collects, how we use it, and how you can contact us."
            sections={[
                {
                    heading: '1. Information We Collect',
                    paragraphs: [
                        'Tavyn may collect account and contact information such as your name, email address, and company details. We may also process company website or content information that you submit or approve.',
                        'As part of the blog workflow, Tavyn may process founder answers, SEO briefs, draft blog posts, revision requests, approval history, email communications, and integration metadata such as connected tools or repository metadata.',
                        'Because Tavyn is a business product, some information we process may include non-public company content, strategy, positioning, SEO plans, draft content, and repository-related files approved by the user.',
                        'If GitHub or similar integrations are connected, Tavyn may process approved repository files needed for the approved blog workflow. We may also collect usage and analytics data such as pages visited, feature usage, browser or device information, logs, and similar product diagnostics. We may use cookies or similar technologies to understand site usage, improve the product, and maintain security.',
                    ],
                },
                {
                    heading: '2. How We Use Information',
                    paragraphs: [
                        'We use information to provide and improve Tavyn, generate company profiles, SEO briefs, founder questions, drafts, revisions, and publish-ready content, and communicate with users about the product.',
                        'We also use information to maintain security, debug issues, understand usage, improve product quality, and comply with legal obligations.',
                    ],
                },
                {
                    heading: '3. AI Processing',
                    paragraphs: [
                        'Tavyn may use AI providers or model APIs to process user-provided context and generate outputs such as company profiles, SEO briefs, founder questions, draft blog posts, revisions, metadata, and publishing suggestions.',
                        'Users should not submit information they do not have the right to use. AI-generated content may be incomplete, inaccurate, or unsuitable for publication.',
                        'Users are responsible for reviewing, editing, and approving generated content before publication.',
                        'We do not use your private company content, founder answers, repository files, or unpublished drafts to train public AI models.',
                    ],
                },
                {
                    heading: '4. How We Share Information',
                    paragraphs: [
                        'We may share information with service providers needed to operate the product, such as hosting, database, email, analytics, AI infrastructure, and integration providers.',
                        'We may also share information for legal or safety reasons if required, or in connection with a merger, acquisition, financing, or asset sale. We do not sell your personal information or share it for cross-context behavioral advertising.',
                    ],
                },
                {
                    heading: '5. GitHub and Repository Data',
                    paragraphs: [
                        'If GitHub or a similar repository integration is connected, Tavyn only accesses repository information needed to understand and operate the approved blog workflow.',
                        'Tavyn only inspects files approved by the user or needed for the approved workflow. Tavyn does not modify repositories without explicit user approval, unless the user intentionally enables an automated publishing workflow.',
                        'When Tavyn creates or updates blog content in a repository, publishing actions are designed to be reviewable, such as through pull requests, unless the user explicitly chooses another workflow.',
                    ],
                },
                {
                    heading: '6. Data Retention',
                    paragraphs: [
                        'Tavyn keeps information as long as needed to provide the service, improve the product, comply with obligations, and resolve disputes. To request access, correction, deletion, or export of your information, email us at nishchay@tavyn.dev.',
                    ],
                },
                {
                    heading: '7. Security',
                    paragraphs: [
                        'Tavyn uses reasonable technical and organizational measures to protect information. No system is perfectly secure, and we cannot guarantee absolute security.',
                    ],
                },
                {
                    heading: '8. User Choices and Rights',
                    paragraphs: [
                        'Users can contact Tavyn to request access, correction, deletion, or export of their information. Depending on location, users may have additional privacy rights.',
                    ],
                },
                {
                    heading: "9. Children's Privacy",
                    paragraphs: [
                        'Tavyn is not intended for children under 13.',
                    ],
                },
                {
                    heading: '10. Changes to This Policy',
                    paragraphs: [
                        'Tavyn may update this policy from time to time. When we do, we will update the "Last updated" date above.',
                    ],
                },
                {
                    heading: '11. Contact',
                    paragraphs: [
                        'Questions about this Privacy Policy can be sent to nishchay@tavyn.dev.',
                    ],
                },
            ]}
        />
    );
}
