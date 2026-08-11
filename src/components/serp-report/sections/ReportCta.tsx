import styles from "./ReportCta.module.css";

export default function ReportCta({ companyName }: { companyName?: string }) {
  const customerName = companyName?.trim() || "your company";

  return (
    <div className={styles.root}>
      <div className={styles.content}>
        <div className={styles.copy}>
          <h2 className={styles.heading}>
            <span>Turn these opportunities</span>
            <span>into content.</span>
          </h2>
          <p className={styles.supportingText}>
            Tavyn can turn this research into a focused content plan for {customerName}, including priority topics and
            target queries for the opportunities above.
          </p>
        </div>

        <a className={styles.waitlistButton} href="/waitlist">
          Turn These Opportunities Into Content
        </a>
      </div>
    </div>
  );
}
