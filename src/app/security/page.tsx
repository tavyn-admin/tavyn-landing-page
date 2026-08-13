import type { Metadata } from 'next';
import LegalPage from '@/components/LegalPage';

export const metadata: Metadata = { title: 'Security | Tavyn' };

export default function SecurityPage() {
    return (
        <LegalPage
            title="Security"
            lastUpdated="Last updated: May 31, 2026"
            intro="Tavyn is designed for founder-led SaaS teams that trust us with company context, content workflows, and potentially repository-connected publishing. Our security approach is centered on minimizing access, keeping founders in control, and making publishing actions reviewable."
            sections={[
                {
                    heading: '1. Our Security Approach',
                    paragraphs: [
                        'Tavyn minimizes the data it needs, uses access only for approved workflows, and designs product flows around user visibility and approval.',
                        'For sensitive workflows such as repository-connected publishing, Tavyn is designed to make important actions reviewable before they affect production content, unless the user intentionally enables an automated workflow.',
                    ],
                },
                {
                    heading: '2. Data Minimization',
                    paragraphs: [
                        'Tavyn only collects or processes the information needed to generate company profiles, SEO briefs, founder questions, drafts, revisions, approvals, metadata, and publishing outputs.',
                        'Tavyn avoids unnecessary access to unrelated company systems, repositories, files, or private information.',
                    ],
                },
                {
                    heading: '3. GitHub and Repository Access',
                    paragraphs: [
                        'If GitHub or a similar repository integration is connected, Tavyn uses the access needed to understand and operate the approved blog workflow. Where possible, Tavyn should use least-privilege access.',
                        "Tavyn inspects only relevant files needed to understand the repository's blog structure and publishing workflow.",
                        'Tavyn prefers reviewable pull requests or reviewable file changes over direct production changes. Tavyn does not modify a repository without explicit approval unless the user has intentionally enabled an automated publishing workflow.',
                        'Users can revoke integration access from their connected provider settings.',
                    ],
                },
                {
                    heading: '4. Secrets and Credentials',
                    paragraphs: [
                        'Users should not submit passwords, API keys, private keys, production secrets, or other sensitive credentials unless Tavyn explicitly asks for them as part of a supported integration flow.',
                        'Tavyn is designed to rely on approved integrations and permissioned access rather than asking users to paste sensitive credentials into prompts or freeform text fields.',
                    ],
                },
                {
                    heading: '5. Reviewable Publishing',
                    paragraphs: [
                        'For repository-based publishing, Tavyn is designed around reviewable changes such as pull requests whenever possible.',
                        'This allows users to inspect generated content, metadata, file changes, and publishing behavior before changes are merged or published.',
                        'If a user enables an automated publishing workflow, the user is responsible for monitoring that workflow and reviewing outputs as needed.',
                    ],
                },
                {
                    heading: '6. Founder Approval Workflow',
                    paragraphs: [
                        'Tavyn is designed so founders can answer questions, request revisions, and approve content before publication.',
                        "User approval is a core trust layer in Tavyn's workflow, especially for generated content, repository changes, and publishing actions.",
                    ],
                },
                {
                    heading: '7. Infrastructure and Providers',
                    paragraphs: [
                        'Tavyn may rely on third-party providers for hosting, databases, email, analytics, AI processing, and integrations.',
                        'Tavyn evaluates providers based on product needs, reliability, and security expectations.',
                        'Third-party providers are governed by their own security practices, terms, and policies.',
                    ],
                },
                {
                    heading: '8. Access Controls',
                    paragraphs: [
                        'Tavyn aims to limit internal access to user data to what is needed for support, debugging, security, and product operations.',
                        'As the product matures, Tavyn will continue improving internal access controls, logging, and operational safeguards.',
                    ],
                },
                {
                    heading: '9. Incident Response',
                    paragraphs: [
                        'If Tavyn becomes aware of a security issue affecting users, Tavyn will investigate and take appropriate steps based on the nature and scope of the issue.',
                        'Users can report security concerns by email at nishchay@tavyn.dev.',
                    ],
                },
                {
                    heading: '10. Responsible Disclosure',
                    paragraphs: [
                        'Security issues should be reported to nishchay@tavyn.dev.',
                        'Please include steps to reproduce, affected URLs, screenshots or logs if available, and contact information so we can follow up.',
                        'Do not access, modify, delete, exfiltrate, or publicly disclose user data or Tavyn data while investigating or reporting a security issue.',
                    ],
                },
                {
                    heading: '11. Security Maturity',
                    paragraphs: [
                        'Tavyn is an early-stage product and does not currently claim formal security certifications or audits unless stated separately. This page describes our current security approach and the product principles we are building around.',
                    ],
                },
                {
                    heading: '12. Contact',
                    paragraphs: [
                        'Security questions can be sent to nishchay@tavyn.dev.',
                    ],
                },
            ]}
        />
    );
}
